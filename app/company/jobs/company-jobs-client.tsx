"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Calendar, Users } from "lucide-react"

// 求人情報の型定義
interface Job {
  id: string
  title: string
  description: string
  company_id: string
  location: string | null
  job_type: string | null
  salary_range: {
    min: number | null
    max: number | null
  } | null
  requirements: string | null
  application_deadline: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
  [key: string]: any
}

interface CompanyJobsClientProps {
  jobs: Job[]
  applicationCounts?: Record<string, number>
  companyId: string
}

export default function CompanyJobsClient({ jobs, applicationCounts = {}, companyId }: CompanyJobsClientProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // 検索フィルター
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // 日付フォーマット
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未設定"
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 給与範囲のフォーマット
  const formatSalaryRange = (salaryRange: { min: number | null; max: number | null } | null) => {
    if (!salaryRange) return "未設定"

    const min = salaryRange.min ? `${salaryRange.min.toLocaleString()}万円` : "応相談"
    const max = salaryRange.max ? `${salaryRange.max.toLocaleString()}万円` : "応相談"

    if (salaryRange.min && salaryRange.max) {
      return `${min} 〜 ${max}`
    } else if (salaryRange.min) {
      return `${min} 〜`
    } else if (salaryRange.max) {
      return `〜 ${max}`
    }

    return "応相談"
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">求人管理</h1>
        <Link href="/company/jobs/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新規求人作成
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="求人を検索..."
          className="w-full p-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">求人情報がありません</p>
          <Link href="/company/jobs/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              最初の求人を作成する
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <Badge variant={job.is_active ? "default" : "secondary"}>{job.is_active ? "公開中" : "非公開"}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    締切: {formatDate(job.application_deadline)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="mr-2 h-4 w-4" />
                    応募数: {applicationCounts[job.id] || 0}
                  </div>
                  <div className="text-sm">給与: {formatSalaryRange(job.salary_range)}</div>
                  {job.location && <div className="text-sm">勤務地: {job.location}</div>}
                </div>
                <div className="flex space-x-2">
                  <Link href={`/company/jobs/${job.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      編集
                    </Button>
                  </Link>
                  <Link href={`/jobs/${job.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      詳細
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
