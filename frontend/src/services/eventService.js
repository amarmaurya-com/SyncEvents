import api from "./api.js";

export const getEvents = async () => {
  const { data } = await api.get("/events");
  return data;
};

export const createEvent = async (payload) => {
  const { data } = await api.post("/events", payload);
  return data;
};

export const updateEvent = async (eventId, payload) => {
  const { data } = await api.put(`/events/${eventId}`, payload);
  return data;
};

export const deleteEvent = async (eventId) => {
  const { data } = await api.delete(`/events/${eventId}`);
  return data;
};

export const assignCoordinatorToEvent = async (eventId, coordinatorId) => {
  const { data } = await api.post(`/events/${eventId}/coordinators`, {
    coordinatorId,
  });
  return data;
};

export const removeCoordinatorFromEvent = async (eventId, coordinatorId) => {
  const { data } = await api.delete(
    `/events/${eventId}/coordinators/${coordinatorId}`
  );
  return data;
};
