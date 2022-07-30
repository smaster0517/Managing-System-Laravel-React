<?php

namespace App\Services\Modules\ServiceOrder;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
// Custom
use App\Models\User\UserModel;
use App\Models\Orders\ServiceOrderModel;
use App\Services\FormatDataService;
use App\Models\Pivot\ServiceOrderHasUserModel;
use App\Models\Pivot\ServiceOrderHasFlightPlanModel;
use App\Notifications\Modules\ServiceOrder\ServiceOrderCreatedNotification;
use App\Notifications\Modules\ServiceOrder\ServiceOrderUpdatedNotification;
use App\Notifications\Modules\ServiceOrder\ServiceOrderDeletedNotification;

class ServiceOrderService{

    private FormatDataService $format_data_service;

    /**
     * Dependency injection.
     * 
     * @param App\Services\FormatDataService $service
     */
    public function __construct(FormatDataService $service){
        $this->format_data_service = $service;
    }

    /**
    * Load all service orders with pagination.
    *
    * @param int $limit
    * @param int $actual_page
    * @param int|string $where_value
    * @return \Illuminate\Http\Response
    */
    public function loadServiceOrdersWithPagination(int $limit, int $current_page, int|string $where_value){

        $data = DB::table('service_orders')
        ->where("service_orders.deleted_at", null)
        ->when($where_value, function ($query, $where_value) {

            $query->where('service_orders.id', $where_value);

        })->orderBy('service_orders.id')->paginate($limit, $columns = ['*'], $pageName = 'page', $current_page);

        if($data->total() > 0){

            $data_formated = $this->format_data_service->serviceOrderPanelDataFormatting($data);

            return response($data_formated, 200);

        }else{

            return response(["message" => "Nenhuma ordem de serviço encontrada."], 404);

        }

    }

    /**
     * Create service order.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function createServiceOrder(Request $request){

        DB::transaction(function () use ($request) {
            
            $creator = UserModel::findOrFail(Auth::user()->id);
            $pilot = UserModel::findOrFail($request->pilot_id);
            $client = UserModel::findOrFail($request->client_id);

            $new_service_order = ServiceOrderModel::create(
                [
                    "start_date" => $request->start_date,
                    "end_date" => $request->end_date,
                    "numOS" => "os.".time(),
                    "observation" => $request->observation,
                    "status" => $request->boolean("status")
                ]
            );

            ServiceOrderHasUserModel::insert([
                "service_order_id" => $new_service_order->id,
                "creator_id" => $creator->id, 
                "pilot_id" => $pilot->id,
                "client_id" => $client->id
            ]);

            foreach($request->flight_plans_ids as $index => $value){

                ServiceOrderHasFlightPlanModel::insert([
                    "service_order_id" => $new_service_order->id,
                    "flight_plan_id" => $value
                ]);

            }

            $creator->notify(new ServiceOrderCreatedNotification($creator, $new_service_order));
            $pilot->notify(new ServiceOrderCreatedNotification($pilot, $new_service_order));
            $client->notify(new ServiceOrderCreatedNotification($client, $new_service_order));

        });

        return response(["message" => "Ordem de serviço criada com sucesso!"], 200);

    }

    /**
    * Update service order.
    *
    * @param \Illuminate\Http\Request $request
    * @param int $service_order_id
    * @return \Illuminate\Http\Response
    */
    public function updateServiceOrder(Request $request, int $service_order_id){

        DB::transaction(function () use ($request, $service_order_id) {

            $service_order = ServiceOrderModel::findOrFail($service_order_id);
            
            $creator = UserModel::findOrFail($service_order->service_order_has_user->creator_id);
            $pilot = UserModel::find($service_order->service_order_has_user->pilot_id);
            $client = UserModel::find($service_order->service_order_has_user->client_id);

            $service_order->update(
                [
                    "start_date" => $request->start_date,
                    "end_date" => $request->end_date,
                    "observation" => $request->observation,
                    "status" => $request->boolean("status")
                ]
            );

            // Desvinculation with all users through service_order_has_user table
            $service_order->service_order_has_user()->delete();
            
            ServiceOrderHasUserModel::create([
                "service_order_id" => $service_order->id,
                "creator_id" => $creator->id, 
                "pilot_id" => $pilot->id,
                "client_id" => $client->id
            ]);

            // Deleta as relações atuais com os planos de vôo - é mais fácil desse modo
            ServiceOrderHasFlightPlanModel::where("service_order_id", $service_order->id)->delete();
            
            // Cria novamente as relações com cada plano de vôo envolvido na ordem de serviço
            foreach($request->flight_plans_ids as $index => $flight_plan_id){
                ServiceOrderHasFlightPlanModel::insert([
                    "service_order_id" => (int) $service_order->id,
                    "flight_plan_id" => (int) $flight_plan_id
                ]);
            }

            $creator->notify(new ServiceOrderCreatedNotification($creator, $service_order));
            $pilot->notify(new ServiceOrderCreatedNotification($pilot, $service_order));
            $client->notify(new ServiceOrderCreatedNotification($client, $service_order));

        });

        return response(["message" => "Ordem de serviço atualizada com sucesso!"], 200);

    }

    /**
     * Soft delete service order.
     *
     * @param int $service_order_id
     * @return \Illuminate\Http\Response
     */
    public function deleteServiceOrder(int $service_order_id){

        DB::transaction(function () use ($service_order_id) {
            
            $service_order = ServiceOrderModel::find($service_order_id);

            $creator = UserModel::findOrFail($service_order->service_order_has_user->creator_id);
            $pilot = UserModel::find($service_order->service_order_has_user->pilot_id);
            $client = UserModel::find($service_order->service_order_has_user->client_id);

            // Desvinculation with flight_plans through service_order_has_flight_plan table
            if(!empty($service_order->service_order_has_flight_plan)){ 
                $service_order->service_order_has_flight_plan()->delete();
            }

            // Desvinculation with all users through service_order_has_user table
            $service_order->service_order_has_user()->delete();

            $service_order->delete();

            $creator->notify(new ServiceOrderDeletedNotification($creator, $service_order));
            $pilot->notify(new ServiceOrderDeletedNotification($pilot, $service_order));
            $client->notify(new ServiceOrderDeletedNotification($client, $service_order));

        });

        return response(["message" => "Ordem de serviço deletada com sucesso!"], 200);

    }
    
}