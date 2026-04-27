// Signs for Sleep - Practice Management App
// Stack: React (single component) + Supabase
// Replace SUPABASE_URL and SUPABASE_ANON_KEY with your actual values

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── CONFIG ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://zkesnhhduxtxinjdkbyn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZXNuaGhkdXh0eGluamRrYnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NDI3OTgsImV4cCI6MjA5MjIxODc5OH0.6yG-4vONpCxi8k_kZm4vIAtUJIV8yxk6PtcKMJKK1Ho";
const COACH_PASSWORD = "sleep2024"; // Change this via Settings inside the app
const DEFAULT_SUPPORT_DAYS = 28;
const DEFAULT_CONTACT_EVERY = 7;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── PALETTE & STYLES ───────────────────────────────────────────────────────
const C = {
  terracotta: "#C4714A",
  terracottaLight: "#F0DDD4",
  terracottaDark: "#8C4E30",
  blue: "#6B8FA8",
  blueLight: "#D6E4EE",
  blueDark: "#3D5F74",
  gold: "#C9A84C",
  goldLight: "#F2E8CC",
  cream: "#FAF7F2",
  dark: "#2C2420",
  mid: "#6B5E58",
  muted: "#9E8E88",
  white: "#FFFFFF",
  success: "#5A8A6A",
  successLight: "#D6EAD8",
  danger: "#B85450",
  dangerLight: "#F0D6D4",
  warning: "#C9A84C",
  warningLight: "#F2E8CC",
  border: "rgba(196,113,74,0.18)",
};

const font = {
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', system-ui, sans-serif",
};

