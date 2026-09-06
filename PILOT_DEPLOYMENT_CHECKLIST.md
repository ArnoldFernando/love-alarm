# Love Alarm - 50 User Pilot Deployment Checklist

**Status:** Ready for deployment  
**Last Updated:** 2026-09-07  
**Pilot Target:** 50 concurrent users  

---

## Phase 1: Credential Setup (DO THIS FIRST)

### 1.1 SendGrid Email Configuration
**Purpose:** Users need to receive verification emails, password resets, and notifications

**Steps:**
1. Go to https://app.sendgrid.com/
2. Navigate to Settings → API Keys
3. Create a new API key (or use existing one)
4. Copy the API key
5. Update `.env.production`:
   ```
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.sendgrid.net
   MAIL_PORT=587
   MAIL_USERNAME=apikey
   MAIL_PASSWORD=sk-... (your SendGrid API key)
   MAIL_ENCRYPTION=tls
   ```
6. Test: Run `php artisan tinker` → `Mail::raw('test', fn($m) => $m->to('test@example.com'))`

**Estimated Time:** 5 minutes

---

### 1.2 Firebase Cloud Messaging (FCM) Configuration
**Purpose:** Push notifications to mobile devices when matches occur or crushes are nearby

**Steps:**
1. Go to https://console.firebase.google.com/
2. Create new project or use existing "love-alarm" project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract from JSON:
   - `project_id` → FCM_PROJECT_ID
   - `private_key` → FCM_PRIVATE_KEY (keep the `\n` characters)
   - `client_email` → FCM_CLIENT_EMAIL
7. Update `.env.production`:
   ```
   FCM_PROJECT_ID=love-alarm-12345
   FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
   FCM_CLIENT_EMAIL=firebase-adminsdk-abc@love-alarm.iam.gserviceaccount.com
   ```

**Test:**
```bash
php artisan tinker
$fcm = app(\Kreait\Firebase\Messaging::class);
$fcm->send(\Kreait\Firebase\Messaging\CloudMessage::withData(['test' => 'ok'])->toToken('device_token'))
```

**Estimated Time:** 10 minutes

---

### 1.3 Laravel Reverb WebSocket Configuration (Optional for MVP)
**Purpose:** Real-time chat and notifications

**Options:**
- **Option A (Recommended):** Use Render/Railway WebSocket service
- **Option B (Skip for MVP):** Temporarily disable real-time features (app will fallback to polling)

**If Using Reverb:**
1. Deploy Reverb server separately (Render, Railway, etc.)
2. Get credentials: APP_KEY, APP_SECRET, HOST
3. Update `.env.production`:
   ```
   REVERB_APP_KEY=your-app-key
   REVERB_APP_SECRET=your-app-secret
   REVERB_HOST=reverb.yourdomain.com
   REVERB_PORT=443
   REVERB_SCHEME=https
   ```

**If Skipping Reverb (MVP Mode):**
- Leave as placeholders
- App will use HTTP polling instead
- Less ideal but will work for pilot

**Estimated Time:** 15-30 minutes (if setting up Reverb) or skip

---

## Phase 2: Pre-Deployment Backend Checks

### 2.1 Database Validation
```bash
# SSH into production backend
cd /backend

# Check if migrations are up to date
php artisan migrate:status

# Run pending migrations if needed
php artisan migrate --env=production

# Verify database indexes
php artisan db:show --counts
```

**Checklist:**
- [ ] All migrations completed successfully
- [ ] PostGIS extension enabled (check with `SELECT PostGIS_version();`)
- [ ] Database indices exist on: blocks(user_id, blocked_user_id), crushes(from_user_id)

### 2.2 Redis Validation
```bash
# Test Redis connection
php artisan redis:connection-test

# Verify Redis has sufficient memory (target: 500MB min for pilot)
redis-cli INFO memory
```

**Checklist:**
- [ ] Redis connection successful
- [ ] Redis memory ≥ 500MB available
- [ ] Redis password configured (if applicable)

