import type { ConfirmColor } from "./confirmModalStyles";
import { getConfirmColorClasses } from "./confirmModalStyles";

interface ConfirmModalHeaderProps {
  confirmColor: ConfirmColor;
  icon?: string;
  title: string;
}

export default function ConfirmModalHeader({
  confirmColor,
  icon,
  title,
}: ConfirmModalHeaderProps) {
  const colorClasses = getConfirmColorClasses(confirmColor);

  return (
    <div className="mb-6 pt-2">
      {icon && (
        <div className="flex justify-center mb-4">
          <div
            className={`relative flex items-center justify-center w-16 h-16 rounded-full ${colorClasses.bg}`}
          >
            <span
              className={`material-symbols-outlined ${colorClasses.text}`}
              style={{
                fontSize: "40px",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {icon}
            </span>
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold text-[var(--color-text)] text-center leading-tight">
        {title}
      </h3>
    </div>
  );
}
