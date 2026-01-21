import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/actions/auth.action";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    redirect("/");
  }

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between p-4 border-b border-dark-200">
        <div className="flex items-center gap-4">
          <h2 className="text-primary-100 text-xl font-semibold">Admin Panel</h2>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/admin/dashboard" 
            className="px-4 py-2 rounded-lg hover:bg-dark-200 transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            className="px-4 py-2 rounded-lg hover:bg-dark-200 transition-colors"
          >
            Users
          </Link>
          <Link 
            href="/admin/interviews" 
            className="px-4 py-2 rounded-lg hover:bg-dark-200 transition-colors"
          >
            Interviews
          </Link>
          <Link 
            href="/" 
            className="px-4 py-2 rounded-lg hover:bg-dark-200 transition-colors"
          >
            Back to App
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
};

export default AdminLayout;

