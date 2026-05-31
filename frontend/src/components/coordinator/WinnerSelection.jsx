const podium = [
  { rank: 1, label: "1st Place" },
  { rank: 2, label: "2nd Place" },
  { rank: 3, label: "3rd Place" },
];

const normalizeCandidates = (participationType, registrations, teams) => {
  if (participationType === "team") {
    return teams
      .filter((team) => team.status === "participated")
      .map((team) => ({
        id: team._id,
        name: team.teamName,
        subtitle: `${team.members.length} members • ${team.leaderId?.name || "Leader"}`,
        rank: team.isWinner ? team.rank : null,
      }));
  }

  return registrations
    .filter((registration) => registration.status === "participated")
    .map((registration) => ({
      id: registration.participantId?._id,
      name: registration.participantId?.name || "Participant",
      subtitle: registration.participantId?.studentId || registration.participantId?.email || "-",
      rank: registration.isWinner ? registration.rank : null,
    }));
};

export default function WinnerSelection({
  eventName,
  participationType,
  registrations = [],
  teams = [],
  winners,
  onAssignWinner,
  onClearWinner,
  actionLoading = false,
}) {
  const candidates = normalizeCandidates(participationType, registrations, teams);

  const currentWinnerForRank = (rank) => {
    if (participationType === "team") {
      const winner = winners?.teamWinners?.find((item) => item.rank === rank);
      return winner
        ? {
            id: winner._id,
            entityId: winner._id,
            label: winner.teamName,
          }
        : null;
    }

    const winner = winners?.participantWinners?.find((item) => item.rank === rank);
    return winner
      ? {
          id: winner.participantId?._id,
          entityId: winner.participantId?._id,
          label: winner.participantId?.name,
        }
      : null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Winner Selection</h2>
        <p className="text-sm text-slate-500">
          Declare podium winners for {eventName}. Only participated{" "}
          {participationType === "team" ? "teams" : "participants"} are shown here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {podium.map((slot) => {
          const winner = currentWinnerForRank(slot.rank);

          return (
            <div
              key={slot.rank}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                Rank {slot.rank}
              </div>
              <div className="mt-2 text-lg font-bold text-slate-900">{slot.label}</div>
              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">
                  {winner?.label || "Not assigned"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {winner ? "Winner selected" : "No winner assigned yet"}
                </div>
              </div>
              {winner ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => onClearWinner?.(winner.entityId)}
                  className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  Clear Rank
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-1 text-lg font-bold text-slate-900">
          Eligible {participationType === "team" ? "Teams" : "Participants"}
        </div>
        <div className="mb-4 text-sm text-slate-500">
          Assign ranks directly from the eligible list below.
        </div>
        {candidates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
            No participated {participationType === "team" ? "teams" : "participants"} yet.
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">{candidate.name}</div>
                  <div className="text-xs text-slate-500">{candidate.subtitle}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.rank ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Current: {candidate.rank} place
                    </span>
                  ) : null}
                  {podium.map((slot) => (
                    <button
                      key={slot.rank}
                      type="button"
                      disabled={actionLoading}
                      onClick={() => onAssignWinner?.(candidate.id, slot.rank)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      Assign {slot.rank}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
