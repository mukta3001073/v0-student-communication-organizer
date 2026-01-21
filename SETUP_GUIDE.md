# StudySync - Setup Guide

## Prerequisites
- Supabase project connected to v0
- GitHub repository linked to Vercel

## Step 1: Run Database Migrations

Go to your Supabase SQL Editor and run these scripts **in order**:

### 1.1 Create Tables (scripts/001_create_tables.sql)
```sql
-- Copy all SQL from /scripts/001_create_tables.sql and paste into Supabase SQL Editor
-- Then click "Run" button
```

### 1.2 Enable RLS (scripts/002_enable_rls.sql)
```sql
-- Copy all SQL from /scripts/002_enable_rls.sql and paste into Supabase SQL Editor
-- Then click "Run" button
```

### 1.3 Create Triggers (scripts/003_create_triggers.sql)
```sql
-- Copy all SQL from /scripts/003_create_triggers.sql and paste into Supabase SQL Editor
-- Then click "Run" button
```

### 1.4 Fix RLS Recursion (scripts/006_fix_rls_recursion.sql)
```sql
-- Copy all SQL from /scripts/006_fix_rls_recursion.sql and paste into Supabase SQL Editor
-- Then click "Run" button
```

### 1.5 Fix Notes & Polls RLS (scripts/007_fix_notes_polls_rls.sql)
```sql
-- Copy all SQL from /scripts/007_fix_notes_polls_rls.sql and paste into Supabase SQL Editor
-- Then click "Run" button
```

### 1.6 Add Missing Columns (scripts/008_add_missing_columns.sql)
```sql
-- Copy all SQL from /scripts/008_add_missing_columns.sql and paste into Supabase SQL Editor
-- Then click "Run" button
```

### 1.7 Personal Notes & Timetable (scripts/009_personal_notes_timetable.sql)
```sql
-- Copy all SQL from /scripts/009_personal_notes_timetable.sql and paste into Supabase SQL Editor
-- Then click "Run" button
```

## Step 2: Configure Email Provider

1. Go to Supabase Dashboard → Authentication → Providers
2. Configure Email/Password provider
3. Enable "Confirm email" if desired
4. Set up email templates for password reset

## Step 3: Environment Variables

Make sure these environment variables are set in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - For development (e.g., http://localhost:3000)

## Step 4: Deploy to Vercel

1. Push your code to GitHub
2. Deploy from Vercel dashboard (should auto-deploy on push)
3. After deployment, test the following flows:

### Sign Up Flow
- Go to `/auth/sign-up`
- Enter email and password
- Check email for confirmation link
- Click link to confirm

### Login Flow
- Go to `/auth/login`
- Enter email and password
- Should redirect to `/home`

### Forgot Password Flow
- Go to `/auth/login`
- Click "Forgot?" link
- Enter email to request reset
- Check email for reset link
- Click link and set new password

### Create Group
- Go to `/home`
- Click "Create Group" button
- Enter group name and description
- Submit to create group

### Create Note in Group
- Open a group
- Click "Add Note" button
- Enter note title, content, and tags
- Submit to create note

### Create Personal Note
- Click "Personal Notes" from home quick tools
- Click "Add Note" button
- Create note with colors and pins

### Timetable
- Click "Timetable" from home quick tools
- Add classes with times, locations, and alerts
- Set reminders for upcoming classes

### Calculator
- Click "Calculator" from home quick tools
- Use for math calculations with history

## Troubleshooting

### "Tenant or user not found" error
- This means the database migrations haven't been run yet
- Follow Step 1 above to run all SQL scripts

### Group not appearing after creation
- Make sure `006_fix_rls_recursion.sql` has been run
- This fixes the RLS policies for group creation

### Notes/Polls not showing
- Make sure `007_fix_notes_polls_rls.sql` has been run
- Check that `008_add_missing_columns.sql` has been run to add the `options` column to polls

### Personal Notes and Timetable errors
- Make sure `009_personal_notes_timetable.sql` has been run
- Check that tables `personal_notes` and `timetable_events` exist in Supabase

## Features

### ✅ Completed
- Email/Password Authentication with Forgot Password
- Group Management (Create, Join, View Members)
- Sticky Notes with Tags and Pinning
- Polls with Voting
- File Management
- Search & Filtering
- Personal Notes with Colors
- Timetable with Alerts
- Math Calculator
- Mobile Navigation

### 🎯 Future Features
- Real-time notifications
- WhatsApp/Telegram integration
- AI-assisted tagging
- Advanced analytics
- Web version for desktop

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check Supabase logs for database errors
3. Verify all SQL migrations have been run
4. Ensure environment variables are set correctly
