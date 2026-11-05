import { Card } from './types';

declare global {
  var __DEV_CARDS_STORE__: Map<string, Card> | undefined;
}

if (!global.__DEV_CARDS_STORE__) {
  global.__DEV_CARDS_STORE__ = new Map<string, Card>([
    [
      'DEMO1',
      {
        id: 'mock-1',
        short_code: 'DEMO11',
        status: 'unclaimed',
        mode: 'smart_hub',
        tap_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    [
      'AKTIF1',
      {
        id: 'mock-2',
        short_code: 'AKTIF1',
        status: 'active',
        mode: 'smart_hub',
        business_name: 'Alone Wear Brand',
        business_category: 'Denim House',
        business_address: 'Jl. Sukoharjo III, Kec, Sukoharjo, Pringsewu-Lampung',
        google_place_id: 'ChIJj6XMWNwzRy4R23c8HJQWjoM',
        review_url: 'https://search.google.com/local/writereview?placeid=ChIJj6XMWNwzRy4R23c8HJQWjoM',
        wifi_ssid: 'KopiCerita_Guest',
        wifi_password: 'kopienakbanget',
        menu_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        services_url: 'https://wa.me/6282278281649?text=Halo%20saya%20ingin%20reservasi%20meja',
        instagram_username: 'alonewear.co',
        tiktok_username: 'alonewear.co',
        website_url: 'https://example.com',
        whatsapp_number: '6282278281649',
        shopee_url: 'https://shopee.co.id/alone_wear.co',
        tokopedia_url: 'https://tokopedia.com/alonewear',
        theme_preset: 'emerald',
        tap_count: 38,
        claimed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    [
      'DIRECT1',
      {
        id: 'mock-3',
        short_code: 'DIRECT1',
        status: 'active',
        mode: 'direct_review',
        business_name: 'Alone Wear Brand',
        business_category: 'Denim House',
        business_address: 'Jl. Sukoharjo III, Kec, Sukoharjo, Pringsewu-Lampung',
        google_place_id: 'ChIJj6XMWNwzRy4R23c8HJQWjoM',
        review_url: 'https://search.google.com/local/writereview?placeid=ChIJj6XMWNwzRy4R23c8HJQWjoM',
        tap_count: 85,
        claimed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  ]);
}

export const devCardsStore = global.__DEV_CARDS_STORE__;

