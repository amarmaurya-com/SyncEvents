import { useState } from "react";

const inputCls =
  "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";

export default function AdminManagement({ admins, onCreateAdmin, creating }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    contactNumber: "",
    password: "",
    adminId: "",
    institution: "",
    gender: "other",
  });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  const filtered = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase()) ||
      (admin.adminId || "").toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Valid email required";
    }
    if (!/^\d{10}$/.test(form.contactNumber)) {
      nextErrors.contactNumber = "10-digit number required";
    }
    if (!form.adminId.trim()) nextErrors.adminId = "Admin ID is required";
    if (!form.institution.trim()) nextErrors.institution = "Institution is required";
    if (form.password.length < 6) nextErrors.password = "Min 6 characters";
    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      await onCreateAdmin(form);
      setShowForm(false);
      setForm({
        name: "",
        email: "",
        contactNumber: "",
        password: "",
        adminId: "",
        institution: "",
        gender: "other",
      });
      setErrors({});
    } catch (error) {
      setErrors({
        form: error.message || "Failed to create admin",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800 text-lg font-bold">Admins</h2>
          <p className="text-slate-400 text-sm">{admins.length} total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all"
        >
          Add Admin
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search admins..."
          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((admin) => (
          <div
            key={admin._id}
            className="bg-white border rounded-xl p-5 shadow-sm border-slate-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm shadow">
                  {admin.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-slate-800 font-semibold text-sm">{admin.name}</p>
                  <p className="text-slate-400 text-xs">{admin.email}</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600">
                Admin
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-500">
              <p>ID: {admin.adminId || "N/A"}</p>
              <p>Phone: {admin.contactNumber || "N/A"}</p>
              <p>Institution: {admin.institution || "N/A"}</p>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="h-1 bg-linear-to-r from-slate-700 to-blue-600" />
            <div className="p-6">
              <h3 className="mb-5 text-base font-bold text-slate-800">Add New Admin</h3>
              {errors.form ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-500">
                  {errors.form}
                </div>
              ) : null}
              <div className="space-y-4">
                {[
                  ["name", "Full Name", "text", "Admin User"],
                  ["email", "Email", "email", "admin@institute.ac.in"],
                  ["contactNumber", "Mobile", "tel", "10-digit number"],
                  ["adminId", "Admin ID", "text", "ADMIN-101"],
                  ["institution", "Institution", "text", "SMS"],
                ].map(([field, label, type, placeholder]) => (
                  <div key={field}>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[field]}
                      onChange={(e) => {
                        setForm((current) => ({ ...current, [field]: e.target.value }));
                        setErrors((current) => ({ ...current, [field]: undefined }));
                      }}
                      placeholder={placeholder}
                      className={`${inputCls} ${errors[field] ? "border-red-300" : ""}`}
                    />
                    {errors[field] ? (
                      <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
                    ) : null}
                  </div>
                ))}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm((current) => ({ ...current, gender: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="male">male</option>
                    <option value="female">female</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => {
                      setForm((current) => ({ ...current, password: e.target.value }));
                      setErrors((current) => ({ ...current, password: undefined }));
                    }}
                    placeholder="Min 6 characters"
                    className={`${inputCls} ${errors.password ? "border-red-300" : ""}`}
                  />
                  {errors.password ? (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={creating}
                  className="flex-1 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-bold text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
                >
                  {creating ? "Adding..." : "Add Admin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
