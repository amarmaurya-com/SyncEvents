import { useState } from "react";

export default function CertificateGenerator({
  eventName,
  certificateAnalytics,
  onGenerateParticipation,
  onGenerateAchievement,
  actionLoading = false,
}) {
  const [lastResult, setLastResult] = useState(null);

  if (!certificateAnalytics) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
        Select an event to manage certificates.
      </div>
    );
  }

  const summary = certificateAnalytics.summary || {};
  const certificateBreakdown = Array.isArray(certificateAnalytics.breakdown)
    ? certificateAnalytics.breakdown
    : [];

  const cards = [
    {
      label: "Participation Eligible",
      value: summary.eligible?.participation || 0,
      tone: "text-violet-700",
      bg: "bg-violet-50",
    },
    {
      label: "Participation Pending",
      value: summary.pending?.participation || 0,
      tone: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Achievement Eligible",
      value: summary.eligible?.achievement || 0,
      tone: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Achievement Pending",
      value: summary.pending?.achievement || 0,
      tone: "text-rose-700",
      bg: "bg-rose-50",
    },
  ];

  const handleGenerateParticipation = async () => {
    setLastResult(null);
    const result = await onGenerateParticipation();

    if (result) {
      setLastResult({
        type: "participation",
        ...result,
      });
    }
  };

  const handleGenerateAchievement = async () => {
    setLastResult(null);
    const result = await onGenerateAchievement();

    if (result) {
      setLastResult({
        type: "achievement",
        ...result,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Certificate Generator</h2>
        <p className="text-sm text-slate-500">
          Generate participation and achievement certificates for {eventName}.
        </p>
      </div>

      {lastResult ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            lastResult.createdCount > 0
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          <div className="font-semibold">
            {lastResult.type === "participation" ? "Participation" : "Achievement"} Certificate
            Generation Complete
          </div>
          <div className="mt-1 text-xs">
            {"\u2713"} {lastResult.createdCount} new certificate(s) generated
            {lastResult.skippedCount > 0 ? ` | ${lastResult.skippedCount} already existed` : ""}
            {lastResult.totalEligible > 0 ? ` | ${lastResult.totalEligible} total eligible` : ""}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-3xl border border-slate-200 p-5 shadow-sm ${card.bg}`}
          >
            <div className={`text-3xl font-bold ${card.tone}`}>{card.value}</div>
            <div className="mt-2 text-sm font-semibold text-slate-800">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-violet-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">Participation Certificates</span>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
              All Participants
            </span>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            Generated for all participants or team members marked as "participated" in the event.
          </p>
          <div className="mb-6 rounded-2xl bg-violet-50 px-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-violet-600">Generated</div>
                <div className="text-2xl font-bold text-violet-700">
                  {summary.generated?.participation || 0}
                </div>
              </div>
              <div>
                <div className="text-violet-600">Pending</div>
                <div className="text-2xl font-bold text-amber-600">
                  {summary.pending?.participation || 0}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={actionLoading || (summary.pending?.participation || 0) === 0}
            onClick={handleGenerateParticipation}
            className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading ? "Generating..." : "Generate Participation Certificates"}
          </button>
          {(summary.pending?.participation || 0) === 0 ? (
            <p className="mt-2 text-center text-xs text-slate-500">
              All eligible participants have certificates
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">Achievement Certificates</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              Winners Only
            </span>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            Generated only for 1st, 2nd, and 3rd place winners who participated in the event.
          </p>
          <div className="mb-6 rounded-2xl bg-emerald-50 px-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-emerald-600">Generated</div>
                <div className="text-2xl font-bold text-emerald-700">
                  {summary.generated?.achievement || 0}
                </div>
              </div>
              <div>
                <div className="text-emerald-600">Pending</div>
                <div className="text-2xl font-bold text-amber-600">
                  {summary.pending?.achievement || 0}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={actionLoading || (summary.pending?.achievement || 0) === 0}
            onClick={handleGenerateAchievement}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading ? "Generating..." : "Generate Achievement Certificates"}
          </button>
          {(summary.pending?.achievement || 0) === 0 ? (
            <p className="mt-2 text-center text-xs text-slate-500">
              All eligible winners have certificates
            </p>
          ) : null}
        </div>
      </div>

      {certificateBreakdown.length > 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-lg font-bold text-slate-900">Certificate Breakdown</div>
          <div className="grid gap-4 md:grid-cols-2">
            {certificateBreakdown.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="text-sm font-semibold text-slate-700">{item.name}</div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500">Eligible</div>
                    <div className="text-2xl font-bold text-slate-900">{item.eligible || 0}</div>
                  </div>
                  <div>
                    <div className="text-emerald-600">Generated</div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {item.generated || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-amber-600">Pending</div>
                    <div className="text-2xl font-bold text-amber-700">{item.pending || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-lg font-bold text-slate-900">Recent Certificate Activity</div>
        {(certificateAnalytics.recentCertificates || []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
            No certificates generated for this event yet.
          </div>
        ) : (
          <div className="space-y-3">
            {certificateAnalytics.recentCertificates.map((certificate) => (
              <div
                key={certificate._id}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-slate-900">
                      {certificate.participantId?.name || "Participant"}
                    </div>
                    {certificate.certificateType === "achievement" && certificate.rank ? (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        {certificate.rank === 1
                          ? "1st"
                          : certificate.rank === 2
                            ? "2nd"
                            : certificate.rank === 3
                              ? "3rd"
                              : `Rank ${certificate.rank}`}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        certificate.certificateType === "achievement"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-violet-100 text-violet-700"
                      }`}
                    >
                      {certificate.certificateType === "achievement"
                        ? "Achievement"
                        : "Participation"}
                    </span>
                    <span>|</span>
                    <span className="font-mono">{certificate.certificateNumber}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(certificate.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
