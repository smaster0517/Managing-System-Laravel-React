<?php

namespace App\Models\ProfileAndModule;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\DB;

class ProfileHasModuleModel extends Model
{
    use HasFactory;

    protected $table = "profile_has_module";
    public $incrementing = false;
    protected $fillable = ["id_modulo", "id_perfil", "ler", "escrever"];
    public $timestamps = false;

    // Método para criar um novo relacionamento perfil-módulo
    function newProfileRelationship($profileID) : bool{

        try{

            DB::beginTransaction();

            ProfileHasModuleModel::insert([
                ["id_modulo"=> 1, "id_perfil"=> $profileID, "ler"=> 0, "escrever"=> 0],
                ["id_modulo"=> 2, "id_perfil"=> $profileID, "ler"=> 0, "escrever"=> 0],
                ["id_modulo"=> 3, "id_perfil"=> $profileID, "ler"=> 0, "escrever"=> 0],
                ["id_modulo"=> 4, "id_perfil"=> $profileID, "ler"=> 0, "escrever"=> 0],
                ["id_modulo"=> 5, "id_perfil"=> $profileID, "ler"=> 0, "escrever"=> 0]
            ]);

            // Se a operação for bem sucedida, confirmar
            DB::commit();

            return true;
            
        }catch(\Exception $e){

            DB::rollBack();

            return false;

        }

        
    }

    // Método para trazer todos os perfis e seus relacionamentos com todos os módulos
    function loadProfilesModulesRelationship($offset, $limit) : array {

        try{

            DB::beginTransaction();

            // Query Builder para fazer o relacionamento
            $allProfilesWithModules = DB::table('profile_has_module')
            ->join('profile', 'profile_has_module.id_perfil', '=', 'profile.id')
            ->select('profile_has_module.id_modulo', 'profile_has_module.id_perfil', 'profile.nome as nome_perfil', 'profile.acesso_geral', 'profile_has_module.ler', 'profile_has_module.escrever')
            ->offset($offset)->limit($limit)->get();

            if($allProfilesWithModules){

                // Assim como na tabela de usuários, é preciso ter o valor do total de registros para calcular a paginação
                // Mas, nesse caso, é preciso dividir o total por 5, porque cada registro da tabela no front corresponde a 5 registros da tabela do banco de dados
                $totalTableRecords = ProfileHasModuleModel::all()->count() / 5;

                $response = [
                    "referencialValueForCalcPages" => $totalTableRecords,
                    "selectedRecords" => $allProfilesWithModules
                ];

                 DB::commit();

                 return ["status" => true, "error" => false, "data" => $response];

            }else{

                DB::rollBack();

                return ["status" => false, "error" => true];

            }
                         
        }catch(\Exception $e){

            DB::rollBack();

            return ["status" => false, "error" => true];

        }

    }

    function loadProfileModuleRelationshipExact($profile_id, $profile_name) : array {

        try{

            DB::beginTransaction();

            $profilePowers = DB::table('profile_has_module')
            ->join('profile', 'profile_has_module.id_perfil', '=', 'profile.id')
            ->where('profile_has_module.id_perfil', '=', $profile_id)
            ->orWhere('profile.nome', '=', $profile_name)
            ->select('profile_has_module.id_modulo', 'profile_has_module.id_perfil', 'profile.nome as nome_perfil', 'profile.acesso_geral', 'profile_has_module.ler', 'profile_has_module.escrever')
            ->get();

            return ["status" => true, "error" => false, "data" => $profilePowers];


        }catch(\Exception $e){

            DB::rollBack();

            return ["status" => false, "error" => true];

        }

    }

    // Método para trazer o relacionamento de um perfil com todos os módulos
    function loadProfileModuleRelationshipApproximate($value_searched, $offset, $limit) : array {

        try{

            DB::beginTransaction();

            $allProfilesWithModules = DB::table('profile_has_module')
            ->join('profile', 'profile_has_module.id_perfil', '=', 'profile.id')
            ->join('module', 'profile_has_module.id_modulo', '=', 'module.id')
            ->select('profile_has_module.id_modulo', 'profile_has_module.id_perfil', 'profile.nome as nome_perfil', 'profile.acesso_geral', 'profile_has_module.ler', 'profile_has_module.escrever')
            ->where('profile_has_module.id_perfil', 'LIKE', '%'.$value_searched.'%')
            ->orWhere('profile.nome', 'LIKE', '%'.$value_searched.'%')
            ->offset($offset)->limit($limit)->get();

            if($allProfilesWithModules){

                // Assim como na tabela de usuários, é preciso ter o valor do total de registros para calcular a paginação
                // Mas, nesse caso, é preciso dividir o total por 5, porque cada registro da tabela no front corresponde a 5 registros da tabela do banco de dados
                $totalTableRecords = count($allProfilesWithModules) / 5;

                $response = [
                    "referencialValueForCalcPages" => $totalTableRecords,
                    "selectedRecords" => $allProfilesWithModules
                ];

                 DB::commit();

                 return ["status" => true, "error" => false, "data" => $response];

            }else{

                DB::rollBack();

                return ["status" => false, "error" => true];

            }


        }catch(\Exception $e){

            DB::rollBack();

            return ["status" => false, "error" => true];

        }


    }

    function updateProfileModuleRelationship($profile_id, $data) : array {

        try{

            DB::beginTransaction();

            for($actual_module = 1; $actual_module <= 5; $actual_module++){

                ProfileHasModuleModel::where('id_perfil', $profile_id)
                ->where('id_modulo', $actual_module)
                ->update(
                    [
                    'ler' => $data[$actual_module]["read"], 
                    'escrever' => $data[$actual_module]["write"]
                    ]
                );

            }

            DB::commit();

            return ["status" => true, "error" => false];

        }catch(\Exception $e){

            DB::rollBack();

        }

    }

}
