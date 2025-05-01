import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "../database.types"

export async function createClient() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // 読み取り専用のため、set と remove は空の実装にする
        set(name: string, value: string, options: any) {
          // Server Components では cookie を設定できないため、何もしない
          console.warn(
            "Warning: Attempting to set cookie in a Server Component. This is not supported and will not work.",
          )
        },
        remove(name: string, options: any) {
          // Server Components では cookie を削除できないため、何もしない
          console.warn(
            "Warning: Attempting to remove cookie in a Server Component. This is not supported and will not work.",
          )
        },
      },
    },
  )

  return supabase
}
