import { useState } from "react";

const THEMES = {
  admin: {
    badge: "bg-blue-100 text-blue-700",
    accentText: "text-blue-700",
    accentBg: "bg-blue-600",
    accentBgSoft: "bg-blue-50 border-blue-200 text-blue-700",
    accentBorder: "hover:border-blue-300 hover:text-blue-700",
    activeNav: "bg-blue-600 text-white shadow-lg shadow-blue-200",
    logo: "from-blue-500 to-cyan-500",
    halo: "from-blue-200/60 via-cyan-100/20 to-transparent",
  },
  coordinator: {
    badge: "bg-violet-100 text-violet-700",
    accentText: "text-violet-700",
    accentBg: "bg-violet-600",
    accentBgSoft: "bg-violet-50 border-violet-200 text-violet-700",
    accentBorder: "hover:border-violet-300 hover:text-violet-700",
    activeNav: "bg-violet-600 text-white shadow-lg shadow-violet-200",
    logo: "from-violet-500 to-fuchsia-500",
    halo: "from-violet-200/60 via-fuchsia-100/20 to-transparent",
  },
  participant: {
    badge: "bg-cyan-100 text-cyan-700",
    accentText: "text-cyan-700",
    accentBg: "bg-cyan-600",
    accentBgSoft: "bg-cyan-50 border-cyan-200 text-cyan-700",
    accentBorder: "hover:border-cyan-300 hover:text-cyan-700",
    activeNav: "bg-cyan-600 text-white shadow-lg shadow-cyan-200",
    logo: "from-cyan-500 to-blue-500",
    halo: "from-cyan-200/60 via-blue-100/20 to-transparent",
  },
};

export default function DashboardShell({
  role,
  roleLabel,
  roleCaption,
  title,
  subtitle,
  navItems,
  activeId,
  onSelect,
  user,
  error,
  onLogout,
  children,
  headerBadge,
}) {
  const theme = THEMES[role] || THEMES.admin;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(241,245,249,0.88)_45%,_rgba(226,232,240,0.92)_100%)] text-slate-900">
      <div className={`pointer-events-none fixed inset-0 bg-gradient-to-br ${theme.halo}`} />

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-80 shrink-0 border-r border-white/60 bg-white/75 px-5 py-6 backdrop-blur-xl transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center gap-4 px-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.logo} text-sm font-black text-white shadow-lg`}
            >
              SEM
            </div>
            <div>
              <div className={`text-xs font-black uppercase tracking-[0.32em] ${theme.accentText}`}>
                SMART
              </div>
              <div className="text-xs text-slate-400">{roleCaption}</div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`w-full rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition ${
                  activeId === item.id
                    ? theme.activeNav
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                <div>{item.label}</div>
                {item.sub ? (
                  <div
                    className={`mt-1 text-xs ${
                      activeId === item.id ? "text-white/75" : "text-slate-400"
                    }`}
                  >
                    {item.sub}
                  </div>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Signed in as</div>
            <div className="mt-3 flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.logo} text-sm font-black text-white`}
              >
                {user?.name?.slice(0, 2).toUpperCase() || roleLabel.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{user?.name || roleLabel}</div>
                <div className="truncate text-xs text-slate-500">{user?.email || "No email"}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className={`mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition ${theme.accentBorder}`}
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen ? (
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        {/* Main content */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "xl:ml-80" : "xl:ml-0"
          }`}
        >
          <div className="border-b border-white/70 bg-white/70 px-5 py-5 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    {/* Hamburger Menu Button */}
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className={`rounded-xl border border-white/80 bg-white/80 p-2.5 text-slate-600 transition ${theme.accentBorder}`}
                      aria-label="Toggle sidebar"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {sidebarOpen ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        )}
                      </svg>
                    </button>

                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${theme.badge}`}>
                      {roleLabel}
                    </span>
                    {headerBadge ? (
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.accentBgSoft}`}>
                        {headerBadge}
                      </span>
                    ) : null}
                  </div>
                  <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                    {title}
                  </h1>
                  {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            ) : null}
          </div>

          <div className="px-5 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
