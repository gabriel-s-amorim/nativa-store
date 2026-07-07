# Nativa Store — Design Ideas

## Referência
O banner fornecido pelo usuário é a fonte de verdade estética: fundo creme/off-white texturizado, fauna e flora brasileira (araras, tucano, onça-pintada, folhas tropicais, flores silvestres), tipografia caligráfica colorida com gradiente quente (vermelho → laranja → verde → azul), penas coloridas espalhadas, e a tagline "Peças autorais e exclusivas, criadas para contar histórias e vestir identidade."

---

## Abordagem Escolhida: **Brasil Vivo — Artesanato com Alma**

### Design Movement
Ilustração editorial brasileira contemporânea — mistura de folk art, tropicalismo e craft premium. Referência: Romero Britto encontra Tarsila do Amaral em uma loja de moda autoral.

### Core Principles
1. **Orgânico e Vivo** — formas curvas, texturas de papel, nada é perfeitamente reto
2. **Cor como identidade** — paleta extraída diretamente do banner: creme, terracota, verde floresta, azul-turquesa, laranja-fogo
3. **Artesanal com sofisticação** — tipografia caligráfica para títulos, serif elegante para corpo
4. **Fauna como motivo** — elementos decorativos de araras, penas e folhas aparecem em toda a interface

### Color Philosophy
- **Fundo primário:** `#F5F0E8` — creme quente, como papel artesanal
- **Terracota:** `#C4522A` — cor-âncora da marca, quente e autoral
- **Verde Floresta:** `#2D6A4F` — profundidade, natureza, exclusividade
- **Azul Turquesa:** `#1B7A8C` — frescor, originalidade
- **Laranja Fogo:** `#E8821A` — energia, criatividade
- **Dourado:** `#C9922A` — premium, artesanal

### Layout Paradigm
Layout assimétrico editorial: seções com recortes orgânicos (SVG wave/diagonal), produtos em grid irregular com cards de proporções variadas, hero com composição lateral (texto à esquerda, ilustração à direita).

### Signature Elements
1. **Penas decorativas** — SVG de penas coloridas flutuando em seções de transição
2. **Bordas com textura de folha** — cards de produto com bordas orgânicas sutis
3. **Gradiente caligráfico** — títulos de seção com gradiente quente (terracota → dourado → verde)

### Interaction Philosophy
Suave e orgânico: hover nos cards eleva com sombra quente, botões têm efeito de pressão, scroll revela elementos com fade-in lateral.

### Animation
- Entrada de seções: fade-in + slide-up (300ms, ease-out)
- Cards de produto: hover eleva 4px + sombra terracota suave (200ms)
- Botões: scale(0.97) no active (160ms)
- Penas decorativas: float suave em loop (6s, ease-in-out)

### Typography System
- **Display/Logo:** Playfair Display Italic Bold — para o nome Nativa e títulos principais
- **Subtítulos:** Lora SemiBold — elegância artesanal
- **Corpo:** Lora Regular — legibilidade com personalidade
- **Destaques/Tags:** Nunito — amigável, moderno

### Brand Essence
"Moda autoral brasileira para quem veste identidade, não apenas roupas." — Autêntica, Criativa, Exclusiva.

### Brand Voice
Headlines soam como convite poético: "Vista quem você é." / "Cada peça, uma história bordada."
CTAs são diretos e calorosos: "Descobrir a coleção" / "Quero essa peça"

### Wordmark & Logo
Símbolo: agulha de costura estilizada cruzada com pena de arara, formando um "N" abstrato. Cores do gradiente do banner.

### Signature Brand Color
Terracota `#C4522A` — cor inconfundível da marca Nativa.

---

## Style Decisions
- Usar fundo creme `#F5F0E8` como base universal
- Títulos de seção sempre com gradiente terracota → dourado
- Cards de produto com cantos levemente arredondados (8px) e sombra quente
- Separadores de seção com SVG orgânico (folha/onda), nunca linha reta
- Nunca usar Inter; usar Playfair Display + Lora + Nunito
