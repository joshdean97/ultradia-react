export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="bg-white border-b px-6 py-4 shadow-sm flex gap-6 text-sm text-blue-700 font-medium">
        <a href="/admin" className="hover:underline">Dashboard</a>
        <a href="/admin/users" className="hover:underline">Users</a>
        <a href="/admin/leads" className="hover:underline">Leads</a>
        <a href="/admin/analytics" className="hover:underline">Analytics</a>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
