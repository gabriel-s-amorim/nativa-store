/**
 * Nativa Store — Footer Component
 * Design: Brasil Vivo — Artesanato com Alma
 * Dark forest green footer with brand info, links and social
 */

import { toast } from "sonner";
import { Instagram, Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";

// Inline logo mark for footer
function NativaLogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="6" x2="32" y2="34" stroke="#E8821A" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="9" cy="7" rx="3" ry="4" fill="#E8821A" opacity="0.9" transform="rotate(-45 9 7)"/>
      <ellipse cx="9" cy="7" rx="1.5" ry="2" fill="white" opacity="0.4" transform="rotate(-45 9 7)"/>
      <path d="M10 10 Q16 20 12 28" stroke="#C9922A" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M32 6 C36 10, 36 18, 30 22 C24 26, 16 28, 12 34 C10 30, 14 24, 20 20 C26 16, 32 12, 32 6Z" fill="#52A87A" opacity="0.75"/>
      <line x1="32" y1="6" x2="12" y2="34" stroke="#2D6A4F" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

const footerLinks = {
  loja: [
    { label: "Coleções", href: "#colecoes" },
    { label: "Novidades", href: "#novidades" },
    { label: "Promoções", href: "#" },
    { label: "Edições Limitadas", href: "#" },
  ],
  ajuda: [
    { label: "Como Comprar", href: "#" },
    { label: "Trocas e Devoluções", href: "#" },
    { label: "Frete e Entrega", href: "#" },
    { label: "Perguntas Frequentes", href: "#" },
  ],
  empresa: [
    { label: "Nossa História", href: "#sobre" },
    { label: "Artesãs Parceiras", href: "#" },
    { label: "Sustentabilidade", href: "#" },
    { label: "Trabalhe Conosco", href: "#" },
  ],
};

export default function Footer() {
  const handleLink = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (href.startsWith("#") && href.length > 1) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      toast("Em breve!", { description: "Esta página está sendo desenvolvida." });
    }
  };

  return (
    <footer
      id="contato"
      style={{ background: "#1A3D2B" }}
    >
      {/* Main footer content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <NativaLogoMark size={36} />
              <span
                className="text-2xl font-bold italic"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  background: "linear-gradient(135deg, #E8821A, #C9922A, #52A87A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Nativa
              </span>
            </div>
            <p
              className="text-white/65 text-sm leading-relaxed mb-6 max-w-xs"
              style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
            >
              Peças autorais e exclusivas, criadas para contar histórias e vestir identidade. Moda artesanal brasileira com alma.
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              {[
                { icon: <Mail size={14} />, text: "contato@nativa.com.br" },
                { icon: <Phone size={14} />, text: "(11) 9 9999-9999" },
                { icon: <MapPin size={14} />, text: "São Paulo, SP — Brasil" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-white/55">
                  <span className="text-[#E8821A]">{item.icon}</span>
                  <span
                    className="text-xs"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              {[
                { icon: <Instagram size={16} />, label: "Instagram" },
                { icon: <Facebook size={16} />, label: "Facebook" },
                { icon: <Youtube size={16} />, label: "YouTube" },
              ].map((social) => (
                <button
                  key={social.label}
                  onClick={() => toast(`${social.label} em breve!`)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  color: "#E8821A",
                }}
              >
                {section === "loja" ? "Loja" : section === "ajuda" ? "Ajuda" : "Empresa"}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLink(e, link.href)}
                      className="text-sm text-white/55 hover:text-white/90 transition-colors duration-200"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t py-5"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="container flex flex-col md:flex-row items-center justify-between gap-3">
          <p
            className="text-xs text-white/35"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            © 2025 Nativa. Todos os direitos reservados. Feito com 🌿 no Brasil.
          </p>
          <div className="flex gap-4">
            {["Política de Privacidade", "Termos de Uso"].map((item) => (
              <button
                key={item}
                onClick={() => toast("Em breve!")}
                className="text-xs text-white/35 hover:text-white/60 transition-colors duration-200"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
