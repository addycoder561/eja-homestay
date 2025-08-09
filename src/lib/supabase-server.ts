import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function getSupabaseServer() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // In Next 15, cookies() can be async; handle both sync and async cases
        const maybePromise = cookieStore as any;
        if (typeof maybePromise.then === 'function') {
          return (maybePromise as Promise<any>).then((store: any) => store.get(name)?.value);
        }
        return (cookieStore as any).get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        const maybePromise = cookieStore as any;
        if (typeof maybePromise.then === 'function') {
          // @ts-ignore
          return maybePromise.then((store: any) => store.set({ name, value, ...options }));
        }
        (cookieStore as any).set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        const maybePromise = cookieStore as any;
        if (typeof maybePromise.then === 'function') {
          // @ts-ignore
          return maybePromise.then((store: any) => store.set({ name, value: '', ...options, expires: new Date(0) }));
        }
        (cookieStore as any).set({ name, value: '', ...options, expires: new Date(0) });
      },
    },
  });
}


