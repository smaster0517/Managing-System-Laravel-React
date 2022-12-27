<?php

namespace App\Listeners\Auth\Login;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Carbon;
// Custom
use App\Models\Users\User;
use App\Models\Accesses\AnnualTraffic;
use App\Notifications\Auth\LoginNotification;

class LoginSuccessfulListener
{

    function __construct(User $userModel, AnnualTraffic $annualAccessesModel)
    {
        $this->userModel = $userModel;
        $this->annualAccessesModel = $annualAccessesModel;
    }

    function handle($event)
    {
        // Get actual date, month and device used
        $date = Carbon::now();
        $month_column = strtolower($date->format('F'));
        $device_column = "personal_computer";

        $user = $this->userModel->find($event->user->id);
        
        $user->last_access = $date;
        $user->save();

        $user_annual_accesses = $this->annualAccessesModel->where("user_id", $user->id)->first();
        $user_annual_accesses->$month_column += 1;
        $user_annual_accesses->save();

        $user->notify(new LoginNotification($user));
    }
}
