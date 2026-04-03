import "./admin.css";
import { getUserRole } from "@/lib/auth/server/rbac";
import NotFound from "@/components/NotFound";
import AdminSidebar from "./_components/AdminSidebar";
import AppBreadcrumb from "@/components/AppBreadcrumb";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // making this pages visible only to admins
  const role = await getUserRole();
  if (role !== "ADMIN") {
    return <NotFound />
  }

  return (
    <div className="sidebar-layout admin-theme">
      <AdminSidebar />
      <main className="sidebar-content">
        <AppBreadcrumb rootSegment="admin" />
        {children}
      </main>
    </div>
  );
}
