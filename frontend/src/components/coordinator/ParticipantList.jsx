import { useMemo, useState } from "react";

const statusStyles = {
  registered: "bg-blue-100 text-blue-700",
  participated: "bg-emerald-100 text-emerald-700",
  absent: "bg-amber-100 text-amber-700",
  withdrawn: "bg-rose-100 text-rose-700",
};

const winnerIcon = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

export default function ParticipantList({
  eventName,
  registrations = [],
  onStatusChange,
  onRemove,
  actionLoading = false,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return registrations.filter((registration) => {
      const participant = registration.participantId;
      if (!participant) {
        return false;
      }

      const matchSearch =
        participant.name.toLowerCase().includes(search.toLowerCase()) ||
        participant.email.toLowerCase().includes(search.toLowerCase()) ||
        (participant.studentId || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || registration.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [registrations, search, statusFilter]);

  const summary = useMemo(
    () => ({
      total: registrations.length,
      participated: registrations.filter((registration) => registration.status === "participated")
        .length,
      absent: registrations.filter((registration) => registration.status === "absent").length,
      winners: registrations.filter((registration) => registration.isWinner).length,
    }),
    [registrations]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Participants</h2>
          <p className="text-sm text-slate-500">
            Manage attendance and participant status for {eventName || "the selected event"}.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or student ID"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 sm:w-80"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-violet-400"
          >
            <option value="all">All Status</option>
            <option value="registered">Registered</option>
            <option value="participated">Participated</option>
            <option value="absent">Absent</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Participants", value: summary.total },
          { label: "Participated", value: summary.participated },
          { label: "Absent", value: summary.absent },
          { label: "Winners", value: summary.winners },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{item.value}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Winner</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No participants found.
                  </td>
                </tr>
              ) : (
                filtered.map((registration) => {
                  const participant = registration.participantId;
                  return (
                    <tr key={registration._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{participant.name}</div>
                        <div className="text-xs text-slate-500">{participant.email}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{participant.studentId || "-"}</td>
                      <td className="px-4 py-4 text-slate-600">{participant.institution || "-"}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[registration.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {registration.isWinner && registration.rank
                          ? `${winnerIcon[registration.rank] || registration.rank} place`
                          : "-"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {["registered", "participated", "absent"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              disabled={actionLoading || registration.status === "withdrawn"}
                              onClick={() => onStatusChange?.(registration._id, status)}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                registration.status === status
                                  ? "border-violet-300 bg-violet-50 text-violet-700"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => onRemove?.(registration._id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
