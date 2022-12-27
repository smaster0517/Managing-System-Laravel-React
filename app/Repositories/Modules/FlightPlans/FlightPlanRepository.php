<?php

namespace App\Repositories\Modules\FlightPlans;

use App\Repositories\Contracts\RepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
// Model
use App\Models\FlightPlans\FlightPlan;

class FlightPlanRepository implements RepositoryInterface
{
    public function __construct(FlightPlan $flightPlanModel)
    {
        $this->flightPlanModel = $flightPlanModel;
    }

    function getPaginate(string $limit, string $page, string $search)
    {   
        return $this->flightPlanModel
            ->with(["service_orders"]) // pivot
            ->search($search) // scope
            ->paginate($limit, $columns = ['*'], $pageName = 'page', $page);
    }

    function createOne(Collection $data)
    {
        
        // Flight plan is stored just if does not already exists
        if (Storage::disk('public')->exists($data->get("path"))) {
            return response(["message" => "O plano de voo já existe!"], 500);
        }
        
        $flight_plan = $this->flightPlanModel->create([
            "creator_id" => Auth::user()->id,
            "name" => $data->get("name"),
            "coordinates" => $data->get("coordinates"),
            "state" => $data->get("state"),
            "city" => $data->get("city"),
            "description" => $data->get("description")
        ]);

        // File save
        $flight_plan->file()->create([
            "name" => $data->get("routes")["filename"],
            "path" => $data->get("routes")["path"]
        ]);

        $image_path = "images/flight_plans/" . $data->get("image_filename");

        // Image save
        $flight_plan->image()->create([
            "path" => $image_path
        ]);

        Storage::disk('public')->put($data->get("routes")["path"], $data->get("routes")["content"]);
        Storage::disk('public')->put($image_path, $data->get("image_file"));

        return $flight_plan;
    }

    function updateOne(Collection $data, string $identifier)
    {
        $flight_plan = $this->flightPlanModel->findOrFail($identifier);

        $flight_plan->update($data->only(["name", "description"])->all());

        $flight_plan->refresh();

        return $flight_plan;
    }

    function delete(array $ids)
    {
        return DB::transaction(function () use ($ids) {

            $undeleteable_ids = [];
            foreach ($ids as $flight_plan_id) {

                $flight_plan =  $this->flightPlanModel->findOrFail($flight_plan_id);

                // Check if user is related to a active service order 
                foreach ($flight_plan->service_orders as $service_order) {
                    if ($service_order->status) {
                        array_push($undeleteable_ids, $flight_plan_id);
                    }
                }
            }

            // Deletion will occur only if all flight plans can be deleted
            if (count($undeleteable_ids) === 0) {
                $flight_plan->whereIn("id", $ids)->delete();
            }

            return $undeleteable_ids;
        });
    }
}
