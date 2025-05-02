"use client"

import { useState } from "react"
import type { User } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BriefcaseIcon, BookmarkIcon, StarIcon } from "lucide-react"

interface DashboardClientProps {
  user: User
  userRole: string
  profile: any
  applications: any[]
  savedJobs: any[]
  recommendedJobs: any[]
}

export default function DashboardClient({
  user,
  userRole,
  profile,
  applications,
  savedJobs,
  recommendedJobs,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // プロフィール情報
  const firstName = profile?.first_name || "名前未設定"
  const lastName = profile?.last_name || ""
  const university = profile?.university || "大学未設定"
  const graduationYear = profile?.graduation_year || "未設定"
  const avatarUrl = profile?.avatar_url || null

  // イニシャルを取得
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    return firstName.charAt(0).toUpperCase()
  }

  return (
    <div className="container py-6 md:py-10">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* プロフィールカード */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">プロフィール</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/profile">編集</a>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl || undefined} alt={`${firstName} ${lastName}`} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-medium">{`${firstName} ${lastName}`}</h3>
                <p className="text-sm text-muted-foreground">{university}</p>
                <p className="text-sm text-muted-foreground">{`卒業予定: ${graduationYear}年`}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* メインコンテンツ */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <StarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">おすすめ</span>
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <BriefcaseIcon className="h-4 w-4" />
                <span className="hidden sm:inline">応募履歴</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4" />
                <span className="hidden sm:inline">保存済み</span>
              </TabsTrigger>
            </TabsList>

            {/* おすすめ求人タブ */}
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>おすすめ求人</CardTitle>
                  <CardDescription>あなたにおすすめの求人情報です</CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {recommendedJobs.map((job) => (
                        <div key={job.id} className="flex items-start space-x-4 border-b pb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={job.companies?.logo_url || undefined} alt={job.companies?.company_name} />
                            <AvatarFallback>{job.companies?.company_name?.charAt(0) || "C"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium">{job.job_title}</h4>
                            <p className="text-sm text-muted-foreground">{job.companies?.company_name}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {job.location && (
                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1">
                                  {job.location}
                                </span>
                              )}
                              {job.salary_min > 0 && job.salary_max > 0 && (
                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1">
                                  {`${job.salary_min}万円〜${job.salary_max}万円`}
                                </span>
                              )}
                            </div>
                            <div className="pt-2">
                              <Button size="sm" asChild>
                                <a href={`/jobs/${job.id}`}>詳細を見る</a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">おすすめの求人はまだありません</p>
                      <Button className="mt-4" asChild>
                        <a href="/jobs">求人を探す</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 応募履歴タブ */}
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>応募履歴</CardTitle>
                  <CardDescription>あなたの応募状況を確認できます</CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div key={app.id} className="flex items-start space-x-4 border-b pb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={app.jobs?.companies?.logo_url || undefined}
                              alt={app.jobs?.companies?.company_name}
                            />
                            <AvatarFallback>{app.jobs?.companies?.company_name?.charAt(0) || "C"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium">{app.jobs?.job_title}</h4>
                            <p className="text-sm text-muted-foreground">{app.jobs?.companies?.company_name}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-1 ${
                                  app.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : app.status === "accepted"
                                      ? "bg-green-100 text-green-800"
                                      : app.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {app.status === "pending"
                                  ? "審査中"
                                  : app.status === "accepted"
                                    ? "合格"
                                    : app.status === "rejected"
                                      ? "不合格"
                                      : app.status}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1">
                                {new Date(app.created_at).toLocaleDateString("ja-JP")}
                              </span>
                            </div>
                            <div className="pt-2">
                              <Button size="sm" asChild>
                                <a href={`/applications/${app.id}`}>詳細を見る</a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">応募履歴はまだありません</p>
                      <Button className="mt-4" asChild>
                        <a href="/jobs">求人を探す</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 保存済み求人タブ */}
            <TabsContent value="saved">
              <Card>
                <CardHeader>
                  <CardTitle>保存済み求人</CardTitle>
                  <CardDescription>後で確認するために保存した求人です</CardDescription>
                </CardHeader>
                <CardContent>
                  {savedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {savedJobs.map((job) => (
                        <div key={job.id} className="flex items-start space-x-4 border-b pb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={job.jobs?.companies?.logo_url || undefined}
                              alt={job.jobs?.companies?.company_name}
                            />
                            <AvatarFallback>{job.jobs?.companies?.company_name?.charAt(0) || "C"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium">{job.jobs?.job_title}</h4>
                            <p className="text-sm text-muted-foreground">{job.jobs?.companies?.company_name}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {job.jobs?.location && (
                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1">
                                  {job.jobs.location}
                                </span>
                              )}
                              {job.jobs?.salary_min > 0 && job.jobs?.salary_max > 0 && (
                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1">
                                  {`${job.jobs.salary_min}万円〜${job.jobs.salary_max}万円`}
                                </span>
                              )}
                            </div>
                            <div className="pt-2">
                              <Button size="sm" asChild>
                                <a href={`/jobs/${job.jobs?.id}`}>詳細を見る</a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">保存済みの求人はまだありません</p>
                      <Button className="mt-4" asChild>
                        <a href="/jobs">求人を探す</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
