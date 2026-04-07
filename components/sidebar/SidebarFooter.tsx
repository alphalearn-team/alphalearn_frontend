import { Avatar } from "@mantine/core";

interface SidebarFooterProps {
  avatarLetter: string;
  collapsed: boolean;
  onSignOut: () => Promise<void>;
  profilePicture?: string;
  roleLabel: string;
  userLabel: string;
}

export default function SidebarFooter({
  avatarLetter,
  collapsed,
  onSignOut,
  profilePicture,
  roleLabel,
  userLabel,
}: SidebarFooterProps) {
  return (
    <div className="sidebar-footer">
      <div className="sidebar-user">
        <Avatar
          src={profilePicture}
          color="white"
          radius="xl"
          size="md"
          styles={{
            root: {
              backgroundColor: "var(--color-primary)",
              flexShrink: 0,
            },
          }}
        >
          {avatarLetter}
        </Avatar>
        <div className="sidebar-user-info">
          <span className="sidebar-user-email">{userLabel}</span>
          <span className="sidebar-user-role">{roleLabel}</span>
        </div>
      </div>

      <button
        onClick={onSignOut}
        className="sidebar-logout"
        title={collapsed ? "Logout" : undefined}
      >
        <div className="sidebar-logout-content">
          <span className="material-symbols-outlined">logout</span>
          <span className="sidebar-logout-text">Logout</span>
        </div>
      </button>
    </div>
  );
}
