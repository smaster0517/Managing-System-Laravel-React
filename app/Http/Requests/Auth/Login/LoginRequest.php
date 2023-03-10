<?php

namespace App\Http\Requests\Auth\Login;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {

        return [
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:3|max:15'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            "email.required" => "O email precisa ser informado",
            "email.email" => "Informe um email válido",
            "email.exists" => "O email não está cadastrado",
            "password.required" => "A senha precisa ser informada",
            "password.min" => "Senha inválida",
            "password.max" => "Senha inválida"
        ];
    }
}
