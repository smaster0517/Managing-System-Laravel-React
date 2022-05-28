<?php

namespace App\Http\Controllers\Modules\Incident;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Incidents\IncidentsModel;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;
// Form Requests
use App\Http\Requests\Modules\Incidents\IncidentStoreRequest;
use App\Http\Requests\Modules\Incidents\IncidentUpdateRequest;
// Log
use Illuminate\Support\Facades\Log;

class IncidentModuleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index() : \Illuminate\Http\Response
    {
        Gate::authorize('incidents_read');

        $args = explode(".", request()->args);
        $limit = (int) $args[0];
        $where_value = $args[1];
        $actual_page = (int) $args[2];

        $model = new IncidentsModel();

        $model_response = $model->loadIncidentsWithPagination($limit, $actual_page, $where_value);

        if($model_response["status"] && !$model_response["error"]){
    
            if($model_response["data"]->total() > 0){

                $data_formated = $this->formatDataForTable($model_response["data"]);

                return response($data_formated, 200);

            }else{

                Log::channel('incidents_error')->error("[Método: Index][Controlador: IncidentModuleController] - Nenhum registro de incidente foi encontrado no sistema");

                return response(["error" => "records_not_founded"], 404);

            }

        }else if(!$model_response["status"] && $model_response["error"]){

            Log::channel('incidents_error')->error("[Método: Index][Controlador: IncidentModuleController] - Os registros não foram carregados - Erro: ".$model_response["error"]);

            return response(["error" => $model_response["error"]], 500);

        }  
    }

    /**
     * Função para formatação dos dados para o painel de incidentes
     * Os dados são tratados e persistidos em uma matriz
     * 
     *
     * @param object $data
     * @return array
     */
    private function formatDataForTable(LengthAwarePaginator $data) : array {

        $arr_with_formated_data = [];

        foreach($data->items() as $row => $record){
            
            $arr_with_formated_data["records"][$row] = array(
                "incident_id" => $record->id,
                "incident_type" => $record->tipo_incidente,
                "description" => $record->descricao,
                "incident_date" => $record->dh_incidente
            );

        }

        $arr_with_formated_data["total_records_founded"] = $data->total();
        $arr_with_formated_data["records_per_page"] = $data->perPage();
        $arr_with_formated_data["total_pages"] = $data->lastPage();

        return $arr_with_formated_data;

    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  App\Http\Requests\Modules\Incidents\IncidentStoreRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(IncidentStoreRequest $request) : \Illuminate\Http\Response
    {
        Gate::authorize('incidents_write');

        try{

            IncidentsModel::create([
                "tipo_incidente" => $request->incident_type,
                "descricao" => $request->description,
                "dh_incidente" => $request->incident_date
            ]);

            Log::channel('incidents_action')->info("[Método: Store][Controlador: IncidentModuleController] - Incidente criado com sucesso");

            return response("", 200);

        }catch(\Exception $e){

            Log::channel('incidents_error')->error("[Método: Store][Controlador: IncidentModuleController] - Falha na criação do incidente - Erro: ".$e->getMessage());

            return response(["error" => $e->getMessage()], 500);

        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id) : \Illuminate\Http\Response
    {
        Gate::authorize('incidents_read');

        $args = explode(".", request()->args);
        $limit = (int) $args[0];
        $where_value = $args[1];
        $actual_page = (int) $args[2];

        $model = new IncidentsModel();

        $model_response = $model->loadIncidentsWithPagination($limit, $actual_page, $where_value);

        if($model_response["status"] && !$model_response["error"]){
    
            if($model_response["data"]->total() > 0){

                $data_formated = $this->formatDataForTable($model_response["data"]);

                return response($data_formated, 200);

            }else{

                Log::channel('incidents_error')->error("[Método: Show][Controlador: IncidentModuleController] - Nenhum registro encontrado na pesquisa");

                return response(["error" => "records_not_founded"], 404);

            }

        }else if(!$model_response["status"] && $model_response["error"]){

            Log::channel('incidents_error')->error("[Método: Show][Controlador: IncidentModuleController] - Erro: ".$model_response["error"]);

            return response(["error" => $model_response["error"]], 500);

        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  App\Http\Requests\Modules\Incidents\IncidentUpdateRequest  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(IncidentUpdateRequest $request, $id) : \Illuminate\Http\Response
    {
        Gate::authorize('incidents_write');

        try{

            IncidentsModel::where('id', $id)->update([
                "tipo_incidente" => $request->incident_type,
                "descricao" => $request->description,
                "dh_incidente" => $request->incident_date
            ]);

            Log::channel('incidents_action')->info("[Método: Update][Controlador: IncidentModuleController] - Incidente atualizado com sucesso - ID do incidente: ".$id);

            return response("", 200);

        }catch(\Exception $e){

            Log::channel('incidents_error')->error("[Método: Update][Controlador: IncidentModuleController] - Falha na atualização do incidente - Erro: ".$e->getMessage());

            return response(["error" => $e->getMessage()], 200);

        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id) : \Illuminate\Http\Response
    {
        Gate::authorize('incidents_write');
        
        try{

            IncidentsModel::where('id', $id)->delete();

            Log::channel('incidents_action')->info("[Método: Destroy][Controlador: IncidentModuleController] - Incidente removido com sucesso - ID do incidente: ".$id);

            return response("", 200);

        }catch(\Exception $e){

            Log::channel('incidents_error')->error("[Método: Destroy][Controlador: IncidentModuleController] - Falha na remoção do incidente - Erro: ".$e->getMessage());

            return response(["error" => $e->getMessage()], 500);

        }
    }
}
