import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "../database.types"

// シングルトンパターンでクライアントを作成
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (supabaseClient === null) {
    // 環境変数が存在することを確認
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase環境変数が設定されていません")
      throw new Error("Supabase環境変数が設定されていません")
    }

    // 型アサーションを使用して型エラーを回避
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          name: "sb-auth-token",
          lifetime: 60 * 60 * 24 * 7, // 1週間
          domain: "",
          path: "/",
          sameSite: "lax",
        },
      },
    )
  }

  // nullチェックを追加
  if (!supabaseClient) {
    throw new Error("Supabaseクライアントの初期化に失敗しました")
  }

  return supabaseClient
}
