import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { getCurrentUser, loginUser } from "../services/authService.js";

const getRedirectPath = (role) => {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "coordinator") {
    return "/coordinator";
  }

  return "/participant";
};

const trustPoints = [
  "Role-based access for admin, coordinator, and participant workspaces",
  "Secure session cookies handled by the backend",
  "Fast access to registrations, attendance, and certificates",
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { user } = await getCurrentUser();
        navigate(getRedirectPath(user.role), { replace: true });
      } catch {
        // No active session.
      }
    };

    checkSession();
  }, [navigate]);

  const roleHint = useMemo(() => {
    if (form.email.toLowerCase().includes("admin")) {
      return "Admin workspace will open after sign in.";
    }

    if (form.email.toLowerCase().includes("coord")) {
      return "Coordinator tools will open after sign in.";
    }

    return "Participant dashboard will open after sign in.";
  }, [form.email]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Enter both email and password to continue.");
      return;
    }

    setLoading(true);

    try {
      const { user } = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      navigate(getRedirectPath(user.role), { replace: true });
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6efe3] text-slate-900">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(12,74,110,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(180,83,9,0.18),_transparent_28%),linear-gradient(135deg,_#f6efe3_0%,_#fff8ef_48%,_#eef6f3_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#0f766e]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full bg-[#c2410c]/10 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#0f766e]/15 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#0f766e] shadow-sm backdrop-blur">
                <ShieldCheck size={16} />
                Smart Event Manager
              </div>

              <h1 className="mt-6 font-['Space_Grotesk'] text-5xl font-bold leading-tight text-slate-950">
                Event operations, participant access, and reporting in one calm workflow.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                Sign in to continue from where you left off. Your dashboard opens according to
                your role, so coordinators, admins, and participants each land in the right place.
              </p>

              <div className="mt-8 grid gap-4">
                {trustPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-4 shadow-sm backdrop-blur"
                  >
                    <div className="mt-0.5 rounded-xl bg-[#0f766e]/10 p-2 text-[#0f766e]">
                      <ShieldCheck size={16} />
                    </div>
                    <div className="text-sm leading-6 text-slate-700">{point}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-xl">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/88 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="grid gap-8 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white">
                      <LogIn size={14} />
                      Sign In
                    </div>
                    <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold text-slate-950">
                      Welcome back
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Use your account credentials to enter the correct event workspace.
                    </p>
                  </div>

                  <div className="hidden rounded-2xl bg-[#fff4e8] px-4 py-3 text-right sm:block">
                    <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#c2410c]">
                      Routing
                    </div>
                    <div className="mt-2 max-w-[12rem] text-xs leading-5 text-slate-600">
                      {roleHint}
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        placeholder="name@institution.edu"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-[#0f766e]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange("password")}
                        placeholder="Enter your password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3.5 pr-14 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-[#0f766e]/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f172a] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loading ? "Signing in..." : "Enter Workspace"}
                    <ArrowRight size={17} />
                  </button>
                </form>

                <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    New Here
                  </div>
                  <div className="text-sm leading-6 text-slate-600">
                    Participant accounts can be created from the registration page with a unique
                    student ID.
                  </div>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e] transition hover:text-[#115e59]"
                  >
                    Create participant account
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
