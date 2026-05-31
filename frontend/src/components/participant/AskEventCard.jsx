import { useEffect, useRef, useState } from "react";

import { askKnowledgeQuestion } from "../../services/knowledgeService.js";

const suggestedQuestions = [
  "Team rules?",
  "Registration deadline?",
  "Prizes offered?",
  "Venue details?",
];

export default function AskEventCard({ event, events = [], onSelectEvent, open, onClose }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasAsked, setHasAsked] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    setQuestion("");
    setAnswer("");
    setError("");
    setHasAsked(false);
  }, [event?._id]);

  if (!open) return null;

  const runQuestion = async (nextQuestion) => {
    const normalized = nextQuestion.trim();
    if (!normalized) {
      setError("Enter a question about this event.");
      return;
    }
    setLoading(true);
    setError("");
    setHasAsked(true);
    try {
      const data = await askKnowledgeQuestion({ question: normalized, eventId: event._id });
      setAnswer(data.answer || "");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to answer right now.");
      setAnswer("");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await runQuestion(question);
  };

  const handleChip = async (value) => {
    setQuestion(value);
    await runQuestion(value);
  };

  return (
    <div className="w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div
        style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}
        className="px-4 py-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-orange-100">
              AI Assistant
            </div>
            <div className="mt-0.5 text-sm font-semibold text-white leading-snug">
              Ask me anything
            </div>
            <div className="mt-0.5 text-xs text-orange-100/80">
              Rules · dates · prizes · team setup
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 text-orange-200 hover:text-white transition text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {events.length > 1 ? (
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Ask about
            </div>
            <div className="flex flex-wrap gap-1.5">
              {events.map((ev) => (
                <button
                  key={ev._id}
                  type="button"
                  onClick={() => onSelectEvent(ev)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    ev._id === event._id
                      ? "border-transparent text-white"
                      : "border-slate-200 text-slate-500 hover:border-orange-200 hover:text-orange-500"
                  }`}
                  style={
                    ev._id === event._id
                      ? { background: "linear-gradient(135deg, #f97316, #ec4899)" }
                      : {}
                  }
                >
                  {ev.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-medium text-orange-700">{event.name}</span>
          <span className="text-[10px] text-orange-400 capitalize">{event.eventType}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleChip(item)}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-orange-200 hover:text-orange-500 disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "Ask"}
          </button>
        </form>

        {error ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </div>
        ) : null}

        {hasAsked && !loading && !error ? (
          <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-orange-400 mb-1">
              Answer
            </div>
            <p className="text-xs leading-5 text-slate-700">
              {answer || "No answer available."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}