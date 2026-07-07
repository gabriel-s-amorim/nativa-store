/**
 * Nativa Store — About Section
 * Design: Brasil Vivo — Artesanato com Alma
 * Two-column layout: text left, artisan workshop image right
 */

import { ArrowNativa, FeatherGreen, FeatherRed, WaveDividerDown, WaveDividerUp } from "./NativaDecorations";

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
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image side */}
            <div className="relative order-2 md:order-1">
              <div
                className="rounded-3xl overflow-hidden shadow-2xl"
                style={{ boxShadow: "0 24px 64px oklch(0.52 0.14 38 / 0.18)" }}
              >
                <img
                  src="/manus-storage/nativa-about-section_dd4ffc97.jpg"
                  alt="Ateliê Nativa — artesãs trabalhando"
                  className="w-full h-80 md:h-[480px] object-cover"
                />
              </div>
              {/* Floating accent card */}
              <div
                className="absolute -bottom-6 -right-4 md:-right-8 bg-white rounded-2xl p-4 shadow-xl border border-[#E8D5C4]"
                style={{ maxWidth: "180px" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🏆</span>
                  <span
                    className="text-xs font-bold text-[#C4522A] uppercase tracking-wide"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Premiada
                  </span>
                </div>
                <p
                  className="text-xs text-[#8B6F5E] leading-snug"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  Melhor marca artesanal brasileira 2024
                </p>
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
