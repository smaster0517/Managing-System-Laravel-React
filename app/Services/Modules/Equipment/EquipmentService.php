<?php

namespace App\Services\Modules\Equipment;

// Contracts
use App\Services\Contracts\ServiceInterface;
// Repository
use App\Repositories\Modules\Equipments\EquipmentRepository;
// Resources
use App\Http\Resources\Modules\Equipments\EquipmentsPanelResource;

class EquipmentService implements ServiceInterface
{
    function __construct(EquipmentRepository $equipmentRepository)
    {
        $this->repository = $equipmentRepository;
    }

    public function getPaginate(string $limit, string $page, string $search)
    {
        $data = $this->repository->getPaginate($limit, $page, $search);

        if ($data->total() > 0) {
            return response(new EquipmentsPanelResource($data), 200);
        } else {
            return response(["message" => "Nenhum equipamento encontrado."], 404);
        }
    }

    public function createOne(array $data)
    {
        // Filename is the hash of the content
        $file_content = file_get_contents($data['image']);
        $content_hash = md5($file_content);
        $filename = "$content_hash.jpg";
        $path = "images/equipments/" . $filename;

        $data["file_content"] = $file_content;
        $data["path"] = $path;

        $equipment = $this->repository->createOne(collect($data));

        return response(["message" => "Equipamento criado com sucesso!"], 201);
    }

    public function updateOne(array $data, string $identifier)
    {
        if (isset($data['image'])) {

            // Filename is the hash of the content
            $file_content = file_get_contents($data['image']);
            $content_hash = md5($file_content);
            $filename = "$content_hash.jpg";
            $path = "images/equipments/" . $filename;

            $data["change_file"] = 1;
            $data["file_content"] = $file_content;
            $data["path"] = $path;
        } else {
            $data["change_file"] = 0;
        }

        $equipment = $this->repository->updateOne(collect($data), $identifier);

        return response(["message" => "Equipamento atualizado com sucesso!"], 200);
    }

    /**
     * Soft delete equipment.
     *
     * @param $equipment_id
     * @return \Illuminate\Http\Response
     */
    public function delete(array $ids)
    {
        $equipment = $this->repository->delete($ids);

        return response(["message" => "Dele????o realizada com sucesso!"], 200);
    }
}
