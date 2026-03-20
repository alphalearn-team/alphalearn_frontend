import { redirect } from "next/navigation";

import NotFound from "@/components/NotFound";
import UserSidebar from "./_components/UserSidebar";
import UserBreadcrumb from "./_components/UserBreadcrumb";
import { getUserRole } from "@/lib/auth/rbac";
export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getUserRole();
  if (role === "LEARNER" || role === "CONTRIBUTOR") {
    return (
      <>
        <UserSidebar />
        <main className="sidebar-content">
          <UserBreadcrumb />
          {children}
        </main>
      </>
    );
  }

  if (role === "ADMIN") {
    redirect("/admin");
  }
  return <NotFound />

}
