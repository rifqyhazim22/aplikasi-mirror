export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string;
          nickname: string;
          focus_areas: string[];
          consent_camera: boolean;
          consent_data: boolean;
          mood_baseline: string;
          mbti_type: string | null;
          enneagram_type: string | null;
          primary_archetype: string | null;
          zodiac_sign: string | null;
          personality_notes: string | null;
          created_at: string;
          updated_at: string;
          conversation_summary: string | null;
        };
        Insert: {
          id?: string;
          nickname: string;
          focus_areas?: string[];
          consent_camera?: boolean;
          consent_data?: boolean;
          mood_baseline?: string;
          mbti_type?: string | null;
          enneagram_type?: string | null;
          primary_archetype?: string | null;
          zodiac_sign?: string | null;
          personality_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          conversation_summary?: string | null;
        };
        Update: {
          id?: string;
          nickname?: string;
          focus_areas?: string[];
          consent_camera?: boolean;
          consent_data?: boolean;
          mood_baseline?: string;
          mbti_type?: string | null;
          enneagram_type?: string | null;
          primary_archetype?: string | null;
          zodiac_sign?: string | null;
          personality_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          conversation_summary?: string | null;
        };
        Relationships: [];
      };
      conversation_log: {
        Row: {
          id: string;
          profile_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_log_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
        ];
      };
      personality_quiz: {
        Row: {
          id: string;
          nickname: string | null;
          mbti_result: string | null;
          enneagram_result: string | null;
          focus_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nickname?: string | null;
          mbti_result?: string | null;
          enneagram_result?: string | null;
          focus_note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string | null;
          mbti_result?: string | null;
          enneagram_result?: string | null;
          focus_note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      camera_emotion_log: {
        Row: {
          id: string;
          profile_id: string | null;
          emotion: string;
          confidence: number | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          emotion: string;
          confidence?: number | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          emotion?: string;
          confidence?: number | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "camera_emotion_log_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
        ];
      };
      mood_entry: {
        Row: {
          id: string;
          profile_id: string;
          mood: string;
          note: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          mood: string;
          note?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          mood?: string;
          note?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mood_entry_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