const gStyle = {
  app: {
    minHeight: "100vh",
    background: C.cream,
    fontFamily: font.body,
    color: C.dark,
  },
  card: {
    background: C.white,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    padding: "24px",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontFamily: font.body,
    fontSize: 14,
    background: C.white,
    color: C.dark,
    outline: "none",
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: C.mid,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  btnPrimary: {
    background: C.terracotta,
    color: C.white,
    border: "none",
    borderRadius: 10,
    padding: "12px 24px",
    fontFamily: font.body,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },
  btnSecondary: {
    background: "transparent",
    color: C.terracotta,
    border: `1.5px solid ${C.terracotta}`,
    borderRadius: 10,
    padding: "10px 20px",
    fontFamily: font.body,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnGold: {
    background: C.gold,
    color: C.white,
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontFamily: font.body,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDanger: {
    background: "transparent",
    color: C.danger,
    border: `1.5px solid ${C.danger}`,
    borderRadius: 10,
    padding: "8px 16px",
    fontFamily: font.body,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  header: {
    background: C.white,
    borderBottom: `1px solid ${C.border}`,
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: font.display,
    fontSize: 22,
    color: C.terracotta,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  logoSub: {
    fontSize: 10,
    color: C.gold,
    fontWeight: 600,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    display: "block",
  },
  tag: (color, bg) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    color,
    background: bg,
  }),
};

// ── HELPERS ────────────────────────────────────────────────────────────────
const toMin = (h, m) => parseInt(h || 0) * 60 + parseInt(m || 0);
const fromMin = (mins) => {
  if (mins < 0) mins += 1440;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
};
const parseTime = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};
const diffMins = (start, end) => {
  let d = end - start;
  if (d < 0) d += 1440;
  return d;
};
const fmtDuration = (mins) => {
  if (!mins && mins !== 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};
const today = () => new Date().toISOString().split("T")[0];
const daysBetween = (a, b) =>
  Math.floor((new Date(b) - new Date(a)) / 86400000);

// ── INTAKE QUESTIONS ───────────────────────────────────────────────────────
const PRONOUNS = ["She/her", "They/them", "He/him", "Prefer not to say"];

const PM_TIMES = Array.from({ length: 24 }, (_, i) => {
  const h = Math.floor(i / 2) + 12 > 12 ? Math.floor(i / 2) + 12 - 12 : Math.floor(i / 2) + 12;
  const m = i % 2 === 0 ? "00" : "30";
  const ampm = Math.floor(i / 2) + 12 >= 12 && Math.floor(i / 2) + 12 < 24 ? "pm" : "am";
  return `${h}:${m}${ampm}`;
});
const AM_TIMES = Array.from({ length: 24 }, (_, i) => {
  const base = i + 4;
  const h = base % 12 === 0 ? 12 : base % 12;
  const ampm = base < 12 ? "am" : "pm";
  return `${h}:00${ampm}`;
});
const BEDTIMES = ["6:00pm","6:30pm","7:00pm","7:30pm","8:00pm","8:30pm","9:00pm","9:30pm","10:00pm","10:30pm","11:00pm","11:30pm","12:00am"];
const WAKETIMES = ["4:00am","4:30am","5:00am","5:30am","6:00am","6:30am","7:00am","7:30am","8:00am","8:30am","9:00am","9:30am","10:00am"];
const SLEEP_ASSOCIATIONS = ["Dummy/pacifier","Rocking","Patting","Singing","Lullaby","White/pink noise","Sleep sack","Soft toy/comforter","Feed to sleep","Contact/holding","Motion (pram/car)","Other"];
const TIRED_CUES = ["Yawning","Rubbing eyes","Red eyebrows/rimmed eyes","Irritable/fussy","Glazed eyes","Becomes clumsy","Pulling ears","Zoning out","None obvious"];

const INTAKE_SECTIONS = [
  {
    title: "About You",
    fields: [
      { key: "parent_name", label: "Your name", type: "text" },
      { key: "parent_pronouns", label: "Your preferred pronouns", type: "select", options: PRONOUNS },
      { key: "parent_email", label: "Your email address", type: "email" },
      { key: "partner_name", label: "Partner's name (if applicable)", type: "text" },
      { key: "partner_pronouns", label: "Partner's preferred pronouns (if applicable)", type: "select", options: PRONOUNS },
      { key: "child_name", label: "Child's name", type: "text" },
      { key: "child_dob", label: "Child's date of birth", type: "date" },
      { key: "child_age_weeks", label: "Child's corrected age (if premature, in weeks)", type: "text" },
      { key: "siblings", label: "Name and age/s of sibling/s (if applicable)", type: "text" },
    ],
  },
  {
    title: "Child's Health History",
    fields: [
      { key: "birth_type", label: "How was your baby born?", type: "select", options: ["Vaginally","Caesarean","Vaginal after caesarean (VBAC)","Assisted (forceps/vacuum)"] },
      { key: "birth_weight", label: "Birth weight", type: "text" },
      { key: "health_conditions", label: "Any diagnosed health conditions or medical history relevant to sleep (e.g. reflux, tongue tie, allergies)?", type: "textarea" },
      { key: "medications", label: "Is your child taking any prescribed, over the counter, herbal or naturopathic medicines, vitamins or supplements?", type: "textarea" },
      { key: "weight_concerns", label: "Are there any concerns about your child's weight?", type: "textarea" },
      { key: "other_practitioners", label: "Is your child currently seeing any other health care professional or alternative/complementary therapist? Please specify:", type: "textarea" },
      { key: "health_notes", label: "Any other health information you'd like me to know?", type: "textarea" },
    ],
  },
  {
    title: "Current Sleep Situation",
    fields: [
      { key: "sleep_location", label: "Where does your child currently sleep?", type: "text" },
      { key: "sleep_associations", label: "What does your child need to fall asleep? (select all that apply)", type: "multicheck", options: SLEEP_ASSOCIATIONS, otherKey: "sleep_associations_other" },
      { key: "typical_bedtime", label: "What time does your child usually go to sleep?", type: "select", options: BEDTIMES },
      { key: "typical_wake_time", label: "What time does your child usually wake for the day?", type: "select", options: WAKETIMES },
      { key: "night_wakings_count", label: "On an average night, how many times does your child wake overnight?", type: "select", options: Array.from({ length: 26 }, (_, i) => `${i}`) },
      { key: "night_wakings_duration", label: "How long are they typically awake?", type: "select", options: ["Less than 15 minutes","15-30 minutes","30-60 minutes","More than 60 minutes","Varies"] },
      { key: "night_wakings_notes", label: "Any additional details about night wakings", type: "textarea" },
      { key: "nap_number", label: "How many naps per day?", type: "select", options: Array.from({ length: 16 }, (_, i) => `${i}`) },
      { key: "nap_details", label: "Describe a typical nap (duration, location, how they fall asleep)", type: "textarea" },
      { key: "wake_window", label: "What is your child's typical wake window before becoming tired?", type: "text" },
      { key: "tired_cues", label: "What tired cues does your child show? (select all that apply)", type: "multicheck", options: TIRED_CUES, otherKey: "tired_cues_other" },
      { key: "sleep_problem_overview", label: "Please give a brief overview of your child's sleep problem/issue and what methods (if any) you have tried so far to alleviate this.", type: "textarea" },
      { key: "daytime_temperament", label: "What is your child's temperament usually like during the day?", type: "textarea" },
    ],
  },
  {
    title: "Feeding",
    fields: [
      { key: "feeding_type", label: "How is your child currently fed? (breastfed / expressed / formula / solids / combination)", type: "text" },
      { key: "meal_times", label: "What are your child's approximate meal/feed times in 24 hours?", type: "textarea" },
      { key: "night_feeds", label: "Does your child feed overnight? How often and how long?", type: "textarea" },
      { key: "feed_to_sleep", label: "Does your child feed to sleep?", type: "text" },
      { key: "solids_started", label: "Have solids been introduced? If so, how are they with eating (amount/variation/enjoy or dislike meal times etc.)?", type: "textarea" },
      { key: "feeding_concerns", label: "Any feeding concerns or difficulties?", type: "textarea" },
    ],
  },
  {
    title: "Your Concerns & Goals",
    fields: [
      { key: "main_concerns", label: "What are your main sleep concerns?", type: "textarea" },
      { key: "family_impact", label: "Explain how the problem/issue affects you, your child and the rest of the family.", type: "textarea" },
      { key: "what_tried", label: "What approaches have you already tried?", type: "textarea" },
      { key: "goals", label: "What does success look like for you? What are your sleep goals?", type: "textarea" },
      { key: "anything_else", label: "Is there anything else you'd like me to know before we start?", type: "textarea" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

// Generate a unique token for this browser session
const genToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sfs_session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Coach sessions don't need token validation
        if (parsed.role === "coach") {
          setSession(parsed);
          setLoading(false);
          return;
        }
        // For clients, verify the token still matches Supabase
        if (parsed.role === "client" && parsed.token && parsed.clientId) {
          supabase
            .from("clients")
            .select("session_token, name")
            .eq("id", parsed.clientId)
            .single()
            .then(({ data }) => {
              if (data && data.session_token === parsed.token) {
                setSession(parsed);
              } else {
                // Token mismatch — another device has logged in
                localStorage.removeItem("sfs_session");
              }
              setLoading(false);
            });
          return;
        }
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (s) => {
    // For client logins, write a session token to Supabase
    if (s.role === "client") {
      const token = genToken();
      await supabase
        .from("clients")
        .update({ session_token: token })
        .eq("id", s.clientId);
      const sessionWithToken = { ...s, token };
      setSession(sessionWithToken);
      localStorage.setItem("sfs_session", JSON.stringify(sessionWithToken));
    } else {
      setSession(s);
      localStorage.setItem("sfs_session", JSON.stringify(s));
    }
  };

  const logout = async (clientId) => {
    if (clientId) {
      await supabase
        .from("clients")
        .update({ session_token: null })
        .eq("id", clientId);
    }
    setSession(null);
    localStorage.removeItem("sfs_session");
  };

  if (loading) return <Splash />;
  if (!session) return <LoginScreen onLogin={login} />;
  if (session.role === "coach") return <CoachApp session={session} onLogout={() => logout(null)} />;
  return <ClientApp session={session} onLogout={() => logout(session.clientId)} />;
}

// ── SPLASH ──────────────────────────────────────────────────────────────────
function Splash() {
  return (
    <div style={{ ...gStyle.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ ...gStyle.logo, fontSize: 32, marginBottom: 8 }}>Signs for Sleep</div>
        <div style={{ color: C.muted, fontSize: 14 }}>Loading…</div>
      </div>
    </div>
  );
}

// ── STAR positions for login background ─────────────────────────────────────
const STARS = [
  { top: "5%",  left: "6%",  size: 28, op: 0.75 },
  { top: "10%", left: "84%", size: 22, op: 0.65 },
  { top: "3%",  left: "50%", size: 16, op: 0.55 },
  { top: "24%", left: "92%", size: 24, op: 0.7  },
  { top: "38%", left: "2%",  size: 18, op: 0.6  },
  { top: "58%", left: "91%", size: 26, op: 0.65 },
  { top: "70%", left: "4%",  size: 20, op: 0.6  },
  { top: "80%", left: "82%", size: 22, op: 0.65 },
  { top: "87%", left: "16%", size: 24, op: 0.6  },
  { top: "92%", left: "60%", size: 16, op: 0.55 },
  { top: "32%", left: "94%", size: 14, op: 0.5  },
  { top: "52%", left: "1%",  size: 18, op: 0.55 },
  { top: "17%", left: "42%", size: 13, op: 0.45 },
  { top: "74%", left: "36%", size: 15, op: 0.5  },
  { top: "45%", left: "88%", size: 12, op: 0.45 },
  { top: "63%", left: "12%", size: 14, op: 0.5  },
];

function GoldStar({ top, left, size, op }) {
  return (
    <svg style={{ position: "absolute", top, left, opacity: op, pointerEvents: "none" }}
      width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 0 L11.2 8.8 L20 10 L11.2 11.2 L10 20 L8.8 11.2 L0 10 L8.8 8.8 Z"
        fill="#C9A84C"/>
    </svg>
  );
}

// ── LOGIN ───────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    const upper = code.trim().toUpperCase();

    const { data: settings } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "coach_password")
      .single();
    const storedPw = settings?.value || COACH_PASSWORD;

    if (upper === storedPw.toUpperCase()) {
      onLogin({ role: "coach" });
      setLoading(false);
      return;
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id, name")
      .eq("access_code", upper)
      .eq("status", "active")
      .single();

    if (client) {
      onLogin({ role: "client", clientId: client.id, clientName: client.name });
    } else {
      setError("Code not recognised. Please check with your consultant.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F2EDE6",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden",
      fontFamily: font.body,
    }}>
      {/* Scattered gold stars */}
      {STARS.map((s, i) => <GoldStar key={i} {...s} />)}

      <div style={{ width: "100%", maxWidth: 700, position: "relative", zIndex: 1, textAlign: "center" }}>

        {/* Logo — doubled in size, equidistant from divider */}
        <div style={{ marginBottom: 32 }}>
          <img
            src="https://zkesnhhduxtxinjdkbyn.supabase.co/storage/v1/object/public/assets/logo.png"
            alt="Signs for Sleep"
            style={{ maxWidth: 680, width: "100%", height: "auto" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>

        {/* Thin gold divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 680, margin: "0 auto 32px" }}>
          <div style={{ flex: 1, height: "0.5px", background: C.gold, opacity: 0.6 }} />
          <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
            <path d="M10 0 L11.2 8.8 L20 10 L11.2 11.2 L10 20 L8.8 11.2 L0 10 L8.8 8.8 Z" fill="#C9A84C" opacity="0.8"/>
          </svg>
          <div style={{ flex: 1, height: "0.5px", background: C.gold, opacity: 0.6 }} />
        </div>

        {/* Login area */}
        <div>
          <p style={{ fontSize: 13, color: C.mid, marginBottom: 32, lineHeight: 1.7, letterSpacing: "0.01em" }}>
            Enter the access code provided by your sleep consultant.
          </p>

          <label style={{ ...gStyle.label, textAlign: "center", display: "block", marginBottom: 8 }}>
            Access Code
          </label>

          <input
            style={{
              width: "52%",
              padding: "10px 16px",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontFamily: font.body,
              fontSize: 16,
              letterSpacing: "0.2em",
              textAlign: "center",
              background: "rgba(255,255,255,0.55)",
              color: C.dark,
              outline: "none",
              boxSizing: "border-box",
              display: "block",
              margin: "0 auto 14px",
            }}
            placeholder="LUNA42"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button
            style={{
              ...gStyle.btnPrimary,
              width: "52%",
              borderRadius: 8,
              padding: "11px 24px",
              fontSize: 13,
              letterSpacing: "0.05em",
              display: "block",
              margin: "0 auto",
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 28, letterSpacing: "0.03em" }}>
          Sleep consultants: use your admin password to access the coach dashboard.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COACH APP
// ═══════════════════════════════════════════════════════════════════════════
function CoachApp({ session, onLogout }) {
  const [view, setView] = useState("dashboard"); // dashboard | client | settings
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    setClients(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const openClient = (c) => { setSelectedClient(c); setView("client"); };
  const back = () => { setView("dashboard"); setSelectedClient(null); fetchClients(); };

  return (
    <div style={gStyle.app}>
      <Header
        subtitle="Coach Dashboard"
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...gStyle.btnSecondary, padding: "8px 14px" }} onClick={() => setView("settings")}>Settings</button>
            <button style={{ ...gStyle.btnSecondary, padding: "8px 14px" }} onClick={onLogout}>Log out</button>
          </div>
        }
      />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {view === "dashboard" && (
          <Dashboard clients={clients} loading={loading} onSelectClient={openClient} onRefresh={fetchClients} />
        )}
        {view === "client" && selectedClient && (
          <ClientDetail client={selectedClient} onBack={back} onRefresh={fetchClients} />
        )}
        {view === "settings" && (
          <CoachSettings onBack={() => setView("dashboard")} />
        )}
      </div>
    </div>
  );
}

function Header({ subtitle, right }) {
  return (
    <div style={gStyle.header}>
      <div>
        <div style={gStyle.logo}>Signs for Sleep</div>
        {subtitle && <span style={{ fontSize: 11, color: C.muted }}>{subtitle}</span>}
      </div>
      {right}
    </div>
  );
}

// ── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ clients, loading, onSelectClient, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newSupportDays, setNewSupportDays] = useState(DEFAULT_SUPPORT_DAYS);
  const [newContactEvery, setNewContactEvery] = useState(DEFAULT_CONTACT_EVERY);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const addClient = async () => {
    if (!newName.trim() || !newCode.trim()) return;
    setSaving(true);
    await supabase.from("clients").insert({
      name: newName.trim(),
      access_code: newCode.trim().toUpperCase(),
      status: "active",
      support_start_date: today(),
      support_days: parseInt(newSupportDays),
      contact_every_days: parseInt(newContactEvery),
    });
    setSaving(false);
    setShowAdd(false);
    setNewName(""); setNewCode("");
    setNewSupportDays(DEFAULT_SUPPORT_DAYS);
    setNewContactEvery(DEFAULT_CONTACT_EVERY);
    onRefresh();
  };

  const filtered = clients.filter((c) =>
    filter === "all" ? true : c.status === filter
  );
  const active = clients.filter((c) => c.status === "active").length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: font.display, fontSize: 28, color: C.terracotta, margin: 0 }}>My Clients</h1>
          <p style={{ color: C.muted, fontSize: 14, margin: "4px 0 0" }}>{active} active</p>
        </div>
        <button style={gStyle.btnPrimary} onClick={() => setShowAdd(true)} style={{ ...gStyle.btnPrimary, width: "auto" }}>
          + Add Client
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "active", "closed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer",
            fontFamily: font.body, fontSize: 13, fontWeight: 600,
            background: filter === f ? C.terracotta : C.terracottaLight,
            color: filter === f ? C.white : C.terracottaDark,
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Add client form */}
      {showAdd && (
        <div style={{ ...gStyle.card, borderColor: C.terracotta, marginBottom: 24 }}>
          <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 16px" }}>New Client</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={gStyle.label}>Client name</label>
              <input style={gStyle.input} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Sarah Johnson" />
            </div>
            <div>
              <label style={gStyle.label}>Access code</label>
              <input style={gStyle.input} value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="LUNA42" />
            </div>
            <div>
              <label style={gStyle.label}>Support period (days)</label>
              <input style={gStyle.input} type="number" value={newSupportDays} onChange={(e) => setNewSupportDays(e.target.value)} />
            </div>
            <div>
              <label style={gStyle.label}>Contact reminder every (days)</label>
              <input style={gStyle.input} type="number" value={newContactEvery} onChange={(e) => setNewContactEvery(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={gStyle.btnPrimary} onClick={addClient} disabled={saving} style={{ ...gStyle.btnPrimary, width: "auto" }}>
              {saving ? "Saving…" : "Add Client"}
            </button>
            <button style={gStyle.btnSecondary} onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Client list */}
      {loading ? (
        <p style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading clients…</p>
      ) : filtered.length === 0 ? (
        <div style={{ ...gStyle.card, textAlign: "center", padding: 48, color: C.muted }}>
          <p style={{ fontSize: 16 }}>No clients yet. Click "+ Add Client" to get started.</p>
        </div>
      ) : (
        filtered.map((c) => <ClientCard key={c.id} client={c} onClick={() => onSelectClient(c)} />)
      )}
    </>
  );
}

function ClientCard({ client, onClick }) {
  const start = client.support_start_date;
  const daysElapsed = start ? daysBetween(start, today()) : 0;
  const total = client.support_days || DEFAULT_SUPPORT_DAYS;
  const pct = Math.min(100, Math.round((daysElapsed / total) * 100));
  const daysLeft = total - daysElapsed;
  const ending = daysLeft <= 5 && client.status === "active";
  const contactEvery = client.contact_every_days || DEFAULT_CONTACT_EVERY;
  const daysSinceContact = client.last_contact_date
    ? daysBetween(client.last_contact_date, today())
    : daysElapsed;
  const contactDue = daysSinceContact >= contactEvery && client.status === "active";

  return (
    <div onClick={onClick} style={{
      ...gStyle.card, cursor: "pointer",
      borderColor: ending ? C.danger : contactDue ? C.gold : C.border,
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,113,74,0.12)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>{client.name}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Code: {client.access_code}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={gStyle.tag(client.status === "active" ? C.success : C.muted, client.status === "active" ? C.successLight : "#f0f0f0")}>
            {client.status}
          </span>
          {contactDue && <span style={gStyle.tag(C.warning, C.warningLight)}>Contact due</span>}
          {ending && <span style={gStyle.tag(C.danger, C.dangerLight)}>Ending soon</span>}
        </div>
      </div>

      {client.status === "active" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 4 }}>
            <span>Day {daysElapsed} of {total}</span>
            <span>{daysLeft} days remaining</span>
          </div>
          <div style={{ height: 6, background: C.terracottaLight, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: ending ? C.danger : C.terracotta, borderRadius: 3, transition: "width 0.3s" }} />
          </div>
        </>
      )}
    </div>
  );
}

// ── CLIENT DETAIL (coach view) ──────────────────────────────────────────────
function ClientDetail({ client, onBack, onRefresh }) {
  const [tab, setTab] = useState("overview");
  const [clientData, setClientData] = useState(client);

  const refresh = async () => {
    const { data } = await supabase.from("clients").select("*").eq("id", client.id).single();
    if (data) setClientData(data);
    onRefresh();
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "intake", label: "Intake" },
    { key: "diary", label: "Sleep Diary" },
    { key: "notes", label: "Notes" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <>
      <button onClick={onBack} style={{ ...gStyle.btnSecondary, marginBottom: 20 }}>← All Clients</button>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: font.display, fontSize: 26, color: C.terracotta, margin: "0 0 4px" }}>{clientData.name}</h1>
        <span style={{ fontSize: 13, color: C.muted }}>Code: <strong>{clientData.access_code}</strong></span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: font.body, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            background: tab === t.key ? C.terracotta : C.terracottaLight,
            color: tab === t.key ? C.white : C.terracottaDark,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <ClientOverview client={clientData} onRefresh={refresh} />}
      {tab === "intake" && <IntakeViewer clientId={client.id} />}
      {tab === "diary" && <SleepDiaryViewer clientId={client.id} isCoach />}
      {tab === "notes" && <CoachNotes clientId={client.id} />}
      {tab === "settings" && <ClientSettings client={clientData} onRefresh={refresh} onDelete={onBack} />}
    </>
  );
}

