/**
 * Nativa Store — Decorative SVG Components
 * Tropical Brazilian motifs: feathers, leaves, wave dividers
 */

export function FeatherOrange({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 5 C30 15, 38 30, 35 50 C32 70, 22 85, 20 95" stroke="#E8821A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M20 5 C10 15, 2 30, 5 50 C8 70, 18 85, 20 95" stroke="#E8821A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M20 5 C30 15, 38 30, 35 50 C32 70, 22 85, 20 95 C18 85, 8 70, 5 50 C2 30, 10 15, 20 5Z" fill="#E8821A" opacity="0.7"/>
      <path d="M20 5 L20 95" stroke="#C4522A" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

export function FeatherBlue({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 5 C30 15, 38 30, 35 50 C32 70, 22 85, 20 95 C18 85, 8 70, 5 50 C2 30, 10 15, 20 5Z" fill="#1B7A8C" opacity="0.75"/>
      <path d="M20 5 L20 95" stroke="#0D5C6B" strokeWidth="1" strokeLinecap="round"/>
      <path d="M20 20 C28 25, 34 35, 32 45" stroke="#4AABB8" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

export function FeatherGreen({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 5 C30 15, 38 30, 35 50 C32 70, 22 85, 20 95 C18 85, 8 70, 5 50 C2 30, 10 15, 20 5Z" fill="#2D6A4F" opacity="0.75"/>
      <path d="M20 5 L20 95" stroke="#1A4A35" strokeWidth="1" strokeLinecap="round"/>
      <path d="M20 20 C12 25, 6 35, 8 45" stroke="#52A87A" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

export function FeatherRed({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 5 C30 15, 38 30, 35 50 C32 70, 22 85, 20 95 C18 85, 8 70, 5 50 C2 30, 10 15, 20 5Z" fill="#C4522A" opacity="0.8"/>
      <path d="M20 5 L20 95" stroke="#8B3A1E" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

export function WaveDividerDown({
  color = "#F5F0E8",
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div className={`relative z-10 -mt-px ${className ?? ""}`} style={{ lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block w-full h-10 sm:h-14 md:h-20"
      >
        <path
          d="M0,0 C240,80 480,80 720,40 C960,0 1200,0 1440,60 L1440,80 L0,80 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

export function WaveDividerUp({
  color = "#F5F0E8",
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div className={`relative z-10 -mb-px ${className ?? ""}`} style={{ lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block w-full h-10 sm:h-14 md:h-20"
      >
        <path
          d="M0,80 C240,0 480,0 720,40 C960,80 1200,80 1440,20 L1440,0 L0,0 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

export function LeafDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C4522A]/30" />
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2 C20 6, 26 12, 24 18 C22 24, 16 26, 14 26 C12 26, 6 24, 4 18 C2 12, 8 6, 14 2Z" fill="#2D6A4F" opacity="0.6"/>
        <path d="M14 2 L14 26" stroke="#1A4A35" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      </svg>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C4522A]/30" />
    </div>
  );
}

export function ArrowNativa({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="10" x2="100" y2="10" stroke="#C4522A" strokeWidth="1.5"/>
      <polygon points="100,5 120,10 100,15" fill="#C4522A"/>
      <circle cx="20" cy="10" r="2" fill="#E8821A"/>
      <circle cx="40" cy="10" r="1.5" fill="#2D6A4F"/>
      <circle cx="60" cy="10" r="2" fill="#1B7A8C"/>
      <circle cx="80" cy="10" r="1.5" fill="#E8821A"/>
    </svg>
  );
}
