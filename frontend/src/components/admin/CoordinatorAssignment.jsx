import { useMemo, useState } from "react";

export default function CoordinatorAssignment({
  events,
  coordinators,
  onAssign,
  onRemove,
  saving,
}) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?._id || "");

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === selectedEventId) || events[0],
    [events, selectedEventId]
  );

  const assignedIds = selectedEvent?.coordinators?.map((item) => item._id) || [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-slate-800 text-lg font-bold">
          Coordinator Assignment
        </h2>
        <p className="text-slate-400 text-sm">
          Assign coordinators to manage events
        </p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Select Event
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {events.map((event) => (
              <button
                key={event._id}
                onClick={() => setSelectedEventId(event._id)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selectedEvent?._id === event._id
                    ? "bg-blue-50 border-r-2 border-blue-500"
                    : "hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-semibold text-slate-700">{event.name}</p>
                <p className="text-xs text-slate-400">
                  {event.status} - {(event.coordinators || []).length} assigned
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Coordinators for {selectedEvent?.name || "event"}
            </p>
          </div>
          <div className="p-4 space-y-2">
            {coordinators.map((coordinator) => {
              const isAssigned = assignedIds.includes(coordinator._id);

              return (
                <div
                  key={coordinator._id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isAssigned
                      ? "bg-blue-50 border-blue-200"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">
                      {coordinator.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {coordinator.email} - {coordinator.coordinatorId || "N/A"}
                    </p>
                  </div>
                  {isAssigned ? (
                    <button
                      onClick={() => onRemove(selectedEvent._id, coordinator._id)}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => onAssign(selectedEvent._id, coordinator._id)}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-60"
                    >
                      Assign
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
