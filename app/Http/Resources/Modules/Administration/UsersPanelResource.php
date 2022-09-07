<?php

namespace App\Http\Resources\Modules\Administration;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;

class UsersPanelResource extends JsonResource
{

    private LengthAwarePaginator $data;

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
        $formated_data["records"] = array();

        foreach ($this->data as $row => $user) {

            $formated_data["records"][$row] = [
                "id" => $user->id,
                "name" => $user->name,
                "profile_id" => $user->profile->id,
                "profile_name" => $user->profile->name,
                "email" => $user->email,
                "status" => $user->status,
                "last_access" => empty($user->last_access) ? "N/A" : date('d-m-Y h:i', strtotime($user->last_access)),
                "created_at" => date('d-m-Y h:i', strtotime($user->created_at)),
                "updated_at" => empty($user->updated_at) ? "N/A" : date('d-m-Y h:i', strtotime($user->updated_at))
            ];

            if ((bool) $user->status && empty($user->deleted_at)) {
                $formated_data["records"][$row]["status_badge"] = ["Ativo", "success"];
            } else if ((bool) !$user->status && empty($user->deleted_at)) {
                $formated_data["records"][$row]["status_badge"] = ["Inativo", "error"];
            } else if (!empty($user->deleted_at)) {
                $formated_data["records"][$row]["status_badge"] = ["Removido", "error"];
            }
        }

        $formated_data["total_records"] = $this->data->total();
        $formated_data["records_per_page"] = $this->data->perPage();
        $formated_data["total_pages"] = $this->data->lastPage();

        return $formated_data;
    }
}
