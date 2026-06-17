import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import DashboardShell from "../components/common/DashboardShell.jsx";
import FloatingAskBubble from "../components/participant/FloatingAskBubble.jsx";
import useAuth from "../hooks/useAuth.js";
import {
  createTeam,
  getAvailableEvents,
  getCertificateDownloadUrl,
  getMyCertificates,
  getMyRegistrations,
  getMyTeams,
  registerForEvent,
  searchParticipants,
  withdrawRegistration,
  withdrawTeam,
} from "../services/participantService.js";

const formatDate = (value, fallback = "TBD") => {
  if (!value) return fallback;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCertificateType = (value) => {
  if (value === "achievement") return "Achievement";
  if (value === "winner") return "Winner";
  return "Participation";
};

const isEventRegistrationOpen = (event) => {
  if (typeof event?.registration?.open === "boolean") return event.registration.open;
  if (!["open", "ongoing"].includes(event?.status)) return false;

  const now = new Date();
  const registrationStartDate = event?.registrationStartDate
    ? new Date(event.registrationStartDate)
    : null;
  const registrationEndDate = event?.registrationEndDate
    ? new Date(event.registrationEndDate)
    : null;

  if (registrationStartDate && now < registrationStartDate) return false;
  if (registrationEndDate && now > registrationEndDate) return false;

  return true;
};

const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (data?.detail) return data.detail;

  return error?.message || fallback;
};

