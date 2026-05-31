import { useState } from "react";

const inputCls =
  "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";

export default function CoordinatorManagement({
  coordinators,
  workloadMap,
  onCreateCoordinator,
  creating,
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    contactNumber: "",
    password: "",
    coordinatorId: "",
    institution: "",
    gender: "other",
  });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  const filtered = coordinators.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.coordinatorId || "").toLowerCase().includes(search.toLowerCase())
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
    if (!form.coordinatorId.trim()) nextErrors.coordinatorId = "Coordinator ID is required";
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
      await onCreateCoordinator(form);
      setShowForm(false);
      setForm({
        name: "",
        email: "",
        contactNumber: "",
        password: "",
        coordinatorId: "",
        institution: "",
        gender: "other",
      });
      setErrors({});
    } catch (error) {
      setErrors({
        form: error.message || "Failed to create coordinator",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800 text-lg font-bold">Coordinators</h2>
          <p className="text-slate-400 text-sm">{coordinators.length} total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all"
        >
          Add Coordinator
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coordinators..."
          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div
            key={c._id}
            className="bg-white border rounded-xl p-5 shadow-sm border-slate-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow">
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-slate-800 font-semibold text-sm">{c.name}</p>
                  <p className="text-slate-400 text-xs">{c.email}</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">
                Active
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-500 mb-4">
              <p>ID: {c.coordinatorId || "N/A"}</p>
              <p>Phone: {c.contactNumber || "N/A"}</p>
              <p>Institution: {c.institution || "N/A"}</p>
              <p>Assigned events: {workloadMap[c._id] || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="h-1 bg-linear-to-r from-blue-500 to-indigo-500" />
            <div className="p-6">
              <h3 className="text-slate-800 font-bold text-base mb-5">
                Add New Coordinator
              </h3>
              {errors.form && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-500 text-sm">
                  {errors.form}
                </div>
              )}
              <div className="space-y-4">
                {[
                  ["name", "Full Name", "text", "Dr. John Doe"],
                  ["email", "Email", "email", "john@institute.ac.in"],
                  ["contactNumber", "Mobile", "tel", "10-digit number"],
                  ["coordinatorId", "Coordinator ID", "text", "COORD-101"],
                  ["institution", "Institution", "text", "SMS"],
                ].map(([field, label, type, ph]) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[field]}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, [field]: e.target.value }));
                        setErrors((p) => ({ ...p, [field]: undefined }));
                      }}
                      placeholder={ph}
                      className={`${inputCls} ${errors[field] ? "border-red-300" : ""}`}
                    />
                    {errors[field] && (
                      <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
                    )}
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, gender: e.target.value }))
                    }
                    className={inputCls}
                  >
                    <option value="male">male</option>
                    <option value="female">female</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, password: e.target.value }));
                      setErrors((p) => ({ ...p, password: undefined }));
                    }}
                    placeholder="Min 6 characters"
                    className={`${inputCls} ${errors.password ? "border-red-300" : ""}`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm transition-all disabled:opacity-60"
                >
                  {creating ? "Adding..." : "Add Coordinator"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
