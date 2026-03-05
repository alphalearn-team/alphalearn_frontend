"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Burger, Drawer, Avatar, Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Navbar() {
  const { user, userRole, isLoading, signOut } = useAuth();
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();

  const navItems =
    userRole === "ADMIN"
      ? [
        { label: "Dashboard", href: "/admin" },
        { label: "Concepts", href: "/admin/concepts" },
        { label: "Users", href: "/admin/contributors" },
      ]
      : [
        { label: "Concepts", href: "/concepts" },
        { label: "Lessons", href: "/lessons" },
        { label: "Profile", href: "/profile" },
        ...(!user ? [{ label: "Sign In", href: "/signin" }] : []),
      ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const avatarLetter = user?.email ? user.email[0].toUpperCase() : "?";
  const profilePicture =
    user?.user_metadata?.picture || user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <nav className="navbar-glass sticky top-0 z-50 flex items-center justify-between px-6 h-20">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[var(--color-text)] hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center size-8 rounded-full bg-violet-600 text-white shadow-[0_0_16px_rgba(124,58,237,0.5)]">
            <span className="material-symbols-outlined text-sm">bolt</span>
          </div>
          <span className="text-lg font-bold tracking-wide hidden sm:block">
            Alphalearn
          </span>
        </Link>

        {/* Center nav pills */}
        {!isLoading && (
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-7 py-3 rounded-full text-sm font-medium transition-all duration-200 ${isActive(item.href)
                  ? "bg-[#7c3aed] text-white shadow-inner"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right: user */}
        <div className="flex items-center gap-3">
          {!isLoading && (
            <>
              {user && userRole !== "ADMIN" && <NotificationBell />}
              {user ? (
                <Menu shadow="md" width={200} position="bottom-end" radius={10}>
                  <Menu.Target>
                    <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full pl-1 pr-3 py-1 cursor-pointer hover:bg-white/10 transition-colors">
                      <Avatar
                        src={profilePicture}
                        color="violet"
                        radius="xl"
                        size="sm"
                      >
                        {avatarLetter}
                      </Avatar>
                      <div className="flex flex-col hidden sm:flex">
                        <span className="text-xs font-semibold text-[var(--color-text)] truncate max-w-[110px]">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[110px]">
                          {user.email}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-[var(--color-text-muted)] text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </Menu.Target>

                  <Menu.Dropdown
                    styles={{
                      dropdown: {
                        backgroundColor: "var(--color-surface-elevated)",
                        borderColor: "var(--color-border)",
                      },
                    }}
                  >
                    <Menu.Label c="dimmed">{user.email}</Menu.Label>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={
                        <span className="material-symbols-outlined text-[16px]">
                          logout
                        </span>
                      }
                      onClick={signOut}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Link
                  href="/signin"
                  className="px-4 py-1.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors text-sm"
                >
                  Sign in
                </Link>
              )}
            </>
          )}

          {/* Mobile burger */}
          <div className="lg:hidden">
            <Burger
              opened={opened}
              onClick={toggle}
              aria-label="Toggle navigation"
              size="sm"
              color="var(--color-text)"
            />
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        title="Menu"
        styles={{
          content: { backgroundColor: "var(--color-surface)" },
          header: {
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
          },
          title: { color: "var(--color-text)", fontWeight: "bold" },
          close: { color: "var(--color-text)" },
        }}
      >
        <div className="flex flex-col gap-6 p-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-[var(--color-text)] hover:bg-white/5"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <hr className="border-white/10" />

          {user ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar src={profilePicture} color="violet" radius="xl" size="md">
                  {avatarLetter}
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text)]">
                    {displayName}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { signOut(); close(); }}
                className="w-full px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-white/10 font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              onClick={close}
              className="w-full px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors text-center"
            >
              Sign in
            </Link>
          )}
        </div>
      </Drawer>
    </>
  );
}
