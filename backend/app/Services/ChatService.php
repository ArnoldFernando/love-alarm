<?php

namespace App\Services;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ChatService
{
    public function getConversations(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return Conversation::whereHas('users', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->with(['users.profile', 'users.photos', 'messages' => function ($q) {
                $q->latest()->limit(1);
            }])
            ->orderBy('last_message_at', 'desc')
            ->paginate($perPage);
    }

    public function getConversation(User $user, string $conversationId): ?Conversation
    {
        $conversation = Conversation::where('id', $conversationId)
            ->with(['users.profile', 'users.photos'])
            ->first();

        if (! $conversation) {
            return null;
        }

        if (! $conversation->users->contains('id', $user->id)) {
            return null;
        }

        return $conversation;
    }

    public function getMessages(User $user, string $conversationId, int $perPage = 50): ?LengthAwarePaginator
    {
        $conversation = $this->getConversation($user, $conversationId);

        if (! $conversation) {
            return null;
        }

        return Message::where('conversation_id', $conversationId)
            ->with('sender.profile')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function sendMessage(User $user, string $conversationId, string $content): ?Message
    {
        $conversation = Conversation::where('id', $conversationId)
            ->with('users')
            ->first();

        if (! $conversation) {
            return null;
        }

        if (! $conversation->users->contains('id', $user->id)) {
            return null;
        }

        return DB::transaction(function () use ($user, $conversation, $content) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'content' => $content,
            ]);

            $conversation->update(['last_message_at' => now()]);

            // Update last read for sender
            $conversation->users()->updateExistingPivot($user->id, [
                'last_read_at' => now(),
            ]);

            // Broadcast message via Reverb
            broadcast(new MessageSent($message))->toOthers();

            // Create notification for other participants
            // Create notification for other participants
            $otherUsers = $conversation->users->reject(fn($u) => $u->id === $user->id);
            foreach ($otherUsers as $recipient) {
                try {
                    $notification = app(NotificationService::class)->createInAppNotification(
                        $recipient->id,
                        'new_message',
                        'New Message',
                        'You have a new message.',
                        ['conversation_id' => $conversation->id, 'message_id' => $message->id]
                    );

                    broadcast(new \App\Events\UserNotification($notification))->toOthers();
                } catch (\Throwable $e) {
                    \Log::warning('Failed to send message notification: ' . $e->getMessage());
                }
            }

            return $message;
        });
    }

    public function markConversationAsRead(User $user, string $conversationId): bool
    {
        $conversation = $this->getConversation($user, $conversationId);

        if (! $conversation) {
            return false;
        }

        $conversation->users()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        // Mark all messages as read
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return true;
    }

    public function deleteMessage(User $user, string $messageId): bool
    {
        $message = Message::where('id', $messageId)
            ->where('sender_id', $user->id)
            ->first();

        if (! $message) {
            return false;
        }

        $message->update(['deleted_at' => now()]);
        return true;
    }
}
