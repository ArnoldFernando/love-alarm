<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\MessageRequest;
use App\Http\Resources\Api\V1\ConversationResource;
use App\Http\Resources\Api\V1\MessageResource;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(private ChatService $chatService)
    {
    }

    public function conversations(Request $request): JsonResponse
    {
        $conversations = $this->chatService->getConversations($request->user());

        return $this->successResponse([
            'data' => ConversationResource::collection($conversations),
            'pagination' => [
                'current_page' => $conversations->currentPage(),
                'last_page' => $conversations->lastPage(),
                'per_page' => $conversations->perPage(),
                'total' => $conversations->total(),
            ],
        ]);
    }

    public function showConversation(Request $request, string $id): JsonResponse
    {
        $conversation = $this->chatService->getConversation($request->user(), $id);

        if (! $conversation) {
            return $this->errorResponse('Conversation not found.', 404);
        }

        return $this->successResponse(new ConversationResource($conversation));
    }

    public function messages(Request $request, string $id): JsonResponse
    {
        $messages = $this->chatService->getMessages($request->user(), $id);

        if (! $messages) {
            return $this->errorResponse('Conversation not found.', 404);
        }

        return $this->successResponse([
            'data' => MessageResource::collection($messages),
            'pagination' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function sendMessage(MessageRequest $request, string $id): JsonResponse
    {
        $message = $this->chatService->sendMessage(
            $request->user(),
            $id,
            $request->validated('content')
        );

        if (! $message) {
            return $this->errorResponse('Unable to send message.', 403);
        }

        return $this->successResponse(
            new MessageResource($message),
            'Message sent.',
            201
        );
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $marked = $this->chatService->markConversationAsRead($request->user(), $id);

        if (! $marked) {
            return $this->errorResponse('Conversation not found.', 404);
        }

        return $this->successResponse(message: 'Messages marked as read.');
    }

    public function deleteMessage(Request $request, string $conversationId, string $messageId): JsonResponse
    {
        $deleted = $this->chatService->deleteMessage($request->user(), $messageId);

        if (! $deleted) {
            return $this->errorResponse('Message not found.', 404);
        }

        return $this->successResponse(message: 'Message deleted.');
    }
}