const statusStyles = {
  registered: "bg-blue-50 text-blue-700 border-blue-200",
  participated: "bg-emerald-50 text-emerald-700 border-emerald-200",
  withdrawn: "bg-rose-50 text-rose-700 border-rose-200",
  absent: "bg-amber-50 text-amber-700 border-amber-200",
  open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ongoing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-slate-100 text-slate-500 border-slate-200",
  draft: "bg-slate-100 text-slate-500 border-slate-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

function EventDetailModal({ event, onClose }) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                statusStyles[event.status] || statusStyles.draft
              }`}
            >
              {event.status}
            </span>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{event.name}</h2>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-slate-400">
              {event.eventType}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
          >
            Close
          </button>
        </div>

        {event.description ? (
          <p className="mb-4 text-sm leading-6 text-slate-600">{event.description}</p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Date", value: formatDate(event.eventDate) },
            { label: "Venue", value: event.venue || "TBD" },
            { label: "Mode", value: event.participationType },
            { label: "Participants", value: event.stats?.totalParticipants || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-400 mb-0.5">{label}</div>
              <div className="text-sm font-medium text-slate-800">{value}</div>
            </div>
          ))}
        </div>

        {event.participationType === "team" && event.teamConfig ? (
          <div className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
            Team size: {event.teamConfig.minSize || event.teamConfig.minTeamSize}–{event.teamConfig.maxSize || event.teamConfig.maxTeamSize} members
            {(event.teamConfig.genderRequired || event.teamConfig.genderRequirement) &&
            (event.teamConfig.genderRequired || event.teamConfig.genderRequirement) !== "none"
              ? ` · ${event.teamConfig.genderRequired || event.teamConfig.genderRequirement}`
              : ""}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TeamModal({
  event,
  onClose,
  onCreate,
  searching,
  searchResults,
  onSearch,
  creating,
}) {
  const [teamName, setTeamName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState("");
  const minTeamSize = event?.teamConfig?.minSize || event?.teamConfig?.minTeamSize || 1;
  const maxTeamSize = event?.teamConfig?.maxSize || event?.teamConfig?.maxTeamSize || 1;
  const totalMembers = selectedMembers.length + 1;
  const hasReachedMaxMembers = totalMembers >= maxTeamSize;
  const meetsTeamSizeRequirement = totalMembers >= minTeamSize && totalMembers <= maxTeamSize;
  const getId = (item) => item?._id ?? item?.id;

  if (!event) return null;

  const addMember = (user) => {
    if (hasReachedMaxMembers) {
      setError(`You can add up to ${maxTeamSize} members for this event.`);
      return;
    }
    setSelectedMembers((current) => {
      const userId = getId(user);
      if (current.some((member) => getId(member) === userId)) return current;
      return [...current, user];
    });
    setStudentId("");
    setError("");
  };

  const removeMember = (memberId) => {
    setSelectedMembers((current) => current.filter((member) => getId(member) !== memberId));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError("Enter a student ID to search teammates.");
      return;
    }
    setError("");
    await onSearch(studentId.trim(), event._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError("Team name is required.");
      return;
    }
    setError("");
    try {
      await onCreate({
        eventId: getId(event),
        teamName: teamName.trim(),
        members: selectedMembers.map(getId),
      });
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Team enrollment
            </p>
            <h2 className="mt-1.5 text-xl font-semibold text-slate-900">{event.name}</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              Build your team and submit for this event.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:text-slate-800 transition"
          >
            Close
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                Team name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter a team name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">Add teammates</div>
                  <div className="text-xs text-slate-400">
                    Search by student ID. You are added as leader.
                  </div>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {totalMembers} members
                </span>
              </div>

              <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Search student ID"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              <div className="space-y-2">
                {searchResults.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm text-slate-400">
                    Search results will appear here.
                  </div>
                ) : (
                  searchResults.map((user) => {
                    const userId = getId(user);
                    const alreadyAdded = selectedMembers.some((member) => getId(member) === userId);
                    return (
                      <div
                        key={userId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-400">
                            {user.studentId} · {user.institution || "Institution not set"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addMember(user)}
                          disabled={alreadyAdded || hasReachedMaxMembers}
                          className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                        >
                          {alreadyAdded ? "Added" : hasReachedMaxMembers ? "Limit reached" : "Add"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3">
              <div className="text-sm font-medium text-slate-800">Selected team</div>
              <div className="text-xs text-slate-400">
                Rule: {minTeamSize}–{maxTeamSize} members
              </div>
            </div>

            <div className="space-y-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
                  Leader
                </div>
                <div className="mt-0.5 text-sm font-medium text-slate-900">You</div>
              </div>

              {selectedMembers.map((member) => (
                <div
                  key={getId(member)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-2.5"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">{member.name}</div>
                    <div className="text-xs text-slate-400">{member.studentId}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(getId(member))}
                    className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={creating || !meetsTeamSizeRequirement}
              className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {creating ? "Creating team..." : "Create team"}
            </button>

            {!meetsTeamSizeRequirement ? (
              <div className="mt-2 text-xs text-amber-600">
                Team needs {minTeamSize}–{maxTeamSize} members.
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError, signOut } = useAuth("participant");
  const [activeView, setActiveView] = useState("dashboard");
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [teamModalEvent, setTeamModalEvent] = useState(null);
  const [teamSearchLoading, setTeamSearchLoading] = useState(false);
  const [teamSearchResults, setTeamSearchResults] = useState([]);
  const [detailEvent, setDetailEvent] = useState(null);

  const loadParticipantData = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventsData, registrationsData, teamsData, certificatesData] = await Promise.all([
        getAvailableEvents(),
        getMyRegistrations(),
        getMyTeams(),
        getMyCertificates(),
      ]);
      setEvents(Array.isArray(eventsData) ? eventsData : eventsData.events || []);
      setRegistrations(registrationsData.registrations || []);
      setTeams(teamsData.teams || []);
      setCertificates(certificatesData.certificates || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load participant dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!user) return undefined;
    const timer = setTimeout(loadParticipantData, 0);
    return () => clearTimeout(timer);
  }, [user]);

  const activeRegistrations = useMemo(
    () => registrations.filter((r) => r.status !== "withdrawn"),
    [registrations]
  );
  const activeTeams = useMemo(() => teams.filter((t) => t.status !== "withdrawn"), [teams]);

  const enrolledEventIds = useMemo(() => {
    const ids = new Set();
    activeRegistrations.forEach((r) => ids.add(r.eventId?._id || r.eventId));
    activeTeams.forEach((t) => ids.add(t.eventId?._id || t.eventId));
    return ids;
  }, [activeRegistrations, activeTeams]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const isAvailable = isEventRegistrationOpen(event);
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || event.eventType === typeFilter;
      return isAvailable && matchesSearch && matchesType;
    });
  }, [events, searchTerm, typeFilter]);

  const myEntries = useMemo(() => {
    const individualEntries = registrations.map((r) => ({
      id: r._id,
      kind: "individual",
      eventId: r.eventId?._id || r.eventId,
      eventName: r.eventId?.name || "Event",
      eventDate: r.eventId?.eventDate,
      venue: r.eventId?.venue,
      status: r.status,
      participationType: "individual",
      createdAt: r.createdAt,
      isLeader: false,
    }));

    const teamEntries = teams.map((t) => ({
      id: t._id,
      kind: "team",
      eventId: t.eventId?._id || t.eventId,
      eventName: t.eventId?.name || "Event",
      eventDate: t.eventId?.eventDate,
      venue: t.eventId?.venue,
      status: t.status,
      participationType: "team",
      teamName: t.teamName,
      members: t.members,
      createdAt: t.createdAt,
      isLeader: t.leaderId?._id === user?._id,
    }));

    return [...individualEntries, ...teamEntries].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [registrations, teams, user?._id]);

  const stats = useMemo(() => {
    const attendedIndividuals = registrations.filter((r) => r.status === "participated").length;
    const attendedTeams = teams.filter((t) => t.status === "participated").length;
    return {
      active: activeRegistrations.length + activeTeams.length,
      attended: attendedIndividuals + attendedTeams,
      certificates: certificates.length,
    };
  }, [activeRegistrations.length, activeTeams.length, certificates.length, registrations, teams]);

  const handleRegister = async (event) => {
    setActionLoading(true);
    setError("");
    if (!isEventRegistrationOpen(event)) {
      setError(event.registration?.reason || "Registration is not open for this event.");
      setActionLoading(false);
      return;
    }
    try {
      if (event.participationType === "team") {
        setTeamSearchResults([]);
        setTeamModalEvent(event);
        return;
      }
      await registerForEvent(event._id);
      await loadParticipantData();
      setActiveView("my-events");
    } catch (actionError) {
      setError(actionError.response?.data?.message || "Unable to register for event.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawRegistration = async (registrationId) => {
    setActionLoading(true);
    setError("");
    try {
      await withdrawRegistration(registrationId);
      await loadParticipantData();
    } catch (actionError) {
      setError(actionError.response?.data?.message || "Unable to withdraw registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawTeam = async (teamId) => {
    setActionLoading(true);
    setError("");
    try {
      await withdrawTeam(teamId);
      await loadParticipantData();
    } catch (actionError) {
      setError(actionError.response?.data?.message || "Unable to withdraw team.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTeamSearch = async (studentId, eventId) => {
    setTeamSearchLoading(true);
    setError("");
    try {
      const data = await searchParticipants(studentId, eventId);
      setTeamSearchResults(data.participants || data.users || []);
    } catch (searchError) {
      setError(getApiErrorMessage(searchError, "Unable to search participants."));
      setTeamSearchResults([]);
    } finally {
      setTeamSearchLoading(false);
    }
  };

  const handleCreateTeam = async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      await createTeam(payload);
      setTeamModalEvent(null);
      setTeamSearchResults([]);
      await loadParticipantData();
      setActiveView("my-events");
    } catch (actionError) {
      const message = getApiErrorMessage(actionError, "Unable to create team.");
      setError(message);
      throw new Error(message, { cause: actionError });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const EventCard = ({ event }) => {
    const eventId = event._id;
    const enrolled = enrolledEventIds.has(eventId);
    const registrationOpen = isEventRegistrationOpen(event);

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              statusStyles[event.status] || statusStyles.draft
            }`}
          >
            {event.status}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {event.eventType}
          </span>
        </div>

        <div className="text-sm font-semibold text-slate-900 leading-snug">{event.name}</div>

        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            {formatDate(event.eventDate)}
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1C4.3 1 3 2.3 3 4c0 2.6 3 7 3 7s3-4.4 3-7c0-1.7-1.3-3-3-3z" stroke="currentColor" strokeWidth="1.1"/>
            </svg>
            {event.venue || "TBD"}
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M2 11c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            {event.participationType === "team"
              ? `Team · ${event.teamConfig?.minSize || event.teamConfig?.minTeamSize || 1}–${event.teamConfig?.maxSize || event.teamConfig?.maxTeamSize || 1} members`
              : "Individual"}
          </div>
        </div>

        <div className="flex gap-2 mt-auto pt-1">
          <button
            type="button"
            disabled={actionLoading || enrolled || !registrationOpen}
            onClick={() => handleRegister(event)}
            className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {enrolled
              ? "Enrolled"
              : !registrationOpen
              ? "Closed"
              : event.participationType === "team"
              ? "Create team"
              : "Register"}
          </button>
          <button
            type="button"
            onClick={() => setDetailEvent(event)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            Read more
          </button>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {user?.institution || "Participant"} · Track enrollments, browse events, download certificates.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Active enrollments", value: stats.active, dot: "#6366f1", sub: `${activeRegistrations.length} individual · ${activeTeams.length} team` },
          { label: "Events attended", value: stats.attended, dot: "#059669", sub: "This semester" },
          { label: "Certificates", value: stats.certificates, dot: "#f59e0b", sub: "Ready to download" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs text-slate-400">{card.label}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: card.dot }}
              />
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold text-slate-900">Open events</div>
          <button
            type="button"
            onClick={() => setActiveView("browse")}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition"
          >
            Browse all →
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.slice(0, 6).map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold text-slate-900">Recent registrations</div>
          <button
            type="button"
            onClick={() => setActiveView("my-events")}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition"
          >
            View all →
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {myEntries.slice(0, 3).map((entry) => (
            <div
              key={`${entry.kind}-${entry.id}`}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm font-medium text-slate-900">{entry.eventName}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {formatDate(entry.eventDate)} · {entry.participationType}
                  {entry.kind === "team" ? ` · ${entry.teamName}` : ""}
                </div>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 ${
                  statusStyles[entry.status] || statusStyles.registered
                }`}
              >
                {entry.status}
              </span>
            </div>
          ))}
          {myEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-400">
              No registrations yet. Browse events to get started.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderBrowse = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xl font-semibold text-slate-900">Browse events</div>
          <div className="text-sm text-slate-400">Search and enroll in live events.</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by event name"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
          >
            <option value="all">All types</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );

  const renderMyEvents = () => (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">My registrations</div>
        <div className="text-sm text-slate-400">Individual and team registrations in one place.</div>
      </div>

      {myEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
          No registrations yet. Browse events to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {myEntries.map((entry) => (
            <div
              key={`${entry.kind}-${entry.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-slate-900">{entry.eventName}</div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        statusStyles[entry.status] || statusStyles.registered
                      }`}
                    >
                      {entry.status}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                      {entry.participationType}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>{formatDate(entry.eventDate)}</span>
                    <span>{entry.venue || "TBD"}</span>
                    {entry.kind === "team" ? (
                      <span>{entry.teamName} · {entry.members?.length || 0} members</span>
                    ) : null}
                  </div>
                </div>

                {entry.status === "registered" ? (
                  entry.kind === "team" ? (
                    <button
                      type="button"
                      disabled={actionLoading || !entry.isLeader}
                      onClick={() => handleWithdrawTeam(entry.id)}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    >
                      {entry.isLeader ? "Withdraw team" : "Leader can withdraw"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleWithdrawRegistration(entry.id)}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed"
                    >
                      Withdraw
                    </button>
                  )
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCertificates = () => (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">My certificates</div>
        <div className="text-sm text-slate-400">Download participation and achievement certificates.</div>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
          No certificates available yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {certificates.map((certificate) => (
            <div key={certificate._id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="rounded-xl bg-slate-900 p-5 text-white">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  Smart Event Manager
                </div>
                <div className="mt-4 text-base font-semibold">
                  {certificate.eventId?.name || "Certificate"}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  {formatCertificateType(certificate.certificateType)}
                  {certificate.rank ? ` · Rank ${certificate.rank}` : ""}
                </div>
                <div className="mt-4 text-[10px] text-white/40">{certificate.certificateNumber}</div>
              </div>

              <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400">
                <div>Event: {formatDate(certificate.eventId?.eventDate)}</div>
                <div>Generated: {formatDate(certificate.generatedAt)}</div>
              </div>

              <a
                href={getCertificateDownloadUrl(certificate._id)}
                className="mt-3 block rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const views = {
    dashboard: renderDashboard(),
    browse: renderBrowse(),
    "my-events": renderMyEvents(),
    certificates: renderCertificates(),
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <>
      <DashboardShell
        role="participant"
        roleLabel="Participant"
        roleCaption="Student Event Hub"
        title={user?.institution || "Participant Dashboard"}
        subtitle="Track enrollments, discover open events, and keep certificates organized."
        navItems={[
          { id: "dashboard", label: "Dashboard", sub: "Overview" },
          { id: "browse", label: "Browse events", sub: "Explore live events" },
          { id: "my-events", label: "My registrations", sub: "Track enrollments" },
          { id: "certificates", label: "Certificates", sub: "Downloads" },
        ]}
        activeId={activeView}
        onSelect={setActiveView}
        user={user}
        error={error || authError}
        onLogout={handleLogout}
        headerBadge={`${stats.active} active`}
      >
        {views[activeView] || views.dashboard}
      </DashboardShell>

      {teamModalEvent ? (
        <TeamModal
          key={teamModalEvent._id}
          event={teamModalEvent}
          onClose={() => setTeamModalEvent(null)}
          onCreate={handleCreateTeam}
          searching={teamSearchLoading}
          searchResults={teamSearchResults}
          onSearch={handleTeamSearch}
          creating={actionLoading}
        />
      ) : null}

      {detailEvent ? (
        <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} />
      ) : null}

      <FloatingAskBubble events={filteredEvents} />
    </>
  );
}