### 2.3 Cache & Config Refresh
```bash
# Clear all caches
php artisan cache:clear
php artisan route:cache
php artisan config:cache
php artisan view:cache

# Verify cache is working
php artisan tinker
Cache::put('test', 'value', 60)
Cache::get('test')  // Should return 'value'
```

**Checklist:**
- [ ] All caches cleared
- [ ] New config cached
- [ ] Cache test passed

### 2.4 Health Check
```bash
# Test API health endpoint
curl https://your-api.com/api/v1/health

# Expected response:
# {"status":"ok","service":"love-alarm-api"}
```

**Checklist:**
- [ ] Health endpoint responds with 200 OK
- [ ] Response format correct

---

## Phase 3: Pre-Deployment Frontend Checks

### 3.1 Mobile App Configuration
**File:** `apps/mobile/.env`
```
EXPO_PUBLIC_API_URL=https://your-api.com/api/v1
```

**Checklist:**
- [ ] API URL points to production backend
- [ ] PROXIMITY_DEBUG_DISABLED = false (verified in _layout.tsx)
- [ ] No console.log statements in production build
- [ ] QueryClient retry = 3 with exponential backoff

### 3.2 Build Production APK/IPA
```bash
cd apps/mobile

# For Android
eas build --platform=android --profile=production

# For iOS
eas build --platform=ios --profile=production

# Builds will be available at: https://expo.dev/eas
```

**Checklist:**
- [ ] Build succeeds without errors
- [ ] Download APK/IPA to test device
- [ ] Install on test device successfully

### 3.3 Manual Testing on Device
1. **Login Flow:**
   - [ ] Register new account
   - [ ] Verify email (should receive email from SendGrid)
   - [ ] Login successful
   - [ ] Redirected to home screen

2. **Discover Flow:**
   - [ ] Home screen loads with stats
   - [ ] Click "Discover" tab
   - [ ] Browse profiles loads users
   - [ ] "Like" button works (crush created)
   - [ ] "Skip" button works
   - [ ] No console errors

3. **Radar Flow:**
   - [ ] Click "Radar" tab
   - [ ] Location permission requested
   - [ ] Radar shows location (or "no nearby users")
   - [ ] No crashes or errors

4. **Profile Flow:**
   - [ ] Can view own profile
   - [ ] Can edit profile
   - [ ] Can upload/delete photos
   - [ ] Settings page loads

5. **Notifications:**
   - [ ] Enable notifications when prompted
   - [ ] Should NOT see errors about FCM

---

## Phase 4: Load Testing (Pre-Pilot)

### 4.1 Setup Load Testing Tool
**Option 1: Apache JMeter**
```bash
# Install JMeter
brew install jmeter

# Create test plan with:
# - 50 concurrent users
# - 5-minute ramp-up
# - Each user: login → discover → radar → location update
```

**Option 2: Locust (Python)**
```bash
pip install locust

# Create locustfile.py with test scenarios
# Run: locust -f locustfile.py --host=https://your-api.com
```

### 4.2 Load Test Scenarios

**Scenario 1: Login Surge (First 1 minute)**
- 50 users login simultaneously
- Measure: Response time, 401/500 errors, database connections
- Target: <2s median response time

**Scenario 2: Discover Browsing (Continuous)**
- Each user hits /discover every 3 seconds
- Measure: Radar scan performance, database queries/sec
- Target: <500ms median response time

**Scenario 3: Location Updates (Every 30 seconds)**
- Each user submits location via /proximity/location
- Measure: Redis write latency, proximity check performance
- Target: <200ms median response time

**Scenario 4: Radar Scan (Every 60 seconds)**
- Each user calls /proximity/radar
- This is the heaviest query (was N+1, now batch)
- Measure: Query count (should be 1 per scan, not 30+)
- Target: <2s median response time

### 4.3 Monitoring During Load Test
```bash
# Watch database connections
SELECT count(*) FROM pg_stat_activity;  # Target: <20 active for pilot

# Watch Redis memory
redis-cli INFO memory | grep used_memory_human

# Watch query performance (in another terminal)
tail -f storage/logs/laravel.log | grep "SELECT"

# Watch for errors
tail -f storage/logs/laravel.log | grep "ERROR\|EXCEPTION"
```

