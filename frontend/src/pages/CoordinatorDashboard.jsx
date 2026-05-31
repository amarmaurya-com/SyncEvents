import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import AssignedEvents from "../components/coordinator/AssignedEvents.jsx";
import CertificateGenerator from "../components/coordinator/CertificateGenerator.jsx";
import EventConfiguration from "../components/coordinator/EventConfiguration.jsx";
import EventStats from "../components/coordinator/EventStats.jsx";
import ParticipantList from "../components/coordinator/ParticipantList.jsx";
import TeamList from "../components/coordinator/TeamList.jsx";
import WinnerSelection from "../components/coordinator/WinnerSelection.jsx";
import DashboardShell from "../components/common/DashboardShell.jsx";
import useAuth from "../hooks/useAuth.js";
import useCoordinatorData from "../hooks/useCoordinatorData.js";

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "events", label: "My Events" },
  { id: "stats", label: "Analytics" },
  { id: "configuration", label: "Event Setup" },
  { id: "participants", label: "Participants" },
  { id: "teams", label: "Teams" },
  { id: "winners", label: "Winners" },
  { id: "certificates", label: "Certificates" },
];

const cardPalette = [
  "from-violet-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const { user, loading: authLoading, error: authError, signOut } = useAuth("coordinator");
  const {
    summary,
    events,
    selectedEventId,
    workspace,
    eventAnalytics,
    attendanceAnalytics,
    certificateAnalytics,
    breakdowns,
    registrations,
    teams,
    winners,
    loading,
    eventLoading,
    actionLoading,
    error,
    actions,
  } = useCoordinatorData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, navigate, user]);

  const selectedEvent = useMemo(() => {
    return workspace?.event || events.find((event) => event._id === selectedEventId) || null;
  }, [events, selectedEventId, workspace]);

  const cards = [
    {
      label: "Assigned Events",
      value: summary?.summary?.assignedEvents || 0,
      sub: `${summary?.summary?.byStatus?.ongoing || 0} ongoing`,
    },
    {
      label: "Participants",
      value: summary?.summary?.totalParticipants || 0,
      sub: `${summary?.summary?.participationRate || 0}% turnout`,
    },
    {
      label: "Certificates",
      value: summary?.summary?.certificatesIssued || 0,
      sub: `${summary?.pendingTasks?.certificateGenerationPending || 0} events pending`,
    },
    {
      label: "Winner Tasks",
      value: summary?.pendingTasks?.winnerDeclarationsPending || 0,
      sub: `${summary?.pendingTasks?.incompleteEvents || 0} incomplete events`,
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.28em] text-violet-600">
            Coordinator Workspace
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name || "Coordinator"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Run event operations with a clear flow from setup to certificates.
          </p>
        </div>
        {selectedEvent ? (
          <div className="rounded-3xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm text-violet-700">
            <div className="text-[11px] uppercase tracking-[0.2em] text-violet-500">Active Event</div>
            <div className="mt-1 font-semibold">{selectedEvent.name}</div>
            <div className="mt-1 text-xs text-violet-600/80">
              {selectedEvent.status} • {selectedEvent.participationType || "event"}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`inline-flex rounded-2xl bg-gradient-to-br px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white ${cardPalette[index]}`}
            >
              {card.label}
            </div>
            <div className="mt-4 text-4xl font-black text-slate-950">{card.value}</div>
            <div className="mt-2 text-sm text-slate-500">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-slate-900">Assigned Events</div>
                <div className="text-sm text-slate-500">
                  Choose an event and jump straight into operations.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveView("events")}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
              >
                View all
              </button>
            </div>
            <AssignedEvents
              events={events.slice(0, 4)}
              selectedEventId={selectedEventId}
              loading={loading}
              onSelectEvent={async (eventId) => {
                await actions.selectEvent(eventId);
                setActiveView("configuration");
              }}
            />
          </div>
        </div>

        {/* <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-900 p-6 text-white shadow-lg">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-violet-200">
              Event Pulse
            </div>
            <div className="mt-3 text-2xl font-bold">
              {selectedEvent ? selectedEvent.name : "Select an event"}
            </div>
            <div className="mt-2 text-sm text-white/70">
              {selectedEvent
                ? "Attendance, winners, and certificates are all managed from this workspace."
                : "Choose an assigned event to unlock live coordination tools."}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <div className="text-white/60">Status</div>
                <div className="mt-1 font-semibold text-white">
                  {selectedEvent?.status || "Not selected"}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <div className="text-white/60">Mode</div>
                <div className="mt-1 font-semibold text-white">
                  {selectedEvent?.participationType || "Not selected"}
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={actionLoading || !selectedEvent}
              onClick={() =>
                actions.updateEventStatus(
                  selectedEvent?.status === "draft" ? "open" : "ongoing"
                )
              }
              className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {selectedEvent?.status === "draft" ? "Open Event Registration" : "Mark Event Ongoing"}
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );

  const renderView = () => {
    switch (activeView) {
      case "events":
        return (
          <AssignedEvents
            events={events}
            selectedEventId={selectedEventId}
            loading={loading}
            onSelectEvent={actions.selectEvent}
          />
        );
      case "stats":
        return (
          <EventStats
            event={selectedEvent}
            analytics={eventAnalytics}
            attendanceAnalytics={attendanceAnalytics}
            certificateAnalytics={certificateAnalytics}
            breakdowns={breakdowns}
            loading={eventLoading}
          />
        );
      case "configuration":
        return (
          <EventConfiguration
            event={selectedEvent}
            workspace={workspace}
            onUpdateConfiguration={actions.updateEventConfiguration}
            onUpdateStatus={actions.updateEventStatus}
            actionLoading={actionLoading}
          />
        );
      case "participants":
        return (
          <ParticipantList
            eventName={selectedEvent?.name}
            registrations={registrations}
            onStatusChange={actions.updateRegistrationStatus}
            onRemove={actions.removeParticipant}
            actionLoading={actionLoading}
          />
        );
      case "teams":
        return (
          <TeamList
            eventName={selectedEvent?.name}
            teams={teams}
            onStatusChange={actions.updateTeamStatus}
            onRemove={actions.removeTeam}
            actionLoading={actionLoading}
          />
        );
      case "winners":
        return (
          <WinnerSelection
            eventName={selectedEvent?.name}
            participationType={selectedEvent?.participationType}
            registrations={registrations}
            teams={teams}
            winners={winners}
            onAssignWinner={(entityId, rank) => {
              if (selectedEvent?.participationType === "team") {
                return actions.markTeamWinner(entityId, rank);
              }
              return actions.markParticipantWinner(entityId, rank);
            }}
            onClearWinner={(entityId) => {
              if (selectedEvent?.participationType === "team") {
                return actions.clearTeamWinner(entityId);
              }
              return actions.clearParticipantWinner(entityId);
            }}
            actionLoading={actionLoading}
          />
        );
      case "certificates":
        return (
          <CertificateGenerator
            eventName={selectedEvent?.name}
            certificateAnalytics={certificateAnalytics}
            onGenerateParticipation={actions.generateParticipationCertificates}
            onGenerateAchievement={actions.generateAchievementCertificates}
            actionLoading={actionLoading}
          />
        );
      case "dashboard":
      default:
        return renderDashboard();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading coordinator workspace...
      </div>
    );
  }

  return (
    <DashboardShell
      role="coordinator"
      roleLabel="Coordinator"
      roleCaption="Operations Workspace"
      title={selectedEvent?.name || "Select an assigned event"}
      subtitle="Manage setup, attendance, winners, and certificates from one coordinated workspace."
      navItems={navItems}
      activeId={activeView}
      onSelect={setActiveView}
      user={user}
      error={error || authError}
      onLogout={handleLogout}
      headerBadge={selectedEvent ? `Active event: ${selectedEvent.status}` : "No event selected"}
    >
      {renderView()}
    </DashboardShell>
  );
}
