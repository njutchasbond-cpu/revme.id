export type CardStatus = 'unclaimed' | 'active' | 'inactive';

export interface Card {
  id: string;
  short_code: string;
  status: CardStatus;
  owner_id?: string | null;
  owner_phone?: string | null;
  owner_email?: string | null;
  business_name?: string | null;
  business_address?: string | null;
  google_place_id?: string | null;
  review_url?: string | null;
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

