import type { Product } from "@shared/types/product";

export const products: Product[] = [
  {
    id: 1,
    slug: "blusa-arara-bordada",
    name: "Blusa Arara Bordada",
    category: "Roupas",
    price: 289.9,
    originalPrice: 349.9,
    image: "/manus-storage/nativa-product-1_89d7d204.jpg",
    images: [
      "/manus-storage/nativa-product-1_89d7d204.jpg",
      "/manus-storage/nativa-product-1_89d7d204.jpg",
      "/manus-storage/nativa-product-1_89d7d204.jpg",
    ],
    badge: "Mais Vendida",
    badgeColor: "#C4522A",
    rating: 4.9,
    reviews: 47,
    featured: false,
    shortDescription:
      "Blusa em algodão orgânico com bordado artesanal de arara em tons tropicais. Peça leve, confortável e cheia de personalidade.",
    description:
      "A Blusa Arara Bordada celebra a fauna brasileira com um bordado feito à mão por artesãs de Minas Gerais. Confeccionada em algodão orgânico de toque macio, possui corte soltinho que valoriza diferentes tipos de corpo. Cada peça leva em média 8 horas de trabalho manual, garantindo exclusividade e acabamento impecável. Ideal para o dia a dia ou ocasiões especiais com um toque autoral.",
    materials: [
      "100% algodão orgânico certificado",
      "Linha de bordado em algodão tingido naturalmente",
      "Botões de madeira de reflorestamento",
    ],
    careInstructions: [
      "Lavar à mão ou ciclo delicado na máquina",
      "Não usar alvejante",
      "Secar à sombra",
      "Passar do avesso em temperatura baixa",
    ],
    artisan: {
      name: "Maria Helena",
      region: "São João del-Rei, MG",
      story:
        "Maria Helena aprendeu o bordado com sua avó aos 12 anos. Hoje lidera um coletivo de 6 mulheres que preservam técnicas tradicionais mineiras, reinterpretando a fauna brasileira em cada ponto.",
    },
    sizes: [
      { label: "P", available: true },
      { label: "M", available: true },
      { label: "G", available: true },
      { label: "GG", available: false },
    ],
    colors: [
      { name: "Creme", hex: "#F5F0E8" },
      { name: "Terracota", hex: "#C4522A" },
    ],
    sku: "NAT-BLA-001",
    inStock: true,
    stockCount: 12,
    highlights: [
      "Bordado 100% à mão",
      "Algodão orgânico certificado",
      "Produção limitada",
      "Frete grátis acima de R$ 299",
    ],
    faq: [
      {
        question: "O bordado desbota com o tempo?",
        answer:
          "Não. Utilizamos linhas tingidas naturalmente e técnicas que garantem durabilidade. Seguindo as instruções de cuidado, o bordado mantém as cores vibrantes por anos.",
      },
      {
        question: "Posso pedir um tamanho sob medida?",
        answer:
          "Sim! Entre em contato pelo WhatsApp e fazemos ajustes personalizados sem custo adicional. O prazo aumenta em 5 dias úteis.",
      },
      {
        question: "Qual o prazo de entrega?",
        answer:
          "Produção artesanal: 3 a 5 dias úteis. Envio: 5 a 12 dias úteis conforme sua região.",
      },
    ],
  },
  {
    id: 2,
    slug: "vestido-floresta",
    name: "Vestido Floresta",
    category: "Roupas",
    price: 459.9,
    originalPrice: null,
    image: "/manus-storage/nativa-product-2_2d8939e3.jpg",
    images: [
      "/manus-storage/nativa-product-2_2d8939e3.jpg",
      "/manus-storage/nativa-product-2_2d8939e3.jpg",
      "/manus-storage/nativa-product-2_2d8939e3.jpg",
    ],
    badge: "Exclusiva",
    badgeColor: "#2D6A4F",
    rating: 5.0,
    reviews: 23,
    featured: true,
    shortDescription:
      "Vestido longo em viscose de bamboo com estampa exclusiva inspirada na Mata Atlântica. Caimento fluido e elegante.",
    description:
      "O Vestido Floresta é a peça assinatura da coleção 2025. Sua estampa foi pintada à mão por artista plástica carioca e transferida em edição limitada de 50 unidades. O tecido em viscose de bamboo oferece frescor natural e caimento impecável. Com alças reguláveis e fenda lateral discreta, combina sofisticação e conforto em uma única peça.",
    materials: [
      "Viscose de bamboo sustentável",
      "Estampa em pigmentos ecológicos",
      "Forro em algodão leve",
    ],
    careInstructions: [
      "Lavar à mão em água fria",
      "Não torcer",
      "Passar do avesso",
      "Guardar pendurado",
    ],
    artisan: {
      name: "Ana Beatriz",
      region: "Paraty, RJ",
      story:
        "Ana Beatriz é artista visual e costureira. Suas estampas nascem de caminhadas pela Mata Atlântica, capturando folhas, samambaias e a luz filtrada entre as árvores.",
    },
    sizes: [
      { label: "P", available: true },
      { label: "M", available: true },
      { label: "G", available: true },
    ],
    colors: [{ name: "Verde Floresta", hex: "#2D6A4F" }],
    sku: "NAT-VES-002",
    inStock: true,
    stockCount: 8,
    highlights: [
      "Edição limitada — 50 unidades",
      "Estampa pintada à mão",
      "Tecido sustentável",
      "Alças reguláveis",
    ],
    faq: [
      {
        question: "Este vestido é transparente?",
        answer:
          "Não. Possui forro interno em algodão que garante opacidade total sem perder a leveza do caimento.",
      },
      {
        question: "Posso usar em casamentos?",
        answer:
          "Com certeza! É uma das ocasiões favoritas das nossas clientes. O verde floresta combina lindamente com ambientes ao ar livre.",
      },
    ],
  },
  {
    id: 3,
    slug: "bolsa-tucano",
    name: "Bolsa Tucano",
    category: "Bolsas",
    price: 199.9,
    originalPrice: 249.9,
    image: "/manus-storage/nativa-product-3_8bc1b061.jpg",
    images: [
      "/manus-storage/nativa-product-3_8bc1b061.jpg",
      "/manus-storage/nativa-product-3_8bc1b061.jpg",
    ],
    badge: "Promoção",
    badgeColor: "#E8821A",
    rating: 4.8,
    reviews: 61,
    featured: false,
    shortDescription:
      "Bolsa transversal em couro legítimo com aplicação de tucano em couro colorido. Compacta e cheia de charme.",
    description:
      "A Bolsa Tucano é feita em couro legítimo curtido de forma vegetal, com aplicação artesanal do icônico tucano brasileiro. Possui alça ajustável, bolso interno com zíper e fecho magnético. Perfeita para o dia a dia, comporta celular, carteira, chaves e essenciais com estilo.",
    materials: [
      "Couro bovino curtido vegetal",
      "Aplicação em couro colorido",
      "Ferragens em metal escovado",
    ],
    careInstructions: [
      "Limpar com pano úmido",
      "Aplicar hidratante de couro a cada 3 meses",
      "Evitar exposição prolongada ao sol",
    ],
    artisan: {
      name: "João Pedro",
      region: "Nova Friburgo, RJ",
      story:
        "João Pedro é coureiro de terceira geração. Suas bolsas misturam técnicas tradicionais com design contemporâneo, sempre celebrando a fauna nacional.",
    },
    sizes: [{ label: "Único", available: true }],
    colors: [
      { name: "Caramelo", hex: "#C9922A" },
      { name: "Marrom", hex: "#3D2B1F" },
    ],
    sku: "NAT-BOL-003",
    inStock: true,
    stockCount: 15,
    highlights: [
      "Couro legítimo curtido vegetal",
      "Aplicação artesanal",
      "Alça ajustável",
      "Bolso interno com zíper",
    ],
    faq: [
      {
        question: "Qual o tamanho da bolsa?",
        answer: "20cm x 15cm x 8cm — ideal para uso diário sem ser volumosa.",
      },
      {
        question: "O couro é legítimo?",
        answer:
          "Sim, 100% couro bovino com curtimento vegetal, processo mais sustentável e que desenvolve pátina natural com o uso.",
      },
    ],
  },
  {
    id: 4,
    slug: "kimono-tropical",
    name: "Kimono Tropical",
    category: "Roupas",
    price: 379.9,
    originalPrice: null,
    image: "/manus-storage/nativa-product-4_189ffa42.jpg",
    images: [
      "/manus-storage/nativa-product-4_189ffa42.jpg",
      "/manus-storage/nativa-product-4_189ffa42.jpg",
      "/manus-storage/nativa-product-4_189ffa42.jpg",
    ],
    badge: "Nova",
    badgeColor: "#1B7A8C",
    rating: 4.9,
    reviews: 18,
    featured: false,
    shortDescription:
      "Kimono oversized em seda de morera com estampa tropical exclusiva. Peça versátil para sobrepor looks.",
    description:
      "O Kimono Tropical reinventa a peça oriental com a exuberância brasileira. Em seda de morera de toque acetinado, apresenta estampa com folhagens e flores tropicais em tons de turquesa e laranja. Use sobre vestidos, com jeans ou como peça de praia sofisticada.",
    materials: [
      "Seda de morera 100%",
      "Estampa digital em pigmentos ecológicos",
      "Acabamento com bainha francesa",
    ],
    careInstructions: [
      "Lavagem a seco recomendada",
      "Se lavar em casa: ciclo delicado, água fria",
      "Não usar secadora",
      "Passar com ferro em temperatura baixa",
    ],
    artisan: {
      name: "Camila Rocha",
      region: "Florianópolis, SC",
      story:
        "Camila une referências orientais com a estética tropical brasileira. Cada kimono é cortado individualmente para alinhar a estampa de forma única.",
    },
    sizes: [
      { label: "P/M", available: true },
      { label: "G/GG", available: true },
    ],
    colors: [{ name: "Turquesa Tropical", hex: "#1B7A8C" }],
    sku: "NAT-KIM-004",
    inStock: true,
    stockCount: 10,
    highlights: [
      "Seda de morera premium",
      "Corte oversized unissex",
      "Estampa exclusiva Nativa",
      "Versátil — do dia à noite",
    ],
    faq: [
      {
        question: "Serve para homens?",
        answer:
          "Sim! O corte oversized é unissex. O tamanho G/GG veste confortavelmente até o manequim 52.",
      },
    ],
  },
  {
    id: 5,
    slug: "saia-onca-pintada",
    name: "Saia Onça Pintada",
    category: "Roupas",
    price: 319.9,
    originalPrice: null,
    image: "/manus-storage/nativa-product-5_c99b2e11.jpg",
    images: [
      "/manus-storage/nativa-product-5_c99b2e11.jpg",
      "/manus-storage/nativa-product-5_c99b2e11.jpg",
    ],
    badge: "Artesanal",
    badgeColor: "#C9922A",
    rating: 4.7,
    reviews: 35,
    featured: false,
    shortDescription:
      "Saia midi plissada com estampa de onça pintada em tons terrosos. Cintura alta e caimento elegante.",
    description:
      "A Saia Onça Pintada homenageia o felino mais icônico do Brasil com uma estampa sofisticada em tons terrosos e dourados. O plissado é feito manualmente, garantindo caimento fluido e movimento a cada passo. Cintura alta com elástico embutido e forro em microfibra.",
    materials: [
      "Poliéster reciclado PET",
      "Forro em microfibra",
      "Elástico na cintura",
    ],
    careInstructions: [
      "Lavar à máquina em ciclo delicado",
      "Não passar o plissado",
      "Pendurar para secar",
    ],
    artisan: {
      name: "Fernanda Lima",
      region: "Belo Horizonte, MG",
      story:
        "Fernanda transforma resíduos têxteis em tecidos reciclados de alta qualidade. Sua especialidade é o plissado manual, técnica que aprendeu na França e adaptou à estética brasileira.",
    },
    sizes: [
      { label: "P", available: true },
      { label: "M", available: true },
      { label: "G", available: true },
    ],
    colors: [{ name: "Onça Dourada", hex: "#C9922A" }],
    sku: "NAT-SAI-005",
    inStock: true,
    stockCount: 14,
    highlights: [
      "Plissado manual",
      "Tecido reciclado PET",
      "Cintura alta modeladora",
      "Estampa exclusiva",
    ],
    faq: [
      {
        question: "A saia amassa?",
        answer:
          "O plissado é permanente e não requer passagem. É uma das vantagens do plissado artesanal.",
      },
    ],
  },
  {
    id: 6,
    slug: "colar-nativa",
    name: "Colar Nativa",
    category: "Acessórios",
    price: 129.9,
    originalPrice: 159.9,
    image: "/manus-storage/nativa-product-6_b60f7138.jpg",
    images: [
      "/manus-storage/nativa-product-6_b60f7138.jpg",
      "/manus-storage/nativa-product-6_b60f7138.jpg",
    ],
    badge: "Edição Limitada",
    badgeColor: "#C4522A",
    rating: 5.0,
    reviews: 29,
    featured: false,
    shortDescription:
      "Colar em cerâmica artesanal com pingentes inspirados na fauna brasileira. Cordão em couro trançado.",
    description:
      "O Colar Nativa é uma joia de arte wearable. Cada pingente é esculpido e pintado à mão em cerâmica de alta temperatura, representando pássaros e folhas tropicais. O cordão em couro trançado possui fecho ajustável. Edição limitada de 30 unidades numeradas.",
    materials: [
      "Cerâmica artesanal",
      "Couro trançado",
      "Fecho em metal hipoalergênico",
    ],
    careInstructions: [
      "Evitar contato com água e perfumes",
      "Limpar pingentes com pano seco",
      "Guardar em saquinho de veludo incluso",
    ],
    artisan: {
      name: "Luciana Cerqueira",
      region: "Olinda, PE",
      story:
        "Luciana é ceramista com 20 anos de experiência. Suas peças são inspiradas no frevo, no carnaval e na natureza exuberante de Pernambuco.",
    },
    sizes: [{ label: "Ajustável", available: true }],
    colors: [
      { name: "Multicolor", hex: "#C4522A" },
      { name: "Terra", hex: "#8B6F5E" },
    ],
    sku: "NAT-COL-006",
    inStock: true,
    stockCount: 6,
    highlights: [
      "Edição limitada — 30 unidades",
      "Cerâmica esculpida à mão",
      "Numerado e com certificado",
      "Hipoalergênico",
    ],
    faq: [
      {
        question: "Vem com certificado de autenticidade?",
        answer:
          "Sim! Cada colar acompanha certificado com número da edição e assinatura da artesã.",
      },
      {
        question: "O cordão é ajustável?",
        answer:
          "Sim, o fecho deslizante permite ajustar de 40cm a 55cm de comprimento.",
      },
    ],
  },
];
