export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "Follow-up"
  | "Meeting"
  | "Proposal"
  | "Won"
  | "Lost";

export type LeadPriority = "low" | "medium" | "high" | "urgent";

export type LeadSource =
  | "manual"
  | "csv_import"
  | "google_maps"
  | "website"
  | "inbound"
  | "other";

export type WorkspaceRole = "owner" | "admin" | "member";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          active_workspace_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          active_workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          active_workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: WorkspaceRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: WorkspaceRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: WorkspaceRole;
          created_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          workspace_id: string;
          business_name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          website_url: string | null;
          category: string | null;
          address: string | null;
          city: string | null;
          rating: number | null;
          google_maps_url: string | null;
          instagram_url: string | null;
          whatsapp_number: string | null;
          source: LeadSource;
          status: LeadStatus;
          priority: LeadPriority;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          business_name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          website_url?: string | null;
          category?: string | null;
          address?: string | null;
          city?: string | null;
          rating?: number | null;
          google_maps_url?: string | null;
          instagram_url?: string | null;
          whatsapp_number?: string | null;
          source?: LeadSource;
          status?: LeadStatus;
          priority?: LeadPriority;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          business_name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          website_url?: string | null;
          category?: string | null;
          address?: string | null;
          city?: string | null;
          rating?: number | null;
          google_maps_url?: string | null;
          instagram_url?: string | null;
          whatsapp_number?: string | null;
          source?: LeadSource;
          status?: LeadStatus;
          priority?: LeadPriority;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_workspace_member: {
        Args: {
          lookup_workspace_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      lead_status: LeadStatus;
      lead_priority: LeadPriority;
      lead_source: LeadSource;
      workspace_role: WorkspaceRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];
export type WorkspaceRow = Database["public"]["Tables"]["workspaces"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
