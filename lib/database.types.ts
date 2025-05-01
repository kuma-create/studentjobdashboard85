export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          student_id: string
          job_id: string
          status: string
          created_at: string
          updated_at: string | null
          resume_url: string | null
          cover_letter: string | null
          interview_date: string | null
        }
        Insert: {
          id?: string
          student_id: string
          job_id: string
          status?: string
          created_at?: string
          updated_at?: string | null
          resume_url?: string | null
          cover_letter?: string | null
          interview_date?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          job_id?: string
          status?: string
          created_at?: string
          updated_at?: string | null
          resume_url?: string | null
          cover_letter?: string | null
          interview_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          id: string
          name: string
          industry: string | null
          location: string | null
          size: string | null
          description: string | null
          website_url: string | null
          logo_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          location?: string | null
          size?: string | null
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          location?: string | null
          size?: string | null
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_users: {
        Row: {
          id: string
          user_id: string
          company_id: string
          role: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          role?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          role?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          id: string
          company_id: string | null
          student_id: string | null
          job_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          student_id?: string | null
          job_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string | null
          student_id?: string | null
          job_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_schedules: {
        Row: {
          id: string
          application_id: string
          interview_date: string
          interview_time: string
          location: string | null
          meeting_url: string | null
          notes: string | null
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          application_id: string
          interview_date: string
          interview_time: string
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          application_id?: string
          interview_date?: string
          interview_time?: string
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_schedules_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          id: string
          title: string
          description: string
          company_id: string
          location: string | null
          job_type: string | null
          salary_range: string | null
          requirements: string | null
          application_deadline: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          company_id: string
          location?: string | null
          job_type?: string | null
          salary_range?: string | null
          requirements?: string | null
          application_deadline?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          company_id?: string
          location?: string | null
          job_type?: string | null
          salary_range?: string | null
          requirements?: string | null
          application_deadline?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          id: string
          student_id: string
          job_id: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          job_id: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          job_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          university: string | null
          major: string | null
          graduation_year: number | null
          skills: string[] | null
          bio: string | null
          avatar_url: string | null
          resume_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          university?: string | null
          major?: string | null
          graduation_year?: number | null
          skills?: string[] | null
          bio?: string | null
          avatar_url?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          university?: string | null
          major?: string | null
          graduation_year?: number | null
          skills?: string[] | null
          bio?: string | null
          avatar_url?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id: string
          role: string
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          role?: string
          is_approved?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_applications_table: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
