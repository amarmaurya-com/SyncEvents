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
        coordinators: (event.coordinators || []).map((coordinator) => ({
          ...coordinator,
          role: lower(coordinator.role),
          gender: lower(coordinator.gender),
        })),
      }
    : event;

const normalizeEvents = (data) =>
  Array.isArray(data)
    ? data.map(normalizeEvent)
    : {
        ...data,
        events: (data?.events || []).map(normalizeEvent),
      };

export const getEvents = async () => {
  const { data } = await api.get("/events");
  return normalizeEvents(data);
};

export const createEvent = async (payload) => {
  const { data } = await api.post("/events", payload);
  return normalizeEvent(data);
};

export const updateEvent = async (eventId, payload) => {
  const { data } = await api.put(`/events/${eventId}`, payload);
  return normalizeEvent(data);
};

export const deleteEvent = async (eventId) => {
  const { data } = await api.delete(`/events/${eventId}`);
  return data;
};

export const assignCoordinatorToEvent = async (eventId, coordinatorId) => {
  const { data } = await api.post(`/events/${eventId}/coordinators`, {
    coordinatorId,
  });
  return normalizeEvent(data);
};

export const removeCoordinatorFromEvent = async (eventId, coordinatorId) => {
  const { data } = await api.delete(
    `/events/${eventId}/coordinators/${coordinatorId}`
  );
  return normalizeEvent(data);
};