function ClientOverview({ client, onRefresh }) {
  const start = client.support_start_date;
  const daysElapsed = start ? daysBetween(start, today()) : 0;
  const total = client.support_days || DEFAULT_SUPPORT_DAYS;
  const daysLeft = total - daysElapsed;
  const pct = Math.min(100, Math.round((daysElapsed / total) * 100));
  const contactEvery = client.contact_every_days || DEFAULT_CONTACT_EVERY;
  const daysSinceContact = client.last_contact_date
    ? daysBetween(client.last_contact_date, today()) : daysElapsed;

  const markContacted = async () => {
    await supabase.from("clients").update({ last_contact_date: today() }).eq("id", client.id);
    onRefresh();
  };

  const closeClient = async () => {
    await supabase.from("clients").update({ status: "closed" }).eq("id", client.id);
    onRefresh();
  };

  const reopenClient = async () => {
    await supabase.from("clients").update({ status: "active", support_start_date: today() }).eq("id", client.id);
    onRefresh();
  };

  return (
    <div style={gStyle.card}>
      <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 20px" }}>Support Period</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Day", value: `${daysElapsed} of ${total}` },
          { label: "Days left", value: daysLeft },
          { label: "Progress", value: `${pct}%` },
          { label: "Contact every", value: `${contactEvery}d` },
          { label: "Since last contact", value: `${daysSinceContact}d` },
        ].map((s) => (
          <div key={s.label} style={{ background: C.cream, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.terracotta, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 4 }}>
          <span>Support period progress</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 8, background: C.terracottaLight, borderRadius: 4 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: daysLeft <= 5 ? C.danger : C.terracotta, borderRadius: 4 }} />
        </div>
      </div>

      {daysSinceContact >= contactEvery && (
        <div style={{ background: C.warningLight, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.terracottaDark }}>
          ⏰ Contact is due — last contact was {daysSinceContact} days ago.
        </div>
      )}
      {daysLeft <= 5 && client.status === "active" && (
        <div style={{ background: C.dangerLight, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.danger }}>
          ⚠️ Support period ending in {daysLeft} day{daysLeft !== 1 ? "s" : ""}.
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {client.status === "active" && (
          <button style={{ ...gStyle.btnGold, flex: 1 }} onClick={markContacted}>✓ Mark as contacted today</button>
        )}
        {client.status === "active" ? (
          <button style={{ ...gStyle.btnDanger, flex: 1 }} onClick={closeClient}>Close support period</button>
        ) : (
          <button style={{ ...gStyle.btnGold, flex: 1 }} onClick={reopenClient}>↩ Reopen as active client</button>
        )}
      </div>
    </div>
  );
}

