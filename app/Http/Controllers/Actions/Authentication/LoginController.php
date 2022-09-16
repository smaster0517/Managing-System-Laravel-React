<?php

namespace App\Http\Controllers\Actions\Authentication;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
// Custom
use App\Models\Users\User;
use App\Http\Requests\Auth\Login\LoginRequest;
use App\Events\Auth\FirstSuccessfulLoginEvent;
use App\Events\Auth\LoginSuccessfulEvent;

class LoginController extends Controller
{

    public function __construct(User $userModel)
    {
        $this->userModel = $userModel;
    }

    public function __invoke(LoginRequest $request): \Illuminate\Http\Response
    {
        if (Auth::attempt(["email" => $request->email, "password" => $request->password])) {

            $request->session()->regenerate();

            $user = $this->userModel->find(Auth::user()->id);

            // if user was not deleted
            if (!$user->trashed()) {

                // If is the first login
                if (!$user->status && is_null($user->last_access)) {
                    FirstSuccessfulLoginEvent::dispatch($user);
                }

                LoginSuccessfulEvent::dispatch($user);

                return response(["message" => "Acesso autorizado!"], 200);

                // If user was deleted or just his account is disabled (turned inactive after first access)
            } else if ($user->trashed()) {

                return response(["message" => "Conta desabilitada. Contate o suporte!"], 500);
            }
        } else {

            return response(["message" => "Credenciais inválidas!"], 500);
        }
    }
}