# Love Alarm - Architecture Documentation

## System Architecture

```
Mobile (React Native + Expo)
    |
    v
Next.js Web (Admin Dashboard + Landing)
    |
    v
Laravel 12 REST API (Nginx + PHP-FPM)
    |
    +-- PostgreSQL 15 + PostGIS (persistent data)
    +-- Redis (cache, queues, sessions, temporary proximity)
    +-- Laravel Reverb (WebSockets for real-time chat)
    +-- Firebase Cloud Messaging (push notifications)
    +-- S3/Cloudinary (image storage)
```

## Data Flow

### Authentication Flow
1. User registers via mobile/web
2. Backend validates, creates user + profile + settings
3. Sanctum token issued
4. Email verification sent
5. Token stored in SecureStore (mobile) or localStorage (web)

### Crush / Match Flow
1. User A sends crush to User B
2. Backend validates (no self-crush, no blocks, not duplicate)
3. If User B already crushed User A, atomic transaction:
   - Create match
   - Create conversation
   - Attach both users
   - Create notifications
4. Push notification sent via FCM
5. WebSocket broadcast to connected clients

### Proximity / Love Alarm Flow
1. Mobile app sends location update (`POST /proximity/update`)
2. Location stored in Redis with TTL (30 min)
3. Approximate event stored in PostGIS
4. On `POST /proximity/check`:
   - Retrieve user's crush targets
   - Check Redis for target locations
   - Fallback to PostGIS if Redis miss
   - Calculate haversine / ST_DistanceSphere distance
   - Check cooldown in Redis
   - If within radius and cooldown expired:
     - Create alarm (detected)
     - Set cooldown
     - Dispatch notification
5. Notification sent via FCM + WebSocket

### Chat Flow
1. User sends message to conversation
2. Backend validates user belongs to conversation
3. Message persisted, conversation updated
4. `MessageSent` event broadcast via Reverb
5. Notification created for other participant
6. Push notification sent via FCM

## Security Layers
- Sanctum token authentication
- Role-based middleware (admin, moderator, user)
- Account status enforcement (active/suspended/banned)
- Laravel Policies for resource authorization
- Form Request validation (Zod shared schemas)
- Rate limiting per endpoint category
- SQL injection protection via Eloquent/Query Builder
- Mass assignment protection via `$fillable`
- No exact location exposure in any API response

## Caching Strategy
- Redis for: sessions, cache, queues
- Temporary proximity data with TTL
- Alarm cooldown keys with TTL
- Rate limit counters

## Background Processing
- Queue workers handle: notifications, image processing, analytics
- Scheduled tasks: proximity cleanup (every 15 min), alarm expiration (hourly)
