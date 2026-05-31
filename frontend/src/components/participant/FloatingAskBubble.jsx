import { useEffect, useRef, useState } from "react";

import AskEventCard from "./AskEventCard.jsx";

export default function FloatingAskBubble({ events = [] }) {
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (open && wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    >
      {open && selectedEvent ? (
        <AskEventCard
          event={selectedEvent}
          events={events}
          onSelectEvent={setSelectedEvent}
          open={open}
          onClose={() => setOpen(false)}
        />
      ) : null}

      {!open ? (
        <div className="rounded-2xl border border-orange-100 bg-white px-3 py-2 text-xs font-medium text-orange-500 shadow-md">
          Ask me a question ✦
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open AI event assistant"
        style={{
          background: open
            ? "linear-gradient(135deg, #ec4899, #f97316)"
            : "linear-gradient(135deg, #f97316, #ec4899)",
          boxShadow: "0 4px 14px rgba(249,115,22,0.45)",
        }}
        className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white text-white transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 3C7 3 3 6.6 3 11c0 2.2.9 4.2 2.5 5.7L4 21l4.5-1.4C9.6 20.2 10.8 20.5 12 20.5c5 0 9-3.6 9-8s-4-9.5-9-9.5z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
            <circle cx="8.5" cy="11" r="1" fill="white"/>
            <circle cx="12" cy="11" r="1" fill="white"/>
            <circle cx="15.5" cy="11" r="1" fill="white"/>
          </svg>
        )}
      </button>
    </div>
  );
}