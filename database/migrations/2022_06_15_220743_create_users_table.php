<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('profiles');
            $table->foreignId('complementary_data_id')->nullable(true)->constrained('user_complementary_data')->onDelete('cascade');
            $table->string("name");
            $table->string("email");
            $table->string("password");
            $table->boolean("status")->default(false);
            $table->dateTime("last_access")->nullable(true);
            $table->timestamps();   
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
        Schema::dropIfExists('users');
    }
}
