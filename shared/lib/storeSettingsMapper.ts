import type { StoreSettings, StoreSettingsInput } from "@shared/types/storeSettings";

export type StoreSettingsRow = {
  id: boolean;
  contact_email: string;
  whatsapp_number: string;
  whatsapp_display: string;
  address_line: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  twitter_url: string;
  updated_at: string;
};

export function mapStoreSettingsRow(row: StoreSettingsRow): StoreSettings {
  return {
    contactEmail: row.contact_email ?? "",
    whatsappNumber: (row.whatsapp_number ?? "").replace(/\D/g, ""),
    whatsappDisplay: row.whatsapp_display ?? "",
    addressLine: row.address_line ?? "",
    instagramUrl: row.instagram_url ?? "",
    facebookUrl: row.facebook_url ?? "",
    tiktokUrl: row.tiktok_url ?? "",
    twitterUrl: row.twitter_url ?? "",
    updatedAt: row.updated_at,
  };
}

export function mapStoreSettingsInputToRow(
  input: StoreSettingsInput,
): Omit<StoreSettingsRow, "id" | "updated_at"> & { updated_at: string } {
  return {
    contact_email: input.contactEmail.trim(),
    whatsapp_number: input.whatsappNumber.replace(/\D/g, ""),
    whatsapp_display: input.whatsappDisplay.trim(),
    address_line: input.addressLine.trim(),
    instagram_url: input.instagramUrl.trim(),
    facebook_url: input.facebookUrl.trim(),
    tiktok_url: input.tiktokUrl.trim(),
    twitter_url: input.twitterUrl.trim(),
    updated_at: new Date().toISOString(),
  };
}
