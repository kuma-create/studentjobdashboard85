"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Job } from "@/types/job" // Job型をインポート
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface CompanyJobsClientProps {
  jobs: Job[]
}

export default function CompanyJobsClient({ jobs }: CompanyJobsClientProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">求人管理</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-primary text-primary-foreground" : ""}
          >
            リスト表示
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}
          >
            グリッド表示
          </Button>
          <Link href="/company/jobs/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新規求人作成
            </Button>
          </Link>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">求人がありません</h2>
          <p className="text-muted-foreground mb-6">新しい求人を作成して学生からの応募を受け付けましょう</p>
          <Link href="/company/jobs/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新規求人作成
            </Button>
          </Link>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="pb-2">
                <CardTitle>{job.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {job.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">公開中</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">非公開</span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{job.job_type}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/company/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm">
                        編集
                      </Button>
                    </Link>
                    <Link href={`/company/jobs/${job.id}`}>
                      <Button size="sm">詳細</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    {job.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">公開中</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">非公開</span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{job.job_type}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/company/jobs/${job.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        編集
                      </Button>
                    </Link>
                    <Link href={`/company/jobs/${job.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        詳細
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
