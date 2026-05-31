import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];
const GENDER_COLORS = ["#3b82f6", "#ec4899", "#8b5cf6", "#64748b"];

const toPieData = (items) =>
  items
    .filter((item) => item.value > 0)
    .map((item, index) => ({ ...item, color: item.color || GENDER_COLORS[index % GENDER_COLORS.length] }));

export default function EventStats({
  event,
  analytics,
  attendanceAnalytics,
  certificateAnalytics,
  breakdowns,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
        Loading event analytics...
      </div>
    );
  }

  if (!event || !analytics || !attendanceAnalytics || !certificateAnalytics) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
        Select an event to view analytics.
      </div>
    );
  }

  const statusData = toPieData([
    { name: "Registered", value: attendanceAnalytics.attendance.totalRegisteredPeople, color: STATUS_COLORS[0] },
    { name: "Participated", value: attendanceAnalytics.attendance.totalParticipatedPeople, color: STATUS_COLORS[1] },
    { name: "Absent", value: attendanceAnalytics.attendance.totalAbsentPeople, color: STATUS_COLORS[2] },
  ]);

  const genderData = toPieData(
    (breakdowns?.gender?.chart || []).map((item, index) => ({
      name: item.name,
      value: item.count,
      color: GENDER_COLORS[index % GENDER_COLORS.length],
    }))
  );

  const institutionData = (breakdowns?.institutions?.chart || []).slice(0, 6).map((item) => ({
    name: item.name,
    count: item.count,
  }));

  const certificateBreakdown = (certificateAnalytics.breakdown || []).map((item) => ({
    name: item.name,
    generated: item.generated,
    pending: item.pending,
  }));

  const timelineData = (attendanceAnalytics.registrationTimeline || []).map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    count: item.count,
  }));

  const cards = [
    {
      label: "Registered",
      value: analytics.totalParticipants || 0,
      sub: `${event.participationType} event`,
      tone: "text-violet-700",
    },
    {
      label: "Participated",
      value: attendanceAnalytics.attendance.totalParticipatedPeople || 0,
      sub: `${attendanceAnalytics.attendance.participationRate || 0}% turnout`,
      tone: "text-emerald-700",
    },
    {
      label: "Teams",
      value: analytics.teamsCount || 0,
      sub: `${analytics.registrationsCount || 0} individual registrations`,
      tone: "text-amber-700",
    },
    {
      label: "Certificates Pending",
      value:
        (certificateAnalytics.summary?.pending?.participation || 0) +
        (certificateAnalytics.summary?.pending?.achievement || 0),
      sub: "Participation + achievement",
      tone: "text-rose-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Event Analytics</h2>
        <p className="text-sm text-slate-500">
          Live attendance, certificate, and demographic breakdowns for {event.name}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`text-3xl font-bold ${card.tone}`}>{card.value}</div>
            <div className="mt-2 text-sm font-semibold text-slate-800">{card.label}</div>
            <div className="mt-1 text-xs text-slate-500">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-semibold text-slate-800">Registration Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-semibold text-slate-800">Participation Status</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={82}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-semibold text-slate-800">Gender Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={82}>
                {genderData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-semibold text-slate-800">Certificate Progress</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={certificateBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="generated" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 text-sm font-semibold text-slate-800">Institution Breakdown</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={institutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
