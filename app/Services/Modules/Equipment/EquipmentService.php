<?php

namespace App\Services\Modules\Equipment;

// Repository
use App\Repositories\Modules\Equipment\EquipmentRepository;
// Resources
use App\Http\Resources\Modules\Equipments\EquipmentsPanelResource;
// Contracts
use App\Contracts\ServiceInterface;

class EquipmentService implements ServiceInterface
{
    function __construct(EquipmentRepository $equipmentRepository)
    {
        $this->repository = $equipmentRepository;
    }

    public function loadResourceWithPagination(string $limit, string $order_by, string $page_number, string $search, array $filters)
    {
        $data = $this->repository->getPaginate($limit, $order_by, $page_number, $search, $filters);

        if ($data->total() > 0) {
            return response(new EquipmentsPanelResource($data), 200);
        } else {
            return response(["message" => "Nenhum equipamento encontrado."], 404);
        }
    }

    public function createResource(array $data)
    {
        $equipment = $this->repository->createOne(collect($data));

        return response(["message" => "Equipamento criado com sucesso!"], 201);
    }

    public function updateResource(array $data, string $identifier)
    {
        $equipment = $this->repository->updateOne(collect($data), $identifier);

        return response(["message" => "Equipamento atualizado com sucesso!"], 200);
    }

    /**
     * Soft delete equipment.
     *
     * @param $equipment_id
     * @return \Illuminate\Http\Response
     */
    public function deleteResource(string $identifier)
    {
        $equipment = $this->repository->deleteOne($identifier);

        return response(["message" => "Equipamento deletado com sucesso!"], 200);
    }
}
