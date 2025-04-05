# Email Campaign 

A modern email campaign management system built with React, TypeScript, and Supabase.

## Features

- Campaign Management
- Template Editor
- Email Provider Integration (Amazon SES & Gmail)
- Contact Management
- Dark Mode Support
- Responsive Design

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Lucide Icons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Supabase project and update the environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

The application uses Supabase as its database. Run the migration files in the `supabase/migrations` directory to set up the database schema.

## License

MIT
