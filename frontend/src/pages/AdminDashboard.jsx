import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import AdminManagement from "../components/admin/AdminManagement.jsx";
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard.jsx";
import CoordinatorAssignment from "../components/admin/CoordinatorAssignment.jsx";
import CoordinatorManagement from "../components/admin/CoordinatorManagement.jsx";
import EventAnalytics from "../components/admin/EventAnalytics.jsx";
import EventForm from "../components/admin/EventForm.jsx";
import EventList from "../components/admin/EventList.jsx";
import DashboardShell from "../components/common/DashboardShell.jsx";
import { getCurrentUser, logoutUser } from "../services/authService.js";
import { createAdmin, createCoordinator, getAdmins, getCoordinators } from "../services/adminService.js";
import {
  assignCoordinatorToEvent,
  createEvent,
  deleteEvent,
  getEvents,
  removeCoordinatorFromEvent,
  updateEvent,
} from "../services/eventService.js";
import {
  getAdminEventsReport,
  getAdminCoordinatorAnalytics,
  getOverviewAnalytics,
} from "../services/analyticsService.js";

const NAV = [
  { id: "events", label: "Events", sub: "Manage events" },
  { id: "admins", label: "Admins", sub: "Manage admins" },
  { id: "coordinators", label: "Coordinators", sub: "Manage staff" },
  { id: "assignment", label: "Assignment", sub: "Assign coordinators" },
  { id: "analytics", label: "Analytics", sub: "System overview" },
  { id: "eventanalytics", label: "Event Analytics", sub: "Per-event stats" },
];

const formatDateInput = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const mapEventToForm = (event) => ({
  ...event,
  registrationStartDate: formatDateInput(event.registrationStartDate),
  registrationEndDate: formatDateInput(event.registrationEndDate),
  eventDate: formatDateInput(event.eventDate),
});

const buildEventPayload = (form) => {
  return {
    name: form.name,
    description: form.description,
  };
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("events");
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [overview, setOverview] = useState(null);
  const [eventsReport, setEventsReport] = useState([]);
  const [coordinatorAnalytics, setCoordinatorAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const workloadMap = useMemo(() => {
    const map = {};
    (overview?.coordinatorWorkload || []).forEach((item) => {
      map[item.coordinator._id] = item.events.length;
    });
    return map;
  }, [overview]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { user } = await getCurrentUser();

      if (user.role !== "admin") {
        navigate("/login", { replace: true });
        return;
      }

      const [
        eventsResult,
        adminsResult,
        coordinatorsResult,
        overviewResult,
        eventsReportResult,
        coordinatorAnalyticsResult,
      ] = await Promise.allSettled([
        getEvents(),
        getAdmins(),
        getCoordinators(),
        getOverviewAnalytics(),
        getAdminEventsReport(),
        getAdminCoordinatorAnalytics(),
      ]);

      const eventsData = eventsResult.status === "fulfilled" ? eventsResult.value : [];
      const adminsData = adminsResult.status === "fulfilled" ? adminsResult.value : { users: [] };
      const coordinatorsData =
        coordinatorsResult.status === "fulfilled" ? coordinatorsResult.value : { users: [] };
      const overviewData = overviewResult.status === "fulfilled" ? overviewResult.value : null;
      const eventsReportData =
        eventsReportResult.status === "fulfilled" ? eventsReportResult.value : { events: [] };
      const coordinatorAnalyticsData =
        coordinatorAnalyticsResult.status === "fulfilled"
          ? coordinatorAnalyticsResult.value
          : { coordinators: [] };

      setCurrentUser(user);
      setEvents(Array.isArray(eventsData) ? eventsData : eventsData.events || []);
      setAdmins(adminsData.users || []);
      setCoordinators(coordinatorsData.users || []);
      setOverview(overviewData);
      setEventsReport(eventsReportData.events || []);
      setCoordinatorAnalytics(coordinatorAnalyticsData.coordinators || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin dashboard.");
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAdminData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadAdminData]);

  const handleEdit = (event) => {
    setEditEvent(mapEventToForm(event));
    setShowEventForm(true);
  };

  const handleCreate = () => {
    setEditEvent(null);
    setShowEventForm(true);
  };

  const handleFormSubmit = async (data) => {
    setSaving(true);
    setError("");

    try {
      const payload = buildEventPayload(data);
      if (editEvent?._id) {
        await updateEvent(editEvent._id, payload);
      } else {
        await createEvent(payload);
      }
      setShowEventForm(false);
      setEditEvent(null);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    setSaving(true);
    setError("");

    try {
      await deleteEvent(eventId);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete event.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCoordinator = async (form) => {
    await createCoordinator({
      name: form.name,
      email: form.email,
      password: form.password,
      role: "coordinator",
      gender: form.gender,
      institution: form.institution,
      coordinatorId: form.coordinatorId,
      contactNumber: form.contactNumber,
    });
    await loadAdminData();
  };

  const handleCreateAdmin = async (form) => {
    await createAdmin({
      name: form.name,
      email: form.email,
      password: form.password,
      role: "admin",
      gender: form.gender,
      institution: form.institution,
      adminId: form.adminId,
      contactNumber: form.contactNumber,
    });
    await loadAdminData();
  };

  const handleAssignCoordinator = async (eventId, coordinatorId) => {
    setSaving(true);
    try {
      await assignCoordinatorToEvent(eventId, coordinatorId);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign coordinator.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCoordinator = async (eventId, coordinatorId) => {
    setSaving(true);
    try {
      await removeCoordinatorFromEvent(eventId, coordinatorId);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove coordinator.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  const renderContent = () => {
    if (activeTab === "events" && showEventForm) {
      return (
        <EventForm
          event={editEvent}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowEventForm(false);
            setEditEvent(null);
          }}
        />
      );
    }

    switch (activeTab) {
      case "events":
        return (
          <EventList
            events={events}
            loading={loading}
            onEdit={handleEdit}
            onCreate={handleCreate}
            onDelete={handleDeleteEvent}
          />
        );
      case "admins":
        return (
          <AdminManagement
            admins={admins}
            onCreateAdmin={handleCreateAdmin}
            creating={saving}
          />
        );
      case "coordinators":
        return (
          <CoordinatorManagement
            coordinators={coordinators}
            workloadMap={workloadMap}
            onCreateCoordinator={handleCreateCoordinator}
            creating={saving}
          />
        );
      case "assignment":
        return (
          <CoordinatorAssignment
            events={events}
            coordinators={coordinators}
            onAssign={handleAssignCoordinator}
            onRemove={handleRemoveCoordinator}
            saving={saving}
          />
        );
      case "analytics":
        return (
          <AnalyticsDashboard
            overview={overview}
            eventsReport={eventsReport}
            coordinatorAnalytics={coordinatorAnalytics}
            loading={loading}
          />
        );
      case "eventanalytics":
        return <EventAnalytics eventsReport={eventsReport} loading={loading} />;
      default:
        return null;
    }
  };

  const currentNav = NAV.find((item) => item.id === activeTab);

  return (
    <DashboardShell
      role="admin"
      roleLabel="Admin"
      roleCaption="System Control Center"
      title={currentNav?.label || "Admin Dashboard"}
      subtitle={currentNav?.sub || "Manage events, coordinators, and reporting across the platform."}
      navItems={NAV}
      activeId={activeTab}
      onSelect={(id) => {
        setActiveTab(id);
        setShowEventForm(false);
      }}
      user={currentUser}
      error={error}
      onLogout={handleLogout}
      headerBadge={`${events.length} active records`}
    >
      {renderContent()}
    </DashboardShell>
  );
}
