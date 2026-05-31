import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#2563eb", "#7c3aed", "#14b8a6", "#f59e0b", "#ef4444", "#64748b"];

const toChartData = (items = []) =>
  items.map((item) => ({
    name: item._id || "Unknown",
    value: item.count || 0,
  }));

const formatPercent = (value, total) => {
  if (!total) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
};

export default function AnalyticsDashboard({
  overview,
  eventsReport,
  coordinatorAnalytics,
  loading,
}) {
  const stats = [
    { label: "Total Events", value: overview?.totalEvents || 0 },
    { label: "Participants", value: overview?.totalParticipants || 0 },
    { label: "Registrations", value: overview?.totalRegistrations || 0 },
    { label: "Teams", value: overview?.totalTeams || 0 },
    { label: "Coordinators", value: overview?.coordinatorCount || 0 },
  ];

  const totalParticipants = overview?.totalParticipants || 0;
  const statusData = toChartData(overview?.eventsByStatus);
  const typeData = toChartData(overview?.eventsByType);
  const genderData = toChartData(overview?.genderDistribution);
  const topEvents = [...(eventsReport || [])]
    .sort((left, right) => (right.totalParticipants || 0) - (left.totalParticipants || 0))
    .slice(0, 5);
  const topCoordinators = [...(coordinatorAnalytics || [])]
    .sort((left, right) => (right.participantsHandled || 0) - (left.participantsHandled || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-800 text-lg font-bold">Analytics Overview</h2>
        <p className="text-slate-400 text-sm">
          System-wide statistics across all events
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
          Loading analytics...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.map((item) => (
              <div
                key={item.label}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-0.5">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-700 mb-3">Event Status Mix</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-700 mb-3">Event Type Distribution</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-700 mb-4">Participant Gender Mix</p>
              <div className="space-y-3">
                {genderData.map((item, index) => (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {item.name}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {item.value} ({formatPercent(item.value, totalParticipants)})
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: formatPercent(item.value, totalParticipants),
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-700 mb-4">Coordinator Performance</p>
              <div className="space-y-4">
                {topCoordinators.length === 0 ? (
                  <p className="text-sm text-slate-400">No coordinator analytics available yet.</p>
                ) : (
                  topCoordinators.map((item) => (
                    <div key={item.coordinator._id} className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {item.coordinator.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.coordinator.coordinatorId || item.coordinator.email}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                          {item.assignedEvents} events
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500">
                        <div>
                          <p className="font-semibold text-slate-700">
                            {item.participantsHandled}
                          </p>
                          <p>Participants handled</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">
                            {item.certificatesGenerated}
                          </p>
                          <p>Certificates generated</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">
                            {item.activeEvents}
                          </p>
                          <p>Active events</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">
                            {item.winnersDeclared}
                          </p>
                          <p>Winners declared</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-700 mb-4">Top Events By Participation</p>
              <div className="space-y-3">
                {topEvents.length === 0 ? (
                  <p className="text-sm text-slate-400">No event analytics available yet.</p>
                ) : (
                  topEvents.map((event) => (
                    <div
                      key={event._id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{event.name}</p>
                        <p className="text-xs text-slate-400">
                          {event.eventType} · {event.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-800">
                          {event.totalParticipants || 0}
                        </p>
                        <p className="text-xs text-slate-400">participants</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-700 mb-4">Coordinator Workload</p>
              <div className="space-y-3">
                {(overview?.coordinatorWorkload || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No coordinator assignments yet.</p>
                ) : (
                  (overview?.coordinatorWorkload || []).map((item) => (
                    <div key={item.coordinator._id}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-600">{item.coordinator.name}</span>
                        <span className="font-semibold text-slate-700">
                          {item.events.length} events
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-indigo-500"
                          style={{
                            width: `${Math.min(item.events.length * 20, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.totalParticipants} participants across assigned events
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