function IntakeViewer({ clientId }) {
  const [intake, setIntake] = useState(null);

  useEffect(() => {
    supabase.from("intake_responses").select("*").eq("client_id", clientId).single()
      .then(({ data }) => setIntake(data));
  }, [clientId]);

  if (!intake) return (
    <div style={{ ...gStyle.card, color: C.muted, textAlign: "center", padding: 40 }}>
      Client hasn't completed their intake questionnaire yet.
    </div>
  );

  return (
    <div>
      {INTAKE_SECTIONS.map((section) => (
        <div key={section.title} style={gStyle.card}>
          <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 16px" }}>{section.title}</h3>
          {section.fields.map((f) => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 14, color: C.dark, whiteSpace: "pre-wrap" }}>{intake[f.key] || <em style={{ color: C.muted }}>Not answered</em>}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CoachNotes({ clientId }) {
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from("coach_notes").select("notes").eq("client_id", clientId).single()
      .then(({ data }) => {
        setNotes(data?.notes || "");
        setLoaded(true);
      });
  }, [clientId]);

  useEffect(() => {
    if (!loaded) return;
    setSaved(false);
    const t = setTimeout(async () => {
      await supabase.from("coach_notes").upsert({ client_id: clientId, notes }, { onConflict: "client_id" });
      setSaved(true);
    }, 800);
    return () => clearTimeout(t);
  }, [notes]);

  return (
    <div style={gStyle.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: 0 }}>Private Notes</h3>
        <span style={{ fontSize: 12, color: saved ? C.success : C.muted }}>{saved ? "✓ Saved" : "Saving…"}</span>
      </div>
      <textarea
        style={{ ...gStyle.input, minHeight: 300, resize: "vertical", lineHeight: 1.6 }}
        placeholder="Add private coaching notes here. These are not visible to the client."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
}

function ClientSettings({ client, onRefresh, onDelete }) {
  const [supportDays, setSupportDays] = useState(client.support_days || DEFAULT_SUPPORT_DAYS);
  const [contactEvery, setContactEvery] = useState(client.contact_every_days || DEFAULT_CONTACT_EVERY);
  const [code, setCode] = useState(client.access_code);
  const [startDate, setStartDate] = useState(client.support_start_date || today());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from("clients").update({
      support_days: parseInt(supportDays),
      contact_every_days: parseInt(contactEvery),
      access_code: code.toUpperCase(),
      support_start_date: startDate,
    }).eq("id", client.id);
    setSaving(false);
    setMsg("Saved!");
    setTimeout(() => setMsg(""), 2000);
    onRefresh();
  };

  const deleteClient = async () => {
    await supabase.from("clients").delete().eq("id", client.id);
    onDelete();
  };

  return (
    <div>
      <div style={gStyle.card}>
        <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 20px" }}>Client Settings</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={gStyle.label}>Access code</label>
            <input style={gStyle.input} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label style={gStyle.label}>Support start date</label>
            <input style={gStyle.input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label style={gStyle.label}>Support period (days)</label>
            <input style={gStyle.input} type="number" value={supportDays} onChange={(e) => setSupportDays(e.target.value)} />
          </div>
          <div>
            <label style={gStyle.label}>Contact reminder every (days)</label>
            <input style={gStyle.input} type="number" value={contactEvery} onChange={(e) => setContactEvery(e.target.value)} />
          </div>
        </div>
        {msg && <p style={{ color: C.success, fontSize: 13, marginBottom: 8 }}>{msg}</p>}
        <button style={{ ...gStyle.btnPrimary, width: "auto" }} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div style={{ ...gStyle.card, borderColor: C.danger }}>
        <h3 style={{ fontFamily: font.display, color: C.danger, margin: "0 0 8px" }}>Danger Zone</h3>
        <p style={{ fontSize: 13, color: C.mid, marginBottom: 16 }}>
          Permanently deletes this client and all their data including intake responses, sleep diary entries and coaching notes. This cannot be undone.
        </p>
        {!confirmDelete ? (
          <button style={gStyle.btnDanger} onClick={() => setConfirmDelete(true)}>
            Delete client permanently
          </button>
        ) : (
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.danger, marginBottom: 12 }}>
              Are you sure? This will delete everything for {client.name}.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...gStyle.btnDanger, flex: 1 }} onClick={deleteClient}>
                Yes, delete permanently
              </button>
              <button style={{ ...gStyle.btnSecondary, flex: 1 }} onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CoachSettings({ onBack }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [defaultDays, setDefaultDays] = useState(DEFAULT_SUPPORT_DAYS);
  const [defaultContact, setDefaultContact] = useState(DEFAULT_CONTACT_EVERY);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const changePw = async () => {
    setError("");
    const { data } = await supabase.from("settings").select("value").eq("key", "coach_password").single();
    const stored = data?.value || COACH_PASSWORD;
    if (currentPw !== stored) { setError("Current password incorrect."); return; }
    if (newPw !== confirmPw) { setError("New passwords don't match."); return; }
    if (newPw.length < 4) { setError("Password must be at least 4 characters."); return; }
    await supabase.from("settings").upsert({ key: "coach_password", value: newPw }, { onConflict: "key" });
    setMsg("Password changed!"); setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <>
      <button onClick={onBack} style={{ ...gStyle.btnSecondary, marginBottom: 20 }}>← Back</button>
      <h1 style={{ fontFamily: font.display, fontSize: 26, color: C.terracotta, margin: "0 0 24px" }}>Settings</h1>

      <div style={gStyle.card}>
        <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 16px" }}>Change Password</h3>
        {[
          { label: "Current password", val: currentPw, set: setCurrentPw },
          { label: "New password", val: newPw, set: setNewPw },
          { label: "Confirm new password", val: confirmPw, set: setConfirmPw },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: 12 }}>
            <label style={gStyle.label}>{f.label}</label>
            <input type="password" style={gStyle.input} value={f.val} onChange={(e) => f.set(e.target.value)} />
          </div>
        ))}
        {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 8 }}>{error}</p>}
        {msg && <p style={{ color: C.success, fontSize: 13, marginBottom: 8 }}>{msg}</p>}
        <button style={{ ...gStyle.btnPrimary, width: "auto" }} onClick={changePw}>Change Password</button>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT APP
