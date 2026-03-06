import "./admin.css";
import { getUserRole } from "@/lib/auth/rbac";
import NotFound from "@/components/NotFound";
import AdminSidebar from "./_components/AdminSidebar";

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
    <div className="admin-layout admin-theme">
      <AdminSidebar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
