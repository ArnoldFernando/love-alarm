<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class DiscoverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'min_age' => ['nullable', 'integer', 'min:18', 'max:100'],
            'max_age' => ['nullable', 'integer', 'min:18', 'max:100'],
            'gender' => ['nullable', 'in:male,female,non_binary,prefer_not_to_say'],
            'school' => ['nullable', 'string', 'max:200'],
            'course' => ['nullable', 'string', 'max:200'],
            'interests' => ['nullable', 'array'],
            'interests.*' => ['string', 'uuid', 'exists:interests,id'],
            'exclude_crushed' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
