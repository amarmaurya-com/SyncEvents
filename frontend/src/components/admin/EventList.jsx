const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-500",
  open: "bg-green-100 text-green-600",
  ongoing: "bg-amber-100 text-amber-600",
  completed: "bg-purple-100 text-purple-600",
  cancelled: "bg-red-100 text-red-600",
};

const TYPE_ICONS = {
  technical: "T",
  cultural: "C",
  sports: "S",
  academic: "A",
  other: "O",
};

export default function EventList({
  events,
  loading,
  onEdit,
  onCreate,
  onDelete,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800 text-lg font-bold">Events</h2>
          <p className="text-slate-400 text-sm">{events.length} events loaded</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all"
        >
          New Event
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Event
              </th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Participation
              </th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  No events found
                </td>
              </tr>
            ) : (
              events.map((ev) => (
                <tr key={ev._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800">{ev.name}</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {ev.venue || "No venue"} - {ev.stats?.totalParticipants || 0} participants
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      {TYPE_ICONS[ev.eventType] || "O"} {ev.eventType}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        STATUS_STYLES[ev.status] || "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {ev.eventDate
                      ? new Date(ev.eventDate).toLocaleDateString("en-IN")
                      : "TBD"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {ev.participationType}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(ev)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(ev._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
