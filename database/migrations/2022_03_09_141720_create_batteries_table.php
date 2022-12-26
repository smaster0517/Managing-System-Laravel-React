<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBatteriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('batteries', function (Blueprint $table) {
            $table->id();
            $table->foreignId("service_order_flight_plan_id")->nullable(true)->constrained('service_order_flight_plan');
            $table->string('name');
            $table->string('manufacturer');
            $table->string('model');
            $table->string('serial_number');
            $table->datetime('last_charge');
            $table->string('observation')->nullable(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('batteries');
    }
}
