import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "../database.types"
import type { CookieOptions } from "@supabase/ssr"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ※サービスロールは必要な場面だけ
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // App Router では set/remove は使用不可なので no-op
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  )
}
