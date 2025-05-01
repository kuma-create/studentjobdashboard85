import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "../database.types"

/**
 * サーバーサイドで Supabase クライアントを作成する関数
 * App Router のサーバーコンポーネントで使用することを想定しています
 *
 * @returns Supabase クライアントインスタンス
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // App Router のサーバーコンポーネントでは Cookie の設定は
        // レスポンスヘッダーを通じて行われるため、ここでは何もしない
        set(name: string, value: string, options: any) {
          // サーバーアクションや API ルートでは必要に応じて実装
        },
        remove(name: string, options: any) {
          // サーバーアクションや API ルートでは必要に応じて実装
        },
      },
    },
  )
}
