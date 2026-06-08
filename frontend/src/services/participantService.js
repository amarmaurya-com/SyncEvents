import api from "./api.js";

const STATUS_FROM_API = {
  DRAFT: "draft",
  PUBLISHED: "open",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const lower = (value) => (typeof value === "string" ? value.toLowerCase() : value);

const normalizeEvent = (event) =>
  event
    ? {
        ...event,
        eventType: lower(event.eventType),
        participationType: lower(event.participationType),
        status: STATUS_FROM_API[event.status] || lower(event.status),
      }
    : event;

export const getAvailableEvents = async () => {
  const { data } = await api.get("/events");
  return Array.isArray(data)
    ? data.map(normalizeEvent)
    : {
        ...data,
        events: (data?.events || []).map(normalizeEvent),
      };
};

export const getMyRegistrations = async () => {
  const { data } = await api.get("/registrations/me");
  return data;
};

export const registerForEvent = async (eventId) => {
  const { data } = await api.post("/registrations", { eventId });
  return data;
};

export const withdrawRegistration = async (registrationId, reason = "") => {
  const { data } = await api.delete(`/registrations/${registrationId}`, {
    data: { reason },
  });
  return data;
};

export const getMyTeams = async () => {
  const { data } = await api.get("/teams/me");
  return data;
};

export const searchParticipants = async (studentId, eventId) => {
  const { data } = await api.get("/teams/participants/search", {
    params: { studentId, eventId },
  });
  return data;
};

export const createTeam = async (payload) => {
  const { data } = await api.post("/teams", payload);
  return data;
};

export const withdrawTeam = async (teamId, reason = "") => {
  const { data } = await api.delete(`/teams/${teamId}/withdraw`, {
    data: { reason },
  });
  return data;
};

export const getMyCertificates = async () => {
  const { data } = await api.get("/certificates/me");
  return data;
};

export const getCertificateDownloadUrl = (certificateId) =>
  `${api.defaults.baseURL}/certificates/${certificateId}/download`;
