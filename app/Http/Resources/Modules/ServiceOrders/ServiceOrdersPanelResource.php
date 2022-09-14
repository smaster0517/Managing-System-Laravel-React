<?php

namespace App\Http\Resources\Modules\ServiceOrders;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;

class ServiceOrdersPanelResource extends JsonResource
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
        foreach ($this->data as $row => $service_order) {

            $this->formatedData["records"][$row] = [
                "id" => $service_order->id,
                "number" => $service_order->number,
                "start_date" => $service_order->start_date,
                "end_date" => $service_order->end_date,
                "status" => $service_order->status,
                "observation" => $service_order->observation,
                "created_at" => strtotime($service_order->created_at),
                "updated_at" => empty($service_order->updated_at) ? "N/A" : strtotime($service_order->updated_at)
            ];

            // ============================== RELATED FLIGHT PLANS ============================== //

            if ($service_order->flight_plans->count() > 0) {
                foreach ($service_order->flight_plans as $index => $flight_plan) {

                    $this->formatedData["records"][$row]["flight_plans"][$index]["id"] = $flight_plan->id;
                    $this->formatedData["records"][$row]["flight_plans"][$index]["file"] = $flight_plan->coordinates_file;
                    $this->formatedData["records"][$row]["flight_plans"][$index]["status"] = $flight_plan->status;
                    $this->formatedData["records"][$row]["flight_plans"][$index]["deleted_at"] = $flight_plan->deleted_at;
                }
            } else {
                $this->formatedData["records"][$row]["flight_plans"] = array();
            }

            // ============================== RELATED USERS ============================== //

            if ($service_order->users->count() > 0) {
                foreach ($service_order->users as $row => $user) {

                    // Get creator, pilot and client 
                    $this->formatedData["records"][$row][$user->pivot->role]["id"] = $user->id;
                    $this->formatedData["records"][$row][$user->pivot->role]["profile_id"] = $user->profile_id;
                    $this->formatedData["records"][$row][$user->pivot->role]["name"] = $user->name;
                    $this->formatedData["records"][$row][$user->pivot->role]["status"] = $user->status;
                    $this->formatedData["records"][$row][$user->pivot->role]["deleted_at"] = $user->deleted_at;
                }
            }

            $this->formatedData["total_records"] = $this->data->total();
            $this->formatedData["records_per_page"] = $this->data->perPage();
            $this->formatedData["total_pages"] = $this->data->lastPage();

            dd($this->formatedData);

            return $this->formatedData;
        }
    }
}
