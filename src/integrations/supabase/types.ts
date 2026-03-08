export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          city: string | null
          company_address: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          country: string | null
          created_at: string
          currency: string
          default_interest_rate: number | null
          email_sender_name: string | null
          fiscal_year_start: string | null
          id: string
          late_payment_penalty_rate: number | null
          license_number: string | null
          logo_url: string | null
          max_loan_to_salary_ratio: number | null
          payroll_cutoff_day: number | null
          smtp_email: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          tin_number: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          default_interest_rate?: number | null
          email_sender_name?: string | null
          fiscal_year_start?: string | null
          id?: string
          late_payment_penalty_rate?: number | null
          license_number?: string | null
          logo_url?: string | null
          max_loan_to_salary_ratio?: number | null
          payroll_cutoff_day?: number | null
          smtp_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          tin_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          default_interest_rate?: number | null
          email_sender_name?: string | null
          fiscal_year_start?: string | null
          id?: string
          late_payment_penalty_rate?: number | null
          license_number?: string | null
          logo_url?: string | null
          max_loan_to_salary_ratio?: number | null
          payroll_cutoff_day?: number | null
          smtp_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          tin_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          allowances: number
          bank_account: string | null
          branch: string
          created_at: string
          date_of_employment: string
          department: string
          email: string | null
          employee_id: string
          employment_status: string
          full_name: string
          id: string
          monthly_salary: number
          phone: string | null
          position: string
          updated_at: string
          user_type: string
        }
        Insert: {
          allowances?: number
          bank_account?: string | null
          branch?: string
          created_at?: string
          date_of_employment: string
          department: string
          email?: string | null
          employee_id: string
          employment_status?: string
          full_name: string
          id?: string
          monthly_salary?: number
          phone?: string | null
          position: string
          updated_at?: string
          user_type?: string
        }
        Update: {
          allowances?: number
          bank_account?: string | null
          branch?: string
          created_at?: string
          date_of_employment?: string
          department?: string
          email?: string | null
          employee_id?: string
          employment_status?: string
          full_name?: string
          id?: string
          monthly_salary?: number
          phone?: string | null
          position?: string
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      loan_application_documents: {
        Row: {
          document_name: string
          file_size: number | null
          file_url: string
          id: string
          loan_application_id: string
          uploaded_at: string
        }
        Insert: {
          document_name: string
          file_size?: number | null
          file_url: string
          id?: string
          loan_application_id: string
          uploaded_at?: string
        }
        Update: {
          document_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          loan_application_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_application_documents_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_applications: {
        Row: {
          application_date: string
          application_number: string
          approval_date: string | null
          approval_remarks: string | null
          approved_amount: number | null
          approved_by: string | null
          closure_date: string | null
          closure_remarks: string | null
          created_at: string
          disbursed_by: string | null
          disbursement_date: string | null
          disbursement_method: string | null
          disbursement_voucher: string | null
          employee_id: string
          id: string
          interest_rate: number
          loan_type_id: string
          monthly_installment: number | null
          next_due_date: string | null
          outstanding_balance: number | null
          proposed_start_date: string | null
          purpose: string | null
          recommended_by: string | null
          remarks: string | null
          repayment_period_months: number
          requested_amount: number
          reviewed_by: string | null
          status: string
          total_paid: number
          total_payable: number | null
          updated_at: string
        }
        Insert: {
          application_date?: string
          application_number: string
          approval_date?: string | null
          approval_remarks?: string | null
          approved_amount?: number | null
          approved_by?: string | null
          closure_date?: string | null
          closure_remarks?: string | null
          created_at?: string
          disbursed_by?: string | null
          disbursement_date?: string | null
          disbursement_method?: string | null
          disbursement_voucher?: string | null
          employee_id: string
          id?: string
          interest_rate?: number
          loan_type_id: string
          monthly_installment?: number | null
          next_due_date?: string | null
          outstanding_balance?: number | null
          proposed_start_date?: string | null
          purpose?: string | null
          recommended_by?: string | null
          remarks?: string | null
          repayment_period_months: number
          requested_amount: number
          reviewed_by?: string | null
          status?: string
          total_paid?: number
          total_payable?: number | null
          updated_at?: string
        }
        Update: {
          application_date?: string
          application_number?: string
          approval_date?: string | null
          approval_remarks?: string | null
          approved_amount?: number | null
          approved_by?: string | null
          closure_date?: string | null
          closure_remarks?: string | null
          created_at?: string
          disbursed_by?: string | null
          disbursement_date?: string | null
          disbursement_method?: string | null
          disbursement_voucher?: string | null
          employee_id?: string
          id?: string
          interest_rate?: number
          loan_type_id?: string
          monthly_installment?: number | null
          next_due_date?: string | null
          outstanding_balance?: number | null
          proposed_start_date?: string | null
          purpose?: string | null
          recommended_by?: string | null
          remarks?: string | null
          repayment_period_months?: number
          requested_amount?: number
          reviewed_by?: string | null
          status?: string
          total_paid?: number
          total_payable?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_applications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_applications_loan_type_id_fkey"
            columns: ["loan_type_id"]
            isOneToOne: false
            referencedRelation: "loan_types"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_type_documents: {
        Row: {
          created_at: string
          document_name: string
          id: string
          is_required: boolean
          loan_type_id: string
          template_url: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          id?: string
          is_required?: boolean
          loan_type_id: string
          template_url?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          id?: string
          is_required?: boolean
          loan_type_id?: string
          template_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_type_documents_loan_type_id_fkey"
            columns: ["loan_type_id"]
            isOneToOne: false
            referencedRelation: "loan_types"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_types: {
        Row: {
          approval_level: string | null
          created_at: string
          deduction_method: string
          description: string | null
          eligibility_min_months: number | null
          id: string
          interest_free: boolean
          interest_rate: number
          is_active: boolean
          max_active_loans: number
          max_amount: number
          max_period_months: number
          min_amount: number
          name: string
          salary_multiplier: number | null
          updated_at: string
        }
        Insert: {
          approval_level?: string | null
          created_at?: string
          deduction_method?: string
          description?: string | null
          eligibility_min_months?: number | null
          id?: string
          interest_free?: boolean
          interest_rate?: number
          is_active?: boolean
          max_active_loans?: number
          max_amount?: number
          max_period_months?: number
          min_amount?: number
          name: string
          salary_multiplier?: number | null
          updated_at?: string
        }
        Update: {
          approval_level?: string | null
          created_at?: string
          deduction_method?: string
          description?: string | null
          eligibility_min_months?: number | null
          id?: string
          interest_free?: boolean
          interest_rate?: number
          is_active?: boolean
          max_active_loans?: number
          max_amount?: number
          max_period_months?: number
          min_amount?: number
          name?: string
          salary_multiplier?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      manual_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          loan_application_id: string
          payment_date: string
          payment_method: string
          receipt_number: string | null
          received_by: string | null
          remarks: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          loan_application_id: string
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          received_by?: string | null
          remarks?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_application_id?: string
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          received_by?: string | null
          remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_payments_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_deductions: {
        Row: {
          created_at: string
          deduction_amount: number
          id: string
          loan_application_id: string
          payroll_period: string
          processed_date: string | null
          remarks: string | null
          repayment_schedule_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          deduction_amount: number
          id?: string
          loan_application_id: string
          payroll_period: string
          processed_date?: string | null
          remarks?: string | null
          repayment_schedule_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          deduction_amount?: number
          id?: string
          loan_application_id?: string
          payroll_period?: string
          processed_date?: string | null
          remarks?: string | null
          repayment_schedule_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_deductions_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_deductions_repayment_schedule_id_fkey"
            columns: ["repayment_schedule_id"]
            isOneToOne: false
            referencedRelation: "repayment_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      repayment_schedule: {
        Row: {
          beginning_balance: number
          created_at: string
          due_date: string
          id: string
          installment_amount: number
          installment_no: number
          interest_portion: number
          loan_application_id: string
          paid_amount: number
          paid_date: string | null
          principal_portion: number
          remaining_balance: number
          status: string
          total_due: number
          updated_at: string
        }
        Insert: {
          beginning_balance: number
          created_at?: string
          due_date: string
          id?: string
          installment_amount: number
          installment_no: number
          interest_portion?: number
          loan_application_id: string
          paid_amount?: number
          paid_date?: string | null
          principal_portion: number
          remaining_balance: number
          status?: string
          total_due: number
          updated_at?: string
        }
        Update: {
          beginning_balance?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_amount?: number
          installment_no?: number
          interest_portion?: number
          loan_application_id?: string
          paid_amount?: number
          paid_date?: string | null
          principal_portion?: number
          remaining_balance?: number
          status?: string
          total_due?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repayment_schedule_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module: string
          role: string
          updated_at: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module: string
          role: string
          updated_at?: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      savings_transactions: {
        Row: {
          amount: number
          created_at: string
          employee_id: string
          id: string
          payment_method: string
          receipt_number: string | null
          recorded_by: string | null
          remarks: string | null
          savings_type: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          employee_id: string
          id?: string
          payment_method?: string
          receipt_number?: string | null
          recorded_by?: string | null
          remarks?: string | null
          savings_type?: string
          transaction_date?: string
          transaction_type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          employee_id?: string
          id?: string
          payment_method?: string
          receipt_number?: string | null
          recorded_by?: string | null
          remarks?: string | null
          savings_type?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_transactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "manager" | "finance" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "manager", "finance", "employee"],
    },
  },
} as const
