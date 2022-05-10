<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReportsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->dateTime("dh_criacao")->useCurrent();
            $table->dateTime("dh_atualizacao")->nullable(true);
            $table->dateTime("dh_inicio_voo");
            $table->dateTime("dh_fim_voo");
            $table->mediumText("log_voo");
            $table->text("observacao");
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('reports');
    }
}
