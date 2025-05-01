export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    is_read: boolean
    created_at: string
    updated_at: string | null
  }
  
  export interface Company {
    id: string
    name: string
    logo_url: string | null
  }
  
  export interface Job {
    id: string
    job_title: string
  }
  
  export interface StudentProfile {
    id: string
    first_name: string | null
    last_name: string | null
    university: string | null
    avatar_url: string | null
  }
  
  export interface Conversation {
    id: string
    company_id: string | null
    student_id: string | null
    job_id: string | null
    created_at: string
    updated_at: string | null
    companies?: Company | null
    jobs?: Job | null
    student_profiles?: StudentProfile | null
  }
  
  export interface ConversationWithDetails extends Conversation {
    latestMessage: Message | null
    unreadCount: number
  }
  