<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\SoftDeletes;
// Custom
use App\Models\User\UserModel;

class UserComplementaryDataModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = "user_complementary_data";
    public $timestamps = false;
    protected $fillable = ["*"];

    /*
    * Relationship with users table
    */
    function user(){
        return $this->hasOne("App\Models\User\UserModel", "complementary_data_id");
    }

    /*
    * Relationship with address table
    */
    function address(){
        return $this->belongsTo("App\Models\User\UserAddressModel", "address_id");
    }

}
