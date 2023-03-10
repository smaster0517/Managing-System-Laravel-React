<?php

namespace App\Http\Requests\Modules\ServiceOrders;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Session;

class ServiceOrderStoreRequest extends FormRequest
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
            "start_date" => ['required', 'date'],
            "end_date" => ['required', 'date'],
            "pilot_id" => ['required', 'numeric'],
            "client_id" => ['required', 'numeric'],
            "observation" => ['required', 'string'],
            "status" => ['required', 'boolean'],
            "flight_plans" => ['required', 'array']
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
            'start_date.required' => "A data inicial deve ser informada",
            'end_date.required' => "A data final deve ser informada",
            'start_date.date' => "Deve ser um formato de data válido",
            'end_date.date' => "Deve ser um formato de data válido",
            'pilot_id.required' => "O piloto deve ser selecionado",
            'client_id.required' => "O cliente deve ser selecionado",
            'observation.required' => "A observação deve ser informada",
            'status.required' => "O status deve ser definido",
            'status.boolean' => "O status deve ser 1 ou 0",
            'flight_plans_ids.required' => "Selecione no mínimo 1 plano de voo"
        ];
    }
}
