import React from "react";

export default function Home() {
  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* Decorative Background Elements */}
      <div style={styles.bgDots} />
      <div style={styles.bgGlowTop} />
      <div style={styles.bgGlowBottom} />

      <div style={styles.contentWrapper}>
        {/* Navigation Bar */}
        <nav style={styles.navbar}>
          <div style={styles.brand}>
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
            <span style={styles.brandText}>SMART Event Manager</span>
          </div>
          <div style={styles.navLinks}>
            <a href="/login" style={styles.navLinkLogin} className="nav-link">
              Sign In
            </a>
            <a
              href="/register"
              style={styles.navLinkRegister}
              className="nav-btn"
            >
              Get Started
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <header style={styles.heroSection}>
          <div style={styles.heroBadge}>
            ✨ Academic Event Management, Simplified
          </div>
          <h1 style={styles.heroTitle}>
            Manage events with <br />
            <span style={styles.heroTitleHighlight}>Intelligence & Ease</span>
          </h1>
          <p style={styles.heroSubtitle}>
            The all-in-one platform for institutions to organize hackathons,
            cultural fests, and academic meets. Seamlessly handle individual and
            team registrations, track analytics, and issue certificates.
          </p>
          <div style={styles.heroActions}>
            <a
              href="/register"
              style={styles.primaryBtn}
              className="primary-btn"
            >
              Register as Participant →
            </a>
            <a
              href="/login"
              style={styles.secondaryBtn}
              className="secondary-btn"
            >
              Coordinator Login
            </a>
          </div>
        </header>

        {/* Two-Column Grid Descriptive Sections */}
        <section style={styles.featuresSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Built for Scale & Simplicity</h2>
            <p style={styles.sectionSubtitle}>
              Everything you need to run a successful event from start to
              finish.
            </p>
          </div>

          <div style={styles.featuresGrid} className="features-grid">
            {/* Feature 1 */}
            <div style={styles.featureCard} className="feature-card">
              <div style={styles.featureIconWrap}>
                <span style={{ fontSize: 24 }}>🎯</span>
              </div>
              <h3 style={styles.featureTitle}>For Participants</h3>
              <p style={styles.featureText}>
                Easily browse upcoming institutional events, form cross-college
                teams, manage your enrollments, and download your participation
                and achievement certificates instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={styles.featureCard} className="feature-card">
              <div style={styles.featureIconWrap}>
                <span style={{ fontSize: 24 }}>⚙️</span>
              </div>
              <h3 style={styles.featureTitle}>Smart Configurations</h3>
              <p style={styles.featureText}>
                Coordinators can set strict participation rules. Enforce min/max
                team sizes, apply gender requirements (e.g., at least 1 female),
                and limit capacities with zero hassle.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={styles.featureCard} className="feature-card">
              <div style={styles.featureIconWrap}>
                <span style={{ fontSize: 24 }}>📊</span>
              </div>
              <h3 style={styles.featureTitle}>Real-time Analytics</h3>
              <p style={styles.featureText}>
                Monitor your event's success live. View demographic breakdowns,
                cross-institution participation rates, daily registration
                trends, and team validation statuses in one dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={styles.featureCard} className="feature-card">
              <div style={styles.featureIconWrap}>
                <span style={{ fontSize: 24 }}>🎓</span>
              </div>
              <h3 style={styles.featureTitle}>Automated Certificates</h3>
              <p style={styles.featureText}>
                Stop manually creating certificates. Select your winners,
                validate participants, and batch-generate highly customized PDFs
                with dynamic watermarks and ranks in a single click.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerLine} />
          <p style={styles.footerText}>
            © 2026 SMART Event Manager · SMS Varanasi · Tech Marathon 12
          </p>
        </footer>
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
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    overflowX: "hidden",
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
    maxWidth: "1100px",
    padding: "0 24px",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 0",
    marginBottom: "40px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  systemBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #3b82f6, #4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
  },
  systemIcon: {
    color: "#ffffff",
    width: "20px",
    height: "20px",
  },
  brandText: {
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  navLinkLogin: {
    textDecoration: "none",
    color: "#475569",
    fontWeight: 600,
    fontSize: "14px",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  navLinkRegister: {
    textDecoration: "none",
    background: "#7c3aed",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "14px",
    padding: "10px 20px",
    borderRadius: "8px",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
  },
  heroSection: {
    textAlign: "center",
    maxWidth: "800px",
    margin: "0 auto 80px auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heroBadge: {
    background: "rgba(124, 58, 237, 0.1)",
    color: "#7c3aed",
    border: "1px solid rgba(124, 58, 237, 0.2)",
    padding: "6px 16px",
    borderRadius: "99px",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    marginBottom: "24px",
    display: "inline-block",
  },
  heroTitle: {
    fontSize: "clamp(40px, 5vw, 64px)",
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 24px 0",
    letterSpacing: "-1px",
  },
  heroTitleHighlight: {
    background: "linear-gradient(to right, #3b82f6, #7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "clamp(16px, 2vw, 18px)",
    lineHeight: 1.6,
    color: "#64748b",
    margin: "0 0 40px 0",
    maxWidth: "600px",
  },
  heroActions: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
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
  },
  secondaryBtn: {
    textDecoration: "none",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#475569",
    fontWeight: 700,
    fontSize: "15px",
    padding: "14px 28px",
    borderRadius: "10px",
    transition: "all 0.2s",
  },
  featuresSection: {
    padding: "20px 0 80px 0",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "48px",
  },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 12px 0",
    letterSpacing: "-0.5px",
  },
  sectionSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "24px",
  },
  featureCard: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "32px",
    transition: "all 0.3s ease",
  },
  featureIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "rgba(124, 58, 237, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  featureTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 12px 0",
  },
  featureText: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.6,
    margin: 0,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: "40px",
    textAlign: "center",
  },
  footerLine: {
    height: "1px",
    width: "100%",
    background: "linear-gradient(to right, transparent, #e2e8f0, transparent)",
    marginBottom: "24px",
  },
  footerText: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: 500,
    margin: 0,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
  
  .nav-link:hover {
    background: #f1f5f9;
    color: #0f172a !important;
  }
  
  .nav-btn:hover, .primary-btn:hover {
    background: linear-gradient(to right, #6d28d9, #4338ca) !important;
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(124, 58, 237, 0.3) !important;
  }
  
  .secondary-btn:hover {
    background: #f8fafc !important;
    border-color: #94a3b8 !important;
    color: #0f172a !important;
  }
  
  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
    border-color: rgba(124, 58, 237, 0.3) !important;
    background: #ffffff !important;
  }
  
  @media (max-width: 768px) {
    .features-grid {
      grid-template-columns: 1fr !important;
    }
    .heroActions {
      flex-direction: column;
      width: 100%;
    }
    .heroActions > a {
      width: 100%;
      box-sizing: border-box;
    }
  }
`;
