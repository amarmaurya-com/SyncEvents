import { useMemo, useState } from "react";

const statusTone = {
  draft: "bg-violet-100 text-violet-700",
  open: "bg-emerald-100 text-emerald-700",
  ongoing: "bg-amber-100 text-amber-700",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const filterLabels = {
  all: "All",
  open: "Open",
  ongoing: "Ongoing",
  completed: "Completed",
  draft: "Draft",
};

export default function AssignedEvents({
  events = [],
  selectedEventId,
  onSelectEvent,
  loading = false,
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const stats = useMemo(
    () => ({
      total: events.length,
      open: events.filter((event) => event.status === "open").length,
      ongoing: events.filter((event) => event.status === "ongoing").length,
      completed: events.filter((event) => event.status === "completed").length,
    }),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchFilter = filter === "all" || event.status === filter;
      const matchSearch = event.name.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [events, filter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Assigned Events</h2>
          <p className="text-sm text-slate-500">
            Choose an event to manage setup, attendance, winners, and certificates.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, tone: "text-violet-700" },
            { label: "Open", value: stats.open, tone: "text-emerald-700" },
            { label: "Ongoing", value: stats.ongoing, tone: "text-amber-700" },
            { label: "Done", value: stats.completed, tone: "text-slate-700" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm"
            >
              <div className={`text-xl font-bold ${item.tone}`}>{item.value}</div>
              <div className="text-xs uppercase tracking-wide text-slate-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by event name"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400"
        />
        <div className="flex flex-wrap gap-2">
          {["all", "open", "ongoing", "completed", "draft"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                filter === item
                  ? "border-violet-300 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              {filterLabels[item]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
          Loading assigned events...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          No events match the current search or status filter.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredEvents.map((event) => {
            const selected = selectedEventId === event._id;
            const statusClass = statusTone[event.status] || statusTone.draft;
            const participantCount = event.stats?.totalParticipants || 0;

            return (
              <button
                key={event._id}
                type="button"
                onClick={() => onSelectEvent?.(event._id)}
                className={`rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selected ? "border-violet-400 ring-2 ring-violet-100" : "border-slate-200"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-slate-900">{event.name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {event.eventType} • {event.participationType}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                      {event.status}
                    </span>
                    {selected ? (
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700">
                        Active
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                  <div>
                    <div className="font-medium text-slate-700">Event Date</div>
                    <div>
                      {event.eventDate
                        ? new Date(event.eventDate).toLocaleDateString("en-IN")
                        : "TBD"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">Venue</div>
                    <div>{event.venue || "TBD"}</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">Participants</div>
                    <div>{participantCount}</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">Capacity</div>
                    <div>{event.maxParticipants || "Unlimited"}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {selected ? "Currently selected" : "Click to manage"}
                  </div>
                  <div className="text-sm font-semibold text-violet-700">
                    {selected ? "Viewing event" : "Open event"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
