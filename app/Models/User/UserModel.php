<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
// Custom Models
use Database\Factories\UserFactory;

class UserModel extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $table = "users";
    protected $guarded = [];

    /*
    * Scope for search
    */
    function scopeSearch($query, $value_searched)
    {
        return $query->when((bool) $value_searched, function ($query) use ($value_searched) {

            if (is_numeric($value_searched)) {
                $query->where('users.id', $value_searched);
            } else {
                $query->where('users.name', 'LIKE', '%' . $value_searched . '%')->orWhere('users.email', 'LIKE', '%' . $value_searched . '%');
            }
        });
    }

    /*
    * Scope for filter
    */
    function scopeFilter($query, $filters)
    {
        return $query->when((bool) $filters, function ($query) use ($filters) {

            foreach ($filters as $index => $filter) {
                $query->where($filter["column"], $filter["value"]);
            }
        });
    }

    /*
    * Relationship with user_complementary_data table
    */
    function complementary_data()
    {
        return $this->belongsTo("App\Models\User\UserComplementaryDataModel", "complementary_data_id");
    }

    /*
    * Relationship with sessions table
    */
    function sessions()
    {
        return $this->hasMany("App\Models\SessionModel", "user_id");
    }

    /*
    * Relationship with profile table
    */
    function profile()
    {
        return $this->belongsTo("App\Models\Profiles\ProfileModel", "profile_id");
    }

    /**
     * Distant relationship with profile_has_module table through profile table
     */
    function profile_modules_relationship()
    {
        return $this->hasManyThrough("App\Models\Pivot\ProfileHasModuleModel", "App\Models\Profiles\ProfileModel");
    }

    /*
    * Relationship with service_order_has_user table as creator
    */
    function service_order_has_user(string $field)
    {
        return $this->hasMany("App\Models\Pivot\ServiceOrderHasUserModel", $field);
    }

    /*
    * Relationship with password_resets table
    */
    function password_resets()
    {
        return $this->hasOne("App\Models\PasswordReset\PasswordResetModel", "user_id");
    }

    /*
    * Relationship with annual_accesses table
    */
    function annual_accesses()
    {
        return $this->hasOne("App\Models\Accesses\AnnualAccessesModel", "user_id");
    }

    /*
    * Relationship with devices_accessed table
    */
    function devices_acessed()
    {
        return $this->hasOne("App\Models\Accesses\AccessedDevicesModel", "user_id");
    }

    /**
     * Factory that uses this model for generate random users
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    protected static function newFactory(): \Illuminate\Database\Eloquent\Factories\Factory
    {
        return UserFactory::new();
    }

    /**
     * Route notifications for the mail channel.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return string
     */
    public function routeNotificationForMail($notification)
    {
        return $this->email;
    }

    /**
     * First name acessor.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return string
     */
    public function getFirstNameAttribute()
    {
        return explode(" ", $this->name)[0];
    }

    /**
     * Password mutator.
     *
     * @param $value
     * @return string
     */
    public function setPasswordAttribute(string $password)
    {
        $this->attributes['password'] = Hash::make($password);
    }
}
