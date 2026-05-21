import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="hidden md:block w-72 p-4 border-r border-[rgba(15,38,23,0.03)] h-[calc(100vh-64px)]">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#0d3f2a]">Navigation</h3>
      </div>
      <nav className="flex flex-col gap-2">
        <Link href="#" className="nav-link p-2 rounded-md">🏠 Dashboard</Link>
        <Link href="#" className="nav-link p-2 rounded-md">📋 History</Link>
        <Link href="#" className="nav-link p-2 rounded-md">💓 Vitals</Link>
        <Link href="#" className="nav-link p-2 rounded-md">💊 Meds</Link>
        <Link href="#" className="nav-link p-2 rounded-md">🧑‍⚕️ Doctor</Link>
      </nav>
    </aside>
  );
}