**Acceptance Criteria:**
- [ ] No 5xx server errors
- [ ] Database connection pool not exhausted
- [ ] Redis memory usage stable (not evicting keys)
- [ ] Median response times < targets above
- [ ] p95 response times < 5 seconds
- [ ] N+1 query fix working (only 1 DB query per radar scan)

---

## Phase 5: Deployment to Production

### 5.1 Backend Deployment
```bash
cd backend

# Commit all changes
git add -A
git commit -m "fix: pilot readiness fixes - implement missing methods, optimize queries, enable proximity"

# Push to production branch
git push origin main

# Deploy (depends on your hosting)
# For Render:
# - Trigger redeploy in Render dashboard
# - Or push to production branch if auto-deploy is enabled

# Verify deployment
curl https://your-api.com/api/v1/health
```

**Checklist:**
- [ ] All code changes committed
- [ ] Changes pushed to production branch
- [ ] Deployment triggered
- [ ] Health endpoint responds
- [ ] No deployment errors in logs

### 5.2 Frontend Deployment
```bash
cd apps/mobile

# Submit build to app stores
# For Google Play: https://play.google.com/console
# For Apple TestFlight: https://appstoreconnect.apple.com

# Or distribute APK directly to test users:
# - Upload to Firebase App Distribution
# - Or send via email/Slack
```

**Checklist:**
- [ ] Build uploaded to app store / distribution service
- [ ] Test users can install app
- [ ] App launches without crashes
- [ ] Can authenticate and use core features

---

## Phase 6: Pilot Launch Day

### 6.1 Pre-Launch (30 minutes before)
```bash
# Final health checks
curl https://your-api.com/api/v1/health

# Clear any cached data
php artisan cache:clear

# Verify all services running
# - Database: SELECT 1;
# - Redis: redis-cli PING
# - Email: Check MAIL_MAILER is 'smtp'
# - FCM: Verify credentials loaded
```

### 6.2 Monitoring During Pilot
**Set up dashboards to monitor:**

1. **API Performance:**
   - Response time (p50, p95, p99)
   - Request count/sec
   - Error rate (5xx, 401, 403)

2. **Database:**
   - Active connections
   - Query time (slow query log)
   - Write latency

3. **Redis:**
   - Memory usage
   - Eviction rate
   - Hit/miss ratio

4. **Application:**
   - Proximity check success rate
   - Crush creation success rate
   - Email delivery rate

**Tools:**
- Sentry (error tracking) - if configured
- Datadog/New Relic (APM) - if available
- PostgreSQL slow query log
- Redis CLI monitoring

### 6.3 Real-Time Support During Pilot
**Have ready:**
- [ ] SSH access to backend server
- [ ] Database query debugging tools
- [ ] Redis CLI access
- [ ] Mobile app logs (check device logs)
- [ ] Firebase Console (for FCM status)
- [ ] Reverb dashboard (if using)

**Common Issues & Fixes:**

| Issue | Symptom | Fix |
|-------|---------|-----|
| Emails not sent | Users don't receive verification email | Check MAIL_MAILER, SendGrid API key, mail queue |
| Push notifications not working | No notifications on mobile | Check FCM credentials, device token registration |
| Crushes fail to save | 500 error when liking profile | Check database write performance, transaction logs |
| Radar scan slow | Radar takes >5 seconds | Check N+1 query fix applied, Redis is working |
| Proximity detection fails | Location not being tracked | Check location permissions, ProximityService in logs |

---

## Phase 7: Post-Pilot Analysis

### 7.1 Collect Metrics
```bash
# Export database metrics
pg_dump --stats-only love_alarm > pilot_stats.sql

# Export Redis metrics
redis-cli --rdb /tmp/pilot_dump.rdb

# Export application logs
tail -n 10000 storage/logs/laravel.log > pilot_logs.txt
```

### 7.2 User Feedback
- [ ] Collect bug reports from users
- [ ] Collect feature requests
- [ ] Measure engagement (crushes sent, matches made, radar scans)
- [ ] Measure retention (active users after 24h, 48h, 7d)