// ═══════════════════════════════════════════════════════════════════════════
function ClientApp({ session, onLogout }) {
  const [tab, setTab] = useState("diary");
  const [hasIntake, setHasIntake] = useState(null);

  useEffect(() => {
    supabase.from("intake_responses").select("id").eq("client_id", session.clientId).single()
      .then(({ data }) => {
        setHasIntake(!!data);
        if (!data) setTab("intake");
      });
  }, [session.clientId]);

  const tabs = [
    { key: "diary", label: "Sleep Diary" },
    { key: "intake", label: "Questionnaire" },
  ];

  return (
    <div style={gStyle.app}>
      <Header
        subtitle={`Welcome, ${session.clientName}`}
        right={<button style={{ ...gStyle.btnSecondary, padding: "8px 14px" }} onClick={onLogout}>Log out</button>}
      />

      {!hasIntake && tab === "diary" && (
        <div style={{ background: C.warningLight, borderLeft: `4px solid ${C.gold}`, padding: "12px 24px", fontSize: 14, color: C.terracottaDark }}>
          Please complete your intake questionnaire before logging sleep data.
        </div>
      )}

      {/* Tab bar */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", gap: 4 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "12px 20px", border: "none", background: "transparent", cursor: "pointer",
            fontFamily: font.body, fontSize: 14, fontWeight: 600,
            color: tab === t.key ? C.terracotta : C.muted,
            borderBottom: tab === t.key ? `2px solid ${C.terracotta}` : "2px solid transparent",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
        {tab === "diary" && <SleepDiaryViewer clientId={session.clientId} isCoach={false} />}
        {tab === "intake" && (
          <IntakeForm
            clientId={session.clientId}
            hasIntake={hasIntake}
            onComplete={() => { setHasIntake(true); setTab("diary"); }}
          />
        )}
      </div>
    </div>
  );
}

// ── INTAKE FORM (client-facing) ─────────────────────────────────────────────
function IntakeForm({ clientId, hasIntake, onComplete }) {
  const [responses, setResponses] = useState({});
  const [section, setSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (hasIntake) {
      supabase.from("intake_responses").select("*").eq("client_id", clientId).single()
        .then(({ data }) => { if (data) { setResponses(data); setLoaded(true); } });
    } else {
      setLoaded(true);
    }
  }, [clientId, hasIntake]);

  const set = (key, val) => setResponses((r) => ({ ...r, [key]: val }));

  const submit = async () => {
    setSaving(true);
    if (hasIntake) {
      await supabase.from("intake_responses").update(responses).eq("client_id", clientId);
    } else {
      await supabase.from("intake_responses").insert({ ...responses, client_id: clientId });
      // Notify coach by email via Supabase Edge Function
      try {
        const { data: clientData } = await supabase
          .from("clients").select("name").eq("id", clientId).single();
        await supabase.functions.invoke("notify-intake", {
          body: { clientName: clientData?.name || "A client", clientId },
        });
      } catch (e) { /* silent fail — don't block the client */ }
    }
    setSaving(false);
    onComplete();
  };

  const currentSection = INTAKE_SECTIONS[section];
  const isLast = section === INTAKE_SECTIONS.length - 1;

  if (!loaded) return <p style={{ color: C.muted, padding: 40 }}>Loading…</p>;

  return (
    <div>
      {/* Section progress */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {INTAKE_SECTIONS.map((s, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= section ? C.terracotta : C.terracottaLight }} />
        ))}
      </div>
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Section {section + 1} of {INTAKE_SECTIONS.length}</p>
      <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.terracotta, margin: "0 0 20px" }}>{currentSection.title}</h2>

      {currentSection.fields.map((f) => (
        <div key={f.key} style={{ marginBottom: 16 }}>
          <label style={gStyle.label}>{f.label}</label>
          {f.type === "textarea" ? (
            <textarea
              style={{ ...gStyle.input, minHeight: 80, resize: "vertical" }}
              value={responses[f.key] || ""}
              onChange={(e) => set(f.key, e.target.value)}
            />
          ) : f.type === "select" ? (
            <select
              style={{ ...gStyle.input, cursor: "pointer" }}
              value={responses[f.key] || ""}
              onChange={(e) => set(f.key, e.target.value)}
            >
              <option value="">Select...</option>
              {f.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : f.type === "multicheck" ? (
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", background: C.white }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {f.options.map((o) => {
                  const vals = responses[f.key] ? responses[f.key].split(",").map(v => v.trim()) : [];
                  const checked = vals.includes(o);
                  return (
                    <label key={o} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.dark }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked ? vals.filter(v => v !== o) : [...vals, o];
                          set(f.key, next.join(", "));
                        }}
                        style={{ accentColor: C.terracotta, width: 15, height: 15 }}
                      />
                      {o}
                    </label>
                  );
                })}
              </div>
              {f.otherKey !== undefined && (
                <div>
                  <label style={{ ...gStyle.label, marginTop: 4 }}>Other (please specify)</label>
                  <input
                    style={gStyle.input}
                    value={responses[f.otherKey] || ""}
                    placeholder="Anything else..."
                    onChange={(e) => set(f.otherKey, e.target.value)}
                  />
                </div>
              )}
            </div>
          ) : (
            <input
              type={f.type}
              style={gStyle.input}
              value={responses[f.key] || ""}
              onChange={(e) => set(f.key, e.target.value)}
            />
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {section > 0 && (
          <button style={{ ...gStyle.btnSecondary, flex: 1 }} onClick={() => setSection((s) => s - 1)}>Back</button>
        )}
        {isLast ? (
          <button style={{ ...gStyle.btnPrimary, flex: 1 }} onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Submit Questionnaire"}
          </button>
        ) : (
          <button style={{ ...gStyle.btnPrimary, flex: 1 }} onClick={() => setSection((s) => s + 1)}>Next →</button>
        )}
      </div>
    </div>
  );
}

