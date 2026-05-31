import api from "./api.js";

export const getAssignedEvents = async () => {
  const { data } = await api.get("/events");
  return data;
};

export const getEventRegistrations = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}/registrations`);
  return data;
};

export const getEventTeams = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}/teams`);
  return data;
};

export const updateEventStatus = async (eventId, status) => {
  const { data } = await api.patch(`/events/${eventId}/status`, { status });
  return data;
};

export const updateEventConfiguration = async (eventId, payload) => {
  const { data } = await api.patch(`/events/${eventId}/configuration`, payload);
  return data;
};

export const updateRegistrationStatus = async (eventId, registrationId, status) => {
  const { data } = await api.patch(`/events/${eventId}/registrations/${registrationId}/status`, {
    status,
  });
  return data;
};

export const updateTeamStatus = async (eventId, teamId, status) => {
  const { data } = await api.patch(`/events/${eventId}/teams/${teamId}/status`, {
    status,
  });
  return data;
};

export const removeParticipantFromEvent = async (eventId, registrationId) => {
  const { data } = await api.delete(`/events/${eventId}/registrations/${registrationId}`);
  return data;
};

export const removeTeamFromEvent = async (eventId, teamId) => {
  const { data } = await api.delete(`/events/${eventId}/teams/${teamId}`);
  return data;
};

export const getEventWinners = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}/winners`);
  return data;
};

export const markParticipantWinner = async (eventId, participantId, rank) => {
  const { data } = await api.post(`/events/${eventId}/winners`, {
    participantId,
    rank,
  });
  return data;
};

export const markTeamWinner = async (eventId, teamId, rank) => {
  const { data } = await api.post(`/events/${eventId}/winners`, {
    teamId,
    rank,
  });
  return data;
};

export const clearParticipantWinner = async (eventId, participantId) => {
  const { data } = await api.delete(`/events/${eventId}/winners`, {
    data: { participantId },
  });
  return data;
};

export const clearTeamWinner = async (eventId, teamId) => {
  const { data } = await api.delete(`/events/${eventId}/winners`, {
    data: { teamId },
  });
  return data;
};

export const generateEventCertificates = async (eventId, certificateType) => {
  const { data } = await api.post(`/certificates/events/${eventId}/batch`, {
    certificateType,
  });
  return data;
};

// export const generateEventCertificates = async (eventId, certificateType) => {
//   const response = await api.post(`/certificates/batch/${eventId}`, {
//     certificateType,
//   });
//   return response.data; // Return the data so it can be used
// };
