<?php

namespace App\Services\Modules\Equipment;

// Contracts
use App\Services\Contracts\ServiceInterface;
// Repository
use App\Repositories\Modules\Equipments\BatteryRepository;
// Resources
use App\Http\Resources\Modules\Equipments\BatteriesPanelResource;

class BatteryService implements ServiceInterface
{
    function __construct(BatteryRepository $batteryRepository)
    {
        $this->repository = $batteryRepository;
    }

    public function getPaginate(string $limit, string $page, string $search)
    {
        $data = $this->repository->getPaginate($limit, $page, $search);

        if ($data->total() > 0) {
            return response(new BatteriesPanelResource($data), 200);
        } else {
            return response(["message" => "Nenhuma bateria encontrada."], 404);
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

        $battery = $this->repository->createOne(collect($data));

        return response(["message" => "Bateria criada com sucesso!"], 201);
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

        $battery = $this->repository->updateOne(collect($data), $identifier);

        return response(["message" => "Bateria atualizada com sucesso!"], 200);
    }

    /**
     * Soft delete battery.
     *
     * @param $battery_id
     * @return \Illuminate\Http\Response
     */
    public function delete(array $ids)
    {
        $battery = $this->repository->delete($ids);

        return response(["message" => "Dele????o realizada com sucesso!"], 200);
    }
}
