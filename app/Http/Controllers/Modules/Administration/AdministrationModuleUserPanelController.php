<?php

namespace App\Http\Controllers\Modules\Administration;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;
// Custom
use App\Models\Pivot\ServiceOrderHasUserModel;
use App\Models\User\UserModel;
use App\Models\Profiles\ProfileModel;
use App\Models\Orders\ServiceOrderModel;
use App\Http\Requests\Modules\Administration\UserPanel\UserPanelStoreRequest;
use App\Http\Requests\Modules\Administration\UserPanel\UserPanelUpdateRequest;
use App\Events\Modules\Admin\UserCreatedEvent;
use App\Services\FormatDataService;

class AdministrationModuleUserPanelController extends Controller
{

    private FormatDataService $format_data_service;
    private UserModel $user_model;

    /**
     * Dependency injection.
     * 
     * @param App\Models\User\UserModel $user
     */
    public function __construct(FormatDataService $service, UserModel $user){
        $this->format_data_service = $service;
        $this->user_model = $user;
    }
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index() : \Illuminate\Http\Response
    {

        Gate::authorize('administration_read');

        $args = explode(".", request()->args);
        $limit = (int) $args[0];
        $where_value = $args[1];
        $actual_page = (int) $args[2];
            
        $model_response = $this->user_model->loadUsersWithPagination($limit, $actual_page, $where_value);

        if($model_response["status"] && !$model_response["error"]){

            if($model_response["data"]->total() > 0){

                $data_formated = $this->format_data_service->userPanelDataFormatting($model_response["data"]);

                return response($data_formated, 200);

            }else{

                Log::channel('administration_error')->info("[Método: Index][Controlador: AdministrationModuleUserPanelController] - Nenhum registro de usuário encontrado no sistema");

                return response(["error" => "records_not_founded"], 404);

            }

        }else if(!$model_response["status"] && $model_response["error"]){

            Log::channel('administration_error')->error("[Método: Index][Controlador: AdministrationModuleUserPanelController] - Os registros não foram carregados - Erro: ".$model_response["error"]);

            return response(["error" => $model_response->content()], 500);

        }  

    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create() : \Illuminate\Http\Response
    {
        
        try{

            $data = ProfileModel::all();

            return response($data, 200);
    
        }catch(\Exception $e){

            return response(["error" => $e->getMessage()], 500);

        }

    }

    /**
     * Store a newly created resource in storage.
     *
     * @param App\Http\Requests\Modules\Administration\UserPanel\UserPanelUpdateRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(UserPanelStoreRequest $request) : \Illuminate\Http\Response
    {

        Gate::authorize('administration_write');

        try{

            DB::transaction(function () use ($request) {

                $this->user_model->profile_id = intval($request->profile_id);
                $this->user_model->name = $request->name;
                $this->user_model->email = $request->email;
                $this->user_model->password = Hash::make($request->password);
        
                $this->user_model->save();

                $data_for_email = [
                    "name" => $this->user_model->name,
                    "email" => $this->user_model->email,
                    "profile" => $this->user_model->profile->name,
                    "password" => $request->password
                ];

                event(new UserCreatedEvent($data_for_email));

                Log::channel('mail')->info("[Método: createUser][Model: UserModel] - Dados de acesso do novo usuário enviados com sucesso - Destinatário: ".$request->email);
                Log::channel('administration_action')->info("[Método: Store][Controlador: AdministrationModuleUserPanelController] - Usuário criado com sucesso - Email do usuário: ".$request->email." - Perfil do usuário: ". $request->profile_id);

            });

            return response("", 200);


        }catch(\Exception $e){

            Log::channel('administration_error')->error("[Método: Store][Controlador: AdministrationModuleUserPanelController] - Falha na criação do usuário - Erro: ".$e->getMessage());

            return response(["error" => $e->getMessage()], 500);

        }       

    }

    /**
     * Display the specified resource.
     *
     * @param string $id
     * @return \Illuminate\Http\Response
     */
    public function show($id) : \Illuminate\Http\Response
    {

        Gate::authorize('administration_read');

        $args = explode(".", request()->args);
        $limit = (int) $args[0];
        $where_value = $args[1];
        $actual_page = (int) $args[2];
            
        $model_response = $this->user_model->loadUsersWithPagination($limit, $actual_page, $where_value);

        if($model_response["status"] && !$model_response["error"]){

            if($model_response["data"]->total() > 0){

                $data_formated = $this->format_data_service->userPanelDataFormatting($model_response["data"]);

                return response($data_formated, 200);

            }else{

                Log::channel('administration_error')->error("[Método: Show][Controlador: AdministrationModuleUserPanelController] - Nenhum registro encontrado na pesquisa");

                return response(["error" => "records_not_founded"], 404);

            }

        }else if(!$model_response["status"] && $model_response["error"]){

            Log::channel('administration_error')->error("[Método: Show][Controlador: AdministrationModuleUserPanelController] - Erro: ".$model_response["error"]);

            return response(["error" => $model_response["error"]], 500);

        }  

    }

    /**
     * Update the specified resource in storage.
     *
     * @param App\Http\Requests\Modules\Administration\UserPanel\UserPanelStoreRequest $request
     * @param string $id
     * @return \Illuminate\Http\Response
     */
    public function update(UserPanelUpdateRequest $request, $id) : \Illuminate\Http\Response
    {

        Gate::authorize('administration_write');

        try{

            UserModel::where('id', $id)->update($request->only(["name", "email", "profile_id", "status"]));

            Log::channel('administration_action')->info("[Método: Update][Controlador: AdministrationModuleUserPanelController] - Usuário atualizado com sucesso - ID do usuário: ".$id);

            return response("", 200);

        }catch(\Exception $e){

            Log::channel('administration_error')->error("[Método: Update][Controlador: AdministrationModuleUserPanelController] - Falha na atualização do usuário - Erro: ".$e->getMessage());

            return response(["error" => $e->getMessage()], 500);

        }

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param string $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id) : \Illuminate\Http\Response
    {

        Gate::authorize('administration_write');

        try{

            DB::beginTransaction();

            $user = UserModel::find($id);

            // If user is linked to a service order
            if(!empty($user->service_order_has_user)){

                // Desvinculations with service_orders table
                // The user name must be removed from the service_order 
                foreach($user->service_order_has_user as $index => $record){

                    // If user is a pilot and his name is the same of the pilot of the actual service order
                    if($user->profile_id == 3 && ($record->service_order->pilot_name === $user->name)){

                        ServiceOrderModel::where("id", $record->service_order_id)
                        ->where("pilot_name", $user->name)
                        ->update(["pilot_name" => null]);
                    
                    // If user is a client and his name is the same of the client of the actual service order
                    }else if($user->profile_id == 4 && ($record->service_order->client_name === $user->name)){

                        ServiceOrderModel::where("id", $record->service_order_id)
                        ->where("client_name", $user->name)
                        ->update(["client_name" => null]);
                    
                    // If the name of the user is the same of the creator of the actual service order
                    }else if(($record->service_order->creator_name === $user->name)){

                        ServiceOrderModel::where("id", $record->service_order_id)
                        ->where("creator_name", $user->name)
                        ->update(["creator_name" => null]);

                    }

                }

            }

            // Desvinculations with service_orders_has_user table 
            // The relations with the user id are deleted
            $user->service_order_has_user()->delete();

            // The user record is soft deleted
            UserModel::where('id', $id)->update(["status" => false]);
            UserModel::where('id', $id)->delete();

            // Destroy user session?

            Log::channel('administration_action')->info("[Método: Destroy][Controlador: AdministrationModuleUserPanelController] - Usuário removido com sucesso - ID do usuário: ".$id);

            DB::Commit();

            return response("", 200);

        }catch(\Exception $e){

            Log::channel('administration_error')->error("[Método: Destroy][Controlador: AdministrationModuleUserPanelController] - Falha na remoção do usuário - Erro: ".$e->getMessage());

            DB::rollBack();

            return response(["error"=> $e->getMessage()], 500);

        }

    }
    
}
