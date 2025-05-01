"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const userType = formData.get("userType") as "student" | "company"

  // サービスロールキーを使用してクライアントを作成
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // ユーザー登録（管理者権限で）
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { user_type: userType },
    })

    if (error) {
      console.error("ユーザー作成エラー:", JSON.stringify(error))
      return { success: false, error: error.message }
    }

    if (data.user) {
      try {
        // まず既存のレコードを確認
        const { data: existingRole, error: selectError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (selectError && selectError.code !== "PGRST116") {
          // PGRST116はレコードが見つからないエラー
          console.error("既存ロール確認エラー:", JSON.stringify(selectError))
          return { success: false, error: `既存ロール確認エラー: ${selectError.message || "不明なエラー"}` }
        }

        // 既存のレコードがなければ挿入
        if (!existingRole) {
          console.log("ユーザーロール挿入開始:", data.user.id, userType)

          // ユーザーロールを設定
          const { error: roleError } = await supabase.from("user_roles").insert([
            {
              id: data.user.id,
              role: userType,
              is_approved: userType === "student", // 学生は自動承認、企業は管理者承認
            },
          ])

          if (roleError) {
            console.error("ロール設定エラー詳細:", {
              code: roleError.code,
              details: roleError.details,
              hint: roleError.hint,
              message: roleError.message,
            })

            // エラーメッセージがundefinedの場合は汎用的なメッセージを表示
            const errorMessage = roleError.message || "ユーザーロールの設定中にエラーが発生しました"
            return { success: false, error: `ロール設定エラー: ${errorMessage}` }
          }
        }

        // 学生プロフィールを作成
        if (userType === "student") {
          // まず既存のプロフィールを確認
          const { data: existingProfile, error: profileSelectError } = await supabase
            .from("student_profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (profileSelectError && profileSelectError.code !== "PGRST116") {
            console.error("既存プロフィール確認エラー:", JSON.stringify(profileSelectError))
            return {
              success: false,
              error: `既存プロフィール確認エラー: ${profileSelectError.message || "不明なエラー"}`,
            }
          }

          // 既存のプロフィールがなければ挿入
          if (!existingProfile) {
            const { error: profileError } = await supabase.from("student_profiles").insert([
              {
                id: data.user.id,
              },
            ])

            if (profileError) {
              console.error("プロフィール作成エラー:", JSON.stringify(profileError))
              return { success: false, error: `プロフィール作成エラー: ${profileError.message || "不明なエラー"}` }
            }
          }
        }

        revalidatePath("/auth/signin")
        return {
          success: true,
          message:
            "登録が完了しました。確認メールを送信しましたので、メールのリンクをクリックして登録を完了してください。",
        }
      } catch (innerError: any) {
        console.error("内部処理エラー:", innerError)
        return { success: false, error: innerError.message || "処理中に予期せぬエラーが発生しました" }
      }
    } else {
      return { success: false, error: "ユーザーデータが取得できませんでした" }
    }
  } catch (error: any) {
    console.error("登録エラー:", error)
    return { success: false, error: error.message || "登録に失敗しました。もう一度お試しください。" }
  }
}
