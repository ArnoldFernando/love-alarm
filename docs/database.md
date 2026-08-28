# Love Alarm - Database Documentation

## Entity Relationship Overview

```
users
  ├── has one profile
  ├── has one settings
  ├── has many crushes_sent (crushes.from_user_id)
  ├── has many crushes_received (crushes.to_user_id)
  ├── has many matches (via user_one_id / user_two_id)
  ├── has many blocks
  ── has many blocked_by
  ├── has many devices
  ├── has many notifications
  ├── has many alarms
  ├── has many reports_made
  ├── has many reports_received
  ├── has many audit_logs
  ├── has many photos
  └── belongs to many interests

matches
  ├── has one conversation
  ├── belongs to user_one (User)
  └── belongs to user_two (User)

conversations
  ├── belongs to match
  ├── belongs to many users (via conversation_users)
  └── has many messages

messages
  ├── belongs to conversation
  └── belongs to sender (User)

proximity_events
  └── belongs to user
  └── belongs to nearby_user (User)
```

## Key Constraints

### Unique Constraints
- `users.email`
- `profiles.username`
- `profile_photos.fcm_token`
- `crushes (from_user_id, to_user_id)`
- `matches (user_one_id, user_two_id)`
- `blocks (user_id, blocked_user_id)`
- `user_interests (user_id, interest_id)`
- `conversation_users (conversation_id, user_id)`

### Indexes
- All foreign keys indexed
- `users`: email, role, account_status
- `profiles`: username, school, course
- `alarms`: user_id, triggered_by_user_id, status, type
- `proximity_events`: user_id, nearby_user_id, spatial index on location
- `notifications`: user_id, read_at, type
- `reports`: status, reporter_id, reported_user_id

### Soft Deletes
- `users` (cascade to related data via foreign key constraints)
- `messages` (soft delete shows as `[deleted]`)

### PostGIS
- `proximity_events.location` is a geography(Point, 4326)
- `ST_DistanceSphere` used for accurate distance calculations
- Spatial index on location column
