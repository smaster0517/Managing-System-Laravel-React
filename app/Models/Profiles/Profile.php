<?php

namespace App\Models\Profiles;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
// Models
use App\Models\Users\User;
use App\Models\Modules\Module;

class Profile extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    /*
    * Scope for search
    */
    function scopeSearch($query, $value_searched)
    {
        return $query->when((bool) $value_searched, function ($query) use ($value_searched) {

            if (is_numeric($value_searched)) {
                $query->where('id', $value_searched);
            } else {
                $query->where('name', 'LIKE', '%' . $value_searched . '%');
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
    * Relationship with user table
    */
    function users()
    {
        return $this->hasMany(User::class, "profile_id")->withTrashed();
    }

    /*
    * Relationship many to many with modules table
    */
    function modules()
    {
        return $this->belongsToMany(Module::class, "profile_module")->withPivot('read', 'write');
    }

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'date:Y-m-d',
        'updated_at' => 'date:Y-m-d'
    ];
}
