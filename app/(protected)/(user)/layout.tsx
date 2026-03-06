import { redirect } from "next/navigation";

import Background from "./_components/Background";
import NotFound from "@/components/notFound";
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
        <Background />
        <div className="admin-layout user-shell">
          <UserSidebar />
          <main className="admin-content user-content">
            <UserBreadcrumb />
            {children}
          </main>
        </div>
      </>
    );
  }

  if (role === "ADMIN") {
    redirect("/admin");
  }
  return <NotFound />

}
