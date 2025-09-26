# Database Setup Guide - EventFinder React

## Overview
EventFinder now includes full database integration with PostgreSQL for storing user accounts and search history.

## Database Schema

### Tables Created:

#### 1. **Users Table**
- **Purpose**: Store user registration and Google OAuth accounts
- **Fields**:
  - `id` (UUID, Primary Key)
  - `email` (VARCHAR, Unique)
  - `password_hash` (VARCHAR, for traditional signup)
  - `google_id` (VARCHAR, for Google OAuth)
  - `name` (VARCHAR)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

#### 2. **User Searches Table**
- **Purpose**: Store user search history and results
- **Fields**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key → users.id)
  - `search_query` (JSONB, original search parameters)
  - `results` (JSONB, AI-generated events)
  - `location` (VARCHAR)
  - `activity_type` (VARCHAR)
  - `timeframe` (VARCHAR)
  - `search_radius` (INTEGER)
  - `created_at` (TIMESTAMP)

## Setup Instructions

### 1. **Create Vercel Postgres Database**

#### Option A: Via Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Postgres**
4. Choose a database name (e.g., `eventfinder-db`)
5. Select a region close to your users
6. Click **Create**

#### Option B: Via Vercel CLI
```bash
vercel storage create postgres eventfinder-db
```

### 2. **Get Database Connection String**
After creation, Vercel will provide environment variables:
- `POSTGRES_URL` - Full connection string
- `POSTGRES_PRISMA_URL` - Prisma-compatible URL
- `POSTGRES_URL_NON_POOLING` - Direct connection

### 3. **Add Environment Variables**
In your Vercel project settings:

```env
POSTGRES_URL=your-postgres-connection-string-here
MIGRATION_SECRET=create-a-secure-random-string-here
```

### 4. **Run Database Migration**
Once deployed, run the migration to create tables:

```bash
curl -X POST https://your-app-url.vercel.app/api/db/migrate \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-migration-secret-here"}'
```

**Response**: `{"success": true, "message": "Database tables created successfully"}`

## Updated API Endpoints

### Authentication APIs
All authentication endpoints now save/retrieve users from the database:
- `POST /api/auth/signup` - Creates new user in database
- `POST /api/auth/login` - Authenticates against database users
- `POST /api/auth/google` - Handles Google OAuth with database integration

### Search APIs
Search functionality now saves user search history:
- `POST /api/search` - Saves search queries and results to database
- `GET /api/user/search-history/[userId]` - Retrieves user's search history
- `GET /api/user/search-details/[searchId]` - Gets specific search results

## Database Features

### Automatic Features:
✅ **User Registration**: Email/password and Google OAuth users
✅ **Search History**: All searches saved with AI-generated results
✅ **Performance**: Indexed queries for fast lookups
✅ **Security**: JWT-based authentication with database verification

### Data Relationships:
- Users can have multiple searches (1:many relationship)
- Search history includes original query parameters and generated results
- Google OAuth users automatically created/updated in database

### Privacy & Data Management:
- User searches are private to each authenticated user
- Search history limited to 50 most recent searches per user
- Cascade delete: removing a user removes all their search history

## Local Development

### Using Docker (Recommended):
```bash
# Run local PostgreSQL
docker run --name eventfinder-db -e POSTGRES_DB=eventfinder -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# Update .env for local development
POSTGRES_URL=postgresql://user:password@localhost:5432/eventfinder
```

### Migration for Local:
```bash
# Copy migration file content and run in your local PostgreSQL client
psql -U user -d eventfinder -f api/db/migrations/001_create_tables.sql
```

## Production Checklist

### Before Deployment:
- [ ] Vercel Postgres database created
- [ ] `POSTGRES_URL` environment variable set
- [ ] `MIGRATION_SECRET` environment variable set
- [ ] All other API keys configured

### After Deployment:
- [ ] Run database migration via `/api/db/migrate`
- [ ] Test user registration/login
- [ ] Test search functionality with logged-in user
- [ ] Verify search history is being saved

## Monitoring & Maintenance

### Database Health:
- Monitor connection pool usage in Vercel dashboard
- Check query performance in Postgres metrics
- Set up alerts for connection errors

### Data Growth:
- User searches are accumulated over time
- Consider implementing data retention policies
- Monitor storage usage in Vercel dashboard

## Troubleshooting

### Common Issues:

#### Migration Fails:
```json
{"error": "Migration failed", "details": "connection error"}
```
**Solution**: Check `POSTGRES_URL` environment variable

#### Search History Empty:
- Ensure user is authenticated (JWT token in request headers)
- Check that searches are being saved by looking at network requests

#### Google OAuth Not Saving Users:
- Verify Google OAuth is properly configured
- Check that `google_id` field is being populated

## Cost Optimization

### Vercel Postgres Pricing:
- **Hobby Plan**: Free tier with limits
- **Pro Plan**: Pay-per-usage above free tier
- **Enterprise**: Custom pricing

### Optimization Tips:
- Use connection pooling (automatically handled)
- Limit search history to prevent excessive storage
- Index frequently queried columns (already implemented)

---

## Next Steps
Your EventFinder application now has full database persistence! Users can:
1. Register and log in with email/password or Google OAuth
2. Search for events with AI-powered results
3. View their complete search history
4. Access previous search results

The database integration maintains all existing functionality while adding persistent data storage.