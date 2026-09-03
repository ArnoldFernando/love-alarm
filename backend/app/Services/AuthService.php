<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserSetting;
use App\Models\Profile;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthService
{
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'user',
                'account_status' => 'active',
                'email_verified_at' => now(),
            ]);

            Profile::create([
                'user_id' => $user->id,
                'username' => $data['username'],
                'display_name' => $data['display_name'] ?? $data['username'],
            ]);

            UserSetting::create([
                'user_id' => $user->id,
                'love_alarm_enabled' => true,
                'alarm_radius_meters' => 30,
                'notify_crush_nearby' => true,
                'notify_mutual_crush_nearby' => true,
                'notify_new_match' => true,
                'notify_messages' => true,
                'background_detection_enabled' => true,
                'profile_visible' => true,
                'show_online_status' => true,
            ]);

            return $user;
        });
    }

    public function login(array $credentials, string $deviceName = 'api'): array
    {
        // case-insensitive lookup guards against pre-existing mixed-case emails
        $user = User::whereRaw('LOWER(email) = ?', [strtolower(trim($credentials['email']))])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return [
                'success' => false,
                'message' => 'Invalid credentials.',
            ];
        }

        if (! $user->isActive() && $user->account_status === 'suspended') {
            return [
                'success' => false,
                'message' => 'Account suspended.',
            ];
        }

        if (! $user->isActive() && $user->account_status === 'banned') {
            return [
                'success' => false,
                'message' => 'Account banned.',
            ];
        }

        $token = $user->createToken($deviceName, ['*'], now()->addMinutes(config('sanctum.expiration')))->plainTextToken;

        return [
            'success' => true,
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function logoutAllDevices(User $user): void
    {
        $user->tokens()->delete();
    }

    public function sendPasswordResetLink(string $email): string
    {
        $status = Password::sendResetLink(
            ['email' => $email],
            function ($user, $token) {
                $user->notify(new ResetPasswordNotification($token));
            }
        );

        return $status;
    }

    public function resetPassword(array $data): string
    {
        return Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );
    }

    public function verifyEmail(User $user, int $id, string $hash): bool
    {
        if (! hash_equals((string) $id, (string) $user->getKey())) {
            return false;
        }

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return false;
        }

        if ($user->hasVerifiedEmail()) {
            return true;
        }

        $user->markEmailAsVerified();
        $user->update(['account_status' => 'active']);

        event(new Verified($user));

        return true;
    }

    public function resendVerification(User $user): void
    {
        if ($user->hasVerifiedEmail()) {
            return;
        }

        $user->notify(new VerifyEmailNotification());
    }

    public function changePassword(User $user, string $current, string $new): bool
    {
        if (! Hash::check($current, $user->password)) {
            return false;
        }

        $user->update(['password' => Hash::make($new)]);
        return true;
    }

    public function deleteAccount(User $user, string $password): bool
    {
        if (! Hash::check($password, $user->password)) {
            return false;
        }

        DB::transaction(function () use ($user) {
            $user->tokens()->delete();
            $user->update(['account_status' => 'deleted']);
            $user->delete();
        });

        return true;
    }
}
