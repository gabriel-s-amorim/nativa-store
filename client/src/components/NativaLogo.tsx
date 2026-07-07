/**
 * Nativa Store — Official brand logo
 */

interface NativaLogoProps {
  className?: string;
  showTagline?: boolean;
  taglineClassName?: string;
}

const LOGO_SRC = "/images/logo-nativa.png";

export default function NativaLogo({
  className = "w-48 sm:w-56 md:w-64 h-auto",
  showTagline = false,
  taglineClassName = "text-[#8B6F5E]",
}: NativaLogoProps) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <img
        src={LOGO_SRC}
        alt="Nativa — Liberdade em cada detalhe"
        className={`object-contain shrink-0 ${className}`}
      />
      {showTagline && (
        <span
          className={`hidden lg:block text-[0.65rem] uppercase tracking-[0.18em] leading-tight ${taglineClassName}`}
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Liberdade em cada detalhe
        </span>
      )}
    </div>
  );
}
