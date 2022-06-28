<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// Custom
use App\Http\Requests\Auth\ForgotPassword\UpdatePasswordRequest;
use App\Services\Auth\PasswordResetService;

class PasswordResetController extends Controller
{

    private PasswordResetService $service;

    /**
     * Dependency injection.
     * 
     * @param App\Services\Auth\PasswordResetService $service
     */
    public function __construct(PasswordResetService $service){
        $this->service = $service;
    }

     /**
     * Method for handle password reset request.
     * 
     * @param App\Http\Requests\Auth\ForgotPassword\UpdatePasswordRequest $request
     * @return \Illuminate\Http\Response
     */
    public function index(UpdatePasswordRequest $request){

        $response = $this->service->updatePassword($request);

        if($response["status"]){
            return response(["message" => $response["message"]], 200);
        }else{
            return response(["error" => $response["error"]], 500);
        }

    }
}