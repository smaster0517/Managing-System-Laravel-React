<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Users\User;
use App\Models\Accesses\AnnualTraffic;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $user = User::create([
            "name" => "Master",
            "email" => env("ADMIN_EMAIL"),
            "password" => Hash::make(env("ADMIN_PASS")),
            "status" => true,
            "profile_id" => 1
        ]);

        AnnualTraffic::create([
            "user_id" => $user->id,
            "january" => 0,
            "february" => 0,
            "march" => 0,
            "april" => 0,
            "may" => 0,
            "june" => 0,
            "july" => 0,
            "august" => 0,
            "september" => 0,
            "october" => 0,
            "november" => 0,
            "december" => 0
        ]);
    }
}
