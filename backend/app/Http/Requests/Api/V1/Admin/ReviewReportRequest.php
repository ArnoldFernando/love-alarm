<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReviewReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isModerator();
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:under_review,resolved,dismissed'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
