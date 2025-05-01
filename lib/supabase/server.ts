import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "../database.types"
import type { CookieOptions } from "@supabase/ssr"

/**
 * サーバーサイドで Supabase クライアントを作成する関数
 * App Router のサーバーコンポーネントで使用することを想定しています
 *
 * @returns Supabase クライアントインスタンス
 */
export async function createClient() {
  // cookies()関数を内部で呼び出し、awaitで解決する
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookieValue = cookieStore.get(name)
          return cookieValue?.value
        },
        // App Router のサーバーコンポーネントでは Cookie の設定は
        // レスポンスヘッダーを通じて行われるため、ここでは何もしない
        set(name: string, value: string, options: CookieOptions) {
          // サーバーアクションや API ルートでは必要に応じて実装
        },
        remove(name: string, options: CookieOptions) {
          // サーバーアクションや API ルートでは必要に応じて実装
        },
      },
    },
  )
}
