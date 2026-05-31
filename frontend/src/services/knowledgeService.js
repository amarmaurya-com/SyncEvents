import api from "./api.js";

export const askKnowledgeQuestion = async ({ question, eventId }) => {
  const { data } = await api.post("/knowledge/answer", {
    question,
    eventId,
  });

  return data;
};
