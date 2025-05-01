export type DashboardClientProps = {
    user: any
    userRole: string
    profile: any
    applications: any[]
    savedJobs: any[]
    recommendedJobs: any[]
  }
  
  export type CompanyDashboardClientProps = {
    user: any
    company: {
      id: string
      company_name: string
      email: string | undefined | null
      industry: string | null
      location: string | null
      company_size: string | null
      description: string | null
      website_url: string | null
      logo_url: string | null
    } | null
    jobs: any[]
    applications: any[]
  }
  