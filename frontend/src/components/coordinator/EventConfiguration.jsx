import { useEffect, useState } from "react";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "TBD";

const formatDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

export default function EventConfiguration({
  event,
  workspace,
  onUpdateConfiguration,
  onUpdateStatus,
  actionLoading = false,
}) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!event) {
        setForm(null);
        return;
      }

      setForm({
        eventType: event.eventType || "other",
        participationType: event.participationType || "individual",
        registrationStartDate: formatDateInputValue(event.registrationStartDate),
        registrationEndDate: formatDateInputValue(event.registrationEndDate),
        eventDate: formatDateInputValue(event.eventDate),
        venue: event.venue || "",
        maxParticipants: event.maxParticipants || "",
        rules: event.rules || "",
        prizes: (event.prizes || []).join(", "),
        minTeamSize: event.teamConfig?.minTeamSize || 2,
        maxTeamSize: event.teamConfig?.maxTeamSize || 5,
        genderRequirement: event.teamConfig?.genderRequirement || "none",
        allowCrossInstitution: Boolean(event.teamConfig?.allowCrossInstitution),
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [event]);

  if (!event || !workspace || !form) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
        Select an event to view setup and lifecycle controls.
      </div>
    );
  }

  const statusButtons = [
    { status: "open", label: "Open Event", tone: "bg-blue-600 hover:bg-blue-700" },
    { status: "ongoing", label: "Mark Ongoing", tone: "bg-amber-600 hover:bg-amber-700" },
    { status: "completed", label: "Complete Event", tone: "bg-emerald-600 hover:bg-emerald-700" },
  ];

  const setField = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveConfiguration = async (e) => {
    e.preventDefault();

    await onUpdateConfiguration?.({
      eventType: form.eventType,
      participationType: form.participationType,
      registrationStartDate: form.registrationStartDate || undefined,
      registrationEndDate: form.registrationEndDate || undefined,
      eventDate: form.eventDate || undefined,
      venue: form.venue,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      rules: form.rules,
      prizes: form.prizes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      teamConfig:
        form.participationType === "team"
          ? {
              minTeamSize: Number(form.minTeamSize),
              maxTeamSize: Number(form.maxTeamSize),
              genderRequirement: form.genderRequirement,
              allowCrossInstitution: Boolean(form.allowCrossInstitution),
            }
          : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Event Setup</h2>
        <p className="text-sm text-slate-500">
          Configure event details, participation rules, dates, capacity, and lifecycle status.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold text-slate-900">{event.name}</div>
              <div className="mt-1 text-sm text-slate-500">{event.description || "No description yet."}</div>
            </div>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              {event.status}
            </span>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Mode</div>
              <div className="mt-2 text-sm font-semibold capitalize text-slate-900">
                {event.participationType || "individual"}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Category</div>
              <div className="mt-2 text-sm font-semibold capitalize text-slate-900">
                {event.eventType || "other"}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Capacity</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {event.maxParticipants || "Unlimited"}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">Registration</div>
              <div className="mt-2 text-sm text-slate-700">
                {formatDate(event.registrationStartDate)} to {formatDate(event.registrationEndDate)}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">Event Date</div>
              <div className="mt-2 text-sm text-slate-700">{formatDate(event.eventDate)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">Venue</div>
              <div className="mt-2 text-sm text-slate-700">{event.venue || "TBD"}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">Participation Rules</div>
              <div className="mt-2 text-sm text-slate-700">
                {event.participationType === "team"
                  ? `${event.teamConfig?.minTeamSize || 1}-${event.teamConfig?.maxTeamSize || 1} members`
                  : "Individual event"}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Rules</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              {event.rules || "No extra rules added for this event."}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <form
            onSubmit={handleSaveConfiguration}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-1 text-lg font-bold text-slate-900">Configuration</div>
            <div className="mb-4 text-sm text-slate-500">
              Update the live setup details for this event.
            </div>
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Event Type
                  </label>
                  <select
                    value={form.eventType}
                    onChange={setField("eventType")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300"
                  >
                    {["technical", "cultural", "sports", "academic", "other"].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Participation Type
                  </label>
                  <select
                    value={form.participationType}
                    onChange={setField("participationType")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300"
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Team</option>
                  </select>
                </div>
              </div>

              {form.participationType === "team" ? (
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <div className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-700">
                    Team Rules
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="number"
                      min={2}
                      value={form.minTeamSize}
                      onChange={setField("minTeamSize")}
                      placeholder="Min team size"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300"
                    />
                    <input
                      type="number"
                      min={2}
                      value={form.maxTeamSize}
                      onChange={setField("maxTeamSize")}
                      placeholder="Max team size"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300"
                    />
                    <select
                      value={form.genderRequirement}
                      onChange={setField("genderRequirement")}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 md:col-span-2"
                    >
                      {["none", "mixed", "at least 1 female", "at least 1 male"].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.allowCrossInstitution}
                      onChange={setField("allowCrossInstitution")}
                      className="rounded border-slate-300"
                    />
                    Allow cross-institution teams
                  </label>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Registration Start
                  </label>
                  <input
                    type="date"
                    value={form.registrationStartDate}
                    onChange={setField("registrationStartDate")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-300"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Registration End
                  </label>
                  <input
                    type="date"
                    value={form.registrationEndDate}
                    onChange={setField("registrationEndDate")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-300"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={setField("eventDate")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-300"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={setField("venue")}
                    placeholder="Venue"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-300"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={form.maxParticipants}
                    onChange={setField("maxParticipants")}
                    placeholder="Max participants"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-300"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rules and Notes
                </label>
                <textarea
                  rows={4}
                  value={form.rules}
                  onChange={setField("rules")}
                  placeholder="Rules and operational notes"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-300"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Prizes
                </label>
                <textarea
                  rows={3}
                  value={form.prizes}
                  onChange={setField("prizes")}
                  placeholder="Prizes (comma separated)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save Configuration
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 text-lg font-bold text-slate-900">Lifecycle</div>
            <div className="mb-4 text-sm text-slate-500">
              Move the event through its active stages when operations are ready.
            </div>
            <div className="space-y-3">
              {statusButtons.map((button) => (
                <button
                  key={button.status}
                  type="button"
                  disabled={actionLoading || event.status === button.status}
                  onClick={() => onUpdateStatus?.(button.status)}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${button.tone}`}
                >
                  {button.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Events can only be completed after at least one participant or team is marked as
              participated.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 text-lg font-bold text-slate-900">Event Checklist</div>
            <div className="mb-4 text-sm text-slate-500">
              Use this checklist to confirm what still needs attention.
            </div>
            {(workspace.tasks || []).length === 0 ? (
              <div className="text-sm text-slate-500">No pending tasks for this event.</div>
            ) : (
              <div className="space-y-3">
                {workspace.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="font-semibold text-slate-900">{task.label}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                      Priority: {task.priority}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
