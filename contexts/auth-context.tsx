"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/auth-helpers-nextjs"

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

  const supabase = createClient()

  const refreshUser = async () => {
    try {
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
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserRole(null)
      setProfile(null)
      window.location.href = "/"
    } catch (error) {
      console.error("ログアウトエラー:", error)
    }
  }

  useEffect(() => {
    refreshUser()

    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        refreshUser()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUserRole(null)
        setProfile(null)
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
