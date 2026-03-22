/**
 * ADMIN COMPONENT - Page Header
 * 
 * Gradient header section with title, description, and optional action.
 * Provides visual interest with a subtle gradient mesh background.
 */

interface AdminPageHeaderProps {
  title: string;
  description: string;
  icon: string;
  action?: React.ReactNode;
}

export default function AdminPageHeader({ title, description, icon, action }: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header relative overflow-hidden rounded-2xl mb-8 px-8 py-10">
      {/* Gradient Background */}
      <div className="absolute inset-0 admin-header-gradient" />

      {/* Mesh pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-text) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="admin-header-icon-wrapper flex items-center justify-center w-14 h-14 rounded-xl">
            <span className="material-symbols-outlined text-3xl text-white">
              {icon}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-1">
              {title}
            </h1>
            <p className="text-[var(--color-text-secondary)] text-sm">
              {description}
            </p>
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
