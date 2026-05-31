import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Hash,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { registerParticipant } from "../services/authService.js";

const genders = ["male", "female", "other"];

const inputBase =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-[#0f766e]/10";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    contactNumber: "",
    institution: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!/^\d{10}$/.test(form.contactNumber)) {
      nextErrors.contactNumber = "Enter a valid 10-digit mobile number.";
    }
    if (!form.institution.trim()) nextErrors.institution = "Institute name is required.";
    if (!form.studentId.trim()) nextErrors.studentId = "Student ID is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (!form.gender) nextErrors.gender = "Please select a gender.";

    return nextErrors;
  };

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const handleGenderSelect = (gender) => {
    setForm((current) => ({ ...current, gender }));
    setErrors((current) => ({ ...current, gender: undefined, form: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await registerParticipant({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        gender: form.gender,
        institution: form.institution.trim(),
        studentId: form.studentId.trim(),
        contactNumber: form.contactNumber.trim(),
      });

      setSuccess(true);
      setTimeout(() => navigate("/participant", { replace: true }), 1200);
    } catch (submitError) {
      setErrors({
        form: submitError.response?.data?.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f6efe3] px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={42} />
            </div>
            <h1 className="mt-6 font-['Space_Grotesk'] text-3xl font-bold text-slate-950">
              Registration complete
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your participant account is ready. Redirecting you to the dashboard now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6efe3] text-slate-900">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(12,74,110,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(180,83,9,0.18),_transparent_28%),linear-gradient(135deg,_#f6efe3_0%,_#fff8ef_48%,_#eef6f3_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#0f766e]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full bg-[#c2410c]/10 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#c2410c]/15 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#c2410c] shadow-sm backdrop-blur">
                <ShieldCheck size={16} />
                Participant Access
              </div>

              <h1 className="mt-6 font-['Space_Grotesk'] text-5xl font-bold leading-tight text-slate-950">
                Create a participant account that’s ready for event registration right away.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                Use your unique student ID, institution details, and contact number once. After
                that, you can register for open events, join teams, and collect certificates.
              </p>

              <div className="mt-8 grid gap-4">
                {[
                  "Unique student ID validation for each participant",
                  "Live event registration and team creation after login",
                  "Certificates and activity history in the participant dashboard",
                ].map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-4 shadow-sm backdrop-blur"
                  >
                    <div className="mt-0.5 rounded-xl bg-[#c2410c]/10 p-2 text-[#c2410c]">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="text-sm leading-6 text-slate-700">{point}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-2xl">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/88 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="grid gap-8 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white">
                      <User size={14} />
                      Register
                    </div>
                    <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold text-slate-950">
                      Create participant account
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Fill in your verified student details to unlock participant features.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#eef6f3] px-4 py-3 sm:max-w-[14rem]">
                    <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0f766e]">
                      Important
                    </div>
                    <div className="mt-2 text-xs leading-5 text-slate-600">
                      Each participant must use a unique student ID.
                    </div>
                  </div>
                </div>

                {errors.form ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {errors.form}
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Full Name"
                      icon={<User size={18} className="text-slate-400" />}
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="e.g. Rahul Sharma"
                      error={errors.name}
                    />
                    <Field
                      label="Student ID"
                      icon={<Hash size={18} className="text-slate-400" />}
                      value={form.studentId}
                      onChange={handleChange("studentId")}
                      placeholder="e.g. 23MCA101"
                      error={errors.studentId}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Mobile Number"
                      type="tel"
                      icon={<Phone size={18} className="text-slate-400" />}
                      value={form.contactNumber}
                      onChange={handleChange("contactNumber")}
                      placeholder="9876543210"
                      error={errors.contactNumber}
                    />
                    <Field
                      label="Institute / College"
                      icon={<Building2 size={18} className="text-slate-400" />}
                      value={form.institution}
                      onChange={handleChange("institution")}
                      placeholder="e.g. SMS Varanasi"
                      error={errors.institution}
                    />
                  </div>

                  <Field
                    label="Email Address"
                    type="email"
                    icon={<Mail size={18} className="text-slate-400" />}
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="name@example.com"
                    error={errors.email}
                  />

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                      Gender
                    </label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {genders.map((gender) => {
                        const active = form.gender === gender;

                        return (
                          <button
                            key={gender}
                            type="button"
                            onClick={() => handleGenderSelect(gender)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                              active
                                ? "border-[#c2410c] bg-[#fff4e8] text-[#9a3412]"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                            }`}
                          >
                            {gender}
                          </button>
                        );
                      })}
                    </div>
                    {errors.gender ? (
                      <p className="mt-2 text-xs font-medium text-rose-600">{errors.gender}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <PasswordField
                      label="Password"
                      value={form.password}
                      onChange={handleChange("password")}
                      placeholder="Minimum 6 characters"
                      error={errors.password}
                      visible={showPassword}
                      onToggleVisibility={() => setShowPassword((current) => !current)}
                    />
                    <PasswordField
                      label="Confirm Password"
                      value={form.confirmPassword}
                      onChange={handleChange("confirmPassword")}
                      placeholder="Repeat your password"
                      error={errors.confirmPassword}
                      visible={showConfirmPassword}
                      onToggleVisibility={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f172a] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loading ? "Creating your account..." : "Create Participant Account"}
                    <ArrowRight size={17} />
                  </button>
                </form>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <div className="text-sm text-slate-600">
                    Already registered?
                    <Link
                      to="/login"
                      className="ml-2 font-semibold text-[#0f766e] transition hover:text-[#115e59]"
                    >
                      Sign in here
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", icon, value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputBase}
        />
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  error,
  visible,
  onToggleVisibility,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-14 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-[#0f766e]/10"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
