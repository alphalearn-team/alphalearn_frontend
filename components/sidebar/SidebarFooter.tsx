import { Avatar } from "@mantine/core";

interface SidebarFooterProps {
  avatarAccentBorder: string;
  avatarLetter: string;
  collapsed: boolean;
  onSignOut: () => Promise<void>;
  profilePicture?: string;
  roleLabel: string;
  userLabel: string;
}

export default function SidebarFooter({
  avatarAccentBorder,
  avatarLetter,
  collapsed,
  onSignOut,
  profilePicture,
  roleLabel,
  userLabel,
}: SidebarFooterProps) {
  return (
    <div className="admin-sidebar-footer">
      <div className="admin-sidebar-user">
        <Avatar
          src={profilePicture}
          color="white"
          radius="xl"
          size="md"
          styles={{
            root: {
              backgroundColor: "var(--color-primary)",
              border: `2px solid ${avatarAccentBorder}`,
              flexShrink: 0,
            },
          }}
        >
          {avatarLetter}
        </Avatar>
        <div className="admin-sidebar-user-info">
          <span className="admin-sidebar-user-email">{userLabel}</span>
          <span className="admin-sidebar-user-role">{roleLabel}</span>
        </div>
      </div>

      <button
        onClick={onSignOut}
        className="admin-sidebar-logout"
        title={collapsed ? "Logout" : undefined}
      >
        <div className="admin-sidebar-logout-content">
          <span className="material-symbols-outlined">logout</span>
          <span className="admin-sidebar-logout-text">Logout</span>
        </div>
      </button>
    </div>
  );
}
