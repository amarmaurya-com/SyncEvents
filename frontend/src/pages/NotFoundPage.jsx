import React from "react";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* Decorative Background Elements */}
      <div style={styles.bgDots} />
      <div style={styles.bgGlowTop} />
      <div style={styles.bgGlowBottom} />

      <div style={styles.contentWrapper}>
        <div style={styles.card}>
          <div style={styles.topAccent} />

          <div style={styles.cardInner}>
            {/* System Badge */}
            <div style={styles.badgeWrap}>
              <div style={styles.systemBadge}>
                <svg
                  style={styles.systemIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 14v7"
                  />
                </svg>
              </div>
            </div>

            {/* 404 Graphic */}
            <div style={styles.errorCodeWrap}>
              <h1 style={styles.errorCode}>404</h1>
              <div style={styles.errorIcon} className="floating-icon">
                🔍
              </div>
            </div>

            <h2 style={styles.title}>Page Not Found</h2>
            <p style={styles.subtitle}>
              Oops! The page you are looking for seems to have vanished. It
              might have been moved, renamed, or temporarily unavailable.
            </p>

            <div style={styles.actions}>
              <a href="/frontend/public" style={styles.primaryBtn} className="primary-btn">
                ← Return to Home
              </a>
              <a
                href="/login"
                style={styles.secondaryBtn}
                className="secondary-btn"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p style={styles.footerText}>
          SMART Event Manager · SMS Varanasi · Tech Marathon 12
        </p>
      </div>
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = {
  container: {
    fontFamily: "'Syne', 'Segoe UI', sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    position: "relative",
    overflow: "hidden",
  },
  bgDots: {
    position: "absolute",
    inset: 0,
    opacity: 0.5,
    backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    zIndex: 0,
  },
  bgGlowTop: {
    position: "absolute",
    top: "-10%",
    left: "10%",
    width: "600px",
    height: "600px",
    backgroundColor: "#dbeafe", // blue-100
    opacity: 0.6,
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  bgGlowBottom: {
    position: "absolute",
    bottom: "10%",
    right: "-10%",
    width: "500px",
    height: "500px",
    backgroundColor: "#ede9fe", // indigo-100
    opacity: 0.6,
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  contentWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
    overflow: "hidden",
  },
  topAccent: {
    height: "6px",
    width: "100%",
    background: "linear-gradient(to right, #3b82f6, #6366f1, #8b5cf6)", // blue to indigo to violet
  },
  cardInner: {
    padding: "48px 32px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  badgeWrap: {
    marginBottom: "24px",
  },
  systemBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #3b82f6, #4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
  },
  systemIcon: {
    color: "#ffffff",
    width: "24px",
    height: "24px",
  },
  errorCodeWrap: {
    position: "relative",
    marginBottom: "16px",
  },
  errorCode: {
    fontSize: "120px",
    fontWeight: 800,
    lineHeight: 1,
    margin: 0,
    background: "linear-gradient(to bottom right, #cbd5e1, #94a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-4px",
  },
  errorIcon: {
    position: "absolute",
    bottom: "20%",
    right: "-10%",
    fontSize: "40px",
  },
  title: {
    margin: "0 0 12px 0",
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "0 0 32px 0",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  actions: {
    display: "flex",
    gap: "12px",
    width: "100%",
    flexDirection: "column",
  },
  primaryBtn: {
    textDecoration: "none",
    background: "linear-gradient(to right, #7c3aed, #4f46e5)",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "15px",
    padding: "14px 28px",
    borderRadius: "10px",
    boxShadow: "0 8px 20px rgba(124, 58, 237, 0.25)",
    transition: "all 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  secondaryBtn: {
    textDecoration: "none",
    background: "transparent",
    border: "1px solid #cbd5e1",
    color: "#475569",
    fontWeight: 700,
    fontSize: "15px",
    padding: "14px 28px",
    borderRadius: "10px",
    transition: "all 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  footerText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "12px",
    letterSpacing: "0.02em",
    marginTop: "24px",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
  
  .primary-btn:hover {
    background: linear-gradient(to right, #6d28d9, #4338ca) !important;
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(124, 58, 237, 0.3) !important;
  }
  
  .secondary-btn:hover {
    background: #f1f5f9 !important;
    border-color: #94a3b8 !important;
    color: #0f172a !important;
  }

  .floating-icon {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
`;
