<?php

namespace App\Http\Resources\Modules\Equipments;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BatteriesPanelResource extends JsonResource
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
        foreach ($this->data as $row => $battery) {

            $this->formatedData["records"][$row] = [
                "id" => $battery->id,
                "image_url" => Storage::url($battery->image->path),
                "name" => $battery->name,
                "manufacturer" => $battery->manufacturer,
                "model" => $battery->model,
                "total_service_orders" => $battery->service_orders()->distinct('service_order_id')->count(),
                "serial_number" => $battery->serial_number,
                "last_charge" => empty($battery->last_charge) ? "nunca" : $battery->last_charge,
                "created_at" => $battery->created_at,
                "updated_at" => $battery->updated_at
            ];

            // Related flight plan that exists in service order
            // Battery is used in a flight plan that exists in a service order
            if (!is_null($battery->service_order_flight_plan)) {

                // Service order and flight plan of pivot
                $service_order = $battery->service_order_flight_plan->service_order;
                $flight_plan = $battery->service_order_flight_plan->flight_plan;


            }
        }

        $this->formatedData["total_records"] = $this->data->total();
        $this->formatedData["records_per_page"] = $this->data->perPage();
        $this->formatedData["total_pages"] = $this->data->lastPage();

        return $this->formatedData;
    }
}
