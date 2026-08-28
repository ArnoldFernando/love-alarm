<?php

namespace App\Services;

use App\Models\Profile;
use App\Models\ProfilePhoto;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileService
{
    public function getProfile(User $user): Profile
    {
        return $user->profile()->with(['user.interests', 'user.photos'])->firstOrFail();
    }

    public function updateProfile(User $user, array $data): Profile
    {
        $profile = $user->profile;

        if (! $profile) {
            $profile = Profile::create(array_merge($data, ['user_id' => $user->id]));
        } else {
            $profile->update($data);
        }

        if (! empty($data['interests'])) {
            $user->interests()->sync($data['interests']);
        }

        return $profile->fresh(['user.interests', 'user.photos']);
    }

    public function uploadPhoto(User $user, UploadedFile $file, bool $isPrimary = false): ProfilePhoto
    {
        $validated = validator(['photo' => $file], [
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ])->validate();

        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        $path = 'photos/' . $user->id . '/' . $filename;

        $disk = Storage::disk(config('filesystems.default', 's3'));
        $disk->put($path, file_get_contents($file->getRealPath()), 'public');

        $url = $disk->url($path);

        if ($isPrimary) {
            $user->photos()->update(['is_primary' => false]);
        }

        $photo = $user->photos()->create([
            'url' => $url,
            'thumbnail_url' => $url, // In production, generate actual thumbnail
            'is_primary' => $isPrimary || $user->photos()->count() === 0,
            'sort_order' => $user->photos()->count(),
        ]);

        return $photo;
    }

    public function deletePhoto(User $user, string $photoId): void
    {
        $photo = $user->photos()->findOrFail($photoId);

        $disk = Storage::disk(config('filesystems.default', 's3'));
        $path = parse_url($photo->url, PHP_URL_PATH);
        if ($path) {
            $disk->delete(ltrim($path, '/'));
        }

        $photo->delete();
    }

    public function setPrimaryPhoto(User $user, string $photoId): ProfilePhoto
    {
        $photo = $user->photos()->findOrFail($photoId);

        $user->photos()->update(['is_primary' => false]);
        $photo->update(['is_primary' => true]);

        return $photo->fresh();
    }

    public function getUserSettings(User $user): UserSetting
    {
        return $user->settings ?? UserSetting::create(['user_id' => $user->id]);
    }

    public function updateSettings(User $user, array $data): UserSetting
    {
        $settings = $this->getUserSettings($user);
        $settings->update($data);
        return $settings->fresh();
    }
}
