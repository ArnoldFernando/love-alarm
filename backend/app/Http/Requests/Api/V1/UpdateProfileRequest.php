<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $userId = auth()->id();

        return [
            'display_name' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:500'],
            'gender' => ['nullable', 'in:male,female,non_binary,prefer_not_to_say'],
            'school' => ['nullable', 'string', 'max:200'],
            'course' => ['nullable', 'string', 'max:200'],
            'year_level' => ['nullable', 'in:1st,2nd,3rd,4th,5th'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'interests' => ['nullable', 'array'],
            'interests.*' => ['string', 'uuid', 'exists:interests,id'],
        ];
    }
}
