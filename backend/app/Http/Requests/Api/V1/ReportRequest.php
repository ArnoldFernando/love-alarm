<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'reported_user_id' => ['required', 'string', 'uuid', 'exists:users,id'],
            'reason' => ['required', 'in:spam,harassment,fake_account,impersonation,inappropriate_behavior,inappropriate_profile,other'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
