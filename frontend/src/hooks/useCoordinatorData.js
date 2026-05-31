import { useCallback, useEffect, useMemo, useState } from "react";

import {
  clearParticipantWinner,
  clearTeamWinner,
  generateEventCertificates,
  getAssignedEvents,
  getEventRegistrations,
  getEventTeams,
  getEventWinners,
  markParticipantWinner,
  markTeamWinner,
  removeParticipantFromEvent,
  removeTeamFromEvent,
  updateEventConfiguration,
  updateEventStatus,
  updateRegistrationStatus,
  updateTeamStatus,
} from "../services/coordinatorService.js";
import {
  getCoordinatorSummary,
  getCoordinatorWorkspace,
  getEventAnalytics,
  getEventAttendanceAnalytics,
  getEventBreakdowns,
  getEventCertificateAnalytics,
} from "../services/analyticsService.js";

const getDefaultSelectedEvent = (events, currentId) => {
  if (!events.length) {
    return null;
  }

  if (currentId && events.some((event) => event._id === currentId)) {
    return currentId;
  }

  return events[0]._id;
};

export default function useCoordinatorData() {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [eventAnalytics, setEventAnalytics] = useState(null);
  const [attendanceAnalytics, setAttendanceAnalytics] = useState(null);
  const [certificateAnalytics, setCertificateAnalytics] = useState(null);
  const [breakdowns, setBreakdowns] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [winners, setWinners] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    const [summaryData, eventsData] = await Promise.all([
      getCoordinatorSummary(),
      getAssignedEvents(),
    ]);

    const assignedEvents = eventsData.events || [];
    setSummary(summaryData);
    setEvents(assignedEvents);

    const nextSelectedEventId = getDefaultSelectedEvent(assignedEvents, selectedEventId);
    setSelectedEventId(nextSelectedEventId);

    return nextSelectedEventId;
  }, [selectedEventId]);

  const loadEventData = useCallback(async (eventId) => {
    if (!eventId) {
      setWorkspace(null);
      setEventAnalytics(null);
      setAttendanceAnalytics(null);
      setCertificateAnalytics(null);
      setBreakdowns(null);
      setRegistrations([]);
      setTeams([]);
      setWinners(null);
      return;
    }

    setEventLoading(true);
    setError("");

    try {
      const [
        workspaceData,
        eventAnalyticsData,
        attendanceData,
        certificateData,
        breakdownData,
        registrationsData,
        teamsData,
        winnersData,
      ] = await Promise.all([
        getCoordinatorWorkspace(eventId),
        getEventAnalytics(eventId),
        getEventAttendanceAnalytics(eventId),
        getEventCertificateAnalytics(eventId),
        getEventBreakdowns(eventId),
        getEventRegistrations(eventId),
        getEventTeams(eventId),
        getEventWinners(eventId),
      ]);

      setWorkspace(workspaceData);
      setEventAnalytics(eventAnalyticsData);
      setAttendanceAnalytics(attendanceData);
      setCertificateAnalytics(certificateData);
      setBreakdowns(breakdownData);
      setRegistrations(registrationsData.registrations || []);
      setTeams(teamsData.teams || []);
      setWinners(winnersData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load event data.");
      throw err;
    } finally {
      setEventLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const nextSelectedEventId = await loadSummary();
      await loadEventData(nextSelectedEventId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load coordinator dashboard.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEventData, loadSummary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshAll().catch(() => {});
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshAll]);

  const selectEvent = useCallback(
    async (eventId) => {
      setSelectedEventId(eventId);
      await loadEventData(eventId);
    },
    [loadEventData]
  );

  const runAction = useCallback(
    async (task) => {
      if (!selectedEventId) {
        return null;
      }

      setActionLoading(true);
      setError("");

      try {
        // Execute the task and capture the result
        const result = await task(selectedEventId);
        
        // Refresh data after action
        await Promise.all([loadSummary(), loadEventData(selectedEventId)]);
        
        // Return the result so components can use it
        return result;
      } catch (err) {
        setError(err.response?.data?.message || "Coordinator action failed.");
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [loadEventData, loadSummary, selectedEventId]
  );

  const actions = useMemo(
    () => ({
      selectEvent,
      refreshAll,
      updateEventConfiguration: (payload) =>
        runAction((eventId) => updateEventConfiguration(eventId, payload)),
      updateEventStatus: (status) =>
        runAction((eventId) => updateEventStatus(eventId, status)),
      updateRegistrationStatus: (registrationId, status) =>
        runAction((eventId) => updateRegistrationStatus(eventId, registrationId, status)),
      updateTeamStatus: (teamId, status) =>
        runAction((eventId) => updateTeamStatus(eventId, teamId, status)),
      removeParticipant: (registrationId) =>
        runAction((eventId) => removeParticipantFromEvent(eventId, registrationId)),
      removeTeam: (teamId) => runAction((eventId) => removeTeamFromEvent(eventId, teamId)),
      markParticipantWinner: (participantId, rank) =>
        runAction((eventId) => markParticipantWinner(eventId, participantId, rank)),
      markTeamWinner: (teamId, rank) =>
        runAction((eventId) => markTeamWinner(eventId, teamId, rank)),
      clearParticipantWinner: (participantId) =>
        runAction((eventId) => clearParticipantWinner(eventId, participantId)),
      clearTeamWinner: (teamId) =>
        runAction((eventId) => clearTeamWinner(eventId, teamId)),
      generateParticipationCertificates: () =>
        runAction((eventId) => generateEventCertificates(eventId, "participation")),
      generateAchievementCertificates: () =>
        runAction((eventId) => generateEventCertificates(eventId, "achievement")),
    }),
    [refreshAll, runAction, selectEvent]
  );

  return {
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
  };
}
