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
  const parts = t.split(":").map(Number);
  return parts[0] * 60 + (parts[1] || 0); // handles HH:MM and HH:MM:SS
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
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const daysBetween = (a, b) =>
  Math.floor((new Date(b) - new Date(a)) / 86400000);

// Safe date offset using string arithmetic — avoids UTC timezone shift issues
// e.g. offsetDate("2026-05-06", -1) => "2026-05-05"
const offsetDate = (dateStr, delta) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta); // local time, no UTC conversion
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
};

// ── TIME WHEEL PICKER ─────────────────────────────────────────────────────
// Scroll-wheel style picker: Hour | Minute | AM/PM
// Output: clean HH:MM 24hr string — identical format to previous dropdown
// Input: HH:MM or HH:MM:SS (Supabase format) — both handled correctly

const WHEEL_HOURS = ["12","1","2","3","4","5","6","7","8","9","10","11"];
const WHEEL_MINS  = Array.from({ length: 60 }, (_, i) => String(i).padStart(2,"0"));
const WHEEL_AMPM  = ["am","pm"];
const ITEM_H = 40;  // px height of each item
const VISIBLE = 5;  // items visible, centre = selected

function parse24ToWheel(t) {
  if (!t) return { h: null, m: null, ampm: null };
  const parts = t.slice(0,5).split(":").map(Number);
  const h24 = parts[0], m = parts[1];
  const ampm = h24 < 12 ? "am" : "pm";
  const h12  = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return { h: h12, m, ampm };
}

