import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "../database.types"

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === "undefined") return undefined
          const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
          return match ? match[2] : undefined
        },
        set(name: string, value: string, options) {
          if (typeof document === "undefined") return
          const opt = {
            path: "/",
            ...options,
          }
          let cookie = `${name}=${value}`
          if (opt.maxAge) cookie += `; Max-Age=${opt.maxAge}`
          if (opt.path) cookie += `; Path=${opt.path}`
          if (opt.domain) cookie += `; Domain=${opt.domain}`
          if (opt.sameSite) cookie += `; SameSite=${opt.sameSite}`
          if (opt.secure) cookie += `; Secure`
          document.cookie = cookie
        },
        remove(name: string, options) {
          if (typeof document === "undefined") return
          document.cookie = `${name}=; Max-Age=0; Path=${options?.path || "/"}`
        },
      },
    },
  )
}
