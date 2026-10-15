import { createBrowserClient } from '@supabase/ssr';

// Use the SSR cookie storage so the browser and server share one session.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
