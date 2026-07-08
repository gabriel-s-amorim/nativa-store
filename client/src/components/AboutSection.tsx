/**
 * Nativa Store — About Section
 * Design: Brasil Vivo — Artesanato com Alma
 * Two-column layout: portrait artisan photo left, story text right
 */

import { ArrowNativa, FeatherGreen, FeatherRed, WaveDividerDown, WaveDividerUp } from "./NativaDecorations";

const ABOUT_IMAGE = "/images/1cad9ce5-deab-4955-8b80-f93e26115088.jpg";

const values = [
  {
    icon: "🪡",
    title: "100% Artesanal",
    desc: "Cada peça é bordada e costurada à mão por artesãs brasileiras.",
  },
  {
    icon: "🌿",
    title: "Sustentável",
    desc: "Usamos tecidos naturais e tingimentos com plantas nativas.",
  },
  {
    icon: "🦜",
    title: "Identidade",
    desc: "Inspiradas na riqueza cultural e natural do Brasil.",
  },
];

export default function AboutSection() {
  return (
    <>
      <WaveDividerUp color="#FAF7F2" />
      <section
        id="sobre"
        className="py-20 relative overflow-hidden"
        style={{ background: "#F5F0E8" }}
      >
        {/* Floating feathers */}
        <div className="absolute top-16 left-4 feather-float-delay opacity-30">
          <FeatherGreen className="w-7 h-16 rotate-[-25deg]" />
        </div>
        <div className="absolute bottom-20 right-6 feather-float opacity-35">
          <FeatherRed className="w-6 h-14 rotate-[20deg]" />
        </div>

        <div className="container">
          <div className="grid md:grid-cols-[minmax(0,340px)_1fr] lg:grid-cols-[minmax(0,380px)_1fr] gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Portrait photo — natural aspect ratio with decorative frame */}
            <div className="relative order-2 md:order-1 flex justify-center md:justify-start">
              <div
                className="absolute top-5 left-5 right-0 bottom-0 rounded-3xl hidden sm:block"
                style={{
                  background: "linear-gradient(145deg, #C4522A22, #2D6A4F18)",
                  transform: "translate(12px, 12px)",
                }}
                aria-hidden
              />
              <div className="relative w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[340px]">
                <div
                  className="rounded-3xl overflow-hidden shadow-2xl ring-[3px] ring-white/90"
                  style={{ boxShadow: "0 24px 64px oklch(0.52 0.14 38 / 0.18)" }}
                >
                  <img
                    src={ABOUT_IMAGE}
                    alt="Artesã Nativa no ateliê, com bolsa artesanal e máquina de costura"
                    className="w-full h-auto block"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {/* Floating accent card */}
                <div
                  className="absolute -bottom-5 -right-3 sm:-right-6 bg-white rounded-2xl p-4 shadow-xl border border-[#E8D5C4] z-10"
                  style={{ maxWidth: "168px" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🪡</span>
                    <span
                      className="text-xs font-bold text-[#C4522A] uppercase tracking-wide"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      Feito à mão
                    </span>
                  </div>
                  <p
                    className="text-xs text-[#8B6F5E] leading-snug"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    Cada peça costurada com carinho no nosso ateliê
                  </p>
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <ArrowNativa className="w-20 h-4" />
                <span
                  className="text-xs font-semibold text-[#1B7A8C] uppercase tracking-widest"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Nossa História
                </span>
              </div>

              <h2
                className="text-4xl md:text-5xl font-bold leading-tight mb-6"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  background: "linear-gradient(135deg, #C4522A, #E8821A, #2D6A4F)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Vestir identidade<br />
                <span style={{ WebkitTextFillColor: "#3D2B1F", backgroundClip: "unset" }}>
                  é nossa missão
                </span>
              </h2>

              <p
                className="text-[#5C4033] text-base leading-relaxed mb-4"
                style={{ fontFamily: "'Lora', serif" }}
              >
                A Nativa nasceu do amor pela cultura brasileira e pelo artesanato. Cada peça que criamos carrega a essência da nossa terra — as cores vibrantes da Amazônia, os padrões dos povos originários e a riqueza da fauna e flora nativa.
              </p>
              <p
                className="text-[#8B6F5E] text-base leading-relaxed mb-8"
                style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
              >
                "Não fazemos moda. Fazemos memória vestível."
              </p>

              {/* Values */}
              <div className="grid grid-cols-1 gap-4">
                {values.map((val) => (
                  <div key={val.title} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: "linear-gradient(135deg, #C4522A15, #E8821A20)" }}
                    >
                      {val.icon}
                    </div>
                    <div>
                      <h4
                        className="text-sm font-bold text-[#3D2B1F] mb-0.5"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {val.title}
                      </h4>
                      <p
                        className="text-xs text-[#8B6F5E] leading-relaxed"
                        style={{ fontFamily: "'Lora', serif" }}
                      >
                        {val.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <WaveDividerDown color="#FAF7F2" />
    </>
  );
}
