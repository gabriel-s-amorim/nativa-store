import { products } from "@shared/data/products";
import { mapProductToRow } from "@shared/lib/productMapper";
import { supabase } from "../lib/supabase";

async function seedProducts() {
  const rows = products.map(mapProductToRow);

  const { error } = await supabase.from("products").upsert(rows, {
    onConflict: "slug",
  });

  if (error) {
    throw new Error(error.message);
  }

  console.log(`✓ ${rows.length} produtos enviados para o Supabase`);
}

seedProducts().catch((error) => {
  const message = error instanceof Error ? error.message : "Erro desconhecido";

  if (message.includes("Invalid API key")) {
    console.error("Erro ao popular o banco: chave de API inválida.");
    console.error("");
    console.error("Verifique no Supabase:");
    console.error("1. Settings → API Keys → Secret keys");
    console.error("2. Clique no ícone do olho para revelar a chave");
    console.error("3. Copie a chave COMPLETA (começa com sb_secret_)");
    console.error("4. Cole em SUPABASE_SECRET_KEY no arquivo .env");
    console.error("");
    console.error("Alternativa: use a chave legacy service_role (JWT longa) em SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  console.error("Erro ao popular o banco:", message);
  process.exit(1);
});
