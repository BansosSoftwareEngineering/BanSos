import { supabase } from './supabaseClient';
import { fetchSavedLocations } from './api';

export const SESSION_LOCATION_KEY = 'bansos_user_location';
export const SESSION_LOCATION_NAME_KEY = 'bansos_active_location_name';

export const DEFAULT_LAT = -6.1233;
export const DEFAULT_LNG = 106.8317;

export interface ResolvedLocation {
  lat: number;
  lng: number;
  name?: string;
  id?: string;
  source: 'session' | 'saved' | 'default';
}


export function saveSessionLocation(lat: number, lng: number): void {
  try {
    sessionStorage.setItem(SESSION_LOCATION_KEY, JSON.stringify({ lat, lng }));
  } catch {
  }
}

export function saveSessionLocationName(name: string): void {
  try {
    sessionStorage.setItem(SESSION_LOCATION_NAME_KEY, name);
  } catch { /* sessionStorage unavailable */ }
}

export function getSessionLocationName(): string | null {
  try {
    return sessionStorage.getItem(SESSION_LOCATION_NAME_KEY);
  } catch {
    return null;
  }
}

export function getSessionLocation(): { lat: number; lng: number } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { lat: number; lng: number };
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function resolvePrimaryLocation(): Promise<ResolvedLocation> {
  const session = getSessionLocation();
  if (session) return { ...session, source: 'session' };

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return { lat: DEFAULT_LAT, lng: DEFAULT_LNG, source: 'default' };

    const primaryId: string | undefined =
      authData.user.user_metadata?.primary_location_id;

    const result = await fetchSavedLocations(authData.user.id);
    const withCoords = result.data.filter(
      (l) => l.latitude != null && l.longitude != null,
    );

    if (withCoords.length > 0) {
      const primary =
        (primaryId ? withCoords.find((l) => l.id === primaryId) : undefined) ??
        withCoords[0];

      if (primary.latitude != null && primary.longitude != null) {
        return {
          lat: primary.latitude,
          lng: primary.longitude,
          name: primary.name,
          id: primary.id,
          source: 'saved',
        };
      }
    }
  } catch {}

  return { lat: DEFAULT_LAT, lng: DEFAULT_LNG, source: 'default' };
}
