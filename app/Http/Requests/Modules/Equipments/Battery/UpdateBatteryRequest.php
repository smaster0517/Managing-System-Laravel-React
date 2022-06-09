<?php

namespace App\Http\Requests\Modules\Equipments\Battery;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBatteryRequest extends FormRequest
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
            'name' => 'bail|required|unique:batteries,name',
            'manufacturer' => 'bail|required',
            'model' => 'bail|required',
            'serial_number' => 'bail|required',
            'last_charge' => 'bail|required|date'
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
            'name.unique' => 'Já existe uma bateria com esse nome',
            'manufacturer.required' => 'O fabricante da bateria deve ser informado',
            'model.required' => 'O modelo da bateria deve ser informado',
            'serial_number.required' => 'O número do serial deve ser informado',
            'last_charge.required' => 'A data da última carga deve ser informada',
            'last_charge.date' => 'Informe uma data válida'
        ];
    }
}
