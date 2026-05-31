import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Award,
  BarChart3,
  ShieldCheck,
  Zap,
  ChevronRight,
  PlayCircle,
  LayoutDashboard,
  CheckCircle2,
  Globe,
} from "lucide-react";

export default function SmartLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");

  // Handle scroll for sticky navbar glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={styles.wrapper}>
      <style>{css}</style>

      {/* --- NAVBAR --- */}
      <nav
        style={{ ...styles.navbar, ...(scrolled ? styles.navbarScrolled : {}) }}
      >
        <div style={styles.navContainer}>
          <div style={styles.brand}>
            <div style={styles.logoBox}>
              <LayoutDashboard size={20} color="#fff" />
            </div>
            <span style={styles.brandText}>SMART</span>
          </div>

          <div style={styles.navLinksDesktop} className="nav-links-desktop">
            <a href="#features" style={styles.navLink}>
              Features
            </a>
            <a href="#how-it-works" style={styles.navLink}>
              How it Works
            </a>
            <a href="#testimonials" style={styles.navLink}>
              Institutions
            </a>
          </div>

          <div style={styles.navActions}>
            <a href="/login" style={styles.loginBtn}>
              Sign In
            </a>
            <a href="/register" style={styles.registerBtn} className="glow-btn">
              Get Started <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={styles.hero}>
        {/* Animated Background Elements */}
        <div style={styles.heroBgMedia}>
          {/* Subtle abstract tech video background (muted, looping, darkened) */}
          <video
            autoPlay
            loop
            muted
            playsInline
            style={styles.bgVideo}
            poster="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80"
          >
            <source
              src="https://cdn.pixabay.com/video/2020/05/25/40134-424785461_large.mp4"
              type="video/mp4"
            />
          </video>
          <div style={styles.videoOverlay} />
        </div>

        {/* Floating gradient meshes */}
        <div style={styles.meshOne} className="animate-float-slow" />
        <div style={styles.meshTwo} className="animate-float-delayed" />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge} className="animate-fade-up">
            <Zap size={14} color="#7c3aed" />
            <span>Tech Marathon 12 Edition Available Now</span>
          </div>

          <h1 style={styles.heroTitle} className="animate-fade-up stagger-1">
            The Future of <br />
            <span style={styles.gradientText}>Academic Events.</span>
          </h1>

          <p style={styles.heroSubtitle} className="animate-fade-up stagger-2">
            A complete ecosystem for institutions to organize hackathons,
            cultural fests, and academic meets. Manage teams, track analytics,
            and automate certificates effortlessly.
          </p>

          <div
            style={styles.heroButtons}
            className="animate-fade-up stagger-3 heroActions"
          >
            <a
              href="/register"
              style={styles.heroPrimaryBtn}
              className="glow-btn hover-scale"
            >
              Register as Participant
            </a>
            <a
              href="/login"
              style={styles.heroSecondaryBtn}
              className="hover-scale"
            >
              <PlayCircle size={20} />
              See How It Works
            </a>
          </div>
        </div>

        {/* Abstract Floating UI Mockups */}
        <div
          style={styles.heroMockupContainer}
          className="animate-fade-up stagger-4"
        >
          <div style={styles.mockupGlassCard} className="animate-float">
            <div style={styles.mockupHeader}>
              <div style={styles.mockupDots}>
                <span style={{ ...styles.dot, background: "#ef4444" }} />
                <span style={{ ...styles.dot, background: "#eab308" }} />
                <span style={{ ...styles.dot, background: "#22c55e" }} />
              </div>
              <span style={styles.mockupTitle}>Dashboard Overview</span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
              alt="Dashboard Mockup"
              style={styles.mockupImg}
            />

            {/* Floating mini-cards over the mockup */}
            <div
              style={styles.floatingMiniCard1}
              className="animate-float-delayed"
            >
              <Award size={24} color="#d97706" />
              <div>
                <p style={styles.miniCardTitle}>Certificate Generated</p>
                <p style={styles.miniCardSub}>Arjun Sharma - 1st Place</p>
              </div>
            </div>

            <div
              style={styles.floatingMiniCard2}
              className="animate-float-fast"
            >
              <Users size={24} color="#3b82f6" />
              <div>
                <p style={styles.miniCardTitle}>New Team Enrolled</p>
                <p style={styles.miniCardSub}>ByteForce • 4 Members</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- LOGO STRIP --- */}
      <div style={styles.logoStrip}>
        <p style={styles.logoStripText}>TRUSTED BY TOP ACADEMIC INSTITUTIONS</p>
        <div style={styles.logos}>
          <span style={styles.instLogo}>
            <Globe size={24} /> SMS Varanasi
          </span>
          <span style={styles.instLogo}>
            <Globe size={24} /> IIT BHU
          </span>
          <span style={styles.instLogo}>
            <Globe size={24} /> IET Lucknow
          </span>
          <span style={styles.instLogo}>
            <Globe size={24} /> Delhi University
          </span>
        </div>
      </div>

      {/* --- INTERACTIVE BENTO GRID FEATURES --- */}
      <section style={styles.section} id="features">
        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>
            Everything you need. <br />
            Nothing you don't.
          </h2>
          <p style={styles.p}>
            A powerful, flexible platform designed specifically for the unique
            needs of university events.
          </p>
        </div>

        <div style={styles.bentoGrid} className="features-grid">
          {/* Bento Item 1: Large Image Feature */}
          <div
            style={{ ...styles.bentoItem, ...styles.bentoLarge }}
            className="bento-hover bentoLarge"
          >
            <div style={styles.bentoContent}>
              <div style={styles.bentoIcon}>
                <Award color="#7c3aed" size={24} />
              </div>
              <h3 style={styles.bentoTitle}>Automated Certificate Engine</h3>
              <p style={styles.bentoDesc}>
                Select winners, click generate, and let the system create
                hundreds of customized PDFs with dynamic watermarks, signatures,
                and ranks instantly.
              </p>
            </div>
            <div style={styles.bentoImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                alt="Students celebrating"
                style={styles.bentoImg}
              />
            </div>
          </div>

          {/* Bento Item 2: Analytics */}
          <div style={styles.bentoItem} className="bento-hover">
            <div style={styles.bentoContent}>
              <div style={styles.bentoIcon}>
                <BarChart3 color="#3b82f6" size={24} />
              </div>
              <h3 style={styles.bentoTitle}>Real-Time Analytics</h3>
              <p style={styles.bentoDesc}>
                Watch registrations pour in. Track gender ratios,
                cross-institution participation, and team validation statuses
                via beautiful charts.
              </p>
            </div>
            <div style={styles.bentoAbstractGraphics}>
              <div style={styles.chartBar1} className="grow-up-1" />
              <div style={styles.chartBar2} className="grow-up-2" />
              <div style={styles.chartBar3} className="grow-up-3" />
              <div style={styles.chartBar4} className="grow-up-4" />
            </div>
          </div>

          {/* Bento Item 3: Rules */}
          <div style={styles.bentoItem} className="bento-hover">
            <div style={styles.bentoContent}>
              <div style={styles.bentoIcon}>
                <ShieldCheck color="#16a34a" size={24} />
              </div>
              <h3 style={styles.bentoTitle}>Smart Constraints</h3>
              <p style={styles.bentoDesc}>
                Enforce minimum team sizes or specific gender requirements
                (e.g., "At least 1 female per team"). The system validates it
                automatically.
              </p>
            </div>
            <div style={styles.validationList}>
              <div style={styles.valItem}>
                <CheckCircle2 size={16} color="#16a34a" /> Team Size: 3-5
              </div>
              <div style={styles.valItem}>
                <CheckCircle2 size={16} color="#16a34a" /> Min 1 Female
              </div>
              <div style={styles.valItem}>
                <CheckCircle2 size={16} color="#16a34a" /> ID Verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE TABS SECTION --- */}
      <section
        style={{ ...styles.section, background: "#ffffff" }}
        id="how-it-works"
      >
        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>Two perspectives. One platform.</h2>
        </div>

        <div style={styles.tabContainer}>
          <div style={styles.tabHeader}>
            <button
              style={{
                ...styles.tabBtn,
                ...(activeTab === "participants" ? styles.tabBtnActive : {}),
              }}
              onClick={() => setActiveTab("participants")}
            >
              For Participants
            </button>
            <button
              style={{
                ...styles.tabBtn,
                ...(activeTab === "coordinators" ? styles.tabBtnActive : {}),
              }}
              onClick={() => setActiveTab("coordinators")}
            >
              For Coordinators
            </button>
          </div>

          <div style={styles.tabContent}>
            {activeTab === "participants" ? (
              <div style={styles.tabGrid} className="animate-fade-in tabGrid">
                <div style={styles.tabText} className="tabText">
                  <h3 style={styles.tabTitle}>
                    Your academic journey, tracked.
                  </h3>
                  <ul style={styles.featureList}>
                    <li style={styles.featureListItem}>
                      <CheckCircle2 size={20} color="#7c3aed" />{" "}
                      <span>
                        Browse and enroll in technical, cultural, and sports
                        events.
                      </span>
                    </li>
                    <li style={styles.featureListItem}>
                      <CheckCircle2 size={20} color="#7c3aed" />{" "}
                      <span>
                        Form teams and invite members from different
                        institutions.
                      </span>
                    </li>
                    <li style={styles.featureListItem}>
                      <CheckCircle2 size={20} color="#7c3aed" />{" "}
                      <span>
                        Download participation and achievement certificates
                        instantly.
                      </span>
                    </li>
                  </ul>
                  <a href="/register" style={styles.tabLink}>
                    Create Participant Account →
                  </a>
                </div>
                <div style={styles.tabImageWrap}>
                  <img
                    src="https://images.unsplash.com/photo-1560298803-1d998f6b5249?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Participants"
                    style={styles.tabImg}
                  />
                </div>
              </div>
            ) : (
              <div style={styles.tabGrid} className="animate-fade-in tabGrid">
                <div style={styles.tabText} className="tabText">
                  <h3 style={styles.tabTitle}>
                    Absolute control over your events.
                  </h3>
                  <ul style={styles.featureList}>
                    <li style={styles.featureListItem}>
                      <CheckCircle2 size={20} color="#3b82f6" />{" "}
                      <span>
                        Configure event dates, venues, capacities, and rules
                        easily.
                      </span>
                    </li>
                    <li style={styles.featureListItem}>
                      <CheckCircle2 size={20} color="#3b82f6" />{" "}
                      <span>
                        Monitor live registration trends and participant
                        demographics.
                      </span>
                    </li>
                    <li style={styles.featureListItem}>
                      <CheckCircle2 size={20} color="#3b82f6" />{" "}
                      <span>
                        Select winners via an intuitive podium UI and generate
                        certs.
                      </span>
                    </li>
                  </ul>
                  <a
                    href="/login"
                    style={{ ...styles.tabLink, color: "#3b82f6" }}
                  >
                    Login to Dashboard →
                  </a>
                </div>
                <div style={styles.tabImageWrap}>
                  <img
                    src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80"
                    alt="Coordinators"
                    style={styles.tabImg}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaBgGlow} />
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to transform your next event?</h2>
          <p style={styles.ctaText}>
            Join thousands of students and coordinators who trust SMART Event
            Manager.
          </p>
          <div style={styles.ctaButtons}>
            <a
              href="/register"
              style={styles.ctaPrimaryBtn}
              className="glow-btn hover-scale"
            >
              Get Started Now
            </a>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.footerBrand}>
            <div style={styles.logoBox}>
              <LayoutDashboard size={20} color="#fff" />
            </div>
            <span style={styles.brandText}>SMART</span>
          </div>
          <div style={styles.footerLinks}>
            <a href="#features" style={styles.fLink} className="fLink">
              Features
            </a>
            <a href="#privacy" style={styles.fLink} className="fLink">
              Privacy Policy
            </a>
            <a href="#terms" style={styles.fLink} className="fLink">
              Terms of Service
            </a>
            <a href="/login" style={styles.fLink} className="fLink">
              Coordinator Login
            </a>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>
            © 2026 SMART Event Manager. Built for SMS Varanasi · Tech Marathon
            12.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = {
  wrapper: {
    fontFamily: "'Syne', 'Segoe UI', sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
  },

  /* --- Backgrounds --- */
  bgDots: {
    position: "absolute",
    inset: 0,
    opacity: 0.5,
    backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    zIndex: 0,
    pointerEvents: "none",
  },
  bgGlowTop: {
    position: "absolute",
    top: "-10%",
    left: "-10%",
    width: "50vw",
    height: "50vw",
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    borderRadius: "50%",
    filter: "blur(100px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  bgGlowBottom: {
    position: "absolute",
    bottom: "20%",
    right: "-10%",
    width: "40vw",
    height: "40vw",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRadius: "50%",
    filter: "blur(100px)",
    pointerEvents: "none",
    zIndex: 0,
  },

  /* --- Navbar --- */
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: "all 0.3s ease",
    padding: "20px 0",
  },
  navbarScrolled: {
    padding: "12px 0",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  navContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  logoBox: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(124, 58, 237, 0.3)",
  },
  brandText: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  navLinksDesktop: { display: "flex", gap: "32px" },
  navLink: {
    textDecoration: "none",
    color: "#64748b",
    fontWeight: 600,
    fontSize: "14px",
    transition: "color 0.2s",
  },
  navActions: { display: "flex", alignItems: "center", gap: "16px" },
  loginBtn: {
    textDecoration: "none",
    color: "#475569",
    fontWeight: 700,
    fontSize: "14px",
  },
  registerBtn: {
    textDecoration: "none",
    background: "#0f172a",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "99px",
    fontSize: "14px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.3s",
  },

  /* --- Hero --- */
  hero: {
    position: "relative",
    padding: "180px 24px 80px",
    minHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroBgMedia: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
    maskImage:
      "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
    WebkitMaskImage:
      "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
  },
  bgVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.08,
    pointerEvents: "none",
  },
  videoOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(248,250,252,0) 0%, #f8fafc 100%)",
  },

  meshOne: {
    position: "absolute",
    top: "20%",
    left: "20%",
    width: "40vw",
    height: "40vw",
    background:
      "radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(255,255,255,0) 70%)",
    zIndex: 1,
    pointerEvents: "none",
  },
  meshTwo: {
    position: "absolute",
    top: "40%",
    right: "10%",
    width: "50vw",
    height: "50vw",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%)",
    zIndex: 1,
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 10,
    textAlign: "center",
    maxWidth: "800px",
    margin: "0 auto",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(124, 58, 237, 0.1)",
    border: "1px solid rgba(124, 58, 237, 0.2)",
    padding: "8px 16px",
    borderRadius: "99px",
    color: "#7c3aed",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "24px",
    backdropFilter: "blur(4px)",
  },
  heroTitle: {
    fontSize: "clamp(48px, 6vw, 76px)",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.1,
    letterSpacing: "-2px",
    margin: "0 0 24px",
  },
  gradientText: {
    background: "linear-gradient(to right, #4f46e5, #9333ea, #db2777)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "clamp(16px, 2vw, 20px)",
    color: "#475569",
    lineHeight: 1.6,
    margin: "0 auto 40px",
    maxWidth: "680px",
  },
  heroButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  heroPrimaryBtn: {
    textDecoration: "none",
    background: "linear-gradient(to right, #7c3aed, #4f46e5)",
    color: "#fff",
    padding: "16px 32px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 700,
    boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)",
    display: "inline-block",
  },
  heroSecondaryBtn: {
    textDecoration: "none",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    padding: "16px 32px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  /* --- Hero Mockup --- */
  heroMockupContainer: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    maxWidth: "1000px",
    margin: "60px auto 0",
    perspective: "1000px",
  },
  mockupGlassCard: {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "24px",
    padding: "16px",
    boxShadow: "0 30px 60px -15px rgba(0,0,0,0.1)",
    position: "relative",
    transform: "rotateX(2deg) rotateY(0deg)",
    transformStyle: "preserve-3d",
  },
  mockupHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    padding: "0 8px",
  },
  mockupDots: { display: "flex", gap: "6px" },
  dot: { width: "12px", height: "12px", borderRadius: "50%" },
  mockupTitle: { fontSize: "13px", fontWeight: 600, color: "#94a3b8" },
  mockupImg: {
    width: "100%",
    height: "auto",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    display: "block",
  },

  floatingMiniCard1: {
    position: "absolute",
    top: "20%",
    left: "-40px",
    background: "#ffffff",
    padding: "16px",
    borderRadius: "16px",
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    transform: "translateZ(50px)",
  },
  floatingMiniCard2: {
    position: "absolute",
    bottom: "15%",
    right: "-30px",
    background: "#ffffff",
    padding: "16px",
    borderRadius: "16px",
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    transform: "translateZ(70px)",
  },
  miniCardTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
  },
  miniCardSub: { margin: "4px 0 0", fontSize: "12px", color: "#64748b" },

  /* --- Logo Strip --- */
  logoStrip: {
    padding: "60px 24px",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
    position: "relative",
    zIndex: 10,
  },
  logoStripText: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: "2px",
    marginBottom: "24px",
  },
  logos: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    flexWrap: "wrap",
    opacity: 0.6,
  },
  instLogo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "20px",
    fontWeight: 800,
    color: "#475569",
  },

  /* --- Sections --- */
  section: {
    padding: "100px 24px",
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
    zIndex: 10,
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "60px",
    maxWidth: "600px",
    margin: "0 auto 60px",
  },
  h2: {
    fontSize: "40px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-1px",
    lineHeight: 1.1,
    margin: "0 0 16px",
  },
  p: { fontSize: "18px", color: "#64748b", lineHeight: 1.6, margin: 0 },

  /* --- Bento Grid --- */
  bentoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  bentoItem: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
  },
  bentoLarge: {
    gridColumn: "1 / -1",
    flexDirection: "row",
    alignItems: "center",
    gap: "40px",
  },
  bentoContent: { flex: 1, position: "relative", zIndex: 2 },
  bentoIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
  },
  bentoTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 12px",
    letterSpacing: "-0.5px",
  },
  bentoDesc: { fontSize: "15px", color: "#64748b", lineHeight: 1.6, margin: 0 },

  bentoImageWrap: {
    flex: 1,
    borderRadius: "16px",
    overflow: "hidden",
    height: "300px",
  },
  bentoImg: { width: "100%", height: "100%", objectFit: "cover" },

  bentoAbstractGraphics: {
    marginTop: "32px",
    height: "120px",
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
  },
  chartBar1: { flex: 1, background: "#cbd5e1", borderRadius: "6px 6px 0 0" },
  chartBar2: { flex: 1, background: "#94a3b8", borderRadius: "6px 6px 0 0" },
  chartBar3: { flex: 1, background: "#3b82f6", borderRadius: "6px 6px 0 0" },
  chartBar4: { flex: 1, background: "#7c3aed", borderRadius: "6px 6px 0 0" },

  validationList: {
    marginTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
  },
  valItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#334155",
  },

  /* --- Tabs Section --- */
  tabContainer: {
    background: "#f8fafc",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    padding: "8px",
    overflow: "hidden",
  },
  tabHeader: {
    display: "flex",
    gap: "8px",
    background: "#ffffff",
    padding: "8px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    marginBottom: "24px",
    width: "fit-content",
    margin: "0 auto 32px",
  },
  tabBtn: {
    padding: "12px 24px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#64748b",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    background: "#0f172a",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  tabContent: { padding: "0 32px 32px" },
  tabGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "48px",
    alignItems: "center",
  },
  tabText: { paddingRight: "20px" },
  tabTitle: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-1px",
    lineHeight: 1.1,
    margin: "0 0 24px",
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 32px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  featureListItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "16px",
    color: "#475569",
    lineHeight: 1.5,
  },
  tabLink: {
    textDecoration: "none",
    color: "#7c3aed",
    fontWeight: 700,
    fontSize: "16px",
    display: "inline-block",
    transition: "transform 0.2s",
  },
  tabImageWrap: {
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
    border: "4px solid #fff",
  },
  tabImg: {
    width: "100%",
    height: "auto",
    display: "block",
    aspectRatio: "4/3",
    objectFit: "cover",
  },

  /* --- CTA Section --- */
  ctaSection: {
    position: "relative",
    padding: "120px 24px",
    textAlign: "center",
    background: "#0f172a",
    overflow: "hidden",
    marginTop: "40px",
  },
  ctaBgGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(15,23,42,1) 60%)",
    pointerEvents: "none",
  },
  ctaContent: {
    position: "relative",
    zIndex: 10,
    maxWidth: "600px",
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "48px",
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-1px",
    margin: "0 0 20px",
  },
  ctaText: { fontSize: "18px", color: "#94a3b8", margin: "0 0 40px" },
  ctaButtons: { display: "flex", justifyContent: "center" },
  ctaPrimaryBtn: {
    textDecoration: "none",
    background: "#ffffff",
    color: "#0f172a",
    padding: "16px 36px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 800,
    display: "inline-block",
  },

  /* --- Footer --- */
  footer: {
    background: "#ffffff",
    padding: "60px 24px 40px",
    borderTop: "1px solid #e2e8f0",
    zIndex: 10,
  },
  footerTop: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "24px",
    marginBottom: "40px",
  },
  footerBrand: { display: "flex", alignItems: "center", gap: "10px" },
  footerLinks: { display: "flex", gap: "24px", flexWrap: "wrap" },
  fLink: {
    textDecoration: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
    transition: "color 0.2s",
  },
  footerBottom: {
    maxWidth: "1200px",
    margin: "0 auto",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "24px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
  },
};

