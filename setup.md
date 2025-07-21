# Quick Setup Guide

## 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 2. Database Setup

### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Push the database schema:
```bash
supabase db push
```

5. Seed the database:
```bash
supabase db reset
```

### Option B: Manual Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the contents of `supabase/seed.sql`

## 3. Start Development

```bash
npm run dev
```

Visit http://localhost:3000 to see your application!

## 4. Test the Application

1. **Browse Properties**: Visit the homepage to see featured properties
2. **Search**: Use the search functionality to find properties
3. **Sign Up**: Create a new account
4. **Book a Property**: Try booking a property (it will be pending until approved)
5. **Host Features**: Sign up as a host to manage properties

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Make sure your Supabase URL and key are correct
2. **Authentication Issues**: Check that Row Level Security policies are set up correctly
3. **Missing Dependencies**: Run `npm install` to install all dependencies

### Getting Help

- Check the main README.md for detailed documentation
- Review the Supabase documentation for database setup
- Create an issue if you encounter problems 