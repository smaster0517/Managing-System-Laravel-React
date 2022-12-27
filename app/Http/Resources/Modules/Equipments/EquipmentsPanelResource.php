<?php

namespace App\Http\Resources\Modules\Equipments;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class EquipmentsPanelResource extends JsonResource
{

    private LengthAwarePaginator $data;
    private array $formatedData = [];

    function __construct(LengthAwarePaginator $data)
    {
        $this->data = $data;
    }

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        foreach ($this->data as $row => $equipment) {

            $this->formatedData["records"][$row] = [
                "id" => $equipment->id,
                "image_url" => Storage::url($equipment->image->path),
                "name" => $equipment->name,
                "manufacturer" => $equipment->manufacturer,
                "model" => $equipment->model,
                "record_number" => $equipment->record_number,
                "serial_number" => $equipment->serial_number,
                "service_orders" => [
                    "total" => $equipment->service_order_flight_plan()->distinct('service_order_id')->count(),
                    "data" => []
                ],
                "incidents" => [
                    "total" => "",
                    "data" => []
                ],
                "weight" => $equipment->weight,
                "observation" => $equipment->observation,
                "purchase_date" => empty($equipment->purchase_date) ? "nunca" : $equipment->purchase_date,
                "created_at" => $equipment->created_at,
                "updated_at" => $equipment->updated_at
            ];

            // Related flight plan that exists in service order
            // Equipment is used in a flight plan that exists in a service order
            if (!is_null($equipment->service_order_flight_plan)) {

                foreach ($equipment->service_order_flight_plan as $pivot_row => $service_order_flight_plan) {
                    // Service order and flight plan of pivot
                    $service_order = $service_order_flight_plan->service_order;
                    $flight_plan = $service_order_flight_plan->flight_plan;
                }
            }
        }

        $this->formatedData["total_records"] = $this->data->total();
        $this->formatedData["records_per_page"] = $this->data->perPage();
        $this->formatedData["total_pages"] = $this->data->lastPage();

        return $this->formatedData;
    }
}
