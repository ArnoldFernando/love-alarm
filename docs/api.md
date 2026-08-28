# Love Alarm - API Documentation

## Base URL
```
/api/v1
```

## Authentication
All endpoints (except auth public routes) require:
```
Authorization: Bearer {sanctum_token}
```

## Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new account |
| POST | `/auth/login` | Login and receive token |
| POST | `/auth/logout` | Revoke current token |
| POST | `/auth/logout-all` | Revoke all tokens |
| GET | `/auth/me` | Get current user |
| POST | `/auth/forgot-password` | Send reset link |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/verify-email/{id}/{hash}` | Verify email |
| POST | `/auth/resend-verification` | Resend verification |
| POST | `/auth/change-password` | Change password |
| POST | `/auth/delete-account` | Delete account |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get own profile |
| PUT | `/profile` | Update profile |
| POST | `/profile/photos` | Upload photo |
| DELETE | `/profile/photos/{id}` | Delete photo |
| POST | `/profile/photos/{id}/primary` | Set primary photo |
| GET | `/profile/settings` | Get settings |
| PUT | `/profile/settings` | Update settings |

### Discover
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/discover` | Browse users (paginated, filterable) |
| GET | `/users/{id}` | View public profile |

### Crush
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crushes` | List sent crushes |
| POST | `/crushes` | Create crush |
| DELETE | `/crushes/{id}` | Remove crush |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matches` | List matches |
| GET | `/matches/{id}` | Get match detail |

### Proximity
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/proximity/update` | Update location |
| POST | `/proximity/check` | Check proximity and trigger alarms |

### Alarms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/alarms` | List alarms |
| GET | `/alarms/{id}` | Get alarm |
| POST | `/alarms/{id}/acknowledge` | Acknowledge alarm |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| POST | `/notifications/{id}/read` | Mark as read |
| POST | `/notifications/read-all` | Mark all as read |
| GET | `/notifications/unread-count` | Get unread count |
| DELETE | `/notifications/{id}` | Delete notification |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | List conversations |
| GET | `/conversations/{id}` | Get conversation |
| GET | `/conversations/{id}/messages` | Get messages |
| POST | `/conversations/{id}/messages` | Send message |
| POST | `/conversations/{id}/read` | Mark as read |
| DELETE | `/conversations/{id}/messages/{messageId}` | Delete message |

### Blocks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/blocks` | List blocked users |
| POST | `/blocks` | Block user |
| DELETE | `/blocks/{id}` | Unblock user |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports` | List my reports |
| POST | `/reports` | Submit report |

### Devices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/devices` | List devices |
| POST | `/devices` | Register device |
| DELETE | `/devices/{id}` | Remove device |

### Admin (requires moderator/admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard stats |
| GET | `/admin/users` | List all users |
| GET | `/admin/users/{id}` | User detail |
| POST | `/admin/users/{id}/suspend` | Suspend user |
| POST | `/admin/users/{id}/ban` | Ban user |
| POST | `/admin/users/{id}/reactivate` | Reactivate user |
| GET | `/admin/reports` | Report queue |
| GET | `/admin/reports/{id}` | Report detail |
| POST | `/admin/reports/{id}/assign` | Assign report |
| POST | `/admin/reports/{id}/resolve` | Resolve report |
| POST | `/admin/reports/{id}/dismiss` | Dismiss report |
| GET | `/admin/analytics` | Analytics data |
| GET | `/admin/audit-logs` | Audit logs |

## Response Format
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

## Error Format
```json
{
  "success": false,
  "message": "...",
  "errors": {}
}
```
