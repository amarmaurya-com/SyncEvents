import { useState } from "react";

const inputCls =
  "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";
const labelCls =
  "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

export default function EventForm({ event = null, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: event?.name || "",
    description: event?.description || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm((previous) => ({ ...previous, [field]: e.target.value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Event name is required";
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setLoading(false);

    onSubmit?.({
      name: form.name,
      description: form.description,
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1 bg-linear-to-r from-blue-500 to-cyan-500" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {event ? "Edit Event Basics" : "Create New Event"}
            </h2>
            <p className="text-sm text-slate-400">
              Admin controls only the event identity here. Operational setup is handled by the
              assigned coordinator.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              event ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            {event ? "Basic Edit" : "New Event"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Event Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Annual Hackathon 2026"
              className={`${inputCls} ${errors.name ? "border-red-300" : ""}`}
            />
            {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name}</p> : null}
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={set("description")}
              placeholder="Describe the event briefly for admins and coordinators."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-700">
            Coordinators will later configure participation type, team rules, dates, venue,
            capacity, rules, prizes, and other event operations.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : event ? "Save Basic Details" : "Create Event"}
            </button>
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
