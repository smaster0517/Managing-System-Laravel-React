<?php

namespace App\Models\Pivot;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Models
use App\Models\FlightPlans\FlightPlan;
use App\Models\ServiceOrders\ServiceOrder;
use App\Models\Incidents\Incident;

class ServiceOrderFlightPlan extends Model
{
    use HasFactory;

    public $table = "service_order_flight_plan";

    function flight_plan(){
        return $this->belongsTo(FlightPlan::class, "flight_plan_id", "id");
    }

    function service_order(){
        return $this->belongsTo(ServiceOrder::class, "service_order_id", "id");
    }

    function incidents(){
        return $this->hasMany(Incident::class, "service_order_flight_plan_id");
    }
}