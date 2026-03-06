/**
 * ADMIN COMPONENT - Illustrated Empty State
 * 
 * Displays a friendly illustration with message when no data is found.
 * Uses inline SVGs for zero external dependencies.
 */

interface AdminEmptyStateProps {
  icon: "users" | "concepts" | "search" | "generic";
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyIllustration({ icon }: { icon: AdminEmptyStateProps["icon"] }) {
  const illustrations: Record<string, React.ReactNode> = {
    users: (
      <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Base circle */}
        <circle cx="80" cy="70" r="60" fill="var(--color-primary)" opacity="0.06" />
        <circle cx="80" cy="70" r="42" fill="var(--color-primary)" opacity="0.08" />
        
        {/* Person 1 (center) */}
        <circle cx="80" cy="52" r="12" stroke="var(--color-primary)" strokeWidth="2.5" fill="none" opacity="0.6" />
        <path d="M60 88 C60 74, 100 74, 100 88" stroke="var(--color-primary)" strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round" />
        
        {/* Person 2 (left, faded) */}
        <circle cx="48" cy="58" r="8" stroke="var(--color-accent)" strokeWidth="2" fill="none" opacity="0.3" />
        <path d="M34 82 C34 72, 62 72, 62 82" stroke="var(--color-accent)" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />
        
        {/* Person 3 (right, faded) */}
        <circle cx="112" cy="58" r="8" stroke="var(--color-accent)" strokeWidth="2" fill="none" opacity="0.3" />
        <path d="M98 82 C98 72, 126 72, 126 82" stroke="var(--color-accent)" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />

        {/* Question mark */}
        <text x="80" y="112" textAnchor="middle" fill="var(--color-text-muted)" fontSize="18" fontWeight="600" opacity="0.5">?</text>
      </svg>
    ),
    concepts: (
      <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Base circle */}
        <circle cx="80" cy="70" r="60" fill="var(--color-primary)" opacity="0.06" />
        <circle cx="80" cy="70" r="42" fill="var(--color-primary)" opacity="0.08" />
        
        {/* Book shape */}
        <rect x="56" y="42" width="48" height="56" rx="4" stroke="var(--color-primary)" strokeWidth="2.5" fill="none" opacity="0.5" />
        <line x1="80" y1="42" x2="80" y2="98" stroke="var(--color-primary)" strokeWidth="2" opacity="0.3" />
        
        {/* Text lines on book */}
        <line x1="62" y1="54" x2="74" y2="54" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <line x1="62" y1="62" x2="74" y2="62" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <line x1="62" y1="70" x2="72" y2="70" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        
        <line x1="86" y1="54" x2="98" y2="54" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <line x1="86" y1="62" x2="98" y2="62" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <line x1="86" y1="70" x2="96" y2="70" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

        {/* Sparkle */}
        <circle cx="112" cy="38" r="3" fill="var(--color-accent)" opacity="0.5" />
        <circle cx="46" cy="96" r="2" fill="var(--color-primary)" opacity="0.4" />
      </svg>
    ),
    search: (
      <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Base circle */}
        <circle cx="80" cy="70" r="60" fill="var(--color-primary)" opacity="0.06" />
        <circle cx="80" cy="70" r="42" fill="var(--color-primary)" opacity="0.08" />
        
        {/* Magnifying glass */}
        <circle cx="74" cy="62" r="20" stroke="var(--color-primary)" strokeWidth="2.5" fill="none" opacity="0.5" />
        <line x1="88" y1="76" x2="104" y2="92" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        
        {/* X inside */}
        <line x1="68" y1="56" x2="80" y2="68" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <line x1="80" y1="56" x2="68" y2="68" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
    generic: (
      <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Base circle */}
        <circle cx="80" cy="70" r="60" fill="var(--color-primary)" opacity="0.06" />
        <circle cx="80" cy="70" r="42" fill="var(--color-primary)" opacity="0.08" />
        
        {/* Empty box */}
        <rect x="56" y="46" width="48" height="40" rx="6" stroke="var(--color-primary)" strokeWidth="2.5" fill="none" opacity="0.5" />
        <path d="M56 56 L80 68 L104 56" stroke="var(--color-primary)" strokeWidth="2" fill="none" opacity="0.3" />
        
        {/* Dots */}
        <circle cx="80" cy="100" r="2" fill="var(--color-text-muted)" opacity="0.4" />
        <circle cx="72" cy="104" r="1.5" fill="var(--color-text-muted)" opacity="0.3" />
        <circle cx="88" cy="104" r="1.5" fill="var(--color-text-muted)" opacity="0.3" />
      </svg>
    ),
  };

  return <>{illustrations[icon]}</>;
}

export default function AdminEmptyState({ icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <EmptyIllustration icon={icon} />
      <h3 className="text-lg font-semibold text-[var(--color-text)] mt-4 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--color-text-muted)] text-center max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