### 7.3 Performance Analysis
- [ ] Identify bottlenecks from metrics
- [ ] Identify N+1 queries that weren't caught
- [ ] Identify database indexes that could help
- [ ] Identify rate limiting issues

---

## Troubleshooting Guide

### Problem: "Unable to like this user" error
**Likely Cause:** User is blocked or removeCrush() implementation has bug  
**Fix:**
```bash
# Check crushes table
SELECT * FROM crushes WHERE from_user_id = 'user_id';

# Check blocks table
SELECT * FROM blocks WHERE user_id = 'user_id' OR blocked_user_id = 'user_id';

# Check logs for exact error
grep "Crush creation failed" storage/logs/laravel.log
```

### Problem: Radar scan returns empty or very slow
**Likely Cause:** N+1 query not optimized or Redis empty  
**Fix:**
```bash
# Check if batched query is working
grep "User::with.*whereIn" storage/logs/laravel.log

# Check Redis has location data
redis-cli KEYS "proximity:*" | wc -l  # Should have some keys

# Check if location updates are working
grep "proximity/location" storage/logs/laravel.log
```

### Problem: "No push notification received"
**Likely Cause:** FCM not configured or device token not registered  
**Fix:**
```bash
# Check device token is saved
SELECT user_id, device_token FROM devices WHERE user_id = 'user_id';

# Check FCM credentials
php artisan tinker
echo config('services.firebase.credentials');

# Send test notification
$message = CloudMessage::withData(['test' => 'ok'])->toToken('device_token');
app(Messaging::class)->send($message);
```

### Problem: Database connection pool exhausted
**Likely Cause:** Slow queries holding connections, sync queue blocking  
**Fix:**
```bash
# Kill slow queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE query LIKE '%SELECT%' AND query_start < now() - interval '30 seconds';

# Verify queue is async
grep QUEUE_CONNECTION .env.production  # Should be 'redis'

# Check process count
ps aux | grep "laravel\|php" | wc -l
```

---

## Success Criteria

✅ **Pilot is successful if:**
- All 50 users can login and use the app
- No 5xx errors in production
- Median API response time <500ms
- Proximity detection works (radar shows nearby users)
- Push notifications delivered (matches trigger alerts)
- Email delivery working (verification, password reset)
- Zero crashes on mobile app
- Database performance stable (no connection pool issues)
- Redis memory stays below limits

---

## Post-Pilot Next Steps

1. **Analyze Metrics:**
   - Which features were used most?
   - What were the performance bottlenecks?
   - What bugs were reported?

2. **Fix Critical Bugs:**
   - Any crashes or permanent errors

3. **Optimize Performance:**
   - Add caching where needed
   - Optimize slow queries
   - Adjust rate limits based on actual usage

4. **Expand to Full Scale:**
   - Plan for 1,000+ users
   - Set up proper monitoring (Sentry, DataDog)
   - Implement analytics

---

## Deployment Quick Reference

```bash
# Full deployment checklist (copy-paste)

# 1. Update credentials in .env.production
# MAIL_PASSWORD=sk-...
# FCM_PROJECT_ID=...
# FCM_PRIVATE_KEY=...
# REVERB_APP_KEY=...

# 2. Backend
cd backend
php artisan migrate --env=production
php artisan cache:clear && php artisan config:cache

# 3. Verify
curl https://your-api.com/api/v1/health

# 4. Mobile app
cd apps/mobile
eas build --platform=android --profile=production

# 5. Test
# Install on device, test login → discover → radar flow

# 6. Load test (optional but recommended)
locust -f loadtest.py --host=https://your-api.com

# 7. Launch pilot
# Share app with 50 test users
# Monitor logs and metrics
# Be ready to debug!
```

---

**Questions?** Check the logs:
- Backend: `storage/logs/laravel.log`
- Mobile: Device console (connect to XCode/Android Studio)
- Database: PostgreSQL logs
- Redis: `redis-cli MONITOR`

Good luck! 🚀