function wheelTo24(h, m, ampm) {
  if (h === null || m === null || !ampm) return "";
  let h24 = parseInt(h);
  if (ampm === "am" && h24 === 12) h24 = 0;
  if (ampm === "pm" && h24 !== 12) h24 += 12;
  return `${String(h24).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

function WheelColumn({ items, selected, onSelect }) {
  const scrollRef = useRef(null);
  const timerRef  = useRef(null);
  const selStr = selected !== null ? String(selected) : null;
  const idx = selStr !== null ? items.indexOf(selStr) : -1;

  useEffect(() => {
    if (scrollRef.current && idx >= 0) {
      scrollRef.current.scrollTop = idx * ITEM_H;
    }
  }, [idx]);

  const onScroll = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const snapped = Math.round(scrollRef.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, snapped));
      scrollRef.current.scrollTop = clamped * ITEM_H;
      onSelect(items[clamped]);
    }, 100);
  };

  return (
    <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
      {/* Selection band */}
      <div style={{
        position: "absolute", pointerEvents: "none", zIndex: 1,
        top: ITEM_H * Math.floor(VISIBLE / 2), left: 0, right: 0, height: ITEM_H,
        background: "rgba(196,113,74,0.1)",
        borderTop: "1.5px solid rgba(196,113,74,0.4)",
        borderBottom: "1.5px solid rgba(196,113,74,0.4)",
        borderRadius: 6,
      }} />
      {/* Top fade */}
      <div style={{
        position: "absolute", pointerEvents: "none", zIndex: 2,
        top: 0, left: 0, right: 0, height: ITEM_H * Math.floor(VISIBLE / 2),
        background: "linear-gradient(to bottom, rgba(255,255,255,0.9) 60%, transparent)",
      }} />
      {/* Bottom fade */}
      <div style={{
        position: "absolute", pointerEvents: "none", zIndex: 2,
        bottom: 0, left: 0, right: 0, height: ITEM_H * Math.floor(VISIBLE / 2),
        background: "linear-gradient(to top, rgba(255,255,255,0.9) 60%, transparent)",
      }} />
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          height: ITEM_H * VISIBLE,
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div style={{ height: ITEM_H * Math.floor(VISIBLE / 2) }} />
        {items.map((item) => {
          const active = selStr === item;
          return (
            <div
              key={item}
              onClick={() => {
                onSelect(item);
                const i = items.indexOf(item);
                if (scrollRef.current) scrollRef.current.scrollTop = i * ITEM_H;
              }}
              style={{
                height: ITEM_H, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: active ? 20 : 17,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: active ? 700 : 400,
                color: active ? "#C4714A" : "#9E8E88",
                cursor: "pointer",
                scrollSnapAlign: "center",
                userSelect: "none",
                transition: "font-size 0.1s, color 0.1s",
              }}
            >
              {item.toUpperCase()}
            </div>
          );
        })}
        <div style={{ height: ITEM_H * Math.floor(VISIBLE / 2) }} />
      </div>
    </div>
  );
}

function TimeSelect({ value, onChange, disabled, placeholder }) {
  const init = parse24ToWheel(value);
  const [h,    setH]    = useState(init.h);
  const [m,    setM]    = useState(init.m);
  const [ampm, setAmpm] = useState(init.ampm || "am");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Sync when external value changes (loading saved data)
  useEffect(() => {
    const p = parse24ToWheel(value);
    if (p.h !== null) { setH(p.h); setM(p.m); setAmpm(p.ampm); }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const handle = (field, val) => {
    const next = {
      h:    field === "h"    ? val  : h,
      m:    field === "m"    ? val  : m,
      ampm: field === "ampm" ? val  : ampm,
    };
    if (field === "h")    setH(val);
    if (field === "m")    setM(val);
    if (field === "ampm") setAmpm(val);
    // Only fire onChange when all three are valid
    if (next.h !== null && next.m !== null && next.ampm) {
      const result = wheelTo24(next.h, next.m, next.ampm);
      if (result) onChange(result);
    }
  };

  const label = h !== null && m !== null
    ? `${h}:${String(m).padStart(2,"0")} ${ampm.toUpperCase()}`
    : placeholder || "Select time…";

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: "100%", padding: "10px 14px",
          border: "1px solid rgba(196,113,74,0.18)",
          borderRadius: 8,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: 14,
          background: disabled ? "#FAF7F2" : "#FFFFFF",
          color: h !== null ? "#2C2420" : "#9E8E88",
          outline: "none", cursor: disabled ? "default" : "pointer",
          textAlign: "left", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <span>{label}</span>
        {!disabled && <span style={{ color: "#C9A84C", fontSize: 11 }}>{open ? "▲" : "▼"}</span>}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999,
          background: "#FFFFFF",
          border: "1px solid rgba(196,113,74,0.25)",
          borderRadius: 14,
          boxShadow: "0 12px 40px rgba(44,36,32,0.18)",
          padding: "8px 8px 10px",
          width: "100%", minWidth: 220,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <WheelColumn
              items={WHEEL_HOURS}
              selected={h !== null ? String(h) : null}
              onSelect={(v) => handle("h", parseInt(v))}
            />
            <div style={{ color: "#9E8E88", fontSize: 20, fontWeight: 700, paddingBottom: 2 }}>:</div>
            <WheelColumn
              items={WHEEL_MINS}
              selected={m !== null ? String(m).padStart(2,"0") : null}
              onSelect={(v) => handle("m", parseInt(v))}
            />
            <WheelColumn
              items={WHEEL_AMPM}
              selected={ampm}
              onSelect={(v) => handle("ampm", v)}
            />
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              marginTop: 8, width: "100%", padding: "9px",
              border: "none", borderRadius: 8,
              background: "#C4714A", color: "#FFFFFF",
              fontSize: 13, fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

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
      { key: "snoring", label: "Does your child ever snore and/or sleep with their mouth open? If so, how often and for how long?", type: "textarea" },
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
            .maybeSingle()
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
      .maybeSingle();
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
      .maybeSingle();

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
    <div style={gStyle.header} data-print-hide="true" className="no-print">
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
        filtered.map((c) => <ClientCard key={c.id} client={c} onClick={() => onSelectClient(c)} onRefresh={onRefresh} />)
      )}
    </>
  );
}

// Testimonial status config
const TESTIMONIAL_STATUSES = [
  { key: "requested",   label: "Requested",   color: C.blue,          bg: C.blueLight },
  { key: "followed_up", label: "Followed up",  color: C.gold,          bg: C.goldLight },
  { key: "received",    label: "Received ✓",   color: C.success,       bg: C.successLight },
];

function ClientCard({ client, onClick, onRefresh }) {
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

  const pkg = client.package && PACKAGES[client.package] ? PACKAGES[client.package] : null;
  const testimonialStatus = TESTIMONIAL_STATUSES.find(s => s.key === client.testimonial_status);

  const cycleTestimonial = async (e) => {
    e.stopPropagation(); // don't open client detail
    const keys = [null, "requested", "followed_up", "received"];
    const current = keys.indexOf(client.testimonial_status || null);
    const next = keys[(current + 1) % keys.length];
    await supabase.from("clients")
      .update({ testimonial_status: next })
      .eq("id", client.id);
    onRefresh();
  };

  return (
    <div onClick={onClick} style={{
      ...gStyle.card, cursor: "pointer",
      borderColor: ending ? C.danger : contactDue ? C.gold : C.border,
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,113,74,0.12)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>{client.name}</span>
            {/* Package badge */}
            {pkg && (
              <span style={gStyle.tag(C.terracottaDark, C.terracottaLight)}>
                {pkg.label}
              </span>
            )}
            {(client.extension_weeks || 0) > 0 && (
              <span style={gStyle.tag(C.gold, C.goldLight)}>
                +{client.extension_weeks}wk
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Code: {client.access_code}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "flex-start" }}>
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
          <div style={{ height: 6, background: C.terracottaLight, borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: ending ? C.danger : C.terracotta, borderRadius: 3, transition: "width 0.3s" }} />
          </div>
        </>
      )}

      {/* Testimonial button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={cycleTestimonial}
          style={{
            padding: "5px 12px", borderRadius: 20, border: "none",
            cursor: "pointer", fontFamily: font.body, fontSize: 11, fontWeight: 600,
            background: testimonialStatus ? testimonialStatus.bg : "#f0f0f0",
            color: testimonialStatus ? testimonialStatus.color : C.muted,
          }}
          title="Click to cycle through testimonial status"
        >
          ⭐ {testimonialStatus ? testimonialStatus.label : "Testimonial"}
        </button>
      </div>
    </div>
  );
}

// ── CLIENT DETAIL (coach view) ──────────────────────────────────────────────
function ClientDetail({ client, onBack, onRefresh }) {
  const [tab, setTab] = useState("overview");
  const [clientData, setClientData] = useState(client);

  const refresh = async () => {
    const { data } = await supabase.from("clients").select("*").eq("id", client.id).maybeSingle();
    if (data) setClientData(data);
    onRefresh();
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "intake", label: "Intake" },
    { key: "diary", label: "Sleep Diary" },
    { key: "analysis", label: "📊 Analysis" },
    { key: "plan", label: "📋 Sleep Plan" },
    { key: "toolbox", label: "🧰 Toolbox" },
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
      {tab === "analysis" && <SleepAnalysis client={clientData} />}
      {tab === "plan" && <SleepPlanEditor clientId={client.id} clientData={clientData} isCoach={true} />}
      {tab === "toolbox" && <KnowledgeToolbox clientId={client.id} clientData={clientData} isCoach={true} />}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("intake_responses").select("*").eq("client_id", clientId).maybeSingle()
      .then(({ data }) => { setIntake(data); setLoading(false); });
  }, [clientId]);

  if (loading) return <p style={{ color: C.muted, padding: 40 }}>Loading…</p>;

  if (!intake || !intake.completed) return (
    <div style={{ ...gStyle.card, color: C.muted, textAlign: "center", padding: 40 }}>
      {intake ? "Client has started but not yet submitted their intake questionnaire." : "Client hasn't completed their intake questionnaire yet."}
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
    supabase.from("coach_notes").select("notes").eq("client_id", clientId).maybeSingle()
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
  const [packageStartDate, setPackageStartDate] = useState(client.package_start_date || "");
  const [pkg, setPkg] = useState(client.package || "");
  const [extensionWeeks, setExtensionWeeks] = useState(client.extension_weeks || 0);
  const [callsUsed, setCallsUsed] = useState(client.calls_used || 0);
  const [consultBooked, setConsultBooked] = useState(client.consult_booked || false);
  const [testimonialText, setTestimonialText] = useState(client.testimonial_text || "");
  const [feedbackText, setFeedbackText] = useState(client.feedback_text || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // When package changes, auto-set support days and calls total
  const handlePackageChange = (newPkg) => {
    setPkg(newPkg);
    if (newPkg && PACKAGES[newPkg]) {
      const baseDays = PACKAGES[newPkg].days + (extensionWeeks * EXTENSION.days);
      const baseCalls = PACKAGES[newPkg].calls + (extensionWeeks * EXTENSION.calls);
      setSupportDays(baseDays);
    }
  };

  const handleExtensionChange = (weeks) => {
    const w = parseInt(weeks) || 0;
    setExtensionWeeks(w);
    if (pkg && PACKAGES[pkg]) {
      setSupportDays(PACKAGES[pkg].days + (w * EXTENSION.days));
    }
  };

  const callsTotal = pkg && PACKAGES[pkg]
    ? PACKAGES[pkg].calls + (extensionWeeks * EXTENSION.calls)
    : extensionWeeks * EXTENSION.calls;

  const save = async () => {
    setSaving(true);
    await supabase.from("clients").update({
      support_days: parseInt(supportDays),
      contact_every_days: parseInt(contactEvery),
      access_code: code.toUpperCase(),
      support_start_date: startDate,
      package: pkg || null,
      package_start_date: packageStartDate || null,
      testimonial_text: testimonialText || null,
      feedback_text: feedbackText || null,
      extension_weeks: extensionWeeks,
      calls_total: callsTotal,
      calls_used: callsUsed,
      consult_booked: consultBooked,
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
      {/* Package Selection */}
      <div style={gStyle.card}>
        <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 16px" }}>Package</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {/* Package selector */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={gStyle.label}>Package</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { key: "", label: "None" },
                { key: "gentle_start", label: `Gentle Start — ${PACKAGES.gentle_start.weeks}wk ${PACKAGES.gentle_start.price}` },
                { key: "foundations", label: `Foundations — ${PACKAGES.foundations.weeks}wk ${PACKAGES.foundations.price}` },
              ].map(opt => (
                <button key={opt.key} onClick={() => handlePackageChange(opt.key)} style={{
                  padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontFamily: font.body, fontSize: 13, fontWeight: 600,
                  background: pkg === opt.key ? C.terracotta : C.terracottaLight,
                  color: pkg === opt.key ? C.white : C.terracottaDark,
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extension weeks */}
          <div>
            <label style={gStyle.label}>Extension Weeks (+{EXTENSION.price}/wk)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => handleExtensionChange(Math.max(0, extensionWeeks - 1))}
                style={{ ...gStyle.btnSecondary, padding: "6px 12px", fontSize: 16 }}>−</button>
              <span style={{ fontSize: 18, fontWeight: 700, color: C.terracotta, minWidth: 24, textAlign: "center" }}>
                {extensionWeeks}
              </span>
              <button onClick={() => handleExtensionChange(extensionWeeks + 1)}
                style={{ ...gStyle.btnSecondary, padding: "6px 12px", fontSize: 16 }}>+</button>
              {extensionWeeks > 0 && (
                <span style={{ fontSize: 12, color: C.muted }}>
                  +{extensionWeeks * EXTENSION.days}d, +{extensionWeeks * EXTENSION.calls} call{extensionWeeks > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Consult booked toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" id="consultBooked" checked={consultBooked}
              onChange={(e) => setConsultBooked(e.target.checked)}
              style={{ accentColor: C.terracotta, width: 16, height: 16 }} />
            <label htmlFor="consultBooked" style={{ fontSize: 13, color: C.dark, cursor: "pointer" }}>
              Initial consult booked
            </label>
          </div>
        </div>

        {/* Call tracking — Foundations or Extension only */}
        {callsTotal > 0 && (
          <div style={{ background: C.blueLight, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.blueDark }}>
                Check-in calls: {callsUsed} of {callsTotal} used · {Math.max(0, callsTotal - callsUsed)} remaining
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {Array.from({ length: callsTotal }).map((_, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 14,
                  background: i < callsUsed ? C.blue : C.white,
                  border: `2px solid ${i < callsUsed ? C.blue : C.border}`,
                  color: i < callsUsed ? C.white : C.muted,
                  cursor: "pointer",
                }} onClick={() => setCallsUsed(i < callsUsed ? i : i + 1)}
                  title={i < callsUsed ? "Click to unmark" : "Click to mark as used"}>
                  {i < callsUsed ? "✓" : i + 1}
                </div>
              ))}
              <span style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>Click to mark used</span>
            </div>
          </div>
        )}

        {/* Package summary */}
        {pkg && (
          <div style={{ background: C.goldLight, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.dark }}>
            {PACKAGES[pkg].label} · {parseInt(supportDays)} days total
            {extensionWeeks > 0 ? ` (incl. ${extensionWeeks} extension wk${extensionWeeks > 1 ? "s" : ""})` : ""}
            {callsTotal > 0 ? ` · ${callsTotal} check-in calls` : ""}
          </div>
        )}
      </div>

      {/* General settings */}
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
            <label style={gStyle.label}>Package start date (auto-set)</label>
            <input style={gStyle.input} type="date" value={packageStartDate} onChange={(e) => setPackageStartDate(e.target.value)} />
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

      {/* Testimonial & Feedback */}
      <div style={gStyle.card}>
        <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 16px" }}>Testimonial & Feedback</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={gStyle.label}>Testimonial</label>
          <textarea
            style={{ ...gStyle.input, minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
            placeholder="Paste client testimonial here once received…"
            value={testimonialText}
            onChange={(e) => setTestimonialText(e.target.value)}
          />
        </div>
        <div>
          <label style={gStyle.label}>Feedback / Notes</label>
          <textarea
            style={{ ...gStyle.input, minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
            placeholder="Private feedback or notes about this client's program…"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </div>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
          Saved when you click Save Changes above. Not visible to the client.
        </p>
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
    const { data } = await supabase.from("settings").select("value").eq("key", "coach_password").maybeSingle();
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
  const [clientPackage, setClientPackage] = useState(null);
  const [diaryCount, setDiaryCount] = useState(0);

  useEffect(() => {
    // Load intake completion
    supabase.from("intake_responses").select("id, completed")
      .eq("client_id", session.clientId).maybeSingle()
      .then(({ data }) => {
        const done = !!(data?.completed);
        setHasIntake(done);
        if (!done) setTab("intake");
      });
    // Load package info
    supabase.from("clients").select("package, extension_weeks, calls_total, calls_used, consult_booked")
      .eq("id", session.clientId).maybeSingle()
      .then(({ data }) => { if (data) setClientPackage(data); });
    // Load diary count
    supabase.from("sleep_diary").select("id", { count: "exact", head: true })
      .eq("client_id", session.clientId)
      .then(({ count }) => setDiaryCount(count || 0));
  }, [session.clientId]);

  const tabs = [
    { key: "diary", label: "Sleep Diary" },
    { key: "intake", label: "Questionnaire" },
    { key: "plan", label: "📋 Sleep Plan" },
    { key: "toolbox", label: "🧰 Toolbox" },
  ];

  // Check-in call eligibility
  const hasFoundations = clientPackage?.package === "foundations";
  const hasExtension = (clientPackage?.extension_weeks || 0) > 0;
  const callsTotal = clientPackage?.calls_total || 0;
  const callsUsed = clientPackage?.calls_used || 0;
  const callsRemaining = Math.max(0, callsTotal - callsUsed);
  const checkinUnlocked = diaryCount >= CHECKIN_UNLOCK_DAYS &&
    hasIntake && clientPackage?.consult_booked &&
    (hasFoundations || hasExtension) && callsRemaining > 0;

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
      <div className="no-print" style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 16px", display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer",
            fontFamily: font.body, fontSize: 14, fontWeight: 600,
            color: tab === t.key ? C.terracotta : C.muted,
            borderBottom: tab === t.key ? `2px solid ${C.terracotta}` : "2px solid transparent",
            whiteSpace: "nowrap",
          }}>
            {t.label}
          </button>
        ))}
        {/* Book a Call button — only for eligible clients */}
        {checkinUnlocked && (
          <a
            href={CHECKIN_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: "auto",
              padding: "8px 16px",
              background: C.terracotta,
              color: C.white,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: font.body,
              textDecoration: "none",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            📞 Book a Call
            <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
              {callsRemaining} left
            </span>
          </a>
        )}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
        {tab === "diary" && <SleepDiaryViewer clientId={session.clientId} isCoach={false} />}
        {tab === "plan" && <SleepPlanEditor clientId={session.clientId} isCoach={false} />}
        {tab === "toolbox" && <KnowledgeToolbox clientId={session.clientId} isCoach={false} />}
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
  const [savedMsg, setSavedMsg] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef(null);

  // Load existing responses on mount
  useEffect(() => {
    supabase.from("intake_responses").select("*")
      .eq("client_id", clientId).maybeSingle()
      .then(({ data }) => {
        if (data) setResponses(data);
        setLoaded(true);
      });
  }, [clientId]);

  // Core save function — check if row exists then insert or update
  const saveNow = async (data, markCompleted = false) => {
    // Strip system fields
    const { id, client_id, created_at, completed, ...fields } = data;

    // Check if a row already exists for this client
    const { data: existing } = await supabase
      .from("intake_responses")
      .select("id, completed")
      .eq("client_id", clientId)
      .maybeSingle();

    // IMPORTANT: never downgrade completed from true to false
    // If already completed, keep it completed regardless of markCompleted param
    const completedValue = existing?.completed === true ? true : markCompleted;

    const payload = { ...fields, completed: completedValue };

    let error;
    if (existing?.id) {
      ({ error } = await supabase
        .from("intake_responses")
        .update(payload)
        .eq("id", existing.id));
    } else {
      ({ error } = await supabase
        .from("intake_responses")
        .insert({ ...payload, client_id: clientId }));
    }
    if (error) console.error("Intake save error:", error);
    return !error;
  };

  // Auto-save debounced 1000ms after each field change
  useEffect(() => {
    if (!loaded || Object.keys(responses).length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    saveTimerRef.current = setTimeout(async () => {
      await saveNow(responses, false);
      setSaving(false);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [responses, loaded]);

  const set = (key, val) => setResponses((r) => ({ ...r, [key]: val }));

  // Save immediately then move section
  const goToSection = async (next) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    await saveNow(responses, false);
    setSaving(false);
    setSection(next);
    window.scrollTo(0, 0);
  };

  const submit = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    await saveNow(responses, true);
    // Send email notification
    try {
      const { data: clientData } = await supabase
        .from("clients").select("name").eq("id", clientId).maybeSingle();
      await supabase.functions.invoke("notify-intake", {
        body: { clientName: clientData?.name || "A client", clientId },
      });
    } catch (e) { console.error("Email notify error:", e); }

    // Auto-set package_start_date if intake + diary both complete and date not yet set
    try {
      const { data: clientRow } = await supabase
        .from("clients").select("package_start_date").eq("id", clientId).maybeSingle();
      if (!clientRow?.package_start_date) {
        const { count } = await supabase
          .from("sleep_diary").select("id", { count: "exact", head: true })
          .eq("client_id", clientId);
        if ((count || 0) >= 5) {
          await supabase.from("clients").update({ package_start_date: today() }).eq("id", clientId);
        }
      }
    } catch (e) { /* silent */ }

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
          <button style={{ ...gStyle.btnSecondary, flex: 1 }} onClick={() => goToSection(section - 1)} disabled={saving}>Back</button>
        )}
        {isLast ? (
          <button style={{ ...gStyle.btnPrimary, flex: 1 }} onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Submit Questionnaire"}
          </button>
        ) : (
          <button style={{ ...gStyle.btnPrimary, flex: 1 }} onClick={() => goToSection(section + 1)} disabled={saving}>
            {saving ? "Saving…" : "Next →"}
          </button>
        )}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: savedMsg ? C.success : C.muted, marginTop: 12 }}>
        {savedMsg ? "✓ Progress saved" : saving ? "Saving…" : "Your answers are saved automatically"}
      </p>
    </div>
  );
}

// ── SLEEP DIARY ─────────────────────────────────────────────────────────────
const BOOKING_URL = "https://calendar.app.google/UJPyiq6md5VCxfuV6";
const CHECKIN_BOOKING_URL = "https://calendar.app.google/zSnQxyG6BEYxUVch9";
const DIARY_DAYS_REQUIRED = 5;
const CHECKIN_UNLOCK_DAYS = 7;

const PACKAGES = {
  gentle_start:  { label: "Gentle Start",       weeks: 4, days: 28, calls: 0, price: "$425" },
  foundations:   { label: "Foundations of Sleep", weeks: 6, days: 42, calls: 6, price: "$695" },
};
const EXTENSION = { label: "Extension Week", days: 7, calls: 1, price: "$175" };

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
        .maybeSingle();
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

    // Calculate nap total from current entry
    const totalNapMins = calcNapMins(data);

    // ── NEW LOGIC: night_sleep and total_sleep_24h belong to the day the child went to sleep ──
    // night_sleep on Day N = Day N bed_time → Day N+1 wake_time
    // total_sleep_24h on Day N = Day N naps + Day N night sleep
    // This means:
    //   - When wake_time is entered on Day N, update YESTERDAY's night_sleep and total
    //   - When bed_time is entered on Day N, calculate once tomorrow's wake is known

    const { id, created_at, ...rest } = data;

    // Step 1: Calculate today's night sleep using TODAY's bed_time → TOMORROW's wake_time
    const nextDateStr = offsetDate(date, +1);
    const { data: nextEntry } = await supabase
      .from("sleep_diary").select("id, wake_time, total_nap_mins")
      .eq("client_id", clientId).eq("date", nextDateStr).maybeSingle();

    const tomorrowWake = nextEntry?.wake_time ? nextEntry.wake_time.slice(0, 5) : null;
    const nightSleep = calcNightSleep(rest.bed_time, tomorrowWake);
    const total24h = totalNapMins + (nightSleep || 0);

    // Step 2: Build and save today's payload
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
      total_nap_mins: totalNapMins,
      night_sleep_mins: nightSleep,
      total_sleep_24h: total24h,
    };

    const { error } = await supabase
      .from("sleep_diary")
      .upsert(payload, { onConflict: "client_id,date" });
    if (error) {
      console.error("Diary save error:", error);
      setSaving(false);
      return;
    }

    // Step 3: When today's wake_time is entered, update YESTERDAY's night_sleep and total
    // Because yesterday's night = yesterday bed → today wake
    const prevDateStr = offsetDate(date, -1);
    const { data: prevEntry } = await supabase
      .from("sleep_diary").select("id, bed_time, total_nap_mins")
      .eq("client_id", clientId).eq("date", prevDateStr).maybeSingle();
    if (prevEntry?.id && prevEntry.bed_time) {
      const prevNightSleep = calcNightSleep(prevEntry.bed_time, rest.wake_time);
      const prevTotal = (prevEntry.total_nap_mins || 0) + (prevNightSleep || 0);
      await supabase.from("sleep_diary").update({
        night_sleep_mins: prevNightSleep,
        total_sleep_24h: prevTotal,
      }).eq("id", prevEntry.id);
    }

    // Step 4: Update local state so display refreshes immediately
    setEntry(prev => prev ? {
      ...prev,
      total_nap_mins: totalNapMins,
      night_sleep_mins: nightSleep,
      total_sleep_24h: total24h,
    } : prev);

    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
    loadDiaryCount();

    // Auto-set package_start_date when 5th diary entry saved + intake complete
    if (!isCoach) {
      try {
        const { count } = await supabase
          .from("sleep_diary").select("id", { count: "exact", head: true })
          .eq("client_id", clientId);
        if ((count || 0) >= 5) {
          const { data: clientRow } = await supabase
            .from("clients").select("package_start_date").eq("id", clientId).maybeSingle();
          if (!clientRow?.package_start_date) {
            const { data: intakeRow } = await supabase
              .from("intake_responses").select("completed").eq("client_id", clientId).maybeSingle();
            if (intakeRow?.completed) {
              await supabase.from("clients").update({ package_start_date: today() }).eq("id", clientId);
            }
          }
        }
      } catch (e) { /* silent */ }
    }
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
    setSelectedDate(offsetDate(selectedDate, delta));
  };

  const handleDateChange = (newDate) => setSelectedDate(newDate);

  if (loading || !entry) return <p style={{ color: C.muted, padding: 40 }}>Loading…</p>;

  const totalNapMins = calcNapMins(entry);
  const nightSleepMins = entry.night_sleep_mins || null;
  const total24h = totalNapMins + (nightSleepMins || 0);
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
          { label: "Total nap sleep", value: fmtDuration(totalNapMins) },
          { label: "Tonight's sleep", value: nightSleepMins ? fmtDuration(nightSleepMins) : "Enter bedtime + tomorrow's wake" },
          { label: "Total sleep (24h)", value: fmtDuration(total24h) },
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
        <h3 style={{ fontFamily: font.display, color: C.blue, margin: "0 0 4px" }}>Morning Wake</h3>
        <p style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>Enter times in 24hr format — e.g. 07:00, 13:30, 19:45</p>
        <label style={gStyle.label}>Wake time</label>
        <TimeSelect value={entry.wake_time} onChange={(v) => update("wake_time", v)} disabled={isCoach} placeholder="Select wake time…" />
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
                  <TimeSelect value={nap.start} onChange={(v) => updateNap(idx, "start", v)} disabled={isCoach} placeholder="Start…" />
                </div>
                <div>
                  <label style={gStyle.label}>End</label>
                  <TimeSelect value={nap.end} onChange={(v) => updateNap(idx, "end", v)} disabled={isCoach} placeholder="End…" />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={gStyle.label}>How did they fall asleep?</label>
                <textarea style={{ ...gStyle.input, minHeight: 56, resize: "vertical" }} value={nap.how_fell_asleep || ""}
                  placeholder="e.g. fed to sleep, rocked, independently, with dummy..."
                  onChange={(e) => updateNap(idx, "how_fell_asleep", e.target.value)} disabled={isCoach} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={gStyle.label}>Where did they nap?</label>
                <textarea style={{ ...gStyle.input, minHeight: 56, resize: "vertical" }} value={nap.location || ""}
                  placeholder="e.g. cot, pram, carrier, car, arms..."
                  onChange={(e) => updateNap(idx, "location", e.target.value)} disabled={isCoach} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={gStyle.label}>Did they need to be resettled?</label>
                <textarea style={{ ...gStyle.input, minHeight: 56, resize: "vertical" }} value={nap.resettled || ""}
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
            <TimeSelect value={entry.routine_start_time} onChange={(v) => update("routine_start_time", v)} disabled={isCoach} placeholder="Select time…" />
          </div>
          <div>
            <label style={gStyle.label}>Time into bed</label>
            <TimeSelect value={entry.into_bed_time} onChange={(v) => update("into_bed_time", v)} disabled={isCoach} placeholder="Select time…" />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={gStyle.label}>Time went to sleep</label>
          <TimeSelect value={entry.bed_time} onChange={(v) => update("bed_time", v)} disabled={isCoach} placeholder="Select time…" />
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
              onChange={(e) => update("night_wakings_notes", e.target.value)} disabled={isCoach} style={{ ...gStyle.input, minHeight: 60 }} />
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

// ── SLEEP ANALYSIS ───────────────────────────────────────────────────────────
function SleepAnalysis({ client }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("sleep_diary").select("*")
      .eq("client_id", client.id)
      .order("date", { ascending: true })
      .then(({ data }) => {
        setEntries(data || []);
        setLoading(false);
      });
  }, [client.id]);

  if (loading) return <p style={{ color: C.muted, padding: 40 }}>Loading analysis…</p>;
  if (entries.length === 0) return (
    <div style={{ ...gStyle.card, textAlign: "center", padding: 48, color: C.muted }}>
      No sleep diary entries yet for this client.
    </div>
  );

  // ── Compute metrics per day ──────────────────────────────
  // Option B: For analysis, calculate night sleep using BACKWARD direction
  // (prev bed → current wake) so every day from Day 2 has complete data.
  // This gives better averages — only Day 1 is incomplete, not the last day.
  // The diary display uses forward direction (bed → next wake) for client clarity.

  const days = entries.map((e, idx) => {
    const napMins = e.total_nap_mins || 0;
    const napCount = Array.isArray(e.naps) ? e.naps.filter(n => n.start && n.end).length : 0;

    // Option B: backward night sleep calc (prev bed → today wake) for analysis accuracy
    const prevEntry = idx > 0 ? entries[idx - 1] : null;
    const backwardNightMins = prevEntry?.bed_time && e.wake_time
      ? calcNightSleep(prevEntry.bed_time, e.wake_time)
      : null;

    // Option D: only include total if we have BOTH nap and night data
    // Use backward night sleep for analysis totals
    const totalMins = backwardNightMins !== null
      ? napMins + backwardNightMins
      : null; // null = incomplete, excluded from averages

    // Wake windows: time from wake to first nap, between naps, last nap to bed
    const wakeWindows = [];
    const naps = Array.isArray(e.naps) ? e.naps.filter(n => n.start && n.end) : [];
    if (e.wake_time && naps.length > 0 && naps[0].start) {
      const ww = diffMins(parseTime(e.wake_time), parseTime(naps[0].start));
      if (ww > 0 && ww < 600) wakeWindows.push(ww);
    }
    for (let i = 0; i < naps.length - 1; i++) {
      if (naps[i].end && naps[i+1].start) {
        const ww = diffMins(parseTime(naps[i].end), parseTime(naps[i+1].start));
        if (ww > 0 && ww < 600) wakeWindows.push(ww);
      }
    }
    const lastNapEnd = naps.length > 0 ? naps[naps.length-1].end : null;
    if (lastNapEnd && e.bed_time) {
      const ww = diffMins(parseTime(lastNapEnd), parseTime(e.bed_time));
      if (ww > 0 && ww < 600) wakeWindows.push(ww);
    }
    const avgWW = wakeWindows.length > 0
      ? Math.round(wakeWindows.reduce((a,b) => a+b,0) / wakeWindows.length) : null;

    const nightWakings = e.night_wakings_count !== null && e.night_wakings_count !== ""
      ? parseInt(e.night_wakings_count) : null;
    const wakeTime = e.wake_time || null;
    const bedTime = e.bed_time || null;

    return {
      date: e.date,
      label: new Date(e.date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
      napMins,
      nightMins: backwardNightMins,
      totalMins,
      napCount, avgWW, nightWakings, wakeTime, bedTime,
    };
  });

  // ── Averages — Option D: exclude incomplete days (null values) ────────────
  const avg = (arr) => {
    // Filter out nulls AND zeros — only average days with real data
    const valid = arr.filter(v => v !== null && v > 0);
    return valid.length > 0 ? Math.round(valid.reduce((a,b) => a+b,0) / valid.length) : null;
  };
  const avgNap      = avg(days.map(d => d.napMins));
  const avgNight    = avg(days.map(d => d.nightMins));   // excludes Day 1 (no prev bed)
  const avgTotal    = avg(days.map(d => d.totalMins));   // excludes any day without both
  const avgNapCount = avg(days.map(d => d.napCount));
  const avgWW       = avg(days.map(d => d.avgWW));
  const avgNightWakings = avg(days.map(d => d.nightWakings));

  // Count of complete days (for display)
  const completeDays = days.filter(d => d.totalMins !== null).length;

  // ── SVG line chart helper ─────────────────────────────────
  const LineChart = ({ data, color, label, yLabel }) => {
    const valid = data.filter(d => d.value !== null && d.value > 0);
    if (valid.length < 2) return (
      <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "20px 0" }}>
        Not enough data to show trend
      </div>
    );
    const W = 560, H = 160, PAD = { top: 16, right: 16, bottom: 36, left: 48 };
    const minV = Math.min(...valid.map(d => d.value));
    const maxV = Math.max(...valid.map(d => d.value));
    const rangeV = maxV - minV || 60;
    const xScale = (i) => PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right);
    const yScale = (v) => PAD.top + (1 - (v - (minV - 15)) / (rangeV + 30)) * (H - PAD.top - PAD.bottom);

    const points = data.map((d, i) => ({
      x: xScale(i), y: d.value ? yScale(d.value) : null, ...d,
    }));
    const validPoints = points.filter(p => p.y !== null);
    const pathD = validPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    // Y axis ticks
    const ticks = 4;
    const tickVals = Array.from({ length: ticks }, (_, i) =>
      Math.round((minV - 15) + (i / (ticks-1)) * (rangeV + 30))
    );

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        {/* Grid lines */}
        {tickVals.map(v => (
          <line key={v} x1={PAD.left} x2={W - PAD.right}
            y1={yScale(v)} y2={yScale(v)}
            stroke={C.border} strokeWidth="1" />
        ))}
        {/* Y axis labels */}
        {tickVals.map(v => (
          <text key={v} x={PAD.left - 6} y={yScale(v) + 4}
            textAnchor="end" fontSize="10" fill={C.muted}>
            {yLabel === "mins" ? fmtDuration(v) : yLabel === "time" ? fromMin(v) : v}
          </text>
        ))}
        {/* X axis labels — show every other one if many entries */}
        {points.map((p, i) => (
          (i % Math.ceil(points.length / 10) === 0) && (
            <text key={i} x={p.x} y={H - 4}
              textAnchor="middle" fontSize="9" fill={C.muted}>
              {p.label}
            </text>
          )
        ))}
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {validPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="1.5">
            <title>{p.label}: {yLabel === "mins" ? fmtDuration(p.value) : yLabel === "time" ? (p.displayValue || fromMin(p.value)) : yLabel === "naps" ? p.value + " naps" : yLabel === "wakings" ? p.value + " wakings" : p.value}</title>
          </circle>
        ))}
        {/* Average line */}
        {avg([...valid.map(d => d.value)]) && (
          <line x1={PAD.left} x2={W - PAD.right}
            y1={yScale(avg(valid.map(d => d.value)))}
            y2={yScale(avg(valid.map(d => d.value)))}
            stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        )}
      </svg>
    );
  };

  const charts = [
    {
      label: "Total Nap Sleep",
      avg: avgNap,
      color: C.blue,
      data: days.map(d => ({ label: d.label, value: d.napMins })),
      yLabel: "mins",
    },
    {
      label: "Night Sleep",
      avg: avgNight,
      color: C.terracotta,
      data: days.map(d => ({ label: d.label, value: d.nightMins })),
      yLabel: "mins",
    },
    {
      label: "Total Sleep in 24h",
      avg: avgTotal,
      color: C.gold,
      data: days.map(d => ({ label: d.label, value: d.totalMins })),
      yLabel: "mins",
    },
    {
      label: "Number of Naps",
      avg: avgNapCount,
      color: C.blueDark,
      data: days.map(d => ({ label: d.label, value: d.napCount })),
      yLabel: "naps",
    },
    {
      label: "Average Wake Window",
      avg: avgWW,
      color: C.terracottaDark,
      data: days.map(d => ({ label: d.label, value: d.avgWW })),
      yLabel: "mins",
    },
    {
      label: "Night Wakings",
      avg: avgNightWakings,
      color: C.blueDark,
      data: days.map(d => ({ label: d.label, value: d.nightWakings })),
      yLabel: "wakings",
    },
    {
      label: "Morning Wake Time",
      avg: null,
      color: C.gold,
      data: days.map(d => ({
        label: d.label,
        value: d.wakeTime ? parseTime(d.wakeTime) : null,
        displayValue: d.wakeTime ? (() => { const p = parse24ToWheel(d.wakeTime); return p.h !== null ? `${p.h}:${String(p.m).padStart(2,"0")} ${p.ampm.toUpperCase()}` : d.wakeTime; })() : null,
      })),
      yLabel: "time",
    },
    {
      label: "Time Went to Sleep",
      avg: null,
      color: C.terracottaDark,
      data: days.map(d => ({
        label: d.label,
        value: d.bedTime ? parseTime(d.bedTime) : null,
        displayValue: d.bedTime ? (() => { const p = parse24ToWheel(d.bedTime); return p.h !== null ? `${p.h}:${String(p.m).padStart(2,"0")} ${p.ampm.toUpperCase()}` : d.bedTime; })() : null,
      })),
      yLabel: "time",
    },
  ];

  return (
    <div>
      {/* Print button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}
        className="no-print">
        <div>
          <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.terracotta, margin: 0 }}>
            Sleep Analysis
          </h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {entries.length} days logged · {completeDays} complete · averages exclude incomplete days
          </p>
        </div>
        <button
          style={{ ...gStyle.btnGold, display: "flex", alignItems: "center", gap: 8 }}
          onClick={() => window.print()}
        >
          🖨 Print / Save as PDF
        </button>
      </div>

      {/* Print header — only shows when printing */}
      <div className="print-only" style={{ display: "none", marginBottom: 24 }}>
        <div style={{ fontFamily: font.display, fontSize: 24, color: C.terracotta }}>Signs for Sleep</div>
        <div style={{ fontSize: 12, color: C.gold, letterSpacing: "0.05em" }}>Supporting sleep through connection and communication.</div>
        <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>Sleep Analysis — {client.name}</div>
        <div style={{ fontSize: 12, color: C.muted }}>Generated {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</div>
        <hr style={{ borderColor: C.border, margin: "12px 0" }} />
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Avg nap sleep", value: fmtDuration(avgNap), color: C.blue, sub: `${avgNapCount ?? "—"} naps/day` },
          { label: "Avg night sleep", value: fmtDuration(avgNight), color: C.terracotta, sub: "per night" },
          { label: "Avg total 24h", value: fmtDuration(avgTotal), color: C.gold, sub: "all sleep" },
          { label: "Avg wake window", value: fmtDuration(avgWW), color: C.blueDark, sub: "between sleeps" },
          { label: "Avg night wakings", value: avgNightWakings !== null ? avgNightWakings : "—", color: C.terracottaDark, sub: "times per night" },
          { label: "Days logged", value: entries.length, color: C.mid, sub: `${completeDays} complete` },
        ].map((s) => (
          <div key={s.label} style={{
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "16px 14px",
          }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value ?? "—"}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {charts.map((chart) => (
        <div key={chart.label} style={{ ...gStyle.card, marginBottom: 20, pageBreakInside: "avoid" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontFamily: font.display, color: C.dark, margin: 0, fontSize: 16 }}>{chart.label}</h3>
            {chart.avg !== null && (
              <span style={{ fontSize: 13, color: chart.color, fontWeight: 700 }}>
                Avg: {
                  chart.yLabel === "mins" ? fmtDuration(chart.avg) :
                  chart.yLabel === "naps" ? chart.avg + " naps" :
                  chart.yLabel === "wakings" ? chart.avg + " wakings" :
                  chart.avg
                }
              </span>
            )}
          </div>
          <LineChart data={chart.data} color={chart.color} label={chart.label} yLabel={chart.yLabel} />
          <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
            Dashed line = average · Hover dots to see exact values
          </p>
        </div>
      ))}

      {/* Daily breakdown table */}
      <div style={{ ...gStyle.card, pageBreakInside: "avoid" }}>
        <h3 style={{ fontFamily: font.display, color: C.dark, margin: "0 0 16px", fontSize: 16 }}>Daily Breakdown</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {["Date", "Wake Time", "Bedtime", "Naps", "Nap Sleep", "Night Sleep", "Total 24h", "Avg Wake Window", "Night Wakings"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => (
                <tr key={d.date} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.cream }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: C.dark }}>{d.label}</td>
                  <td style={{ padding: "8px 10px", color: C.gold }}>
                    {d.wakeTime ? (() => { const p = parse24ToWheel(d.wakeTime); return p.h !== null ? `${p.h}:${String(p.m).padStart(2,"0")} ${p.ampm.toUpperCase()}` : d.wakeTime; })() : "—"}
                  </td>
                  <td style={{ padding: "8px 10px", color: C.terracottaDark }}>
                    {d.bedTime ? (() => { const p = parse24ToWheel(d.bedTime); return p.h !== null ? `${p.h}:${String(p.m).padStart(2,"0")} ${p.ampm.toUpperCase()}` : d.bedTime; })() : "—"}
                  </td>
                  <td style={{ padding: "8px 10px", color: C.mid }}>{d.napCount}</td>
                  <td style={{ padding: "8px 10px", color: C.blue }}>{fmtDuration(d.napMins)}</td>
                  <td style={{ padding: "8px 10px", color: C.terracotta }}>{fmtDuration(d.nightMins)}</td>
                  <td style={{ padding: "8px 10px", color: C.gold, fontWeight: 600 }}>{fmtDuration(d.totalMins)}</td>
                  <td style={{ padding: "8px 10px", color: C.mid }}>{d.avgWW ? fmtDuration(d.avgWW) : "—"}</td>
                  <td style={{ padding: "8px 10px", color: C.terracottaDark }}>{d.nightWakings !== null ? d.nightWakings : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          button { display: none !important; }
          /* Hide app chrome — header, tabs, nav */
          header, nav, [style*="sticky"], [style*="position: sticky"] { display: none !important; }
          /* Hide tab bar */
          div[style*="borderBottom"][style*="padding: \"0 24px\""] { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ── SLEEP PLAN ───────────────────────────────────────────────────────────────

const DEFAULT_SECTIONS = [
  { key: "consult_summary",   title: "Consult Summary" },
  { key: "goals",             title: "Goals" },
  { key: "sleep_reasons",     title: "Possible Reasons for Your Current Sleep Situation" },
  { key: "focus",             title: "What We Will Focus On" },
  { key: "methods",           title: "Sleep Methods & Strategies" },
  { key: "nap_schedule",      title: "Nap Schedule" },
  { key: "bedtime_routine",   title: "Bedtime Routine" },
  { key: "night_waking",      title: "Night Waking Plan" },
  { key: "additional_notes",  title: "Additional Notes" },
];

function SleepPlanEditor({ clientId, clientData, isCoach }) {
  const [plan, setPlan]         = useState(null);
  const [sections, setSections] = useState([]);
  const [saving, setSaving]     = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [viewingVersion, setViewingVersion] = useState(null);
  const [childName, setChildName] = useState("");
  const saveTimer = useRef(null);

  // Load child name from intake
  useEffect(() => {
    supabase.from("intake_responses").select("child_name")
      .eq("client_id", clientId).maybeSingle()
      .then(({ data }) => { if (data?.child_name) setChildName(data.child_name); });
  }, [clientId]);

  // Load plan and sections
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: planData } = await supabase
        .from("sleep_plans").select("*")
        .eq("client_id", clientId).maybeSingle();

      if (planData) {
        setPlan(planData);
        const { data: secData } = await supabase
          .from("sleep_plan_sections").select("*")
          .eq("plan_id", planData.id)
          .order("sort_order", { ascending: true });
        setSections(secData || []);
        // Load versions
        const { data: verData } = await supabase
          .from("sleep_plan_versions").select("*")
          .eq("plan_id", planData.id)
          .order("created_at", { ascending: false });
        setVersions(verData || []);
      } else if (isCoach) {
        // Initialise with default sections for coach
        setSections(DEFAULT_SECTIONS.map((s, i) => ({
          id: null, plan_id: null,
          section_key: s.key, title: s.title,
          content: "", sort_order: i,
        })));
      }
      setLoading(false);
    };
    load();
  }, [clientId, isCoach]);

  // Save plan to Supabase
  const savePlan = async (secs, opts = {}) => {
    setSaving(true);
    let planId = plan?.id;

    // Create plan row if it doesn't exist
    if (!planId) {
      const { data: newPlan } = await supabase
        .from("sleep_plans")
        .insert({ client_id: clientId, shared: false })
        .select("*").maybeSingle();
      if (newPlan) { setPlan(newPlan); planId = newPlan.id; }
    }
    if (!planId) { setSaving(false); return; }

    // Upsert all sections
    const toSave = secs.map((s, i) => ({
      plan_id: planId,
      section_key: s.section_key || null,
      title: s.title,
      content: s.content || "",
      sort_order: i,
    }));

    // Delete existing sections and reinsert (simplest way to handle reorder/delete)
    await supabase.from("sleep_plan_sections").delete().eq("plan_id", planId);
    const { data: savedSecs } = await supabase
      .from("sleep_plan_sections").insert(toSave).select("*");
    if (savedSecs) setSections(savedSecs.sort((a,b) => a.sort_order - b.sort_order));

    // If sharing for first time or updating shared plan, save version snapshot
    if (opts.share || (plan?.shared && !opts.unshare)) {
      await supabase.from("sleep_plan_versions").insert({
        plan_id: planId,
        snapshot: toSave,
      });
      // Reload versions
      const { data: verData } = await supabase
        .from("sleep_plan_versions").select("*")
        .eq("plan_id", planId)
        .order("created_at", { ascending: false });
      setVersions(verData || []);
    }

    // Update shared status if needed
    if (opts.share !== undefined) {
      const update = { shared: opts.share };
      if (opts.share) update.shared_at = new Date().toISOString();
      await supabase.from("sleep_plans").update(update).eq("id", planId);
      setPlan(prev => ({ ...prev, ...update, shared: opts.share }));
    }

    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  // Debounced auto-save
  const handleSectionChange = (idx, field, value) => {
    const updated = sections.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    setSections(updated);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => savePlan(updated), 1500);
  };

  const addCustomSection = () => {
    const updated = [...sections, {
      id: null, plan_id: plan?.id || null,
      section_key: null, title: "Custom Section",
      content: "", sort_order: sections.length,
    }];
    setSections(updated);
  };

  const removeSection = (idx) => {
    const updated = sections.filter((_, i) => i !== idx);
    setSections(updated);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => savePlan(updated), 1500);
  };

  const sharePlan = async () => {
    await savePlan(sections, { share: true });
    // Notify client via in-app flag on plan
    alert("Sleep plan shared with client! They will see a notification next time they log in.");
  };

  const unshare = async () => {
    await supabase.from("sleep_plans").update({ shared: false }).eq("id", plan.id);
    setPlan(prev => ({ ...prev, shared: false }));
  };

  const printPlan = () => window.print();

  if (loading) return <p style={{ color: C.muted, padding: 40 }}>Loading sleep plan…</p>;

  // Client view — only show if plan exists and is shared
  if (!isCoach) {
    if (!plan || !plan.shared) return (
      <div style={{ ...gStyle.card, textAlign: "center", padding: 48, color: C.muted }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
        <p style={{ fontSize: 16, marginBottom: 8 }}>Your sleep plan isn't ready yet.</p>
        <p style={{ fontSize: 13 }}>Your consultant will share it with you after your consult.</p>
      </div>
    );

    const filledSections = (viewingVersion
      ? viewingVersion.snapshot
      : sections
    ).filter(s => s.content && s.content.trim());

    return (
      <div>
        {/* Print header */}
        <div className="print-only" style={{ display: "none", marginBottom: 24, textAlign: "center" }}>
          <img src="https://zkesnhhduxtxinjdkbyn.supabase.co/storage/v1/object/public/assets/logo.png"
            alt="Signs for Sleep" style={{ maxWidth: 280, height: "auto" }} />
          <div style={{ fontSize: 12, color: C.gold, marginTop: 4 }}>
            Supporting sleep through connection and communication.
          </div>
          <div style={{ fontFamily: font.display, fontSize: 20, color: C.terracotta, marginTop: 12 }}>
            Sleep Plan{childName ? ` for ${childName}` : ""}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            {plan.shared_at ? `Shared ${new Date(plan.shared_at).toLocaleDateString("en-AU", { day:"numeric", month:"long", year:"numeric" })}` : ""}
          </div>
          <hr style={{ borderColor: C.border, margin: "16px 0" }} />
        </div>

        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.terracotta, margin: 0 }}>
              {childName ? `Sleep Plan for ${childName}` : "Your Sleep Plan"}
            </h2>
            {plan.shared_at && (
              <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                Shared {new Date(plan.shared_at).toLocaleDateString("en-AU", { day:"numeric", month:"long", year:"numeric" })}
              </p>
            )}
          </div>
          <button style={gStyle.btnGold} onClick={printPlan}>🖨 Print / Save PDF</button>
        </div>

        {filledSections.length === 0 ? (
          <div style={{ ...gStyle.card, color: C.muted, textAlign: "center", padding: 40 }}>
            No content has been added to your sleep plan yet.
          </div>
        ) : (
          filledSections.map((s, i) => (
            <div key={i} style={{ ...gStyle.card, pageBreakInside: "avoid" }}>
              <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 12px", fontSize: 18 }}>
                {s.title}
              </h3>
              <div style={{ fontSize: 14, color: C.dark, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {s.content}
              </div>
            </div>
          ))
        )}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white !important; }
          }
        `}</style>
      </div>
    );
  }

  // Coach view — full editor
  const filledCount = sections.filter(s => s.content && s.content.trim()).length;

  return (
    <div>
      {/* Coach toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.terracotta, margin: 0 }}>
            {childName ? `Sleep Plan for ${childName}` : "Sleep Plan"}
          </h2>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {filledCount} of {sections.length} sections filled · {saving ? "Saving…" : savedMsg ? "✓ Saved" : "Auto-saves as you type"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {versions.length > 0 && (
            <button style={gStyle.btnSecondary} onClick={() => setShowVersions(!showVersions)}>
              🕐 History ({versions.length})
            </button>
          )}
          <button style={gStyle.btnGold} onClick={printPlan}>🖨 Print / PDF</button>
          {plan?.shared ? (
            <button style={gStyle.btnDanger} onClick={unshare}>Unshare from client</button>
          ) : (
            <button style={{ ...gStyle.btnPrimary, width: "auto" }} onClick={sharePlan}>
              Share with client
            </button>
          )}
        </div>
      </div>

      {/* Shared status banner */}
      {plan?.shared && (
        <div style={{ background: C.successLight, borderRadius: 10, padding: "10px 16px",
          marginBottom: 20, fontSize: 13, color: C.success, display: "flex", justifyContent: "space-between" }}>
          <span>✓ This plan is visible to the client</span>
          <span style={{ color: C.muted }}>
            Shared {plan.shared_at ? new Date(plan.shared_at).toLocaleDateString("en-AU") : ""}
          </span>
        </div>
      )}

      {/* Version history */}
      {showVersions && versions.length > 0 && (
        <div style={{ ...gStyle.card, marginBottom: 20, background: C.cream }}>
          <h4 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 12px" }}>Version History</h4>
          {versions.map((v, i) => (
            <div key={v.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0", borderBottom: i < versions.length - 1 ? `1px solid ${C.border}` : "none"
            }}>
              <span style={{ fontSize: 13, color: C.dark }}>
                Version {versions.length - i} — {new Date(v.created_at).toLocaleDateString("en-AU", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </span>
              <button
                style={{ ...gStyle.btnSecondary, padding: "4px 12px", fontSize: 12 }}
                onClick={() => setViewingVersion(viewingVersion?.id === v.id ? null : v)}
              >
                {viewingVersion?.id === v.id ? "Close" : "View"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Viewing old version */}
      {viewingVersion && (
        <div style={{ ...gStyle.card, borderColor: C.gold, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontFamily: font.display, color: C.gold, margin: 0 }}>
              Viewing version from {new Date(viewingVersion.created_at).toLocaleDateString("en-AU")}
            </h4>
            <button style={gStyle.btnSecondary} onClick={() => setViewingVersion(null)}>Back to current</button>
          </div>
          {viewingVersion.snapshot.filter(s => s.content?.trim()).map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: C.dark, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{s.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* Print header */}
      <div className="print-only" style={{ display: "none", marginBottom: 24, textAlign: "center" }}>
        <img src="https://zkesnhhduxtxinjdkbyn.supabase.co/storage/v1/object/public/assets/logo.png"
          alt="Signs for Sleep" style={{ maxWidth: 280, height: "auto" }} />
        <div style={{ fontFamily: font.display, fontSize: 11, color: C.gold,
          letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>
          Supporting sleep through connection and communication.
        </div>
        <div style={{ fontFamily: font.display, fontSize: 20, color: C.terracotta, marginTop: 12 }}>
          Sleep Plan{childName ? ` for ${childName}` : ""}
        </div>
        <hr style={{ borderColor: C.border, margin: "16px 0" }} />
      </div>

      {/* Sections */}
      {sections.map((s, idx) => (
        <div key={idx} style={{ ...gStyle.card, marginBottom: 16 }} className="no-print">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            {s.section_key ? (
              <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: 0, fontSize: 16 }}>
                {s.title}
              </h3>
            ) : (
              <input
                style={{ ...gStyle.input, fontFamily: font.display, fontSize: 16,
                  color: C.terracotta, border: "none", padding: 0, fontWeight: 700, flex: 1 }}
                value={s.title}
                onChange={(e) => handleSectionChange(idx, "title", e.target.value)}
                placeholder="Section title…"
              />
            )}
            {!s.section_key && (
              <button onClick={() => removeSection(idx)}
                style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, marginLeft: 8 }}>
                ×
              </button>
            )}
          </div>
          <textarea
            style={{ ...gStyle.input, minHeight: 120, resize: "vertical", lineHeight: 1.7 }}
            placeholder={s.section_key ? `Add ${s.title.toLowerCase()} here…` : "Add content here…"}
            value={s.content || ""}
            onChange={(e) => handleSectionChange(idx, "content", e.target.value)}
          />
          {!s.content?.trim() && (
            <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Leave empty to hide this section from the client
            </p>
          )}
        </div>
      ))}

      {/* Print version of sections */}
      {sections.filter(s => s.content?.trim()).map((s, i) => (
        <div key={i} className="print-only" style={{ display: "none", pageBreakInside: "avoid", marginBottom: 20 }}>
          <h3 style={{ fontFamily: font.display, color: C.terracotta, fontSize: 16, marginBottom: 8 }}>{s.title}</h3>
          <p style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", color: C.dark }}>{s.content}</p>
        </div>
      ))}

      {/* Add custom section */}
      <button
        onClick={addCustomSection}
        style={{ ...gStyle.btnSecondary, width: "100%", marginBottom: 16, borderStyle: "dashed" }}
      >
        + Add Custom Section
      </button>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          button { display: none !important; }
          /* Hide app chrome — header, tabs, nav */
          header, nav, [style*="sticky"], [style*="position: sticky"] { display: none !important; }
          /* Hide tab bar */
          div[style*="borderBottom"][style*="padding: \"0 24px\""] { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE TOOLBOX — client offboarding document
// ═══════════════════════════════════════════════════════════════════════════

const emptyTile = () => ({
  id: Math.random().toString(36).slice(2),
  situation: "",
  strategy_id: "",
  strategy_title: "",
  strategy_description: "",
});

// Turns a DOB into a friendly age label, e.g. "20 months" or "2y 3m"
function ageFromDOB(dobStr, atDate) {
  if (!dobStr) return "";
  const dob = new Date(dobStr + "T00:00:00");
  const at = new Date((atDate || today()) + "T00:00:00");
  let months = (at.getFullYear() - dob.getFullYear()) * 12 + (at.getMonth() - dob.getMonth());
  if (at.getDate() < dob.getDate()) months--;
  if (months < 0) months = 0;
  if (months < 24) return `${months} month${months !== 1 ? "s" : ""}`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths === 0 ? `${years} year${years !== 1 ? "s" : ""} old` : `${years}y ${remMonths}m`;
}

// ── STRATEGY LIBRARY MANAGER (coach only) ───────────────────────────────────
// Lets Chloé add/edit/delete strategies without touching code.
function StrategyLibraryManager({ library, onRefresh, onClose }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const addStrategy = async () => {
    if (!title.trim() || !desc.trim()) return;
    setSaving(true);
    if (editingId) {
      await supabase.from("strategy_library")
        .update({ title: title.trim(), description: desc.trim() })
        .eq("id", editingId);
    } else {
      await supabase.from("strategy_library")
        .insert({ title: title.trim(), description: desc.trim(), sort_order: library.length });
    }
    setTitle(""); setDesc(""); setEditingId(null);
    setSaving(false);
    onRefresh();
  };

  const editStrategy = (s) => { setEditingId(s.id); setTitle(s.title); setDesc(s.description); };

  const deleteStrategy = async (id) => {
    await supabase.from("strategy_library").delete().eq("id", id);
    onRefresh();
  };

  return (
    <div style={{ ...gStyle.card, borderColor: C.gold, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontFamily: font.display, color: C.gold, margin: 0 }}>Manage Strategy Library</h3>
        <button style={gStyle.btnSecondary} onClick={onClose}>Close</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={gStyle.label}>Strategy name</label>
        <input style={{ ...gStyle.input, marginBottom: 10 }} value={title}
          onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sleep pressure" />
        <label style={gStyle.label}>Description</label>
        <textarea style={{ ...gStyle.input, minHeight: 70, resize: "vertical", marginBottom: 10 }}
          value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="How this strategy works…" />
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...gStyle.btnPrimary, width: "auto" }} onClick={addStrategy} disabled={saving}>
            {editingId ? "Save changes" : "+ Add strategy"}
          </button>
          {editingId && (
            <button style={gStyle.btnSecondary} onClick={() => { setEditingId(null); setTitle(""); setDesc(""); }}>
              Cancel edit
            </button>
          )}
        </div>
      </div>

      {library.length > 0 && (
        <div>
          {library.map((s) => (
            <div key={s.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: "10px 0", borderTop: `1px solid ${C.border}`, gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>{s.description}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button style={{ ...gStyle.btnSecondary, padding: "4px 10px", fontSize: 12 }} onClick={() => editStrategy(s)}>Edit</button>
                <button style={{ ...gStyle.btnDanger, padding: "4px 10px", fontSize: 12 }} onClick={() => deleteStrategy(s.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SHARED HEADER (used by both coach + client + print views) ──────────────
function ToolboxHeader({ toolbox }) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.gold}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Knowledge Toolbox
          </div>
          <div style={{ fontFamily: font.display, fontSize: 28, color: C.dark }}>{toolbox.title || "—"}</div>
          <div style={{ fontSize: 13, color: C.mid, marginTop: 4 }}>
            Prepared by Chloé
            {toolbox.prepared_date ? ` · ${new Date(toolbox.prepared_date + "T00:00:00").toLocaleDateString("en-AU", { month: "long", year: "numeric" })}` : ""}
            {toolbox.child_age_label ? ` · ${toolbox.child_age_label}` : ""}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: font.display, fontSize: 18, color: C.terracotta }}>Signs for Sleep</div>
          <div style={{ fontSize: 11, color: C.mid, letterSpacing: "0.05em", textTransform: "uppercase" }}>Gentle Sleep Consultant</div>
        </div>
      </div>
    </div>
  );
}

function ToolboxTileView({ tile }) {
  return (
    <div style={{ background: C.blueDark, borderRadius: 14, padding: "18px 20px", color: C.white, pageBreakInside: "avoid" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        Your Situation
      </div>
      <div style={{ fontStyle: "italic", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>{tile.situation}</div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          Strategy
        </div>
        <div style={{ fontFamily: font.display, fontSize: 17, marginBottom: 6 }}>{tile.strategy_title}</div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>{tile.strategy_description}</div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT (handles both coach editor and client read-only view) ───
function KnowledgeToolbox({ clientId, clientData, isCoach }) {
  const [toolbox, setToolbox] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [library, setLibrary] = useState([]);
  const [childDob, setChildDob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [showLibraryManager, setShowLibraryManager] = useState(false);
  const saveTimer = useRef(null);

  const loadLibrary = useCallback(async () => {
    const { data } = await supabase.from("strategy_library").select("*").order("sort_order", { ascending: true });
    setLibrary(data || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: intakeData } = await supabase.from("intake_responses")
        .select("child_dob").eq("client_id", clientId).maybeSingle();
      if (intakeData?.child_dob) setChildDob(intakeData.child_dob);

      const { data: tb } = await supabase.from("knowledge_toolboxes")
        .select("*").eq("client_id", clientId).maybeSingle();

      if (tb) {
        setToolbox(tb);
        setTiles(tb.tiles && tb.tiles.length ? tb.tiles : [emptyTile()]);
      } else if (isCoach) {
        setToolbox({
          client_id: clientId,
          title: clientData?.name || "",
          prepared_date: today(),
          child_age_label: "",
          summary_text: "",
          shared: false,
        });
        setTiles([emptyTile()]);
      }
      await loadLibrary();
      setLoading(false);
    };
    load();
  }, [clientId, isCoach, loadLibrary]);

  const saveToolbox = async (updatedToolbox, updatedTiles, opts = {}) => {
    setSaving(true);
    const payload = {
      client_id: clientId,
      title: updatedToolbox.title || null,
      prepared_date: updatedToolbox.prepared_date || null,
      child_age_label: updatedToolbox.child_age_label || null,
      summary_text: updatedToolbox.summary_text || null,
      tiles: updatedTiles,
      updated_at: new Date().toISOString(),
    };
    if (opts.share !== undefined) {
      payload.shared = opts.share;
      if (opts.share) payload.shared_at = new Date().toISOString();
    }

    let saved;
    if (updatedToolbox?.id) {
      ({ data: saved } = await supabase.from("knowledge_toolboxes")
        .update(payload).eq("id", updatedToolbox.id).select("*").maybeSingle());
    } else {
      ({ data: saved } = await supabase.from("knowledge_toolboxes")
        .insert(payload).select("*").maybeSingle());
    }
    if (saved) setToolbox(saved);
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const scheduleSave = (nextToolbox, nextTiles) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveToolbox(nextToolbox, nextTiles), 1000);
  };

  const updateHeaderField = (field, value) => {
    const next = { ...toolbox, [field]: value };
    setToolbox(next);
    scheduleSave(next, tiles);
  };

  const updateTile = (idx, field, value) => {
    const next = tiles.map((t, i) => i === idx ? { ...t, [field]: value } : t);
    setTiles(next);
    scheduleSave(toolbox, next);
  };

  const selectStrategy = (idx, strategyId) => {
    const strat = library.find((s) => s.id === strategyId);
    const next = tiles.map((t, i) => i === idx ? {
      ...t,
      strategy_id: strategyId,
      strategy_title: strat ? strat.title : "",
      strategy_description: strat ? strat.description : "",
    } : t);
    setTiles(next);
    scheduleSave(toolbox, next);
  };

  const addTile = () => {
    const next = [...tiles, emptyTile()];
    setTiles(next);
    scheduleSave(toolbox, next);
  };

  const removeTile = (idx) => {
    const next = tiles.filter((_, i) => i !== idx);
    setTiles(next);
    scheduleSave(toolbox, next);
  };

  const share = async () => { await saveToolbox(toolbox, tiles, { share: true }); };
  const unshare = async () => { await saveToolbox(toolbox, tiles, { share: false }); };
  const printToolbox = () => window.print();

  // Auto-fill age label from the intake DOB once, if the coach hasn't set one
  useEffect(() => {
    if (isCoach && toolbox && childDob && !toolbox.child_age_label) {
      const age = ageFromDOB(childDob, toolbox.prepared_date);
      if (age) updateHeaderField("child_age_label", age);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childDob, toolbox?.prepared_date]);

  if (loading) return <p style={{ color: C.muted, padding: 40 }}>Loading knowledge toolbox…</p>;

  // ── CLIENT VIEW ────────────────────────────────────────────────────────
  if (!isCoach) {
    if (!toolbox || !toolbox.shared) return (
      <div style={{ ...gStyle.card, textAlign: "center", padding: 48, color: C.muted }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🧰</div>
        <p style={{ fontSize: 16, marginBottom: 8 }}>Your Knowledge Toolbox isn't ready yet.</p>
        <p style={{ fontSize: 13 }}>Your consultant will share it with you as your program wraps up.</p>
      </div>
    );

    const filledTiles = tiles.filter((t) => t.strategy_title);

    return (
      <div>
        <ToolboxHeader toolbox={toolbox} />
        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button style={gStyle.btnGold} onClick={printToolbox}>🖨 Print / Save PDF</button>
        </div>
        {toolbox.summary_text && (
          <div style={{
            background: C.terracotta, color: C.white, borderRadius: 14,
            padding: "20px 24px", marginBottom: 24, lineHeight: 1.7, fontSize: 14,
          }}>
            {toolbox.summary_text}
          </div>
        )}
        {filledTiles.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {filledTiles.map((t, i) => <ToolboxTileView key={t.id || i} tile={t} />)}
          </div>
        )}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
          }
        `}</style>
      </div>
    );
  }

  // ── COACH VIEW ─────────────────────────────────────────────────────────
  return (
    <div>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.terracotta, margin: 0 }}>Knowledge Toolbox</h2>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {saving ? "Saving…" : savedMsg ? "✓ Saved" : "Auto-saves as you type"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={gStyle.btnSecondary} onClick={() => setShowLibraryManager((v) => !v)}>
            📚 Strategy Library
          </button>
          <button style={gStyle.btnGold} onClick={printToolbox}>🖨 Print / PDF</button>
          {toolbox?.shared ? (
            <button style={gStyle.btnDanger} onClick={unshare}>Unshare from client</button>
          ) : (
            <button style={{ ...gStyle.btnPrimary, width: "auto" }} onClick={share}>Share with client</button>
          )}
        </div>
      </div>

      {toolbox?.shared && (
        <div className="no-print" style={{
          background: C.successLight, borderRadius: 10, padding: "10px 16px",
          marginBottom: 20, fontSize: 13, color: C.success, display: "flex", justifyContent: "space-between",
        }}>
          <span>✓ Visible to client</span>
          <span style={{ color: C.muted }}>
            Shared {toolbox.shared_at ? new Date(toolbox.shared_at).toLocaleDateString("en-AU") : ""}
          </span>
        </div>
      )}

      {showLibraryManager && (
        <StrategyLibraryManager library={library} onRefresh={loadLibrary} onClose={() => setShowLibraryManager(false)} />
      )}

      {/* Editable header fields */}
      <div style={{ ...gStyle.card, marginBottom: 16 }} className="no-print">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={gStyle.label}>Title (e.g. child & sibling names)</label>
            <input style={gStyle.input} value={toolbox.title || ""} onChange={(e) => updateHeaderField("title", e.target.value)} />
          </div>
          <div>
            <label style={gStyle.label}>Prepared date</label>
            <input type="date" style={gStyle.input} value={toolbox.prepared_date || today()} onChange={(e) => updateHeaderField("prepared_date", e.target.value)} />
          </div>
          <div>
            <label style={gStyle.label}>Age label</label>
            <input style={gStyle.input} value={toolbox.child_age_label || ""} placeholder="e.g. 20 months"
              onChange={(e) => updateHeaderField("child_age_label", e.target.value)} />
          </div>
        </div>
      </div>

      <ToolboxHeader toolbox={toolbox} />

      {/* Progress summary */}
      <div style={{ marginBottom: 20 }} className="no-print">
        <label style={gStyle.label}>Progress summary</label>
        <textarea
          style={{
            ...gStyle.input, minHeight: 100, resize: "vertical", lineHeight: 1.7,
            background: C.terracotta, color: C.white, border: "none", borderRadius: 14, padding: "18px 20px",
          }}
          placeholder="When we started, [child] was… Over our [x] weeks together we…"
          value={toolbox.summary_text || ""}
          onChange={(e) => updateHeaderField("summary_text", e.target.value)}
        />
      </div>

      {/* Tiles */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }} className="no-print">
        <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: 0, fontSize: 16 }}>Your Strategy Toolkit</h3>
        <button style={{ ...gStyle.btnSecondary, padding: "6px 14px", fontSize: 12 }} onClick={addTile}>+ Add tile</button>
      </div>

      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {tiles.map((t, idx) => (
          <div key={t.id || idx} style={{ background: C.blueDark, borderRadius: 14, padding: "18px 20px", color: C.white }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Your Situation
              </span>
              {tiles.length > 1 && (
                <button onClick={() => removeTile(idx)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 16 }}>×</button>
              )}
            </div>
            <textarea
              style={{
                width: "100%", minHeight: 50, resize: "vertical", marginBottom: 14,
                background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8,
                color: C.white, fontFamily: font.body, fontStyle: "italic", fontSize: 13,
                padding: "8px 10px", outline: "none", boxSizing: "border-box",
              }}
              placeholder="Describe the client's particular struggle…"
              value={t.situation}
              onChange={(e) => updateTile(idx, "situation", e.target.value)}
            />
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Strategy
              </label>
              <select
                style={{
                  width: "100%", padding: "8px 10px", borderRadius: 8, border: "none",
                  fontFamily: font.body, fontSize: 13, marginBottom: 10, cursor: "pointer",
                  background: "rgba(255,255,255,0.9)", color: C.dark,
                }}
                value={t.strategy_id || ""}
                onChange={(e) => selectStrategy(idx, e.target.value)}
              >
                <option value="">Select a strategy…</option>
                {library.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              {t.strategy_title && (
                <>
                  <div style={{ fontFamily: font.display, fontSize: 17, marginBottom: 6 }}>{t.strategy_title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>{t.strategy_description}</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Print-only version — mirrors client view exactly */}
      <div className="print-only" style={{ display: "none" }}>
        <ToolboxHeader toolbox={toolbox} />
        {toolbox.summary_text && (
          <div style={{ background: C.terracotta, color: C.white, borderRadius: 14, padding: "20px 24px", marginBottom: 24, lineHeight: 1.7, fontSize: 14 }}>
            {toolbox.summary_text}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {tiles.filter((t) => t.strategy_title).map((t, i) => <ToolboxTileView key={t.id || i} tile={t} />)}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ── SLEEP CALCULATIONS ──────────────────────────────────────────────────────
function calcNapMins(entry) {
  const { naps = [] } = entry;
  return naps.reduce((acc, n) => {
    if (n.start && n.end) {
      const dur = diffMins(parseTime(n.start), parseTime(n.end));
      return acc + (dur > 0 && dur < 480 ? dur : 0);
    }
    return acc;
  }, 0);
}

// Night sleep = previous day bed_time until current day wake_time
// This must be called with both entries available
function calcNightSleep(prevBedTime, todayWakeTime) {
  if (!prevBedTime || !todayWakeTime) return null;
  // Normalise both times to HH:MM (strip seconds if present)
  const normBed = String(prevBedTime).slice(0, 5);
  const normWake = String(todayWakeTime).slice(0, 5);
  const bedMins = parseTime(normBed);
  const wakeMins = parseTime(normWake);
  if (bedMins === null || wakeMins === null) return null;
  // Bed time is PM, wake time is AM next day — add 1440 if wake <= bed
  let night = wakeMins - bedMins;
  if (night <= 0) night += 1440;
  // Sanity check: night sleep should be between 2h and 16h
  if (night < 120 || night > 960) return null;
  return night;
}

function calcSleep(entry) {
  const totalNapMins = calcNapMins(entry);
  return {
    total_nap_mins: totalNapMins,
    night_sleep_mins: null, // calculated cross-day in doSave
    total_sleep_24h: totalNapMins, // updated after night sleep is known
  };
}
