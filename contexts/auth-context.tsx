"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

type UserProfile = {
  id: string
  first_name?: string | null
  last_name?: string | null
  university?: string | null
  company_name?: string | null
  avatar_url?: string | null
  email: string
}

type AuthContextType = {
  user: User | null
  userRole: string | null
  profile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 初期化フラグを追加して無限ループを防止
  const isInitialized = useRef(false)
  const authChangeProcessing = useRef(false)

  const supabase = createClient()

  const refreshUser = async () => {
    // すでに処理中なら実行しない（無限ループ防止）
    if (authChangeProcessing.current) return

    try {
      authChangeProcessing.current = true
      setIsLoading(true)
      console.log("Refreshing user data")

      // セッション情報を取得
      const {
        data: { session },
      } = await supabase.auth.getSession()

      console.log("Session check:", session ? "Session exists" : "No session")

      if (!session?.user) {
        console.log("No user in session, clearing user data")
        setUser(null)
        setUserRole(null)
        setProfile(null)
        authChangeProcessing.current = false
        return
      }

      console.log("User found in session:", session.user.id)
      setUser(session.user)

      // ユーザーロールを取得
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (roleError) {
        console.error("ロール取得エラー:", roleError)
        authChangeProcessing.current = false
        return
      }

      console.log("User role:", roleData?.role || "No role")
      setUserRole(roleData?.role || null)

      // ユーザープロフィールを取得
      if (roleData?.role === "student") {
        console.log("Fetching student profile")
        const { data: studentProfile, error: profileError } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (!profileError && studentProfile) {
          console.log("Student profile found")
          setProfile({
            id: session.user.id,
            first_name: studentProfile.first_name,
            last_name: studentProfile.last_name,
            university: studentProfile.university,
            avatar_url: studentProfile.avatar_url,
            email: session.user.email || "",
          })
        } else {
          console.log("No student profile found or error:", profileError)
        }
      } else if (roleData?.role === "company") {
        console.log("Fetching company profile")
        // 企業ユーザーの場合
        const { data: companyUser, error: companyUserError } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", session.user.id)
          .single()

        if (!companyUserError && companyUser) {
          console.log("Company user found with company_id:", companyUser.company_id)
          const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("name")
            .eq("id", companyUser.company_id)
            .single()

          if (!companyError && company) {
            console.log("Company found:", company.name)
            setProfile({
              id: session.user.id,
              company_name: company.name || session.user.user_metadata?.company_name,
              email: session.user.email || "",
            })
          } else {
            console.log("No company found or error:", companyError)
          }
        } else {
          console.log("No company user found, using metadata")
          // company_usersテーブルにデータがない場合はuser_metadataから取得
          setProfile({
            id: session.user.id,
            company_name: session.user.user_metadata?.company_name || "企業名未設定",
            email: session.user.email || "",
          })
        }
      }
    } catch (error) {
      console.error("ユーザー情報取得エラー:", error)
    } finally {
      setIsLoading(false)
      authChangeProcessing.current = false
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserRole(null)
      setProfile(null)

      // 直接リダイレクトする代わりにrouterを使用
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("ログアウトエラー:", error)
    }
  }

  useEffect(() => {
    // 初期化済みなら実行しない（無限ループ防止）
    if (isInitialized.current) return

    const initializeAuth = async () => {
      await refreshUser()
      isInitialized.current = true
    }

    initializeAuth()

    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      // ここが重要: SIGNED_OUTイベントは、実際にセッションがない場合のみ処理
      if (event === "SIGNED_OUT") {
        // セッションが実際に存在するか確認
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          console.log("SIGNED_OUT event received but session exists, ignoring")
          return // セッションが存在する場合は無視
        }

        setUser(null)
        setUserRole(null)
        setProfile(null)
      }
      // SIGNED_INとTOKEN_REFRESHEDの場合は通常通り処理
      else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        refreshUser()
        // セッションが更新されたらページをリフレッシュ
        router.refresh()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, userRole, profile, isLoading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
