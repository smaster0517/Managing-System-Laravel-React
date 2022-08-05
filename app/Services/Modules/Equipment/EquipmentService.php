<?php

namespace App\Services\Modules\Equipment;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
// Custom
use App\Models\Equipments\EquipmentModel;
use App\Http\Resources\Modules\Equipments\EquipmentsPanelResource;
use App\Http\Requests\Modules\Equipments\Drone\StoreDroneRequest;
use App\Http\Requests\Modules\Equipments\Drone\UpdateDroneRequest;

class EquipmentService {

    /**
    * Load all equipments with pagination.
    *
    * @param int $limit
    * @param int $current_page
    * @param int|string $where_value
    * @return \Illuminate\Http\Response
    */
    public function loadResourceWithPagination(int $limit, int $current_page, int|string $where_value){

        $data = EquipmentModel::where("equipments.deleted_at", null)
        ->when($where_value, function ($query, $where_value) {

            $query->when(is_numeric($where_value), function($query) use ($where_value){

                $query->where('id', $where_value)
                ->orWhere('weight', $where_value);

            }, function($query) use ($where_value){

                $query->where('name', 'LIKE', '%'.$where_value.'%')
                ->orWhere('manufacturer', 'LIKE', '%'.$where_value.'%')
                ->orWhere('model', 'LIKE', '%'.$where_value.'%')
                ->orWhere('record_number', 'LIKE', '%'.$where_value.'%')
                ->orWhere('serial_number', 'LIKE', '%'.$where_value.'%');

            });

        })
        ->orderBy('id')
        ->paginate($limit, $columns = ['*'], $pageName = 'page', $current_page);
        
        if($data->total() > 0){
            return response(new EquipmentsPanelResource($data), 200);
        }else{
            return response(["message" => "Nenhum equipamento encontrado."], 404);
        }

    }

    /**
     * Create equipment.
     *
     * @param $request
     * @return \Illuminate\Http\Response
     */
    public function createResource(Request $request) {

        DB::transaction(function () use ($request) {

            // Filename is the hash of the content
            $content_hash = md5(file_get_contents($request->file('image'))); 
            $filename = "$content_hash.jpg";
            $storage_folder = "public/images/equipment/";

            EquipmentModel::create([...$request->only(["name", "manufacturer", "model", "record_number", "serial_number", "weight", "observation", "purchase_date"]), "image" => $filename]);

            // Image is stored just if does not already exists
            if (!Storage::disk('public')->exists($storage_folder.$filename)) {
                $path = $request->file('image')->storeAs($storage_folder, $filename);
            }

        });

        return response(["message" => "Equipamento criado com sucesso!"], 200);

    }

    /**
     * Update equipment.
     *
     * @param $request
     * @param $equipment_id
     * @return \Illuminate\Http\Response
     */
    public function updateResource(Request $request, $equipment_id) {

        DB::transaction(function () use ($request, $equipment_id) {

            $equipment = EquipmentModel::findOrFail($equipment_id);

            if(!empty($request->image)){

                // Filename is the hash of the content
                $content_hash = md5(file_get_contents($request->file('image'))); 
                $filename = "$content_hash.jpg";
                $storage_folder = "public/images/equipment/";

                $equipment->update([...$request->only(["name", "manufacturer", "model", "record_number", "serial_number", "weight", "observation", "purchase_date"]), "image" => $filename]);

                // Image is stored just if does not already exists
                if (!Storage::disk('public')->exists($storage_folder.$filename)) {
                    $path = $request->file('image')->storeAs($storage_folder, $filename);
                }

            }else{

                $equipment->update([...$request->only(["name", "manufacturer", "model", "record_number", "serial_number", "weight", "observation", "purchase_date"])]);

            } 

        });

        return response(["message" => "Equipamento atualizado com sucesso!"], 200);

    }

    /**
     * Soft delete equipment.
     *
     * @param $equipment_id
     * @return \Illuminate\Http\Response
     */
    public function deleteResource($equipment_id) {
        
        DB::transaction(function() use ($equipment_id){

            $equipment = EquipmentModel::find($equipment_id);

            Storage::disk('public')->delete("images/equipment/".$equipment->image);

            $equipment->delete();

        });

        return response(["message" => "Equipamento deletado com sucesso!"], 200);

    }
    
}