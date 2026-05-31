import { useState } from "react";

export default function EventAnalytics({ eventsReport, loading }) {
  const [selectedEventId, setSelectedEventId] = useState(eventsReport[0]?._id || "");
  const selectedEvent =
    eventsReport.find((event) => event._id === selectedEventId) || eventsReport[0];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-slate-800 text-lg font-bold">Event Analytics</h2>
        <p className="text-slate-400 text-sm">
          Drill-down statistics for individual events
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
          Loading event analytics...
        </div>
      ) : !selectedEvent ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
          No event analytics available yet
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Select Event
            </p>
            <div className="grid grid-cols-4 gap-2">
              {eventsReport.map((event) => (
                <button
                  key={event._id}
                  onClick={() => setSelectedEventId(event._id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedEvent._id === event._id
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <p className="text-xs font-bold truncate text-slate-700">
                    {event.name}
                  </p>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                    {event.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Registrations", value: selectedEvent.registrationsCount || 0 },
              { label: "Teams", value: selectedEvent.teamsCount || 0 },
              { label: "Participants", value: selectedEvent.totalParticipants || 0 },
              {
                label: "Coordinators",
                value: (selectedEvent.coordinators || []).length,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-700 mb-3">
                Assigned Coordinators
              </p>
              <div className="space-y-2">
                {(selectedEvent.coordinators || []).map((coordinator) => (
                  <div key={coordinator._id} className="text-sm text-slate-600">
                    {coordinator.name} - {coordinator.coordinatorId || "N/A"}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-700 mb-3">
                Participants and Teams
              </p>
              <p className="text-sm text-slate-600">
                Registrations: {(selectedEvent.registrations || []).length}
              </p>
              <p className="text-sm text-slate-600">
                Teams: {(selectedEvent.teams || []).length}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
