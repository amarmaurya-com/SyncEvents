import { useMemo, useState } from "react";

const statusStyles = {
  registered: "bg-blue-100 text-blue-700",
  participated: "bg-emerald-100 text-emerald-700",
  absent: "bg-amber-100 text-amber-700",
  withdrawn: "bg-rose-100 text-rose-700",
};

export default function TeamList({
  eventName,
  teams = [],
  onStatusChange,
  onRemove,
  actionLoading = false,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchSearch =
        team.teamName.toLowerCase().includes(search.toLowerCase()) ||
        team.leaderId?.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || team.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [teams, search, statusFilter]);

  const summary = useMemo(
    () => ({
      total: teams.length,
      participated: teams.filter((team) => team.status === "participated").length,
      valid: teams.filter(
        (team) => team.meetsTeamSizeRequirement && team.meetsGenderRequirement
      ).length,
      winners: teams.filter((team) => team.isWinner).length,
    }),
    [teams]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Teams</h2>
          <p className="text-sm text-slate-500">
            Manage validation, attendance, and team status for {eventName || "the selected event"}.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by team or leader"
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
          { label: "Total Teams", value: summary.total },
          { label: "Participated", value: summary.participated },
          { label: "Valid Teams", value: summary.valid },
          { label: "Winner Teams", value: summary.winners },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{item.value}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredTeams.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm xl:col-span-2">
            No teams found.
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div key={team._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-slate-900">{team.teamName}</div>
                  <div className="text-sm text-slate-500">
                    Leader: {team.leaderId?.name || "-"} • {team.members.length} members
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[team.status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {team.status}
                </span>
              </div>

              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Validation</div>
                  <div className="mt-1 text-sm text-slate-700">
                    Size: {team.meetsTeamSizeRequirement ? "Valid" : "Invalid"}
                  </div>
                  <div className="text-sm text-slate-700">
                    Gender: {team.meetsGenderRequirement ? "Valid" : "Invalid"}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Winner</div>
                  <div className="mt-1 text-sm text-slate-700">
                    {team.isWinner && team.rank ? `${team.rank} place` : "Not declared"}
                  </div>
                  <div className="text-sm text-slate-700">
                    Registered: {new Date(team.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Members</div>
                <div className="flex flex-wrap gap-2">
                  {team.members.map((member) => (
                    <span
                      key={member.userId?._id || member.userId}
                      className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                    >
                      {member.userId?.name || "Member"}
                      {member.role === "leader" ? " (Leader)" : ""}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {["registered", "participated", "absent"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={actionLoading || team.status === "withdrawn"}
                    onClick={() => onStatusChange?.(team._id, status)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      team.status === status
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
                  onClick={() => onRemove?.(team._id)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  Remove Team
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
