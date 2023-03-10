<?php

namespace App\Http\Requests\UserAccount;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateDocumentsRequest extends FormRequest
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

        $unique_id = Auth::user()->personal_document->id;

        return [
            "anac_license" => ["sometimes", "unique:personal_documents,anac_license," . $unique_id],
            "cpf" => ["sometimes", "unique:personal_documents,cpf," . $unique_id],
            "cnpj" => ["sometimes", "unique:personal_documents,cnpj," . $unique_id],
            "telephone" => ["sometimes", "unique:personal_documents,telephone," . $unique_id],
            "cellphone" => ["sometimes", "unique:personal_documents,cellphone," . $unique_id],
            "company_name" => ["sometimes", "unique:personal_documents,company_name," . $unique_id],
            "trading_name" => ["sometimes", "unique:personal_documents,trading_name," . $unique_id]
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
            "anac_license.required" => "A habilitação ANAC deve ser informada",
            "anac_license.unique" => "Essa habilitação já está registrada",
            "cpf.required" => "O CPF deve ser informado",
            "cpf.unique" => "Esse CPF já está registrado",
            "cnpj.required" => "O CNPJ deve ser informado",
            "cnpj.unique" => "Esse CNPJ já está registrado",
            "telephone.required" => "O número de telefone deve ser informado",
            "telephone.unique" => "Esse número de telefone já está registrado",
            "cellphone.required" => "O número de celular deve ser informado",
            "cellphone.unique" => "Esse número de celular já está registrado",
            "company_name.required" => "A razão social deve ser informada",
            "company_name.unique" => "Essa razão social já está registrada",
            "trading_name.required" => "O nome fantasia deve ser informado",
            "trading_name.unique" => "Esse nome fantasia já está registrado"
        ];
    }
}
