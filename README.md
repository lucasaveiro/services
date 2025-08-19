# Services Marketplace

Simple marketplace MVP built with React and Vite.

## Environment Variables

This project uses [Supabase](https://supabase.com/) for authentication and data.
Create a `.env` file with the following variables (you can copy from `.env.example`):

```
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_ANON_PUBLIC_KEY"
```

Without valid credentials the application will still load but any Supabase
functionality will be disabled.

## Scripts

- `npm run dev` – start the development server
- `npm run build` – build the production bundle
- `npm run preview` – preview the production build

