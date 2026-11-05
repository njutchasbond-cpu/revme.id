export type CardStatus = 'unclaimed' | 'active' | 'inactive';
export type CardMode = 'smart_hub' | 'direct_review';

export interface Card {
  id: string;
  short_code: string;
  status: CardStatus;
  mode: CardMode;
  owner_id?: string | null;
  owner_phone?: string | null;
  owner_email?: string | null;
  
  // Informasi Toko
  business_name?: string | null;
  business_category?: string | null;
  business_address?: string | null;
  logo_url?: string | null;
  google_place_id?: string | null;
  review_url?: string | null;
  
  // All-in-One Links & Data
  wifi_ssid?: string | null;
  wifi_password?: string | null;
  menu_url?: string | null;
  services_url?: string | null;
  instagram_username?: string | null;
  tiktok_username?: string | null;
  website_url?: string | null;
  whatsapp_number?: string | null;
  theme_preset?: string | null;
  
  batch_number?: string | null;
  tap_count: number;
  claimed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  review_url: string;
}

export interface InteractionLog {
  id: number;
  card_id: string;
  interaction_type: string;
  device_type?: string;
  user_agent?: string;
  created_at: string;
}
