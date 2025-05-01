// Job型の定義
export interface Job {
    id: string
    title: string
    description: string
    company_id: string
    location: string | null // null を許容するように変更
    job_type: string | null // null を許容するように変更
    salary_range: string | null // null を許容するように変更
    requirements: string | null // null を許容するように変更
    application_deadline: string | null // null を許容するように変更
    is_active: boolean
    created_at: string
    updated_at: string | null // null を許容するように変更
  }
  