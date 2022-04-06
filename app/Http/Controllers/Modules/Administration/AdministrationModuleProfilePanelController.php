<?php

namespace App\Http\Controllers\Modules\Administration;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProfileAndModule\ProfileHasModuleModel;
use App\Models\ProfileAndModule\ProfileModel;
use Illuminate\Pagination\LengthAwarePaginator;

class AdministrationModuleProfilePanelController extends Controller
{
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index() : \Illuminate\Http\Response
    {

        $args = explode(".", request()->args);
        $limit = (int) $args[0]*5;
        $where_value = $args[1];
        $actual_page = (int) $args[2];

        $model = new ProfileHasModuleModel();

        $model_response = $model->loadProfilesModulesRelationshipWithPagination($limit, $actual_page, $where_value);

        if($model_response["status"] && !$model_response["error"]){

            $data_formated = $this->formatDataForTable($model_response["data"]);

            return response($data_formated, 200);

        }else if(!$model_response["status"] && $model_response["error"]){

            return response(["status" => false, "error" => $response["error"]], 500);

        } 
        
    }

    /**
     * Função para formatação dos dados para a tabela de perfis
     *
     * @param object $data
     * @return array
     */
    private function formatDataForTable(LengthAwarePaginator $data) : array {

        $arr_with_formated_records = [];

        $row = 0;
        $relationship_of_current_profile_with_modules = [];
        $profile_row_counter = 0;

        // Cada um tem ou não os privilégios de "ler" e "escrever" em relação a cada um dos 5 módulos
        // Na tabela do banco de dados, cada perfil aparece 5 vezes, porque cada linha é a relação do perfil com 1 dos módulos
        // Aqui cada um desses conjunto de 5 registros é agrupado em um só
        foreach($data->items() as $row => $record){

            // Esse array recebe os dados básicos do perfil atualmente percorrido
            // Se hipoteticamente esse fosse o primeiro loop, esses dados seriam do primeiro perfil, e não mudariam nos próximos 4 loops (porque cada perfil tem 5 registros na tabela)
            $arr_with_formated_records[$profile_row_counter] = ["profile_id" => $record->id_perfil, "profile_name" =>  $record->nome_perfil, "modules" => array()]; 

            // Agora são recuperados os dados do relacionamento do perfil atual com o módulo atual, que é alterado a cada loop
            // O perfil se mantém por 5 loops, cada loop é o relacionamento dele com um dos módulos
            $module_name = $record->id_modulo == 1 ? "Administração" : ($record->id_modulo === 2 ? "Planos" : ($record->id_modulo === 3 ? "Ordens" : ($record->id_modulo === 4 ? "Relatorios" : "Incidentes")));
            $relationship_of_current_profile_with_modules[$record->id_modulo] = ["module_name" => $module_name, "profile_powers" => ["ler" => $record->ler, "escrever" => $record->escrever]];

            // Se o módulo atual for 5, já foram percorridos os 5 registros do perfil com 5 loops
            if($record->id_modulo == 5){

                // Os dados dos 5 loops, reunidos a cada loop, são persistidos em uma única posição
                // Essa fase, agora, é a transformação final dos dados dos 5 registros em uma única linha
                $arr_with_formated_records[$profile_row_counter]["modules"] = $relationship_of_current_profile_with_modules;

                $profile_row_counter += 1;

            }

        }

        $return_array["records"] = $arr_with_formated_records;
        $return_array["total_records_founded"] = $data->total()/5;
        $return_array["records_per_page"] = $data->perPage()/5;
        $return_array["total_pages"] = $data->lastPage();

        return $return_array;

    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request) : \Illuminate\Http\Response
    {

        $request->validate([
            'nome' => 'required|bail|string|unique:profile,nome'
        ]);
        
        $model = new ProfileModel();

        $model_response = $model->newProfile($request->except("auth"));

        if($model_response["status"] === true && !$model_response["error"]){

            return response(["error" => $model_response["error"]], 200);

        }else if(!$model_response["status"] && $model_response["error"]){

            return response(["error" => $model_response["error"]], 500);

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
        
        $args = explode(".", request()->args);
        $limit = (int) $args[0]*5;
        $where_value = $args[1];
        $actual_page = (int) $args[2];

        $model = new ProfileHasModuleModel();

        $model_response = $model->loadProfilesModulesRelationshipWithPagination($limit, $actual_page, $where_value);

        if($model_response["status"] && !$model_response["error"]){
            
            $data_formated = $this->formatDataForTable($model_response["data"]);

            return response($data_formated, 200);

        }else if(!$model_response["status"] && $model_response["error"]){
            
            return response(["error" => $model_response["error"]], 500);

        } 

    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id) : \Illuminate\Http\Response
    {

        $request->validate([
            'nome' => 'required|bail|string|unique:profile,nome'
        ]);
        
        $model = new ProfileModel();

        $model_response = $model->updateProfile((int) $id, $request->nome, $request->profile_modules_relationship);

        if($model_response["status"] && !$model_response["error"]){

            return response("", 200);

        }else if(!$model_response["status"] && $model_response["error"]){

            return response(["error" => $model_response["error"]], 500);

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
        $model = new ProfileModel();

        $model_response = $model->deleteProfile($id);

        if($model_response["status"] && !$model_response["error"]){

            return response("", 200);

        }else if(!$model_response["status"] && $model_response["error"]){

            return response(["error" => $model_response["error"]], 500);

        }

    }
    
}