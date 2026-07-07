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
  className = "h-10 sm:h-11 md:h-12 w-auto",
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
          className={`hidden md:block text-[0.6rem] uppercase tracking-[0.18em] leading-tight ${taglineClassName}`}
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Liberdade em cada detalhe
        </span>
      )}
    </div>
  );
}
