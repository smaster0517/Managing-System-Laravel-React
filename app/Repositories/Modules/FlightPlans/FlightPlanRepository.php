<?php

namespace App\Repositories\Modules\FlightPlans;

use App\Contracts\RepositoryInterface;
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

    function getPaginate(string $limit, string $order_by, string $page_number, string $search, array $filters)
    {
        return $this->flightPlanModel
            ->with(["incidents", "service_orders", "logs"])
            ->search($search) // scope
            ->filter($filters) // scope
            ->orderBy($order_by)
            ->paginate($limit, $columns = ['*'], $pageName = 'page', $page_number);
    }

    function createOne(Collection $data)
    {
        $flight_plan = $this->flightPlanModel->create([
            "creator_id" => Auth::user()->id,
            "name" => $data->get("name"),
            "file" => $data->get("filename"),
            "coordinates" => $data->get("coordinates"),
            "state" => $data->get("state"),
            "city" => $data->get("city"),
            "description" => $data->get("description")
        ]);

        // Flight plan is stored just if does not already exists
        if (!Storage::disk('public')->exists($data->get("path"))) {
            Storage::disk('public')->put($data->get('path'), $data->get('file_content'));
        }

        return $flight_plan;
    }

    function updateOne(Collection $data, string $identifier)
    {
        $flight_plan = $this->flightPlanModel->findOrFail($identifier);

        $flight_plan->update($data->only(["report_id", "incident_id", "name", "description"]));

        $flight_plan->refresh();

        return $flight_plan;
    }

    function deleteOne(string $identifier)
    {
        return DB::transaction(function () use ($identifier) {

            $flight_plan =  $this->flightPlanModel->findOrFail($identifier);

            $flight_plan->delete();

            return $flight_plan;
        });
    }
}
