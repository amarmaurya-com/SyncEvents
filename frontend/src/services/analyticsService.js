import api from "./api.js";

export const getOverviewAnalytics = async () => {
  const { data } = await api.get("/analytics/overview");
  return data;
};

export const getAdminEventsReport = async () => {
  const { data } = await api.get("/analytics/events");
  return data;
};

export const getCoordinatorSummary = async () => {
  const { data } = await api.get("/analytics/coordinator/me");
  return data;
};

export const getCoordinatorWorkspace = async (eventId) => {
  const { data } = await api.get(`/analytics/events/${eventId}/workspace`);
  return data;
};

export const getEventAnalytics = async (eventId) => {
  const { data } = await api.get(`/analytics/events/${eventId}`);
  return data;
};

export const getEventAttendanceAnalytics = async (eventId) => {
  const { data } = await api.get(`/analytics/events/${eventId}/attendance`);
  return data;
};

export const getEventCertificateAnalytics = async (eventId) => {
  const { data } = await api.get(`/analytics/events/${eventId}/certificates`);
  return data;
};

export const getEventBreakdowns = async (eventId) => {
  const { data } = await api.get(`/analytics/events/${eventId}/breakdowns`);
  return data;
};

export const getAdminCoordinatorAnalytics = async () => {
  const { data } = await api.get("/analytics/admin/coordinators");
  return data;
};