// ── SLEEP DIARY ─────────────────────────────────────────────────────────────
const BOOKING_URL = "https://calendar.app.google/UJPyiq6md5VCxfuV6";
const DIARY_DAYS_REQUIRED = 5;

const emptyNap = () => ({ start: "", end: "", how_fell_asleep: "", location: "", resettled: "", notes: "" });
const emptyEntry = () => ({
  wake_time: "", bed_time: "", notes: "",
  routine_start_time: "", into_bed_time: "", asleep_time: "",
  night_wakings_count: "", night_wakings_notes: "",
  daytime_notes: "",
  naps: [emptyNap()],
});

function SleepDiaryViewer({ clientId, isCoach }) {
  const [selectedDate, setSelectedDate] = useState(today());
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [diaryCount, setDiaryCount] = useState(0);

  const loadDiaryCount = async () => {
    const { count } = await supabase
      .from("sleep_diary")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId);
    setDiaryCount(count || 0);
  };

  useEffect(() => { if (!isCoach) loadDiaryCount(); }, [clientId]);

  // Load entry whenever selectedDate changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("sleep_diary")
        .select("*")
        .eq("client_id", clientId)
        .eq("date", selectedDate)
        .single();
      if (!cancelled) {
        setEntry(data ? { ...data, naps: data.naps || [emptyNap()] } : emptyEntry());
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [clientId, selectedDate]);

  // Direct save — called explicitly, returns a promise
  const doSave = async (data, date) => {
    if (!data) return;
    setSaving(true);
    const calcs = calcSleep(data);
    // Strip any fields not in the database schema
    const { id, created_at, ...rest } = data;
    const payload = {
      client_id: clientId,
      date,
      wake_time: rest.wake_time || null,
      bed_time: rest.bed_time || null,
      naps: rest.naps || [],
      notes: rest.notes || null,
      routine_start_time: rest.routine_start_time || null,
      into_bed_time: rest.into_bed_time || null,
      night_wakings_count: rest.night_wakings_count || null,
      night_wakings_notes: rest.night_wakings_notes || null,
      daytime_notes: rest.daytime_notes || null,
      ...calcs,
    };
    const { error } = await supabase.from("sleep_diary").upsert(payload, { onConflict: "client_id,date" });
    if (error) {
      console.error("Diary save error:", error);
      setSaving(false);
      return;
    }
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
    loadDiaryCount();
  };

  // Each field update saves immediately
  const update = async (field, value) => {
    const updated = { ...entry, [field]: value };
    setEntry(updated);
    await doSave(updated, selectedDate);
  };

  const updateNap = async (idx, field, value) => {
    const naps = entry.naps.map((n, i) => i === idx ? { ...n, [field]: value } : n);
    const updated = { ...entry, naps };
    setEntry(updated);
    await doSave(updated, selectedDate);
  };

  const addNap = async () => {
    const naps = [...(entry.naps || []), emptyNap()];
    const updated = { ...entry, naps };
    setEntry(updated);
    await doSave(updated, selectedDate);
  };

  const removeNap = async (idx) => {
    const naps = entry.naps.filter((_, i) => i !== idx);
    const updated = { ...entry, naps };
    setEntry(updated);
    await doSave(updated, selectedDate);
  };

  const changeDate = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleDateChange = (newDate) => setSelectedDate(newDate);

  if (loading || !entry) return <p style={{ color: C.muted, padding: 40 }}>Loading…</p>;

  const calcs = calcSleep(entry);
  const bookingUnlocked = !isCoach && diaryCount >= DIARY_DAYS_REQUIRED;
  const daysRemaining = Math.max(0, DIARY_DAYS_REQUIRED - diaryCount);

  return (
    <div>
      {/* Booking banner — client only */}
      {!isCoach && (
        bookingUnlocked ? (
          <div style={{
            background: "linear-gradient(135deg, #C4714A 0%, #C9A84C 100%)",
            borderRadius: 14, padding: "20px 24px", marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <div style={{ fontFamily: font.display, fontSize: 18, color: C.white, marginBottom: 4 }}>
                🎉 You're ready to book your consult!
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                You've completed {diaryCount} days of sleep diary. Choose a time that suits you.
              </div>
            </div>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: C.white, color: C.terracotta, borderRadius: 10,
                padding: "12px 24px", fontFamily: font.body, fontSize: 14,
                fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
                letterSpacing: "0.02em",
              }}
            >
              Book your consult →
            </a>
          </div>
        ) : (
          <div style={{
            background: C.blueLight, borderRadius: 14, padding: "16px 20px",
            marginBottom: 24, display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.blueDark, marginBottom: 4 }}>
                Sleep diary progress
              </div>
              <div style={{ fontSize: 13, color: C.blueDark, lineHeight: 1.5 }}>
                Complete {daysRemaining} more day{daysRemaining !== 1 ? "s" : ""} of sleep diary to unlock your consult booking.
              </div>
            </div>
            <div style={{ textAlign: "center", minWidth: 56 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.blue }}>{diaryCount}</div>
              <div style={{ fontSize: 11, color: C.blueDark, letterSpacing: "0.05em" }}>of {DIARY_DAYS_REQUIRED}</div>
            </div>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: DIARY_DAYS_REQUIRED }).map((_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: i < diaryCount ? C.terracotta : "rgba(107,143,168,0.3)",
                }} />
              ))}
            </div>
          </div>
        )
      )}

      {/* Date nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => changeDate(-1)} style={{ ...gStyle.btnSecondary, padding: "8px 14px" }}>←</button>
        <input type="date" style={{ ...gStyle.input, flex: 1, textAlign: "center" }}
          value={selectedDate} onChange={(e) => handleDateChange(e.target.value)}
          max={today()}
        />
        <button onClick={() => changeDate(1)} style={{ ...gStyle.btnSecondary, padding: "8px 14px" }}
          disabled={selectedDate >= today()}>→</button>
      </div>

      {/* Calculations summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total nap sleep", value: fmtDuration(calcs.total_nap_mins) },
          { label: "Night sleep", value: fmtDuration(calcs.night_sleep_mins) },
          { label: "Total sleep (24h)", value: fmtDuration(calcs.total_sleep_24h) },
          { label: "Naps today", value: entry.naps?.filter(n => n.start && n.end).length || 0 },
        ].map((s) => (
          <div key={s.label} style={{ background: C.terracottaLight, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: C.terracottaDark, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.terracottaDark, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Wake time */}
      <div style={gStyle.card}>
        <h3 style={{ fontFamily: font.display, color: C.blue, margin: "0 0 16px" }}>Morning Wake</h3>
        <label style={gStyle.label}>Wake time</label>
        <input type="time" style={gStyle.input} value={entry.wake_time || ""}
          onChange={(e) => update("wake_time", e.target.value)} disabled={isCoach} />
      </div>

      {/* Naps */}
      <div style={gStyle.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: font.display, color: C.blue, margin: 0 }}>Naps</h3>
          {!isCoach && (
            <button style={{ ...gStyle.btnSecondary, padding: "6px 12px", fontSize: 12 }} onClick={addNap}>+ Add nap</button>
          )}
        </div>
        {(entry.naps || []).map((nap, idx) => {
          const dur = nap.start && nap.end
            ? diffMins(parseTime(nap.start), parseTime(nap.end)) : null;
          const ww = idx === 0 && entry.wake_time && nap.start
            ? diffMins(parseTime(entry.wake_time), parseTime(nap.start)) : null;
          const prevNapEnd = idx > 0 && entry.naps[idx - 1]?.end ? entry.naps[idx - 1].end : null;
          const wwFromPrev = prevNapEnd && nap.start
            ? diffMins(parseTime(prevNapEnd), parseTime(nap.start)) : null;

          return (
            <div key={idx} style={{ borderTop: idx > 0 ? `1px solid ${C.border}` : "none", paddingTop: idx > 0 ? 16 : 0, marginTop: idx > 0 ? 16 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: C.mid }}>Nap {idx + 1}</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {dur !== null && <span style={gStyle.tag(C.blue, C.blueLight)}>{fmtDuration(dur)}</span>}
                  {!isCoach && entry.naps.length > 1 && (
                    <button onClick={() => removeNap(idx)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
                  )}
                </div>
              </div>
              {(ww !== null || wwFromPrev !== null) && (
                <p style={{ fontSize: 12, color: C.gold, marginBottom: 8 }}>
                  ⏱ Wake window: {fmtDuration(ww ?? wwFromPrev)} {idx === 0 ? "since wake" : "since last nap"}
                </p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={gStyle.label}>Start</label>
                  <input type="time" style={gStyle.input} value={nap.start || ""}
                    onChange={(e) => updateNap(idx, "start", e.target.value)} disabled={isCoach} />
                </div>
                <div>
                  <label style={gStyle.label}>End</label>
                  <input type="time" style={gStyle.input} value={nap.end || ""}
                    onChange={(e) => updateNap(idx, "end", e.target.value)} disabled={isCoach} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={gStyle.label}>How did they fall asleep?</label>
                <input style={gStyle.input} value={nap.how_fell_asleep || ""}
                  placeholder="e.g. fed to sleep, rocked, independently, with dummy..."
                  onChange={(e) => updateNap(idx, "how_fell_asleep", e.target.value)} disabled={isCoach} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={gStyle.label}>Where did they nap?</label>
                <input style={gStyle.input} value={nap.location || ""}
                  placeholder="e.g. cot, pram, carrier, car, arms..."
                  onChange={(e) => updateNap(idx, "location", e.target.value)} disabled={isCoach} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={gStyle.label}>Did they need to be resettled?</label>
                <input style={gStyle.input} value={nap.resettled || ""}
                  placeholder="e.g. no, once after 30 min, multiple times..."
                  onChange={(e) => updateNap(idx, "resettled", e.target.value)} disabled={isCoach} />
              </div>
              <div>
                <label style={gStyle.label}>Additional nap notes</label>
                <textarea style={{ ...gStyle.input, minHeight: 60, resize: "vertical" }} value={nap.notes || ""}
                  placeholder="Anything else to note about this nap..."
                  onChange={(e) => updateNap(idx, "notes", e.target.value)} disabled={isCoach} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Daytime behaviour */}
      <div style={gStyle.card}>
        <h3 style={{ fontFamily: font.display, color: C.blue, margin: "0 0 8px" }}>Daytime Behaviour & Activities</h3>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>e.g. nursery/kindy, home all day, multiple meltdowns, good mood, teething, unwell...</p>
        <textarea style={{ ...gStyle.input, minHeight: 80, resize: "vertical" }}
          value={entry.daytime_notes || ""}
          placeholder="Notes about the day..."
          onChange={(e) => update("daytime_notes", e.target.value)} disabled={isCoach} />
      </div>

      {/* Bedtime */}
      <div style={gStyle.card}>
        <h3 style={{ fontFamily: font.display, color: C.blue, margin: "0 0 16px" }}>Bedtime</h3>
        {(() => {
          const lastNapEnd = [...(entry.naps || [])].reverse().find(n => n.end)?.end;
          const wwToBed = lastNapEnd && entry.bed_time
            ? diffMins(parseTime(lastNapEnd), parseTime(entry.bed_time)) : null;
          const wwFromWake = !lastNapEnd && entry.wake_time && entry.bed_time
            ? diffMins(parseTime(entry.wake_time), parseTime(entry.bed_time)) : null;
          return (wwToBed || wwFromWake) ? (
            <p style={{ fontSize: 12, color: C.gold, marginBottom: 12 }}>
              ⏱ Wake window to bed: {fmtDuration(wwToBed ?? wwFromWake)}
            </p>
          ) : null;
        })()}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={gStyle.label}>Bedtime routine started</label>
            <input type="time" style={gStyle.input} value={entry.routine_start_time || ""}
              onChange={(e) => update("routine_start_time", e.target.value)} disabled={isCoach} />
          </div>
          <div>
            <label style={gStyle.label}>Time into bed</label>
            <input type="time" style={gStyle.input} value={entry.into_bed_time || ""}
              onChange={(e) => update("into_bed_time", e.target.value)} disabled={isCoach} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={gStyle.label}>Time went to sleep</label>
          <input type="time" style={gStyle.input} value={entry.bed_time || ""}
            onChange={(e) => update("bed_time", e.target.value)} disabled={isCoach} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={gStyle.label}>Times woke overnight</label>
            <select style={{ ...gStyle.input, cursor: "pointer" }}
              value={entry.night_wakings_count || ""}
              onChange={(e) => update("night_wakings_count", e.target.value)}
              disabled={isCoach}>
              <option value="">—</option>
              {Array.from({ length: 26 }, (_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={gStyle.label}>Night waking notes</label>
            <input style={gStyle.input} value={entry.night_wakings_notes || ""}
              placeholder="e.g. awake 2am for 45 min, resettled with feed..."
              onChange={(e) => update("night_wakings_notes", e.target.value)} disabled={isCoach} />
          </div>
        </div>
        <label style={gStyle.label}>General notes</label>
        <textarea style={{ ...gStyle.input, minHeight: 80, resize: "vertical" }}
          placeholder="How was settling? Anything else to note..."
          value={entry.notes || ""}
          onChange={(e) => update("notes", e.target.value)} disabled={isCoach} />
      </div>

      {/* Save indicator */}
      {!isCoach && (
        <p style={{ textAlign: "center", fontSize: 12, color: savedMsg ? C.success : C.muted }}>
          {savedMsg ? "✓ Saved automatically" : saving ? "Saving…" : "Changes save automatically"}
        </p>
      )}
    </div>
  );
}

// ── SLEEP CALCULATIONS ──────────────────────────────────────────────────────
function calcSleep(entry) {
  const { wake_time, bed_time, naps = [] } = entry;

  const totalNapMins = naps.reduce((acc, n) => {
    if (n.start && n.end) {
      return acc + diffMins(parseTime(n.start), parseTime(n.end));
    }
    return acc;
  }, 0);

  let nightSleep = null;
  if (bed_time && wake_time) {
    nightSleep = diffMins(parseTime(bed_time), parseTime(wake_time));
    if (nightSleep > 720) nightSleep = null; // sanity check
  }

  return {
    total_nap_mins: totalNapMins,
    night_sleep_mins: nightSleep,
    total_sleep_24h: totalNapMins + (nightSleep || 0),
  };
}
