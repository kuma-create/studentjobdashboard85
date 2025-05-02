// /types/job.ts

export type Job = {
  id: string
  title: string
  description: string
  location: string | null
  job_type: string | null
  salary_range: string | null
  requirements: string | null
  application_deadline: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
  company_id: string
  created_by: string | null
  companies?: {
    id: string
    name: string
    industry: string | null
    logo_url: string | null
  } | null
}