const css = `

  html { scroll-behavior: smooth; }

  .hover-scale { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .hover-scale:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.1); }
  
  .nav-link:hover, .fLink:hover { color: #7c3aed !important; }

  .bento-hover { transition: all 0.3s ease; }
  .bento-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -10px rgba(124, 58, 237, 0.1); border-color: #c4b5fd !important; }

  /* Animations */
  @keyframes float {
    0% { transform: translateY(0px) rotateX(2deg); }
    50% { transform: translateY(-15px) rotateX(4deg); }
    100% { transform: translateY(0px) rotateX(2deg); }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
  
  @keyframes floatDelayed {
    0% { transform: translateZ(50px) translateY(0px); }
    50% { transform: translateZ(50px) translateY(-10px); }
    100% { transform: translateZ(50px) translateY(0px); }
  }
  .animate-float-delayed { animation: floatDelayed 5s ease-in-out infinite; animation-delay: 1s; }
  
  @keyframes floatFast {
    0% { transform: translateZ(70px) translateY(0px); }
    50% { transform: translateZ(70px) translateY(-8px); }
    100% { transform: translateZ(70px) translateY(0px); }
  }
  .animate-float-fast { animation: floatFast 4s ease-in-out infinite; animation-delay: 0.5s; }

  @keyframes floatSlow {
    0% { transform: translate(0, 0); }
    50% { transform: translate(30px, 30px); }
    100% { transform: translate(0, 0); }
  }
  .animate-float-slow { animation: floatSlow 15s ease-in-out infinite; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

  @keyframes growUp {
    from { height: 0%; }
    to { height: var(--h); }
  }
  .grow-up-1 { --h: 40%; animation: growUp 1s ease-out forwards; }
  .grow-up-2 { --h: 65%; animation: growUp 1s ease-out 0.2s forwards; height: 0; }
  .grow-up-3 { --h: 100%; animation: growUp 1s ease-out 0.4s forwards; height: 0; }
  .grow-up-4 { --h: 80%; animation: growUp 1s ease-out 0.6s forwards; height: 0; }

  /* Media Queries */
  @media (max-width: 900px) {
    .bentoLarge { flex-direction: column !important; align-items: stretch !important; }
    .tabGrid { grid-template-columns: 1fr !important; gap: 32px !important; }
    .tabText { padding-right: 0 !important; }
  }
  @media (max-width: 768px) {
    .nav-links-desktop { display: none !important; }
    .features-grid { grid-template-columns: 1fr !important; }
    .heroActions { flex-direction: column; width: 100%; }
    .heroActions > a { width: 100%; box-sizing: border-box; }
  }
`;