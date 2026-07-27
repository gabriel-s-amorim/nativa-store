import {
  mapStoreSettingsInputToRow,
  mapStoreSettingsRow,
  type StoreSettingsRow,
} from "@shared/lib/storeSettingsMapper";
import type { StoreSettings, StoreSettingsInput } from "@shared/types/storeSettings";
import { DEFAULT_STORE_SETTINGS } from "@shared/types/storeSettings";
import { supabase } from "../lib/supabase";

const SELECT =
  "id, contact_email, whatsapp_number, whatsapp_display, address_line, instagram_url, facebook_url, tiktok_url, twitter_url, updated_at";

export async function getStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from("store_settings")
    .select(SELECT)
    .eq("id", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao carregar configurações: ${error.message}`);
  }

  if (!data) {
    return DEFAULT_STORE_SETTINGS;
  }

  return mapStoreSettingsRow(data as StoreSettingsRow);
}

export async function updateStoreSettings(
  input: StoreSettingsInput,
): Promise<StoreSettings> {
  const row = mapStoreSettingsInputToRow(input);

  const { data, error } = await supabase
    .from("store_settings")
    .update(row)
    .eq("id", true)
    .select(SELECT)
    .single();

  if (error) {
    throw new Error(`Erro ao salvar configurações: ${error.message}`);
  }

  return mapStoreSettingsRow(data as StoreSettingsRow);
}
