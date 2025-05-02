import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "../database.types"

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // クッキーの設定に失敗した場合のエラーハンドリング
            console.error("Failed to set cookie:", error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 })
          } catch (error) {
            console.error("Failed to remove cookie:", error)
          }
        },
      },
    },
  )
}

// 後方互換性のために残す
export const createServerSupabaseClient = createClient
