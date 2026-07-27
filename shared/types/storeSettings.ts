/** Configurações públicas de contato e redes da loja. */

export type StoreSettings = {
  contactEmail: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  addressLine: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  twitterUrl: string;
  updatedAt: string;
};

export type StoreSettingsInput = {
  contactEmail: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  addressLine: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  twitterUrl: string;
};

/** Defaults alinhados ao seed do banco (fallback offline). */
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  contactEmail: "contato@nativa.com.br",
  whatsappNumber: "5511976984558",
  whatsappDisplay: "(11) 97698-4558",
  addressLine: "São Paulo, SP — Brasil",
  instagramUrl: "https://www.instagram.com/nativa_criativa/",
  facebookUrl: "https://www.facebook.com/share/1BjeTNQpat/?mibextid=wwXIfr",
  tiktokUrl: "https://www.tiktok.com/@nativa.criativa",
  twitterUrl: "",
  updatedAt: new Date(0).toISOString(),
};
