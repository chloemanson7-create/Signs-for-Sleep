// Signs for Sleep - Practice Management App
// Stack: React (single component) + Supabase
// Replace SUPABASE_URL and SUPABASE_ANON_KEY with your actual values

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── CONFIG ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://zkesnhhduxtxinjdkbyn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZXNuaGhkdXh0eGluamRrYnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NDI3OTgsImV4cCI6MjA5MjIxODc5OH0.6yG-4vONpCxi8k_kZm4vIAtUJIV8yxk6PtcKMJKK1Ho";
const COACH_PASSWORD = "sleep2024"; // Change this via Settings inside the app

// Bump the ?v= number any time you replace the logo file in Supabase Storage.
// Supabase's CDN caches files by URL, so re-uploading a file with the SAME
// name won't show up until the URL itself changes — bumping this version
// number forces browsers/the CDN to fetch the new file instead of a cached
// copy of the old one.
const LOGO_URL = "https://zkesnhhduxtxinjdkbyn.supabase.co/storage/v1/object/public/assets/logo.png?v=2";
const DEFAULT_SUPPORT_DAYS = 28;
const DEFAULT_CONTACT_EVERY = 7;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// iOS's "Add to Home Screen" web apps run in standalone mode, with no Safari
// UI around them — and window.print() silently does nothing there (no
// dialog, no error, nothing). It's a WebKit limitation, not something a web
// app can override. Detect it so the print buttons can guide someone to open
// the same page in an actual Safari tab instead, where Print → Save to Files
// works exactly as expected.
const isIosStandalone = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent || navigator.platform || "");
  const standalone = navigator.standalone === true
    || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
  return isIos && !!standalone;
};

// Every "Print / Save PDF" button in the app should call this instead of
// window.print() directly. On iPhone/iPad's installed Home Screen app,
// window.print() silently does nothing — showIosHelp (a useState setter
// passed in by the caller) opens IosPrintHelpModal instead of a plain
// alert(), because a native alert() can't hold a tappable link or QR code.
const printOrGuide = (showIosHelp) => {
  if (isIosStandalone()) {
    if (showIosHelp) showIosHelp(true);
    return;
  }
  window.print();
};

// Shown instead of a plain alert() when Print/Save PDF is tapped from an
// iPhone/iPad's installed Home Screen app. A same-origin link tapped from
// inside that installed app doesn't reliably launch real Safari — iOS keeps
// it inside the app's own standalone window rather than actually breaking
// out — so instead of a link, this gives two things that genuinely do work:
// a "Copy link" button (paste into Safari's address bar) and a QR code
// (scanning it with the iPhone's Camera app opens Safari directly, since
// that's a completely separate context from this installed app).
function IosPrintHelpModal({ open, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const url = typeof window !== "undefined" ? window.location.origin : "";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Clipboard API can fail without permission — the link is still shown
      // on screen below so it can be selected and copied manually.
    }
  };

  const steps = [
    "Long-press the QR code below, then choose \"Open in Safari\" — or scan it with your Camera app.",
    "Log in and go back to this page.",
    "Tap the Share icon, then \"Print\".",
    "On the print preview, tap the Share icon again and choose \"Save to Files\".",
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2100,
      background: "rgba(44,36,32,0.55)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: C.white, borderRadius: 16, padding: 24,
        maxWidth: 340, width: "100%", textAlign: "center",
        maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box",
      }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>🖨️</div>
        <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 8px", fontSize: 18 }}>
          Printing needs Safari
        </h3>
        <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.6, marginBottom: 16 }}>
          The installed app can't open the print dialog on iPhone/iPad — that's
          an Apple restriction on Home Screen apps. To save this as a PDF:
        </p>

        <img src={qrSrc} alt="QR code to open this app in Safari" style={{ width: 110, height: 110, margin: "0 auto 14px", display: "block" }} />

        <ol style={{ textAlign: "left", fontSize: 12.5, color: C.dark, lineHeight: 1.6, margin: "0 0 18px", paddingLeft: 20 }}>
          {steps.map((step, i) => <li key={i} style={{ marginBottom: 6 }}>{step}</li>)}
        </ol>

        <button onClick={copyLink} style={{ ...gStyle.btnPrimary, marginBottom: 6 }}>
          {copied ? "✓ Link copied" : "📋 Copy link instead"}
        </button>
        <p style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>
          Then open Safari and paste it into the address bar
        </p>

        <button onClick={onClose} style={{ ...gStyle.btnSecondary, width: "100%" }}>
          Close
        </button>
      </div>
    </div>
  );
}

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

// Flips a 24-hour "HH:MM" between AM and PM (09:15 <-> 21:15).
const flipAmPm = (t) => {
  const mins = parseTime(t);
  if (mins === null) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${String((h + 12) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// A mistyped AM/PM shows up as a duration that silently wraps past midnight —
// e.g. 12:35 PM to 1:08 AM reads as a 12h 33m "nap". Rather than guess and
// change the data, this returns a flag plus the correction that WOULD make it
// plausible, so the parent can confirm with one tap. Returns null when the
// duration is unremarkable.
const implausibleDuration = (start, end, maxMins) => {
  if (!start || !end) return null;
  const dur = diffMins(parseTime(start), parseTime(end));
  if (dur <= maxMins) return null;
  // Try flipping each side; a single flip that lands in a sensible range is
  // almost always what was meant.
  const candidates = [
    { fixField: "end",   fixValue: flipAmPm(end),   dur: diffMins(parseTime(start), parseTime(flipAmPm(end))) },
    { fixField: "start", fixValue: flipAmPm(start), dur: diffMins(parseTime(flipAmPm(start)), parseTime(end)) },
  ].filter(c => c.fixValue && c.dur > 0 && c.dur <= maxMins);
  candidates.sort((a, b) => a.dur - b.dur);
  return { dur, suggestion: candidates[0] || null };
};

// Night-specific version of the check above. Unlike a same-day nap, flipping
// EITHER the bed_time or the wake_time by 12h produces the exact same
// "fixed" duration (shifting either side of a difference by 12h changes the
// mod-24h result by the same amount either way), so duration alone can never
// tell us which field was actually mistyped — always defaulting to "fix the
// second field" would keep suggesting the wrong one. Instead this leans on
// what time of day each field is: bedtimes are almost always PM/evening (or
// just after midnight), wake times are almost always AM/morning. Whichever
// entered value sits outside its expected half of the day is the one this
// suggests changing.
const implausibleNightDuration = (bedTime, wakeTime, maxMins) => {
  if (!bedTime || !wakeTime) return null;
  const dur = diffMins(parseTime(bedTime), parseTime(wakeTime));
  if (dur <= maxMins) return null;
  const candidates = [
    { fixField: "start", fixValue: flipAmPm(bedTime),  dur: diffMins(parseTime(flipAmPm(bedTime)), parseTime(wakeTime)) },
    { fixField: "end",   fixValue: flipAmPm(wakeTime), dur: diffMins(parseTime(bedTime), parseTime(flipAmPm(wakeTime))) },
  ].filter(c => c.fixValue && c.dur > 0 && c.dur <= maxMins);
  if (candidates.length === 0) return { dur, suggestion: null };
  const bedHour = Math.floor(parseTime(bedTime) / 60);
  const wakeHour = Math.floor(parseTime(wakeTime) / 60);
  const bedLooksWrong = bedHour >= 4 && bedHour < 12;   // entered as morning hours — unusual for a bedtime
  const wakeLooksWrong = wakeHour >= 12;                // entered as afternoon/evening hours — unusual for a wake time
  let suggestion;
  if (bedLooksWrong && !wakeLooksWrong) {
    suggestion = candidates.find(c => c.fixField === "start") || candidates[0];
  } else if (wakeLooksWrong && !bedLooksWrong) {
    suggestion = candidates.find(c => c.fixField === "end") || candidates[0];
  } else {
    // Genuinely ambiguous (both or neither look off) — fall back to shortest resulting duration.
    suggestion = [...candidates].sort((a, b) => a.dur - b.dur)[0];
  }
  return { dur, suggestion };
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
const REPEATS = 9;  // odd number of copies stacked for the circular/infinite-scroll effect
const MID_COPY = Math.floor(REPEATS / 2);

function parse24ToWheel(t) {
  if (!t) return { h: null, m: null, ampm: null };
  const parts = t.slice(0,5).split(":").map(Number);
  const h24 = parts[0], m = parts[1];
  const ampm = h24 < 12 ? "am" : "pm";
  const h12  = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return { h: h12, m, ampm };
}

// Gets the device's current time in HH:MM 24-hour format
const getCurrentTime = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

function wheelTo24(h, m, ampm) {
  if (h === null || m === null || !ampm) return "";
  let h24 = parseInt(h);
  if (ampm === "am" && h24 === 12) h24 = 0;
  if (ampm === "pm" && h24 !== 12) h24 += 12;
  return `${String(h24).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

// Parses free-typed 24-hour text into a canonical "HH:MM" string.
// Deliberately permissive about separators/padding ("930", "9:30", "09.30" all
// work) but strict about the resulting range, so an out-of-range or half-typed
// entry returns null and is simply never committed — the previously saved value
// stays untouched rather than being overwritten with something invalid.
// allowHourOnly lets 1–2 digits mean a whole hour ("12" -> 12:00). That's only
// safe once the client has finished typing, so it's used for the preview line
// and the on-blur commit, never for the as-you-type commit (where "12" is far
// more likely to be halfway to "12:30" than a finished entry).
const parseManual24 = (raw, { allowHourOnly = false } = {}) => {
  if (!raw) return null;
  const digits = String(raw).replace(/[^0-9]/g, "");
  let h, m;
  if (digits.length === 1 || digits.length === 2) {
    if (!allowHourOnly) return null;
    h = parseInt(digits, 10);
    m = 0;
  } else if (digits.length === 3 || digits.length === 4) {
    h = parseInt(digits.slice(0, digits.length - 2), 10);
    m = parseInt(digits.slice(-2), 10);
  } else {
    return null;
  }
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Renders a 24-hour "HH:MM" value back as friendly 12-hour text, used for the
// read-back confirmation line under the manual input.
const to12hLabel = (t) => {
  const p = parse24ToWheel(t);
  if (p.h === null) return "";
  return `${p.h}:${String(p.m).padStart(2, "0")} ${p.ampm.toUpperCase()}`;
};

// Scroll-wheel column used by TimeSelect and DurationSelect.
// circular=true (default) makes it wrap infinitely (12→1→...→11→12, etc) by
// stacking the item list several times and silently recentring the scroll
// position near the middle copy once you drift toward either outer edge —
// since every copy is visually identical, that recentre is imperceptible.
// circular=false gives a plain, non-wrapping list (used for AM/PM, where
// wrapping a 2-item list doesn't add anything).
function WheelColumn({ items, selected, onSelect, circular = true }) {
  const scrollRef = useRef(null);
  const timerRef  = useRef(null);
  const n = items.length;
  const selStr = selected !== null ? String(selected) : null;
  const selectedIdx = selStr !== null ? items.indexOf(selStr) : 0; // untouched wheels rest on item 0

  const scrollToIndex = (itemIdx) => {
    if (!scrollRef.current) return;
    const target = circular ? MID_COPY * n + itemIdx : itemIdx;
    scrollRef.current.scrollTop = target * ITEM_H;
  };

  // Re-sync scroll position whenever the selected value changes from OUTSIDE
  // (e.g. switching to a different saved diary entry), not on every render.
  useEffect(() => {
    scrollToIndex(selectedIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selStr]);

  const onScroll = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const rawIndex = Math.round(scrollRef.current.scrollTop / ITEM_H);
      let itemIdx, finalRaw;
      if (circular) {
        itemIdx = ((rawIndex % n) + n) % n;
        const copy = Math.floor(rawIndex / n);
        finalRaw = (copy <= 1 || copy >= REPEATS - 2) ? MID_COPY * n + itemIdx : rawIndex;
      } else {
        itemIdx = Math.max(0, Math.min(n - 1, rawIndex));
        finalRaw = itemIdx;
      }
      scrollRef.current.scrollTop = finalRaw * ITEM_H;
      onSelect(items[itemIdx]);
    }, 100);
  };

  const fullList = circular
    ? Array.from({ length: REPEATS * n }, (_, i) => items[i % n])
    : items;

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
        {fullList.map((item, i) => {
          const itemIdx = i % n;
          const active = selStr !== null ? item === selStr : itemIdx === 0;
          return (
            <div
              key={i}
              onClick={() => {
                onSelect(item);
                scrollToIndex(itemIdx);
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
  // When opening with empty value, default to current device time instead of nulls
  const init = parse24ToWheel(value || getCurrentTime());
  const [h,    setH]    = useState(init.h);
  const [m,    setM]    = useState(init.m);
  const [ampm, setAmpm] = useState(init.ampm || "am");
  const [open, setOpen] = useState(false);
  // "wheel" | "manual" — purely a display preference for this picker. Both modes
  // read from and write to the same HH:MM value, so switching never alters or
  // clears what's already saved; it only changes how the value is edited.
  const [mode, setMode] = useState("wheel");
  // Draft text for the manual box. Held separately so half-typed input ("9",
  // "93") stays local and is never pushed to onChange — only a fully valid time
  // is ever committed, leaving any existing saved value intact until then.
  const [manualDraft, setManualDraft] = useState(value ? value.slice(0, 5) : "");
  // True while the manual box has focus. While the client is mid-type, the sync
  // effect below must NOT rewrite what they've typed — doing so was what turned
  // "1200" into "01:200" (a 3-digit commit fired, then overwrote the draft).
  const manualFocused = useRef(false);
  const wrapRef = useRef(null);
  // The panel has a 220px minimum width, but in the two-column nap grid each
  // field is only about half the screen. Anchored left, the right-hand field's
  // panel therefore spills past the viewport edge — which is what made the page
  // appear zoomed/scrolled sideways. When there isn't room to the right, anchor
  // the panel to the field's right edge so it opens inward instead.
  const [alignRight, setAlignRight] = useState(false);
  useEffect(() => {
    if (!open || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const PANEL_MIN = 220;
    setAlignRight(rect.left + Math.max(PANEL_MIN, rect.width) > window.innerWidth - 8);
  }, [open]);

  // Sync when external value changes (loading saved data)
  useEffect(() => {
    const p = parse24ToWheel(value);
    if (p.h !== null) { setH(p.h); setM(p.m); setAmpm(p.ampm); }
    if (!manualFocused.current) setManualDraft(value ? value.slice(0, 5) : "");
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        // Commit anything pending in the manual box first — clicking away
        // unmounts the input, so blur can't be relied on to fire here.
        if (manualFocused.current) onManualBlur();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open, manualDraft, value]);

  // Only fires when a wheel is genuinely touched (click or scroll-settle).
  // At that moment, any OTHER wheel that's still untouched (null) commits to
  // whatever it's currently resting on — so tapping just the hour wheel while
  // minutes rests on "00" correctly saves ":00" instead of silently staying
  // unset. Opening the picker and closing it without touching anything still
  // leaves the value blank, since handle() never fires in that case.
  const handle = (field, val) => {
    const nextH = field === "h" ? val : (h !== null ? h : 12);
    const nextM = field === "m" ? val : (m !== null ? m : 0);
    const nextAmpm = field === "ampm" ? val : (ampm || "am");
    if (field === "h") setH(val); else if (h === null) setH(12);
    if (field === "m") setM(val); else if (m === null) setM(0);
    if (field === "ampm") setAmpm(val); else if (!ampm) setAmpm("am");
    const result = wheelTo24(nextH, nextM, nextAmpm);
    if (result) onChange(result);
  };

  // While typing, only a complete 4-digit time commits. A 3-digit string like
  // "120" is ambiguous — it's a valid 1:20, but far more often it's someone
  // halfway through "1200" — so it's left alone until they finish or move on.
  const onManualType = (raw) => {
    setManualDraft(raw);
    const digits = String(raw).replace(/[^0-9]/g, "");
    if (digits.length === 4) {
      const parsed = parseManual24(raw);
      if (parsed && parsed !== value) onChange(parsed);
    }
  };

  // On blur the entry is finished, so shorter forms are safe to accept:
  // "730" -> 07:30, "12" -> 12:00. The box is then normalised to "HH:MM".
  const onManualBlur = () => {
    manualFocused.current = false;
    const parsed = parseManual24(manualDraft, { allowHourOnly: true });
    if (parsed) {
      setManualDraft(parsed);
      if (parsed !== value) onChange(parsed);
    } else {
      // Unparseable — restore whatever was actually saved rather than leaving
      // stray text sitting in the box looking like it was accepted.
      setManualDraft(value ? value.slice(0, 5) : "");
    }
  };

  const manualParsed = parseManual24(manualDraft, { allowHourOnly: true });
  const manualInvalid = manualDraft.trim() !== "" && !manualParsed;

  // Derived from the saved value, NOT the wheel state — the wheels pre-seed to
  // the current device time so they open somewhere useful, but an untouched
  // picker must still read as empty rather than appearing to hold a time.
  const label = value ? to12hLabel(value) : (placeholder || "Select time…");

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
          color: value ? "#2C2420" : "#9E8E88",
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
          position: "absolute", top: "calc(100% + 6px)", zIndex: 9999,
          ...(alignRight ? { right: 0 } : { left: 0 }),
          background: "#FFFFFF",
          border: "1px solid rgba(196,113,74,0.25)",
          borderRadius: 14,
          boxShadow: "0 12px 40px rgba(44,36,32,0.18)",
          padding: "8px 8px 10px",
          width: "100%", minWidth: 220,
          maxWidth: "calc(100vw - 16px)", boxSizing: "border-box",
        }}>
          {/* Mode toggle — display preference only. Both modes edit the same
              underlying HH:MM value, so switching never clears anything. */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {[["wheel", "Time wheel"], ["manual", "Type it in"]].map(([key, text]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                style={{
                  flex: 1, padding: "6px 8px", borderRadius: 7,
                  border: "1px solid #C4714A",
                  background: mode === key ? "#C4714A" : "transparent",
                  color: mode === key ? "#FFFFFF" : "#8A4B2A",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                {text}
              </button>
            ))}
          </div>

          {mode === "wheel" ? (
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
                circular={false}
              />
            </div>
          ) : (
            <div style={{ padding: "4px 4px 2px" }}>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
                color: "#9E8E88", marginBottom: 5, textTransform: "uppercase",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
                24-hour time
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={manualDraft}
                onChange={(e) => onManualType(e.target.value)}
                onFocus={() => { manualFocused.current = true; }}
                onBlur={onManualBlur}
                placeholder="e.g. 07:00, 13:30, 19:45"
                style={{
                  width: "100%", padding: "10px 12px", boxSizing: "border-box",
                  border: `1px solid ${manualInvalid ? "#B4453A" : "rgba(196,113,74,0.35)"}`,
                  borderRadius: 8, fontSize: 16, letterSpacing: 1,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  color: "#2C2420", outline: "none",
                }}
              />
              {/* Read-back line: the AM/PM safeguard. Typing 24-hour removes the
                  ambiguity at entry, and this confirms how it was understood. */}
              <div style={{ marginTop: 7, fontSize: 12, minHeight: 17, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                {manualParsed ? (
                  <span style={{ color: "#4A7C59", fontWeight: 600 }}>✓ {to12hLabel(manualParsed)}</span>
                ) : manualInvalid ? (
                  <span style={{ color: "#B4453A" }}>Enter a time between 00:00 and 23:59</span>
                ) : (
                  <span style={{ color: "#9E8E88" }}>Midnight is 00:00 · midday is 12:00</span>
                )}
              </div>
            </div>
          )}
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

// ── DURATION WHEEL PICKER ───────────────────────────────────────────────────
// Same scroll-wheel style as TimeSelect, but for a length of time rather than
// a clock time — no AM/PM column. Value is stored/returned as total minutes.
const WHEEL_DUR_HOURS = Array.from({ length: 10 }, (_, i) => String(i)); // 0–9 hours

function parseMinsToWheel(mins) {
  if (mins === null || mins === undefined || mins === "") return { h: null, m: null };
  const total = parseInt(mins);
  if (isNaN(total)) return { h: null, m: null };
  return { h: Math.floor(total / 60), m: total % 60 };
}

function wheelToMins(h, m) {
  if (h === null || m === null) return null;
  return parseInt(h) * 60 + parseInt(m);
}

function DurationSelect({ value, onChange, disabled, placeholder }) {
  const init = parseMinsToWheel(value);
  const [h,    setH]    = useState(init.h);
  const [m,    setM]    = useState(init.m);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  // Same viewport-overflow guard as TimeSelect — see the comment there.
  const [alignRight, setAlignRight] = useState(false);
  useEffect(() => {
    if (!open || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const PANEL_MIN = 220;
    setAlignRight(rect.left + Math.max(PANEL_MIN, rect.width) > window.innerWidth - 8);
  }, [open]);

  // Sync when external value changes (loading saved data)
  useEffect(() => {
    const p = parseMinsToWheel(value);
    setH(p.h); setM(p.m);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const handle = (field, val) => {
    const nextH = field === "h" ? val : (h !== null ? h : 0);
    const nextM = field === "m" ? val : (m !== null ? m : 0);
    if (field === "h") setH(val); else if (h === null) setH(0);
    if (field === "m") setM(val); else if (m === null) setM(0);
    onChange(wheelToMins(nextH, nextM));
  };

  const label = h !== null && m !== null
    ? fmtDuration(wheelToMins(h, m))
    : placeholder || "Select duration…";

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
          position: "absolute", top: "calc(100% + 6px)", zIndex: 9999,
          ...(alignRight ? { right: 0 } : { left: 0 }),
          background: "#FFFFFF",
          border: "1px solid rgba(196,113,74,0.25)",
          borderRadius: 14,
          boxShadow: "0 12px 40px rgba(44,36,32,0.18)",
          padding: "8px 8px 10px",
          width: "100%", minWidth: 220,
          maxWidth: "calc(100vw - 16px)", boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <WheelColumn
              items={WHEEL_DUR_HOURS}
              selected={h !== null ? String(h) : null}
              onSelect={(v) => handle("h", parseInt(v))}
            />
            <div style={{ color: "#9E8E88", fontSize: 13, fontWeight: 700, paddingBottom: 2 }}>hr</div>
            <WheelColumn
              items={WHEEL_MINS}
              selected={m !== null ? String(m).padStart(2,"0") : null}
              onSelect={(v) => handle("m", parseInt(v))}
            />
            <div style={{ color: "#9E8E88", fontSize: 13, fontWeight: 700, paddingBottom: 2 }}>min</div>
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

  // Register the PWA service worker so the app can be installed to a
  // phone's home screen and load instantly / work offline. Silently does
  // nothing on browsers that don't support it.
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

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
            src={LOGO_URL}
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
  const [view, setView] = useState("dashboard"); // dashboard | client | resources | settings
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
            <button style={{ ...gStyle.btnSecondary, padding: "8px 14px" }} onClick={() => setView("resources")}>📚 Resources</button>
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
        {view === "resources" && (
          <ResourceLibraryManager onBack={() => setView("dashboard")} />
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
    { key: "progress", label: "🎉 Progress" },
    { key: "toolbox", label: "🧰 Toolbox" },
    { key: "resources", label: "🎬 Resources" },
    { key: "notes", label: "Notes" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <>
      <button onClick={onBack} className="no-print" style={{ ...gStyle.btnSecondary, marginBottom: 20 }}>← All Clients</button>

      <div className="no-print" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: font.display, fontSize: 26, color: C.terracotta, margin: "0 0 4px" }}>{clientData.name}</h1>
        <span style={{ fontSize: 13, color: C.muted }}>Code: <strong>{clientData.access_code}</strong></span>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ display: "flex", gap: 4, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
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
      {tab === "progress" && <ProgressTab clientId={client.id} clientData={clientData} isCoach={true} />}
      {tab === "toolbox" && <KnowledgeToolbox clientId={client.id} clientData={clientData} isCoach={true} />}
      {tab === "resources" && <ClientResourceGrants clientId={client.id} clientData={clientData} />}
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
  const [isAppTester, setIsAppTester] = useState(client.is_app_tester || false);
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
      is_app_tester: isAppTester,
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

          {/* Founding Family / app tester toggle — shows the "Give Feedback" button in this client's app */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" id="isAppTester" checked={isAppTester}
              onChange={(e) => setIsAppTester(e.target.checked)}
              style={{ accentColor: C.gold, width: 16, height: 16 }} />
            <label htmlFor="isAppTester" style={{ fontSize: 13, color: C.dark, cursor: "pointer" }}>
              🧪 Founding Family (app tester)
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

// ── YOUR PACKAGE (client-facing, no pricing shown) ──────────────────────────
function YourPackageTab({ clientPackage }) {
  if (!clientPackage) {
    return <div style={gStyle.card}>Loading your package details…</div>;
  }

  const pkg = clientPackage.package && PACKAGES[clientPackage.package] ? PACKAGES[clientPackage.package] : null;
  const extensionWeeks = clientPackage.extension_weeks || 0;
  const start = clientPackage.support_start_date;
  const total = clientPackage.support_days || DEFAULT_SUPPORT_DAYS;
  const daysElapsed = start ? Math.max(0, daysBetween(start, today())) : 0;
  const daysLeft = Math.max(0, total - daysElapsed);
  const pct = Math.min(100, Math.round((daysElapsed / total) * 100));

  if (!pkg) {
    return (
      <div style={gStyle.card}>
        <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 8px" }}>Your Package</h3>
        <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
          Your package hasn't been set up yet — reach out to Chloé if you have any questions.
        </p>
      </div>
    );
  }

  return (
    <div style={gStyle.card}>
      <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 16px" }}>Your Package</h3>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <span style={gStyle.tag(C.terracottaDark, C.terracottaLight)}>{pkg.label}</span>
        {extensionWeeks > 0 && (
          <span style={gStyle.tag(C.gold, C.goldLight)}>
            + {extensionWeeks} Extension Week{extensionWeeks > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 6 }}>
        <span>Day {daysElapsed} of {total}</span>
        <span>{daysLeft} day{daysLeft !== 1 ? "s" : ""} of support remaining</span>
      </div>
      <div style={{ height: 8, background: C.terracottaLight, borderRadius: 4, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: C.terracotta, borderRadius: 4, transition: "width 0.3s" }} />
      </div>

      {extensionWeeks > 0 && (
        <p style={{ fontSize: 13, color: C.dark, background: C.goldLight, borderRadius: 8, padding: "10px 14px", margin: 0 }}>
          🧡 You've added {extensionWeeks} extension week{extensionWeeks > 1 ? "s" : ""} of ongoing support to your package.
        </p>
      )}
    </div>
  );
}


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
    supabase.from("clients").select("package, extension_weeks, calls_total, calls_used, consult_booked, is_app_tester, support_days, support_start_date")
      .eq("id", session.clientId).maybeSingle()
      .then(({ data }) => { if (data) setClientPackage(data); });
    // Load diary count
    supabase.from("sleep_diary").select("id", { count: "exact", head: true })
      .eq("client_id", session.clientId)
      .then(({ count }) => setDiaryCount(count || 0));
  }, [session.clientId]);

  const tabs = [
    { key: "intake", label: "📃 Questionnaire" },
    { key: "diary", label: "📖 Sleep Diary" },
    { key: "package", label: "🎁 Your Package" },
    { key: "analysis", label: "📊 Analysis" },
    { key: "plan", label: "📋 Sleep Plan" },
    { key: "progress", label: "🎉 Progress" },
    { key: "resources", label: "🎬 Resources" },
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
      {/* On a phone this wraps to roughly 2 tabs per row. A plain flex-wrap
          row sizes each button to its own label's width, so the second
          "column" only lines up by coincidence — "Questionnaire" is wider
          than "Sleep Plan", so whatever sits next to it ("Sleep Diary")
          starts further right than whatever sits next to the shorter
          "Sleep Plan" ("Progress"), even though both are visually "column
          two". A CSS grid with equal-width auto-fit columns fixes that: every
          tab's cell is the same width, so every row's start/second column
          lines up regardless of label length — and on a wide screen it still
          fits all the tabs on one row the same as before. */}
      <div className="no-print" style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 2, flex: "1 1 auto", minWidth: 0,
        }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer",
              fontFamily: font.body, fontSize: 14, fontWeight: 600, textAlign: "left",
              color: tab === t.key ? C.terracotta : C.muted,
              borderBottom: tab === t.key ? `2px solid ${C.terracotta}` : "2px solid transparent",
              whiteSpace: "nowrap",
            }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <ContactCoachButton clientId={session.clientId} clientPackage={clientPackage?.package} defaultName={session.clientName} />
          {/* Founding Family feedback button — only visible when is_app_tester is true on this client's record */}
          {clientPackage?.is_app_tester && (
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 16px",
                background: C.gold,
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
              🧪 Give Feedback
            </a>
          )}
          {/* Book a Call button — only for eligible clients */}
          {checkinUnlocked && (
            <a
              href={CHECKIN_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
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
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
        {tab === "diary" && <SleepDiaryViewer clientId={session.clientId} isCoach={false} consultBooked={clientPackage?.consult_booked} />}
        {tab === "package" && <YourPackageTab clientPackage={clientPackage} />}
        {tab === "analysis" && <SleepAnalysis client={{ id: session.clientId, name: session.clientName }} />}
        {tab === "progress" && <ProgressTab clientId={session.clientId} isCoach={false} />}
        {tab === "plan" && <SleepPlanEditor clientId={session.clientId} isCoach={false} />}
        {tab === "toolbox" && <KnowledgeToolbox clientId={session.clientId} isCoach={false} />}
        {tab === "resources" && <ClientResourcesViewer clientId={session.clientId} />}
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
const CHECKIN_BOOKING_URL = "https://calendar.app.google/FucJD8hzzv7wdvZS9";
const DIARY_DAYS_REQUIRED = 5;
const CHECKIN_UNLOCK_DAYS = 7;
// Above these, a duration is far more likely to be an AM/PM slip than real.
const NAP_MAX_PLAUSIBLE_MINS = 240;    // 4h
const WAKING_MAX_PLAUSIBLE_MINS = 300; // 5h
const NIGHT_MAX_PLAUSIBLE_MINS = 840;  // 14h — flags a bed_time/wake_time pair that's likely an AM/PM slip

// ── FOUNDING FAMILY APP TESTING ──────────────────────────────────────────────
// Only shown to clients with is_app_tester = true on their client record.
// TODO: replace with your live Google Form URL once published.
const FEEDBACK_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfMALaRdK_n1r7WlVgQ2bMedSjztOwu8YqNtxwZf_xzquz8_Q/viewform?usp=header";

// ── CONTACT COACH BUTTON ─────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "61494730269"; // no + or spaces — required format for wa.me links
const COACH_EMAIL = "chloe@signsforsleep.com";

// Foundations clients get a "Message Chloé" WhatsApp button; everyone else
// (Gentle Start, or no package assigned yet) gets an "Email Chloé" button.
// The "Hi Chloé, this is [name]" greeting only prefills the FIRST time a
// client ever taps this button — tracked via clients.contact_button_used —
// since after that they're continuing an existing conversation/thread and
// don't need to re-introduce themselves.
function ContactCoachButton({ clientId, clientPackage, defaultName }) {
  const [parentName, setParentName] = useState(null);
  const [alreadyUsed, setAlreadyUsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: intakeData } = await supabase.from("intake_responses")
        .select("parent_name").eq("client_id", clientId).maybeSingle();
      if (intakeData?.parent_name) setParentName(intakeData.parent_name);

      const { data: clientRow } = await supabase.from("clients")
        .select("contact_button_used").eq("id", clientId).maybeSingle();
      setAlreadyUsed(!!clientRow?.contact_button_used);
      setLoading(false);
    };
    load();
  }, [clientId]);

  const markUsed = () => {
    if (alreadyUsed) return;
    setAlreadyUsed(true);
    supabase.from("clients").update({ contact_button_used: true }).eq("id", clientId);
  };

  if (loading) return null;

  const name = (parentName || defaultName || "").trim();
  const greeting = name ? `Hi Chloé, this is ${name}` : "";
  const btnStyle = {
    padding: "8px 16px", background: C.terracotta, color: C.white, borderRadius: 8,
    fontSize: 13, fontWeight: 600, fontFamily: font.body, textDecoration: "none",
    whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
  };

  if (clientPackage === "foundations") {
    // api.whatsapp.com + same-tab (no target="_blank") is documented as more
    // reliable than wa.me at preserving the prefilled text through the
    // mobile app handoff — wa.me opening in a new tab first can sometimes
    // drop the query string when it redirects into the WhatsApp app.
    const text = !alreadyUsed && greeting ? `&text=${encodeURIComponent(greeting)}` : "";
    return (
      <a href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}${text}`} onClick={markUsed} style={btnStyle}>
        💬 Message Chloé
      </a>
    );
  }

  // Gentle Start, or no package assigned yet.
  // Built by hand with encodeURIComponent (not URLSearchParams) because
  // URLSearchParams encodes spaces as "+", which mailto: links display
  // literally instead of treating as a space — encodeURIComponent uses %20,
  // which every mail client reads correctly.
  const subject = encodeURIComponent("Weekly check-in email");
  const bodyParam = !alreadyUsed && greeting ? `&body=${encodeURIComponent(greeting)}` : "";
  return (
    <a href={`mailto:${COACH_EMAIL}?subject=${subject}${bodyParam}`} onClick={markUsed} style={btnStyle}>
      ✉️ Email Chloé
    </a>
  );
}

const PACKAGES = {
  gentle_start:  { label: "Gentle Start",       weeks: 4, days: 28, calls: 0, price: "$425" },
  foundations:   { label: "Foundations of Sleep", weeks: 6, days: 42, calls: 6, price: "$695" },
};
const EXTENSION = { label: "Extension Week", days: 7, calls: 1, price: "$175" };

const emptyNap = () => ({ start: "", end: "", how_fell_asleep: "", location: "", resettled: "", notes: "" });
const emptyWaking = () => ({ woke_at: "", back_asleep_at: "" });
// Sums completed wake→back-asleep pairs to derive a count + total minutes awake.
// Used when a client chooses to log each night waking individually rather than
// entering a quick total — keeps night_wakings_count / night_wakings_awake_mins
// (used everywhere else in the app) populated the same way either method is used.
const calcDetailedWakings = (wakings) => {
  const complete = (wakings || []).filter(w => w.woke_at && w.back_asleep_at);
  const mins = complete.reduce((sum, w) => sum + Math.max(0, diffMins(parseTime(w.woke_at), parseTime(w.back_asleep_at))), 0);
  return { count: complete.length, mins };
};
const emptyEntry = () => ({
  wake_time: "", bed_time: "", notes: "",
  routine_start_time: "", into_bed_time: "", asleep_time: "",
  bedtime_how_fell_asleep: "",
  night_wakings_count: "", night_wakings_notes: "", night_wakings_awake_mins: "",
  night_wakings_mode: "simple", night_wakings: [],
  daytime_notes: "",
  naps: [emptyNap()],
});

// Turns a client's diary history into ranked "most used first" suggestion
// lists per question, so a repeat answer (e.g. "fed to sleep", "cot") is one
// tap instead of retyped every day. "How did they fall asleep?" is asked in
// both the nap and bedtime sections, so those two share one pool — same
// question, more data, more useful suggestions either place it's asked.
const buildSuggestionPools = (rows) => {
  const counts = {
    howFellAsleep: new Map(), location: new Map(), resettled: new Map(),
    napNotes: new Map(), daytimeNotes: new Map(), nightWakingNotes: new Map(), generalNotes: new Map(),
  };
  const bump = (map, raw) => {
    const v = (raw || "").trim();
    if (!v) return;
    map.set(v, (map.get(v) || 0) + 1);
  };
  (rows || []).forEach((row) => {
    (row.naps || []).forEach((n) => {
      bump(counts.howFellAsleep, n.how_fell_asleep);
      bump(counts.location, n.location);
      bump(counts.resettled, n.resettled);
      bump(counts.napNotes, n.notes);
    });
    bump(counts.howFellAsleep, row.bedtime_how_fell_asleep);
    bump(counts.daytimeNotes, row.daytime_notes);
    bump(counts.nightWakingNotes, row.night_wakings_notes);
    bump(counts.generalNotes, row.notes);
  });
  const ranked = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v).slice(0, 8);
  return {
    howFellAsleep: ranked(counts.howFellAsleep),
    location: ranked(counts.location),
    resettled: ranked(counts.resettled),
    napNotes: ranked(counts.napNotes),
    daytimeNotes: ranked(counts.daytimeNotes),
    nightWakingNotes: ranked(counts.nightWakingNotes),
    generalNotes: ranked(counts.generalNotes),
  };
};
const emptySuggestionPools = {
  howFellAsleep: [], location: [], resettled: [],
  napNotes: [], daytimeNotes: [], nightWakingNotes: [], generalNotes: [],
};

// A plain textarea/input with a dropdown of the client's own previously
// typed answers for this exact question. Opens on focus, narrows as they
// type, one tap fills the field. onMouseDown (not onClick) on the option is
// what lets a tap register before the field's onBlur closes the dropdown.
function SuggestField({ value, onChange, suggestions = [], placeholder, disabled, minHeight = 56, multiline = true }) {
  const [open, setOpen] = useState(false);
  const current = (value || "").trim().toLowerCase();
  const filtered = (suggestions || [])
    .filter((s) => s.toLowerCase() !== current)
    .filter((s) => !current || s.toLowerCase().includes(current))
    .slice(0, 6);
  const Field = multiline ? "textarea" : "input";

  return (
    <div style={{ position: "relative" }}>
      <Field
        style={{ ...gStyle.input, ...(multiline ? { minHeight, resize: "vertical" } : {}) }}
        value={value || ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      {open && !disabled && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "#FFFFFF", border: "1px solid rgba(196,113,74,0.25)",
          borderRadius: 10, boxShadow: "0 8px 24px rgba(44,36,32,0.14)",
          padding: 6, maxHeight: 190, overflowY: "auto", boxSizing: "border-box",
        }}>
          {filtered.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(s); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 10px", borderRadius: 7, border: "none",
                background: "transparent", color: "#2C2420",
                fontSize: 13, fontFamily: font.body, cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SleepDiaryViewer({ clientId, isCoach, consultBooked }) {
  const [selectedDate, setSelectedDate] = useState(today());
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [diaryCount, setDiaryCount] = useState(0);
  // Neighbouring days' bed/wake times — lets an AM/PM slip on either side of
  // a night's sleep be flagged the moment the pairing is complete, whichever
  // day that happens to be entered on.
  const [adjTimes, setAdjTimes] = useState({ prevBedTime: null, nextWakeTime: null });
  // Ranked "most used first" answers per question, built from this client's
  // own diary history — powers the autosuggest dropdowns below.
  const [suggestionPools, setSuggestionPools] = useState(emptySuggestionPools);
  // Ticks every 30s so an in-progress nap/waking's "so far" duration stays
  // roughly live without needing a per-row timer.
  const [nowTick, setNowTick] = useState(() => getCurrentTime());
  useEffect(() => {
    const id = setInterval(() => setNowTick(getCurrentTime()), 30000);
    return () => clearInterval(id);
  }, []);

  const loadDiaryCount = async () => {
    const { count } = await supabase
      .from("sleep_diary")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId);
    setDiaryCount(count || 0);
  };

  useEffect(() => { if (!isCoach) loadDiaryCount(); }, [clientId]);

  // Fetched once per client (not per date) — history doesn't change just
  // because the coach/parent navigates to a different day.
  useEffect(() => {
    let cancelled = false;
    const loadSuggestions = async () => {
      const { data } = await supabase
        .from("sleep_diary")
        .select("naps, bedtime_how_fell_asleep, daytime_notes, night_wakings_notes, notes")
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(120);
      if (!cancelled) setSuggestionPools(buildSuggestionPools(data || []));
    };
    loadSuggestions();
    return () => { cancelled = true; };
  }, [clientId]);

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
      // Also grab yesterday's bed_time and tomorrow's wake_time (if logged) so
      // the night-duration warning can catch an AM/PM slip on either side.
      const [{ data: prevDay }, { data: nextDay }] = await Promise.all([
        supabase.from("sleep_diary").select("bed_time")
          .eq("client_id", clientId).eq("date", offsetDate(selectedDate, -1)).maybeSingle(),
        supabase.from("sleep_diary").select("wake_time")
          .eq("client_id", clientId).eq("date", offsetDate(selectedDate, +1)).maybeSingle(),
      ]);
      if (!cancelled) {
        setEntry(data ? { ...data, naps: data.naps || [emptyNap()], night_wakings: data.night_wakings || [], night_wakings_mode: data.night_wakings_mode || "simple" } : emptyEntry());
        setAdjTimes({
          prevBedTime: prevDay?.bed_time ? prevDay.bed_time.slice(0, 5) : null,
          nextWakeTime: nextDay?.wake_time ? nextDay.wake_time.slice(0, 5) : null,
        });
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
    const rawNightSleep = calcNightSleep(rest.bed_time, tomorrowWake);
    const wakingMode = rest.night_wakings_mode || "simple";
    const detailed = wakingMode === "detailed" ? calcDetailedWakings(rest.night_wakings) : null;
    const awakeMins = detailed ? detailed.mins : (parseInt(rest.night_wakings_awake_mins) || 0);
    const wakingsCount = detailed ? detailed.count : (rest.night_wakings_count || null);
    const nightSleep = rawNightSleep !== null ? Math.max(0, rawNightSleep - awakeMins) : null;
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
      bedtime_how_fell_asleep: rest.bedtime_how_fell_asleep || null,
      night_wakings_count: wakingsCount,
      night_wakings_notes: rest.night_wakings_notes || null,
      night_wakings_awake_mins: awakeMins || null,
      night_wakings_mode: wakingMode,
      night_wakings: rest.night_wakings || [],
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
      .from("sleep_diary").select("id, bed_time, total_nap_mins, night_wakings_awake_mins")
      .eq("client_id", clientId).eq("date", prevDateStr).maybeSingle();
    if (prevEntry?.id && prevEntry.bed_time) {
      const rawPrevNightSleep = calcNightSleep(prevEntry.bed_time, rest.wake_time);
      const prevAwakeMins = parseInt(prevEntry.night_wakings_awake_mins) || 0;
      const prevNightSleep = rawPrevNightSleep !== null ? Math.max(0, rawPrevNightSleep - prevAwakeMins) : null;
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

  // The night-duration warning can point at a field that lives on a
  // *different* day's entry (e.g. today's wake time is fine, but yesterday's
  // bed_time looks like an AM/PM slip). These apply that fix directly to the
  // neighbouring day's row, then re-run today's doSave so the night-sleep
  // total is recalculated with the corrected value.
  const fixYesterdayBedTime = async (newValue) => {
    const prevDateStr = offsetDate(selectedDate, -1);
    const { data: prevEntry } = await supabase
      .from("sleep_diary").select("id")
      .eq("client_id", clientId).eq("date", prevDateStr).maybeSingle();
    if (!prevEntry?.id) return;
    await supabase.from("sleep_diary").update({ bed_time: newValue }).eq("id", prevEntry.id);
    setAdjTimes(prev => ({ ...prev, prevBedTime: newValue }));
    await doSave(entry, selectedDate);
  };

  const fixTomorrowWakeTime = async (newValue) => {
    const nextDateStr = offsetDate(selectedDate, +1);
    const { data: nextEntry } = await supabase
      .from("sleep_diary").select("id")
      .eq("client_id", clientId).eq("date", nextDateStr).maybeSingle();
    if (!nextEntry?.id) return;
    await supabase.from("sleep_diary").update({ wake_time: newValue }).eq("id", nextEntry.id);
    setAdjTimes(prev => ({ ...prev, nextWakeTime: newValue }));
    await doSave(entry, selectedDate);
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

  // One-tap "they've just gone down" — stamps the current time as start on
  // the trailing nap row if it's still blank (the common case: the default
  // first nap row hasn't been touched yet), otherwise adds a fresh row, so
  // this never leaves an unused blank nap sitting alongside the real one.
  const startNapNow = async () => {
    const now = getCurrentTime();
    const naps = [...(entry.naps || [])];
    const last = naps[naps.length - 1];
    if (last && !last.start && !last.end) {
      naps[naps.length - 1] = { ...last, start: now };
    } else {
      naps.push({ ...emptyNap(), start: now });
    }
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

  const setWakingMode = async (mode) => {
    // Switching modes clears the other method's data so the two can never both
    // be filled in and produce a conflicting "time awake overnight" total.
    const updated = mode === "detailed"
      ? { ...entry, night_wakings_mode: mode, night_wakings_count: "", night_wakings_awake_mins: "" }
      : { ...entry, night_wakings_mode: mode, night_wakings: [] };
    setEntry(updated);
    await doSave(updated, selectedDate);
  };

  const updateWaking = async (idx, field, value) => {
    const night_wakings = (entry.night_wakings || []).map((w, i) => i === idx ? { ...w, [field]: value } : w);
    const updated = { ...entry, night_wakings };
    setEntry(updated);
    await doSave(updated, selectedDate);
  };

  const addWaking = async () => {
    const night_wakings = [...(entry.night_wakings || []), emptyWaking()];
    const updated = { ...entry, night_wakings };
    setEntry(updated);
    await doSave(updated, selectedDate);
  };

  // One-tap "they've just woken up" — works from either logging mode.
  // Detailed mode already tracks individual wakings, so this just stamps the
  // trailing waking row if it's still blank, otherwise adds a fresh one (same
  // "don't leave an unused blank row behind" logic as startNapNow). Simple
  // mode doesn't have a per-waking time field to stamp, so this switches to
  // detailed mode first (the same way tapping "Log each waking" does) and
  // then adds the stamped waking.
  const logWakingNow = async () => {
    const now = getCurrentTime();
    const night_wakings = [...(entry.night_wakings || [])];
    const last = night_wakings[night_wakings.length - 1];
    if (last && !last.woke_at && !last.back_asleep_at) {
      night_wakings[night_wakings.length - 1] = { ...last, woke_at: now };
    } else {
      night_wakings.push({ ...emptyWaking(), woke_at: now });
    }
    const updated = entry.night_wakings_mode === "detailed"
      ? { ...entry, night_wakings }
      : { ...entry, night_wakings_mode: "detailed", night_wakings_count: "", night_wakings_awake_mins: "", night_wakings };
    setEntry(updated);
    await doSave(updated, selectedDate);
  };

  const removeWaking = async (idx) => {
    const night_wakings = (entry.night_wakings || []).filter((_, i) => i !== idx);
    const updated = { ...entry, night_wakings };
    setEntry(updated);
    await doSave(updated, selectedDate);
  };

  const changeDate = (delta) => {
    setSelectedDate(offsetDate(selectedDate, delta));
  };

  const handleDateChange = (newDate) => setSelectedDate(newDate);

  if (loading || !entry) return <p style={{ color: C.muted, padding: 40 }}>Loading…</p>;

  const totalNapMins = calcNapMins(entry);
  // Same AM/PM-slip detection as naps, applied to the night pairing: yesterday's
  // bed_time -> today's wake_time, and today's bed_time -> tomorrow's wake_time.
  const wakeFlag = implausibleNightDuration(adjTimes.prevBedTime, entry.wake_time, NIGHT_MAX_PLAUSIBLE_MINS);
  const bedFlag = implausibleNightDuration(entry.bed_time, adjTimes.nextWakeTime, NIGHT_MAX_PLAUSIBLE_MINS);
  const nightSleepMins = entry.night_sleep_mins || null;
  const total24h = totalNapMins + (nightSleepMins || 0);
  const wakingMode = entry.night_wakings_mode || "simple";
  const detailedWakingTotals = calcDetailedWakings(entry.night_wakings);
  const bookingUnlocked = !isCoach && !consultBooked && diaryCount >= DIARY_DAYS_REQUIRED;
  const daysRemaining = Math.max(0, DIARY_DAYS_REQUIRED - diaryCount);

  return (
    <div>
      {/* Booking banner — client only, and only until the coach has marked the consult as booked */}
      {!isCoach && !consultBooked && (
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
        {wakeFlag && (
          <div style={{
            background: "#FDF3E3", border: "1px solid #E0B96A", borderRadius: 8,
            padding: "10px 12px", marginTop: 10, fontSize: 12.5, color: "#6B4A1F",
          }}>
            <strong>⚠️ That's a {fmtDuration(wakeFlag.dur)} night — is that right?</strong>
            <div style={{ marginTop: 4, lineHeight: 1.45 }}>
              {wakeFlag.suggestion
                ? (wakeFlag.suggestion.fixField === "end"
                    ? <>If you meant <strong>{to12hLabel(wakeFlag.suggestion.fixValue)}</strong> for this wake time, last night would be {fmtDuration(wakeFlag.suggestion.dur)}.</>
                    : <>If yesterday's bedtime was actually <strong>{to12hLabel(wakeFlag.suggestion.fixValue)}</strong>, last night would be {fmtDuration(wakeFlag.suggestion.dur)}.</>)
                : <>Please double-check the AM/PM on yesterday's bedtime and this wake time.</>}
            </div>
            {wakeFlag.suggestion && !isCoach && (
              <button
                onClick={() => wakeFlag.suggestion.fixField === "end"
                  ? update("wake_time", wakeFlag.suggestion.fixValue)
                  : fixYesterdayBedTime(wakeFlag.suggestion.fixValue)}
                style={{
                  marginTop: 8, padding: "6px 12px", borderRadius: 7,
                  border: "1px solid #C4714A", background: "#C4714A", color: "#FFFFFF",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font.body,
                }}>
                Change {wakeFlag.suggestion.fixField === "end" ? "wake time" : "yesterday's bedtime"} to {to12hLabel(wakeFlag.suggestion.fixValue)}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Naps */}
      <div style={gStyle.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: font.display, color: C.blue, margin: 0 }}>Naps</h3>
          {!isCoach && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                style={{ ...gStyle.btnPrimary, width: "auto", padding: "6px 12px", fontSize: 12 }}
                onClick={startNapNow}
              >
                ▶ Start nap now
              </button>
              <button style={{ ...gStyle.btnSecondary, padding: "6px 12px", fontSize: 12 }} onClick={addNap}>+ Add nap</button>
            </div>
          )}
        </div>
        {(entry.naps || []).map((nap, idx) => {
          const dur = nap.start && nap.end
            ? diffMins(parseTime(nap.start), parseTime(nap.end)) : null;
          // Naps longer than 4h are almost always an AM/PM slip rather than a
          // real nap, and left unnoticed they badly skew the 24h sleep total.
          const napFlag = implausibleDuration(nap.start, nap.end, NAP_MAX_PLAUSIBLE_MINS);
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
              {!isCoach && (
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button type="button" onClick={() => updateNap(idx, "start", getCurrentTime())}
                    style={{ ...gStyle.btnSecondary, flex: 1, padding: "8px 10px", fontSize: 12 }}>
                    ▶ Start now
                  </button>
                  <button type="button" onClick={() => updateNap(idx, "end", getCurrentTime())}
                    style={{ ...gStyle.btnSecondary, flex: 1, padding: "8px 10px", fontSize: 12 }}>
                    ⏹ Stop now
                  </button>
                </div>
              )}
              {nap.start && !nap.end && (
                <p style={{ fontSize: 12, color: C.blue, marginBottom: 10 }}>
                  😴 Napping now — {fmtDuration(diffMins(parseTime(nap.start), parseTime(nowTick)))} so far
                </p>
              )}
              {napFlag && (
                <div style={{
                  background: "#FDF3E3", border: "1px solid #E0B96A", borderRadius: 8,
                  padding: "10px 12px", marginBottom: 10, fontSize: 12.5, color: "#6B4A1F",
                }}>
                  <strong>⚠️ That's a {fmtDuration(napFlag.dur)} nap — is that right?</strong>
                  <div style={{ marginTop: 4, lineHeight: 1.45 }}>
                    {napFlag.suggestion
                      ? <>This nap runs into the next day. If you meant <strong>{to12hLabel(napFlag.suggestion.fixValue)}</strong> for the {napFlag.suggestion.fixField === "end" ? "end" : "start"} time, the nap would be {fmtDuration(napFlag.suggestion.dur)}.</>
                      : <>This nap runs past midnight into the next day. Please double-check the AM/PM on both times.</>}
                  </div>
                  {napFlag.suggestion && !isCoach && (
                    <button
                      onClick={() => updateNap(idx, napFlag.suggestion.fixField, napFlag.suggestion.fixValue)}
                      style={{
                        marginTop: 8, padding: "6px 12px", borderRadius: 7,
                        border: "1px solid #C4714A", background: "#C4714A", color: "#FFFFFF",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font.body,
                      }}>
                      Change to {to12hLabel(napFlag.suggestion.fixValue)}
                    </button>
                  )}
                </div>
              )}
              <div style={{ marginBottom: 10 }}>
                <label style={gStyle.label}>How did they fall asleep?</label>
                <SuggestField value={nap.how_fell_asleep} suggestions={suggestionPools.howFellAsleep}
                  placeholder="e.g. fed to sleep, rocked, independently, with dummy..."
                  onChange={(v) => updateNap(idx, "how_fell_asleep", v)} disabled={isCoach} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={gStyle.label}>Where did they nap?</label>
                <SuggestField value={nap.location} suggestions={suggestionPools.location}
                  placeholder="e.g. cot, pram, carrier, car, arms..."
                  onChange={(v) => updateNap(idx, "location", v)} disabled={isCoach} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={gStyle.label}>Did they need to be resettled or woken up?</label>
                <SuggestField value={nap.resettled} suggestions={suggestionPools.resettled}
                  placeholder="e.g. no, once after 30 min, multiple times..."
                  onChange={(v) => updateNap(idx, "resettled", v)} disabled={isCoach} />
              </div>
              <div>
                <label style={gStyle.label}>Additional nap notes/how was their temperament on waking up?</label>
                <SuggestField value={nap.notes} suggestions={suggestionPools.napNotes} minHeight={60}
                  placeholder="e.g. attempted to put them down earlier and it didn't work"
                  onChange={(v) => updateNap(idx, "notes", v)} disabled={isCoach} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Daytime behaviour */}
      <div style={gStyle.card}>
        <h3 style={{ fontFamily: font.display, color: C.blue, margin: "0 0 8px" }}>Daytime Behaviour & Activities</h3>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>e.g. nursery/kindy, home all day, multiple meltdowns, good mood, teething, unwell...</p>
        <SuggestField value={entry.daytime_notes} suggestions={suggestionPools.daytimeNotes} minHeight={80}
          placeholder="Notes about the day..."
          onChange={(v) => update("daytime_notes", v)} disabled={isCoach} />
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
          {bedFlag && (
            <div style={{
              background: "#FDF3E3", border: "1px solid #E0B96A", borderRadius: 8,
              padding: "10px 12px", marginTop: 10, fontSize: 12.5, color: "#6B4A1F",
            }}>
              <strong>⚠️ That's a {fmtDuration(bedFlag.dur)} night — is that right?</strong>
              <div style={{ marginTop: 4, lineHeight: 1.45 }}>
                {bedFlag.suggestion
                  ? (bedFlag.suggestion.fixField === "start"
                      ? <>If you meant <strong>{to12hLabel(bedFlag.suggestion.fixValue)}</strong> for this bedtime, tonight would be {fmtDuration(bedFlag.suggestion.dur)}.</>
                      : <>If tomorrow's wake time was actually <strong>{to12hLabel(bedFlag.suggestion.fixValue)}</strong>, tonight would be {fmtDuration(bedFlag.suggestion.dur)}.</>)
                  : <>Please double-check the AM/PM on this bedtime and tomorrow's wake time.</>}
              </div>
              {bedFlag.suggestion && !isCoach && (
                <button
                  onClick={() => bedFlag.suggestion.fixField === "start"
                    ? update("bed_time", bedFlag.suggestion.fixValue)
                    : fixTomorrowWakeTime(bedFlag.suggestion.fixValue)}
                  style={{
                    marginTop: 8, padding: "6px 12px", borderRadius: 7,
                    border: "1px solid #C4714A", background: "#C4714A", color: "#FFFFFF",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font.body,
                  }}>
                  Change {bedFlag.suggestion.fixField === "start" ? "bedtime" : "tomorrow's wake time"} to {to12hLabel(bedFlag.suggestion.fixValue)}
                </button>
              )}
            </div>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={gStyle.label}>How did they fall asleep?</label>
          <SuggestField value={entry.bedtime_how_fell_asleep} suggestions={suggestionPools.howFellAsleep}
            placeholder="e.g. fed to sleep, rocked, independently, with dummy..."
            onChange={(v) => update("bedtime_how_fell_asleep", v)} disabled={isCoach} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={gStyle.label}>Times woke overnight</label>

          {/* Mode toggle — only one method's fields are ever active/saved at once */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => !isCoach && setWakingMode("simple")}
              disabled={isCoach}
              style={{
                ...gStyle.btnSecondary, padding: "6px 12px", fontSize: 12,
                background: wakingMode === "simple" ? C.terracotta : "transparent",
                color: wakingMode === "simple" ? C.white : C.terracottaDark,
                borderColor: C.terracotta,
              }}>
              Quick totals
            </button>
            <button
              onClick={() => !isCoach && setWakingMode("detailed")}
              disabled={isCoach}
              style={{
                ...gStyle.btnSecondary, padding: "6px 12px", fontSize: 12,
                background: wakingMode === "detailed" ? C.terracotta : "transparent",
                color: wakingMode === "detailed" ? C.white : C.terracottaDark,
                borderColor: C.terracotta,
              }}>
              Log each waking
            </button>
            {!isCoach && (
              <button
                onClick={logWakingNow}
                style={{ ...gStyle.btnPrimary, width: "auto", padding: "6px 12px", fontSize: 12, marginLeft: "auto" }}
              >
                🌙 Log waking now
              </button>
            )}
          </div>

          {wakingMode === "simple" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12 }}>
              <div>
                <label style={gStyle.label}>Number of wakes</label>
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
                <label style={gStyle.label}>Total time awake overnight</label>
                <DurationSelect
                  value={entry.night_wakings_awake_mins}
                  onChange={(v) => update("night_wakings_awake_mins", v)}
                  disabled={isCoach}
                  placeholder="Select duration…"
                />
              </div>
              <div>
                <label style={gStyle.label}>Night waking notes</label>
                <SuggestField value={entry.night_wakings_notes} suggestions={suggestionPools.nightWakingNotes} multiline={false}
                  placeholder="e.g. awake 2am for 45 min, resettled with feed..."
                  onChange={(v) => update("night_wakings_notes", v)} disabled={isCoach} />
              </div>
            </div>
          ) : (
            <div>
              {(entry.night_wakings || []).map((w, idx) => {
                const dur = w.woke_at && w.back_asleep_at
                  ? diffMins(parseTime(w.woke_at), parseTime(w.back_asleep_at)) : null;
                const wakeFlag = implausibleDuration(w.woke_at, w.back_asleep_at, WAKING_MAX_PLAUSIBLE_MINS);
                return (
                  <div key={idx} style={{ borderTop: idx > 0 ? `1px solid ${C.border}` : "none", paddingTop: idx > 0 ? 12 : 0, marginTop: idx > 0 ? 12 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.mid }}>Waking {idx + 1}</span>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {dur !== null && <span style={gStyle.tag(C.blue, C.blueLight)}>{fmtDuration(dur)}</span>}
                        {!isCoach && (
                          <button onClick={() => removeWaking(idx)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={gStyle.label}>Woke at</label>
                        <TimeSelect value={w.woke_at} onChange={(v) => updateWaking(idx, "woke_at", v)} disabled={isCoach} placeholder="Time…" />
                      </div>
                      <div>
                        <label style={gStyle.label}>Back asleep at</label>
                        <TimeSelect value={w.back_asleep_at} onChange={(v) => updateWaking(idx, "back_asleep_at", v)} disabled={isCoach} placeholder="Time…" />
                      </div>
                    </div>
                    {!isCoach && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button type="button" onClick={() => updateWaking(idx, "woke_at", getCurrentTime())}
                          style={{ ...gStyle.btnSecondary, flex: 1, padding: "8px 10px", fontSize: 12 }}>
                          ▶ Woke now
                        </button>
                        <button type="button" onClick={() => updateWaking(idx, "back_asleep_at", getCurrentTime())}
                          style={{ ...gStyle.btnSecondary, flex: 1, padding: "8px 10px", fontSize: 12 }}>
                          ⏹ Asleep now
                        </button>
                      </div>
                    )}
                    {w.woke_at && !w.back_asleep_at && (
                      <p style={{ fontSize: 12, color: C.blue, marginTop: 8 }}>
                        👀 Awake now — {fmtDuration(diffMins(parseTime(w.woke_at), parseTime(nowTick)))} so far
                      </p>
                    )}
                    {wakeFlag && (
                      <div style={{
                        background: "#FDF3E3", border: "1px solid #E0B96A", borderRadius: 8,
                        padding: "10px 12px", marginTop: 10, fontSize: 12.5, color: "#6B4A1F",
                      }}>
                        <strong>⚠️ That's {fmtDuration(wakeFlag.dur)} awake — is that right?</strong>
                        {wakeFlag.suggestion && (
                          <div style={{ marginTop: 4, lineHeight: 1.45 }}>
                            If you meant <strong>{to12hLabel(wakeFlag.suggestion.fixValue)}</strong>, it would be {fmtDuration(wakeFlag.suggestion.dur)}.
                          </div>
                        )}
                        {wakeFlag.suggestion && !isCoach && (
                          <button
                            onClick={() => updateWaking(idx, wakeFlag.suggestion.fixField === "end" ? "back_asleep_at" : "woke_at", wakeFlag.suggestion.fixValue)}
                            style={{
                              marginTop: 8, padding: "6px 12px", borderRadius: 7,
                              border: "1px solid #C4714A", background: "#C4714A", color: "#FFFFFF",
                              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font.body,
                            }}>
                            Change to {to12hLabel(wakeFlag.suggestion.fixValue)}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {!isCoach && (
                <button style={{ ...gStyle.btnSecondary, padding: "6px 12px", fontSize: 12, marginTop: (entry.night_wakings || []).length ? 12 : 0 }} onClick={addWaking}>
                  + Add waking
                </button>
              )}
              {detailedWakingTotals.count > 0 && (
                <p style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
                  {detailedWakingTotals.count} waking{detailedWakingTotals.count !== 1 ? "s" : ""} · {fmtDuration(detailedWakingTotals.mins)} total time awake
                </p>
              )}
              <div style={{ marginTop: 12 }}>
                <label style={gStyle.label}>Night waking notes</label>
                <SuggestField value={entry.night_wakings_notes} suggestions={suggestionPools.nightWakingNotes} multiline={false}
                  placeholder="e.g. awake 2am for 45 min, resettled with feed..."
                  onChange={(v) => update("night_wakings_notes", v)} disabled={isCoach} />
              </div>
            </div>
          )}
        </div>
        <label style={gStyle.label}>General notes</label>
        <SuggestField value={entry.notes} suggestions={suggestionPools.generalNotes} minHeight={80}
          placeholder="How was settling? Anything else to note..."
          onChange={(v) => update("notes", v)} disabled={isCoach} />
      </div>

      {/* Date nav (bottom) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, marginBottom: 20 }}>
        <button onClick={() => changeDate(-1)} style={{ ...gStyle.btnSecondary, padding: "8px 14px" }}>←</button>
        <input type="date" style={{ ...gStyle.input, flex: 1, textAlign: "center" }}
          value={selectedDate} onChange={(e) => handleDateChange(e.target.value)}
          max={today()}
        />
        <button onClick={() => changeDate(1)} style={{ ...gStyle.btnSecondary, padding: "8px 14px" }}
          disabled={selectedDate >= today()}>→</button>
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
  const [iosHelpOpen, setIosHelpOpen] = useState(false);

  // Date range filter — narrows the charts/summary/table to a window within the full diary.
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  // Compare mode — put a "before" and "after" period side by side for client-facing snapshots.
  const [compareOpen, setCompareOpen] = useState(false);
  const [periodAStart, setPeriodAStart] = useState("");
  const [periodAEnd, setPeriodAEnd] = useState("");
  const [periodBStart, setPeriodBStart] = useState("");
  const [periodBEnd, setPeriodBEnd] = useState("");
  const [copied, setCopied] = useState(false);

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
    const rawBackwardNightMins = prevEntry?.bed_time && e.wake_time
      ? calcNightSleep(prevEntry.bed_time, e.wake_time)
      : null;
    // The "awake overnight" duration is logged on the night it belongs to (prevEntry's date)
    const prevAwakeMins = prevEntry ? (parseInt(prevEntry.night_wakings_awake_mins) || 0) : 0;
    const backwardNightMins = rawBackwardNightMins !== null
      ? Math.max(0, rawBackwardNightMins - prevAwakeMins)
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

  // Builds the same set of averages for any subset of `days` — used for the
  // main (date-range-filtered) view and for each side of the period comparison.
  const summarize = (subset) => ({
    avgNap:      avg(subset.map(d => d.napMins)),
    avgNight:    avg(subset.map(d => d.nightMins)),
    avgTotal:    avg(subset.map(d => d.totalMins)),
    avgNapCount: avg(subset.map(d => d.napCount)),
    avgWW:       avg(subset.map(d => d.avgWW)),
    avgNightWakings: avg(subset.map(d => d.nightWakings)),
    completeDays: subset.filter(d => d.totalMins !== null).length,
    dayCount: subset.length,
  });

  // ── Date range filter — narrows which days feed the summary/charts/table ──
  const minDate = days[0].date;
  const maxDate = days[days.length - 1].date;
  const effStart = rangeStart || minDate;
  const effEnd   = rangeEnd   || maxDate;
  const filteredDays = days.filter(d => d.date >= effStart && d.date <= effEnd);
  const isFiltered = effStart !== minDate || effEnd !== maxDate;
  const fmtDateLabel = (dstr) => new Date(dstr + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

  const applyPreset = (preset) => {
    if (preset === "all") { setRangeStart(""); setRangeEnd(""); return; }
    if (preset === "first7")  { setRangeStart(minDate); setRangeEnd(offsetDate(minDate, 6) > maxDate ? maxDate : offsetDate(minDate, 6)); return; }
    if (preset === "last7")   { setRangeStart(offsetDate(maxDate, -6) < minDate ? minDate : offsetDate(maxDate, -6)); setRangeEnd(maxDate); return; }
    if (preset === "first14") { setRangeStart(minDate); setRangeEnd(offsetDate(minDate, 13) > maxDate ? maxDate : offsetDate(minDate, 13)); return; }
    if (preset === "last14")  { setRangeStart(offsetDate(maxDate, -13) < minDate ? minDate : offsetDate(maxDate, -13)); setRangeEnd(maxDate); return; }
  };

  const summary = summarize(filteredDays);
  const { avgNap, avgNight, avgTotal, avgNapCount, avgWW, avgNightWakings, completeDays } = summary;

  // ── Compare two periods (e.g. "when we started" vs "now") ─────────────────
  const totalSpanDays = Math.max(0, daysBetween(minDate, maxDate));
  const defaultWindow = Math.min(6, totalSpanDays); // 7-day window by default
  const pAStart = periodAStart || minDate;
  const pAEnd   = periodAEnd   || offsetDate(minDate, defaultWindow);
  const pBStart = periodBStart || offsetDate(maxDate, -defaultWindow);
  const pBEnd   = periodBEnd   || maxDate;
  const periodADays = days.filter(d => d.date >= pAStart && d.date <= pAEnd);
  const periodBDays = days.filter(d => d.date >= pBStart && d.date <= pBEnd);
  const summaryA = summarize(periodADays);
  const summaryB = summarize(periodBDays);

  const compareMetrics = [
    { key: "avgNightWakings", label: "Night wakings",       unit: "count", direction: "lower" },
    { key: "avgNight",        label: "Night sleep",         unit: "mins",  direction: "higher" },
    { key: "avgTotal",        label: "Total sleep (24h)",   unit: "mins",  direction: "higher" },
    { key: "avgNap",          label: "Nap sleep",           unit: "mins",  direction: "higher" },
    { key: "avgWW",           label: "Wake window",         unit: "mins",  direction: "neutral" },
  ];
  const fmtCompareVal = (v, unit) => v === null ? "—" : unit === "mins" ? fmtDuration(v) : `${v}×`;
  const fmtCompareDelta = (d, unit) => {
    if (d === null) return "—";
    if (d === 0) return unit === "mins" ? "0m" : "0";
    const sign = d > 0 ? "+" : "-";
    return sign + (unit === "mins" ? fmtDuration(Math.abs(d)) : `${Math.abs(d)}`);
  };

  const headlineParts = [];
  if (summaryA.avgNightWakings !== null && summaryB.avgNightWakings !== null) {
    headlineParts.push(`average night wakings went from ${summaryA.avgNightWakings} to ${summaryB.avgNightWakings} times a night`);
  }
  if (summaryA.avgTotal !== null && summaryB.avgTotal !== null) {
    headlineParts.push(`total sleep moved from ${fmtDuration(summaryA.avgTotal)} to ${fmtDuration(summaryB.avgTotal)} a day`);
  }
  const headline = headlineParts.length > 0 ? `With ${client.name}, ${headlineParts.join(", and ")}.` : "";
  const copyHeadline = () => {
    if (!headline) return;
    try {
      navigator.clipboard.writeText(headline);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

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
      data: filteredDays.map(d => ({ label: d.label, value: d.napMins })),
      yLabel: "mins",
    },
    {
      label: "Night Sleep",
      avg: avgNight,
      color: C.terracotta,
      data: filteredDays.map(d => ({ label: d.label, value: d.nightMins })),
      yLabel: "mins",
    },
    {
      label: "Total Sleep in 24h",
      avg: avgTotal,
      color: C.gold,
      data: filteredDays.map(d => ({ label: d.label, value: d.totalMins })),
      yLabel: "mins",
    },
    {
      label: "Number of Naps",
      avg: avgNapCount,
      color: C.blueDark,
      data: filteredDays.map(d => ({ label: d.label, value: d.napCount })),
      yLabel: "naps",
    },
    {
      label: "Average Wake Window",
      avg: avgWW,
      color: C.terracottaDark,
      data: filteredDays.map(d => ({ label: d.label, value: d.avgWW })),
      yLabel: "mins",
    },
    {
      label: "Night Wakings",
      avg: avgNightWakings,
      color: C.blueDark,
      data: filteredDays.map(d => ({ label: d.label, value: d.nightWakings })),
      yLabel: "wakings",
    },
    {
      label: "Morning Wake Time",
      avg: null,
      color: C.gold,
      data: filteredDays.map(d => ({
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
      data: filteredDays.map(d => ({
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
            {filteredDays.length} of {days.length} days logged shown · {completeDays} complete · averages exclude incomplete days
          </p>
        </div>
        <button
          style={{ ...gStyle.btnGold, display: "flex", alignItems: "center", gap: 8 }}
          onClick={() => printOrGuide(setIosHelpOpen)}
        >
          🖨 Print / Save as PDF
        </button>
      </div>

      {/* Print header — only shows when printing */}
      <div className="print-only" style={{ display: "none", marginBottom: 24 }}>
        <div style={{ fontFamily: font.display, fontSize: 24, color: C.terracotta }}>Signs for Sleep</div>
        <div style={{ fontSize: 12, color: C.gold, letterSpacing: "0.05em" }}>Supporting sleep through connection and communication.</div>
        <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>Sleep Analysis — {client.name}</div>
        <div style={{ fontSize: 12, color: C.muted }}>Showing {fmtDateLabel(effStart)} – {fmtDateLabel(effEnd)} · Generated {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</div>
        <hr style={{ borderColor: C.border, margin: "12px 0" }} />
      </div>

      {/* Date range filter */}
      <div className="no-print" style={{ ...gStyle.card, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
          <div>
            <label style={gStyle.label}>Date range</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="date" style={gStyle.input} value={effStart}
                min={minDate} max={effEnd}
                onChange={(e) => setRangeStart(e.target.value)} />
              <span style={{ color: C.muted, fontSize: 13 }}>to</span>
              <input type="date" style={gStyle.input} value={effEnd}
                min={effStart} max={maxDate}
                onChange={(e) => setRangeEnd(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "All time", fn: "all" },
              { label: "First 7 days", fn: "first7" },
              { label: "Last 7 days", fn: "last7" },
              { label: "First 14 days", fn: "first14" },
              { label: "Last 14 days", fn: "last14" },
            ].map(p => (
              <button key={p.label} onClick={() => applyPreset(p.fn)}
                style={{ ...gStyle.btnSecondary, padding: "8px 14px", fontSize: 12 }}>
                {p.label}
              </button>
            ))}
            <button onClick={() => setCompareOpen(o => !o)}
              style={{ ...gStyle.btnGold, padding: "8px 14px", fontSize: 12 }}>
              {compareOpen ? "Hide comparison" : "📊 Compare periods"}
            </button>
          </div>
        </div>
        {isFiltered && (
          <p style={{ fontSize: 12, color: C.terracotta, marginTop: 12, marginBottom: 0 }}>
            Showing a custom range — {fmtDateLabel(effStart)} to {fmtDateLabel(effEnd)} ({filteredDays.length} days).{" "}
            <button onClick={() => applyPreset("all")}
              style={{ background: "none", border: "none", color: C.terracotta, textDecoration: "underline", cursor: "pointer", fontSize: 12, padding: 0 }}>
              Reset to all time
            </button>
          </p>
        )}
      </div>

      {/* Compare two periods — e.g. "when we started" vs "now" */}
      {compareOpen && (
        <div style={{ ...gStyle.card, marginBottom: 24, background: C.cream }}>
          <h3 style={{ fontFamily: font.display, color: C.dark, margin: "0 0 4px", fontSize: 16 }}>
            Compare Two Periods
          </h3>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
            Pick a "before" and "after" window to show a client's progress at a glance.
          </p>

          <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label style={{ ...gStyle.label, color: C.blueDark }}>Period A — before</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="date" style={gStyle.input} value={pAStart}
                  min={minDate} max={pAEnd}
                  onChange={(e) => setPeriodAStart(e.target.value)} />
                <input type="date" style={gStyle.input} value={pAEnd}
                  min={pAStart} max={maxDate}
                  onChange={(e) => setPeriodAEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={{ ...gStyle.label, color: C.terracottaDark }}>Period B — after</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="date" style={gStyle.input} value={pBStart}
                  min={minDate} max={pBEnd}
                  onChange={(e) => setPeriodBStart(e.target.value)} />
                <input type="date" style={gStyle.input} value={pBEnd}
                  min={pBStart} max={maxDate}
                  onChange={(e) => setPeriodBEnd(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", padding: "10px 14px", background: C.cream, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <div>Metric</div>
              <div style={{ textAlign: "right" }}>Before</div>
              <div style={{ textAlign: "right" }}>After</div>
              <div style={{ textAlign: "right" }}>Change</div>
            </div>
            {compareMetrics.map((m, i) => {
              const aVal = summaryA[m.key];
              const bVal = summaryB[m.key];
              const d = (aVal !== null && bVal !== null) ? bVal - aVal : null;
              const improved = d !== null && d !== 0 && m.direction !== "neutral" && (m.direction === "lower" ? d < 0 : d > 0);
              const worsened = d !== null && d !== 0 && m.direction !== "neutral" && (m.direction === "lower" ? d > 0 : d < 0);
              const deltaColor = improved ? C.success : worsened ? C.danger : C.mid;
              const pct = (aVal && bVal !== null && aVal !== 0) ? Math.round(((bVal - aVal) / aVal) * 100) : null;
              return (
                <div key={m.key} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", padding: "10px 14px", borderTop: `1px solid ${C.border}`, fontSize: 13, background: i % 2 === 0 ? C.white : C.cream, alignItems: "center" }}>
                  <div style={{ color: C.dark, fontWeight: 600 }}>{m.label}</div>
                  <div style={{ textAlign: "right", color: C.blueDark }}>{fmtCompareVal(aVal, m.unit)}</div>
                  <div style={{ textAlign: "right", color: C.terracottaDark, fontWeight: 700 }}>{fmtCompareVal(bVal, m.unit)}</div>
                  <div style={{ textAlign: "right", color: deltaColor, fontWeight: 700 }}>
                    {fmtCompareDelta(d, m.unit)}{pct !== null && d !== 0 ? ` (${pct > 0 ? "+" : ""}${pct}%)` : ""}
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>
            Before: {fmtDateLabel(pAStart)} – {fmtDateLabel(pAEnd)} · {periodADays.length} days logged ({summaryA.completeDays} complete) &nbsp;|&nbsp;
            After: {fmtDateLabel(pBStart)} – {fmtDateLabel(pBEnd)} · {periodBDays.length} days logged ({summaryB.completeDays} complete)
          </p>

          {headline && (
            <div style={{ marginTop: 16, background: C.terracottaLight, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 14, color: C.terracottaDark, fontStyle: "italic", lineHeight: 1.5 }}>
                "{headline}"
              </div>
              <button className="no-print" style={{ ...gStyle.btnSecondary, whiteSpace: "nowrap", flexShrink: 0 }}
                onClick={copyHeadline}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Avg nap sleep", value: fmtDuration(avgNap), color: C.blue, sub: `${avgNapCount ?? "—"} naps/day` },
          { label: "Avg night sleep", value: fmtDuration(avgNight), color: C.terracotta, sub: "per night" },
          { label: "Avg total 24h", value: fmtDuration(avgTotal), color: C.gold, sub: "all sleep" },
          { label: "Avg wake window", value: fmtDuration(avgWW), color: C.blueDark, sub: "between sleeps" },
          { label: "Avg night wakings", value: avgNightWakings !== null ? avgNightWakings : "—", color: C.terracottaDark, sub: "times per night" },
          { label: "Days in range", value: filteredDays.length, color: C.mid, sub: `${completeDays} complete` },
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
              {filteredDays.map((d, i) => (
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
      <IosPrintHelpModal open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} />
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
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
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

  const printPlan = () => printOrGuide(setIosHelpOpen);

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
          <img src={LOGO_URL}
            alt="Signs for Sleep" style={{ maxWidth: 280, height: "auto" }} />
          <div style={{ fontFamily: font.display, fontSize: 20, color: "#4A6274", marginTop: 12 }}>
            Sleep Plan{childName ? ` for ${childName}` : ""}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            {plan.shared_at ? `Shared ${new Date(plan.shared_at).toLocaleDateString("en-AU", { day:"numeric", month:"long", year:"numeric" })}` : ""}
          </div>
          <hr style={{ borderColor: "#B8963E", margin: "16px 0" }} />
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
          <>
            {/* On-screen view — cards make it easy to scan while browsing in-app */}
            <div className="no-print">
              {filledSections.map((s, i) => (
                <div key={i} style={{ ...gStyle.card, marginBottom: 16 }}>
                  <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 12px", fontSize: 18 }}>
                    {s.title}
                  </h3>
                  <div style={{ fontSize: 14, color: C.dark, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {s.content}
                  </div>
                </div>
              ))}
            </div>
            {/* Print view — no card borders, and no pageBreakInside:avoid, so a
                heading sits directly under whatever came before it and a long
                body can flow across a page break instead of the whole section
                jumping to the next page and leaving a gap behind it. */}
            <div className="print-only" style={{ display: "none" }}>
              {filledSections.map((s, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <h3 style={{
                    fontFamily: font.display, color: "#C4714A", margin: "0 0 8px", fontSize: 18,
                    breakAfter: "avoid-page", pageBreakAfter: "avoid",
                  }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 14, color: C.dark, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>
                    {s.content}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white !important; }
            /* Without this, some browsers mute/shift text colours when
               printing (the terracotta headings come out closer to brown). */
            .print-only, .print-only * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        `}</style>
        <IosPrintHelpModal open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} />
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
        <img src={LOGO_URL}
          alt="Signs for Sleep" style={{ maxWidth: 280, height: "auto" }} />
        <div style={{ fontFamily: font.display, fontSize: 20, color: "#4A6274", marginTop: 12 }}>
          Sleep Plan{childName ? ` for ${childName}` : ""}
        </div>
        <hr style={{ borderColor: "#B8963E", margin: "16px 0" }} />
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

      {/* Print version of sections — no pageBreakInside:avoid here, so a
          heading sits directly under whatever came before it and a long
          body can flow across a page break instead of the whole section
          jumping to the next page and leaving a gap behind it. */}
      {sections.filter(s => s.content?.trim()).map((s, i) => (
        <div key={i} className="print-only" style={{ display: "none", marginBottom: 20 }}>
          <h3 style={{
            fontFamily: font.display, color: "#C4714A", fontSize: 16, marginBottom: 8,
            breakAfter: "avoid-page", pageBreakAfter: "avoid",
          }}>{s.title}</h3>
          <p style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", color: C.dark, margin: 0 }}>{s.content}</p>
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
          /* Without this, some browsers mute/shift text colours when
             printing (the terracotta headings come out closer to brown). */
          .print-only, .print-only * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
      <IosPrintHelpModal open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} />
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

// Stylesheet shared by both the coach and client toolbox views.
// - Stacks the strategy tiles to a single column on narrow (mobile) screens,
//   keeps them side-by-side on desktop
// - Forces background colours to print (browsers strip them by default)
// - Sets a sensible page size/margin
// - Trims font sizes/padding slightly so more fits per printed page
const TOOLBOX_PRINT_CSS = `
  /* Sized for the current logo (tagline baked into the image, minimal
     built-in padding). If you swap the logo file again and the sizing looks
     off, adjust the max-width values below rather than using large negative
     margins — those were only needed to compensate for the old file's
     excess transparent padding. */
  .tb-logo { max-width: 260px; }

  @media screen and (max-width: 640px) {
    .tb-tiles-grid { grid-template-columns: 1fr !important; }
  }

  @media print {
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    body { background: white !important; }
    button { display: none !important; }

    @page { size: A4; margin: 12mm; }

    /* Force background colours + text colours to actually print */
    .tb-summary, .tb-tile, .tb-summary *, .tb-tile * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* Tighten sizing so everything fits the page more comfortably */
    .tb-header { margin-bottom: 14px !important; padding-bottom: 10px !important; }
    .tb-title { font-size: 20px !important; }
    .tb-meta, .tb-eyebrow { font-size: 10px !important; }
    .tb-logo { max-width: 180px !important; }
    .tb-summary { padding: 12px 16px !important; margin-bottom: 14px !important; font-size: 11.5px !important; line-height: 1.5 !important; }
    .tb-tiles-grid { gap: 10px !important; grid-template-columns: 1fr 1fr !important; }
    .tb-tile { padding: 12px 14px !important; border-radius: 10px !important; }
    .tb-situation { font-size: 10.5px !important; margin-bottom: 8px !important; }
    .tb-strategy-title { font-size: 14px !important; margin-bottom: 4px !important; }
    .tb-strategy-desc { font-size: 10.5px !important; line-height: 1.45 !important; }
  }
`;

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
    <div className="tb-header" style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.gold}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="tb-eyebrow" style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Knowledge Toolbox
          </div>
          <div className="tb-title" style={{ fontFamily: font.display, fontSize: 28, color: C.dark }}>{toolbox.title || "—"}</div>
          <div className="tb-meta" style={{ fontSize: 13, color: C.mid, marginTop: 4 }}>
            Prepared by Chloé
            {toolbox.prepared_date ? ` · ${new Date(toolbox.prepared_date + "T00:00:00").toLocaleDateString("en-AU", { month: "long", year: "numeric" })}` : ""}
            {toolbox.child_age_label ? ` · ${toolbox.child_age_label}` : ""}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <img
            src={LOGO_URL}
            alt="Signs for Sleep"
            className="tb-logo"
            style={{ width: "100%", height: "auto" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
      </div>
    </div>
  );
}

function ToolboxTileView({ tile }) {
  return (
    <div className="tb-tile" style={{ background: C.blueDark, borderRadius: 14, padding: "18px 20px", color: C.white, pageBreakInside: "avoid" }}>
      <div className="tb-eyebrow" style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        Your Situation
      </div>
      <div className="tb-situation" style={{ fontStyle: "italic", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>{tile.situation}</div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 12 }}>
        <div className="tb-eyebrow" style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          Strategy
        </div>
        <div className="tb-strategy-title" style={{ fontFamily: font.display, fontSize: 17, marginBottom: 6 }}>{tile.strategy_title}</div>
        <div className="tb-strategy-desc" style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>{tile.strategy_description}</div>
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
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [showLibraryManager, setShowLibraryManager] = useState(false);
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
  const saveTimer = useRef(null);

  const loadLibrary = useCallback(async () => {
    const { data } = await supabase.from("strategy_library").select("*").order("sort_order", { ascending: true });
    setLibrary(data || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: intakeData } = await supabase.from("intake_responses")
        .select("child_dob, child_name").eq("client_id", clientId).maybeSingle();
      if (intakeData?.child_dob) setChildDob(intakeData.child_dob);
      if (intakeData?.child_name) setChildName(intakeData.child_name);

      const { data: tb } = await supabase.from("knowledge_toolboxes")
        .select("*").eq("client_id", clientId).maybeSingle();

      if (tb) {
        setToolbox(tb);
        setTiles(tb.tiles && tb.tiles.length ? tb.tiles : [emptyTile()]);
      } else if (isCoach) {
        // Default the title to the child's name from intake (falls back to the
        // client account name if intake hasn't been filled in yet). Fully editable.
        setToolbox({
          client_id: clientId,
          title: intakeData?.child_name || clientData?.name || "",
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
  const printToolbox = () => printOrGuide(setIosHelpOpen);

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
          <div className="tb-summary" style={{
            background: C.terracotta, color: C.white, borderRadius: 14,
            padding: "20px 24px", marginBottom: 24, lineHeight: 1.7, fontSize: 14,
          }}>
            {toolbox.summary_text}
          </div>
        )}
        {filledTiles.length > 0 && (
          <div className="tb-tiles-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {filledTiles.map((t, i) => <ToolboxTileView key={t.id || i} tile={t} />)}
          </div>
        )}
        <style>{TOOLBOX_PRINT_CSS}</style>
        <IosPrintHelpModal open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} />
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
            {childName && toolbox.title !== childName && (
              <button
                onClick={() => updateHeaderField("title", childName)}
                style={{
                  background: "none", border: "none", padding: 0, marginTop: 5,
                  fontFamily: font.body, fontSize: 11, color: C.terracotta,
                  cursor: "pointer", textDecoration: "underline",
                }}
              >
                Use "{childName}" from intake
              </button>
            )}
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

      <div className="no-print tb-tiles-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
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

      {/* Print-only version — the live ToolboxHeader above already prints fine on
          its own, so this only needs to add the read-only summary + filled tiles
          (the editable textareas/selects above are hidden via .no-print). */}
      <div className="print-only" style={{ display: "none" }}>
        {toolbox.summary_text && (
          <div className="tb-summary" style={{ background: C.terracotta, color: C.white, borderRadius: 14, padding: "20px 24px", marginBottom: 24, lineHeight: 1.7, fontSize: 14 }}>
            {toolbox.summary_text}
          </div>
        )}
        <div className="tb-tiles-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {tiles.filter((t) => t.strategy_title).map((t, i) => <ToolboxTileView key={t.id || i} tile={t} />)}
        </div>
      </div>

      <style>{TOOLBOX_PRINT_CSS}</style>
      <IosPrintHelpModal open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS LOG — quick wins/milestones tracker + shareable recap
// ═══════════════════════════════════════════════════════════════════════════

const PROGRESS_TAGS = [
  { key: "win",         label: "Win",         emoji: "🎉", color: C.terracotta, bg: C.terracottaLight },
  { key: "milestone",   label: "Milestone",   emoji: "⭐", color: C.gold,       bg: C.goldLight },
  { key: "rough_patch", label: "Rough patch", emoji: "🌙", color: C.blueDark,   bg: C.blueLight },
  { key: "note",        label: "Note",        emoji: "📝", color: C.mid,        bg: "#F0EDE9" },
];

const PROGRESS_PRINT_CSS = `
  @media print {
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    body { background: white !important; }
    button { display: none !important; }
    @page { size: A4; margin: 12mm; }
    .pr-intro, .pr-intro * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }
`;

// Top-level tab: toggles between the working Timeline and the shareable Recap
function ProgressTab({ clientId, clientData, isCoach }) {
  const [view, setView] = useState("timeline"); // timeline | recap

  return (
    <div>
      <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { key: "timeline", label: "Timeline" },
          { key: "recap", label: "✨ Recap" },
        ].map((v) => (
          <button key={v.key} onClick={() => setView(v.key)} style={{
            padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
            fontFamily: font.body, fontSize: 13, fontWeight: 600,
            background: view === v.key ? C.terracotta : C.terracottaLight,
            color: view === v.key ? C.white : C.terracottaDark,
          }}>
            {v.label}
          </button>
        ))}
      </div>
      {view === "timeline"
        ? <ProgressTimeline clientId={clientId} clientData={clientData} isCoach={isCoach} />
        : <ProgressRecap clientId={clientId} isCoach={isCoach} />}
    </div>
  );
}

// ── TIMELINE — the working log, both coach and client can add to it ────────
function ProgressTimeline({ clientId, clientData, isCoach }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const loadEntries = useCallback(async () => {
    const { data } = await supabase.from("progress_entries")
      .select("*").eq("client_id", clientId)
      .order("created_at", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const addEntry = async () => {
    if (!selectedTag) return;
    setSaving(true);
    await supabase.from("progress_entries").insert({
      client_id: clientId,
      author: isCoach ? "coach" : "client",
      tag: selectedTag,
      note: note.trim() || null,
    });
    setSelectedTag("");
    setNote("");
    setSaving(false);
    loadEntries();
  };

  const deleteEntry = async (entry) => {
    await supabase.from("progress_entries").delete().eq("id", entry.id);
    loadEntries();
  };

  // Coach sees "You" for their own entries and the client's name for the client's;
  // client sees "You" for their own and "Chloé" for the coach's.
  const authorLabel = (entry) => {
    if (isCoach) return entry.author === "coach" ? "You" : (clientData?.name || "Client");
    return entry.author === "client" ? "You" : "Chloé";
  };

  // Coach can clear anything; client can only remove their own entries.
  const canDelete = (entry) => (isCoach ? true : entry.author === "client");

  return (
    <div>
      {/* Quick add */}
      <div style={gStyle.card}>
        <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 14px" }}>Log something</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {PROGRESS_TAGS.map((t) => (
            <button key={t.key} onClick={() => setSelectedTag(t.key)} style={{
              padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer",
              fontFamily: font.body, fontSize: 13, fontWeight: 600,
              background: selectedTag === t.key ? t.color : t.bg,
              color: selectedTag === t.key ? C.white : t.color,
            }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...gStyle.input, flex: 1 }}
            placeholder="Add a quick note (optional)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addEntry()}
          />
          <button
            style={{ ...gStyle.btnPrimary, width: "auto" }}
            onClick={addEntry}
            disabled={!selectedTag || saving}
          >
            {saving ? "Adding…" : "+ Add"}
          </button>
        </div>
        {!selectedTag && (
          <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>Pick a tag above to add an entry.</p>
        )}
      </div>

      {/* Timeline */}
      {loading ? (
        <p style={{ color: C.muted, padding: 40 }}>Loading…</p>
      ) : entries.length === 0 ? (
        <div style={{ ...gStyle.card, textAlign: "center", padding: 40, color: C.muted }}>
          Nothing logged yet — tap a tag above to add the first entry.
        </div>
      ) : (
        entries.map((entry) => {
          const tagConfig = PROGRESS_TAGS.find((t) => t.key === entry.tag) || PROGRESS_TAGS[3];
          return (
            <div key={entry.id} style={{
              ...gStyle.card, borderLeft: `4px solid ${tagConfig.color}`,
              display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={gStyle.tag(tagConfig.color, tagConfig.bg)}>{tagConfig.emoji} {tagConfig.label}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>
                    {authorLabel(entry)} · {new Date(entry.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {entry.note && <div style={{ fontSize: 14, color: C.dark }}>{entry.note}</div>}
              </div>
              {canDelete(entry) && (
                <button onClick={() => deleteEntry(entry)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ── RECAP — auto-compiled from Win/Milestone entries, shareable like the Sleep Plan/Toolbox ──
function ProgressRecap({ clientId, isCoach }) {
  const [recap, setRecap] = useState(null);
  const [entries, setEntries] = useState([]);
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: intakeData } = await supabase.from("intake_responses")
        .select("child_name").eq("client_id", clientId).maybeSingle();
      if (intakeData?.child_name) setChildName(intakeData.child_name);

      const { data: rc } = await supabase.from("progress_recaps")
        .select("*").eq("client_id", clientId).maybeSingle();
      if (rc) {
        setRecap(rc);
      } else if (isCoach) {
        setRecap({ client_id: clientId, intro_text: "", shared: false });
      }

      const { data: entryData } = await supabase.from("progress_entries")
        .select("*").eq("client_id", clientId)
        .in("tag", ["win", "milestone"])
        .order("created_at", { ascending: true });
      setEntries(entryData || []);
      setLoading(false);
    };
    load();
  }, [clientId, isCoach]);

  const saveRecap = async (updated, opts = {}) => {
    setSaving(true);
    const payload = {
      client_id: clientId,
      intro_text: updated.intro_text || null,
      updated_at: new Date().toISOString(),
    };
    if (opts.share !== undefined) {
      payload.shared = opts.share;
      if (opts.share) payload.shared_at = new Date().toISOString();
    }
    let saved;
    if (updated?.id) {
      ({ data: saved } = await supabase.from("progress_recaps")
        .update(payload).eq("id", updated.id).select("*").maybeSingle());
    } else {
      ({ data: saved } = await supabase.from("progress_recaps")
        .insert(payload).select("*").maybeSingle());
    }
    if (saved) setRecap(saved);
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const updateIntro = (value) => {
    const next = { ...recap, intro_text: value };
    setRecap(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveRecap(next), 1000);
  };

  const share = () => saveRecap(recap, { share: true });
  const unshare = async () => {
    await supabase.from("progress_recaps").update({ shared: false }).eq("id", recap.id);
    setRecap((prev) => ({ ...prev, shared: false }));
  };

  const printRecap = () => printOrGuide(setIosHelpOpen);

  if (loading) return <p style={{ color: C.muted, padding: 40 }}>Loading recap…</p>;

  const winCount = entries.filter((e) => e.tag === "win").length;
  const milestoneCount = entries.filter((e) => e.tag === "milestone").length;
  const spanLabel = (() => {
    if (entries.length < 2) return null;
    const first = new Date(entries[0].created_at);
    const last = new Date(entries[entries.length - 1].created_at);
    const days = Math.max(1, Math.round((last - first) / 86400000));
    return days < 14 ? `${days} days` : `${Math.round(days / 7)} weeks`;
  })();

  // ── CLIENT VIEW ──
  if (!isCoach) {
    if (!recap || !recap.shared) return (
      <div style={{ ...gStyle.card, textAlign: "center", padding: 48, color: C.muted }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
        <p style={{ fontSize: 16, marginBottom: 8 }}>Your progress recap isn't ready yet.</p>
        <p style={{ fontSize: 13 }}>Your consultant will share it with you when it's time.</p>
      </div>
    );

    return (
      <div>
        <RecapHeader childName={childName} winCount={winCount} milestoneCount={milestoneCount} spanLabel={spanLabel} />
        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button style={gStyle.btnGold} onClick={printRecap}>🖨 Print / Save PDF</button>
        </div>
        {recap.intro_text && (
          <div className="pr-intro" style={{ background: C.terracotta, color: C.white, borderRadius: 14, padding: "20px 24px", marginBottom: 24, lineHeight: 1.7, fontSize: 14 }}>
            {recap.intro_text}
          </div>
        )}
        <RecapEntryList entries={entries} />
        <style>{PROGRESS_PRINT_CSS}</style>
        <IosPrintHelpModal open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} />
      </div>
    );
  }

  // ── COACH VIEW ──
  return (
    <div>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.terracotta, margin: 0 }}>Progress Recap</h2>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {saving ? "Saving…" : savedMsg ? "✓ Saved" : "Auto-saves as you type"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={gStyle.btnGold} onClick={printRecap}>🖨 Print / PDF</button>
          {recap?.shared ? (
            <button style={gStyle.btnDanger} onClick={unshare}>Unshare from client</button>
          ) : (
            <button style={{ ...gStyle.btnPrimary, width: "auto" }} onClick={share}>Share with client</button>
          )}
        </div>
      </div>

      {recap?.shared && (
        <div className="no-print" style={{
          background: C.successLight, borderRadius: 10, padding: "10px 16px",
          marginBottom: 20, fontSize: 13, color: C.success, display: "flex", justifyContent: "space-between",
        }}>
          <span>✓ Visible to client</span>
          <span style={{ color: C.muted }}>
            Shared {recap.shared_at ? new Date(recap.shared_at).toLocaleDateString("en-AU") : ""}
          </span>
        </div>
      )}

      <RecapHeader childName={childName} winCount={winCount} milestoneCount={milestoneCount} spanLabel={spanLabel} />

      <div className="no-print" style={{ marginBottom: 20 }}>
        <label style={gStyle.label}>Intro message</label>
        <textarea
          style={{
            ...gStyle.input, minHeight: 90, resize: "vertical", lineHeight: 1.7,
            background: C.terracotta, color: C.white, border: "none", borderRadius: 14, padding: "18px 20px",
          }}
          placeholder="Look how far you've come — here's every win captured along the way…"
          value={recap.intro_text || ""}
          onChange={(e) => updateIntro(e.target.value)}
        />
      </div>

      {/* Print-only intro — the editable textarea above is hidden via .no-print.
          Placed here (before the entries list) so print order matches the on-screen order. */}
      <div className="print-only" style={{ display: "none" }}>
        {recap.intro_text && (
          <div className="pr-intro" style={{ background: C.terracotta, color: C.white, borderRadius: 14, padding: "20px 24px", marginBottom: 24, lineHeight: 1.7, fontSize: 14 }}>
            {recap.intro_text}
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div style={{ ...gStyle.card, textAlign: "center", padding: 40, color: C.muted }}>
          No wins or milestones logged yet — add some from the Timeline tab first.
        </div>
      ) : (
        <RecapEntryList entries={entries} />
      )}

      <style>{PROGRESS_PRINT_CSS}</style>
      <IosPrintHelpModal open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} />
    </div>
  );
}

function RecapHeader({ childName, winCount, milestoneCount, spanLabel }) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.gold}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Progress Recap
          </div>
          <div style={{ fontFamily: font.display, fontSize: 24, color: C.dark }}>
            {childName ? `${childName}'s Journey` : "Your Journey"}
          </div>
          <div style={{ fontSize: 13, color: C.mid, marginTop: 4 }}>
            {winCount} win{winCount !== 1 ? "s" : ""} · {milestoneCount} milestone{milestoneCount !== 1 ? "s" : ""}
            {spanLabel ? ` · captured over ${spanLabel}` : ""}
          </div>
        </div>
        <img
          src={LOGO_URL}
          alt="Signs for Sleep"
          style={{ maxWidth: 180, width: "100%", height: "auto" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>
    </div>
  );
}

function RecapEntryList({ entries }) {
  return (
    <div>
      {entries.map((entry) => {
        const tagConfig = PROGRESS_TAGS.find((t) => t.key === entry.tag) || PROGRESS_TAGS[0];
        return (
          <div key={entry.id} style={{ borderLeft: `4px solid ${tagConfig.color}`, paddingLeft: 14, marginBottom: 16, pageBreakInside: "avoid" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: tagConfig.color }}>{tagConfig.emoji} {tagConfig.label}</span>
              <span style={{ fontSize: 11, color: C.muted }}>
                {new Date(entry.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            {entry.note && <div style={{ fontSize: 14, color: C.dark, lineHeight: 1.6 }}>{entry.note}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RESOURCE LIBRARY — videos + PDFs, shared across clients with tiered access
// ═══════════════════════════════════════════════════════════════════════════

const RESOURCE_ACCESS_LEVELS = [
  { key: "all",          label: "All clients" },
  { key: "gentle_start", label: "Gentle Start only" },
  { key: "foundations",  label: "Foundations only" },
  { key: "private",      label: "Private (manual only)" },
];

function accessLabel(key) {
  return RESOURCE_ACCESS_LEVELS.find((a) => a.key === key)?.label || key;
}

// Does this resource come included automatically, based on the client's package?
function resourceIncludedByDefault(resource, clientPackage) {
  if (resource.default_access === "all") return true;
  if (resource.default_access && resource.default_access === clientPackage) return true;
  return false;
}

function groupByCategory(resources) {
  const groups = {};
  resources.forEach((r) => {
    const cat = r.category?.trim() || "General";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  });
  return groups;
}

// Converts a raw Supabase storage URL into a branded path on your own domain
// (yoursite.com/files/...) via the rewrite rule in vercel.json — the file
// still physically lives in Supabase, this just hides the address in the
// browser's address bar. Falls back to the raw URL if it doesn't match the
// expected pattern, so nothing breaks if the storage setup ever changes.
function resourceFileUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  const marker = "/storage/v1/object/public/resources/";
  const idx = rawUrl.indexOf(marker);
  if (idx === -1) return rawUrl;
  return "/files/" + rawUrl.slice(idx + marker.length);
}

// Pulls the 11-character video ID out of any common YouTube URL shape
// (watch?v=, youtu.be/, /embed/, /shorts/) so it can be dropped into an
// embed player. Returns null if the link doesn't look like YouTube.
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Renders an embedded YouTube player or a "view PDF" button, depending on
// resource type. Videos are hosted on YouTube (as Unlisted) rather than
// Supabase Storage — free tier's 50MB-per-file cap makes even short phone
// video far too tight, and YouTube handles storage/compression/bandwidth
// for free with no meaningful limit for clips this length.
//
// PDFs open via onOpenPdf (an in-app modal — see PdfViewerModal) rather than
// a plain target="_blank" link. In a phone's installed PWA, target="_blank"
// often just navigates the app's own single window instead of opening a
// real new tab, leaving no obvious way back short of the OS back-swipe. The
// modal always has a visible close button regardless of platform.
function ResourceMedia({ resource, onOpenPdf }) {
  if (resource.type === "video") {
    const videoId = extractYouTubeId(resource.file_url);
    if (!videoId) {
      return (
        <div style={{ padding: 16, background: C.cream, borderRadius: 10, color: C.danger, fontSize: 13 }}>
          This video link couldn't be read — check it's a valid YouTube URL.
        </div>
      );
    }
    return (
      <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 10, overflow: "hidden", background: "#000" }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={resource.title || "Video"}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button
      onClick={() => onOpenPdf(resource)}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "16px",
        background: C.cream, borderRadius: 10, border: "none",
        color: C.terracottaDark, fontWeight: 600, fontSize: 14,
        width: "100%", textAlign: "left", cursor: "pointer", fontFamily: font.body,
      }}
    >
      📄 View PDF
    </button>
  );
}

// Full-screen in-app PDF viewer. Exists specifically so there's always a
// visible, tappable way out — on desktop the browser's own tab/window
// controls are enough, but a phone's installed PWA has no chrome of its own,
// so without this an opened PDF can trap someone until they force-close the
// app or discover the OS back-swipe gesture.
function PdfViewerModal({ resource, onClose }) {
  useEffect(() => {
    if (!resource) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // A PDF opened this way renders at its actual page size rather than
    // fit-to-width, so on a phone it looks "zoomed in" compared to opening
    // it in a new tab. Pinching back out should fix that — but the app's own
    // viewport meta tag (set to stop double-tap-zoom on the rest of the UI)
    // blocks pinch-zoom for everything on the page, including this iframe's
    // content, since mobile Safari applies that restriction page-wide. Relax
    // it just while the PDF is open, and restore the exact previous value on
    // close so the rest of the app is unaffected.
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const prevViewportContent = viewportMeta ? viewportMeta.getAttribute("content") : null;
    if (viewportMeta) {
      viewportMeta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes");
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      if (viewportMeta && prevViewportContent !== null) {
        viewportMeta.setAttribute("content", prevViewportContent);
      }
    };
  }, [resource]);

  if (!resource) return null;
  const url = resourceFileUrl(resource.file_url);
  // Pointing the iframe straight at the PDF hands rendering to the OS's
  // built-in plugin — on iOS that plugin is much more limited inside a
  // nested iframe than when it's the top-level page: no pinch-zoom-out and
  // only the first page of multi-page files. Routing it through PDF.js's
  // viewer instead renders every page on a canvas (real web content, not a
  // native plugin), so it behaves the same everywhere and still lives inside
  // our own page — which is what lets the close button keep working.
  // Needs the raw absolute Supabase URL (not the branded /files/ path) since
  // pdf.js runs on mozilla.github.io and has to fetch it cross-origin.
  const viewerSrc = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(resource.file_url)}#zoom=page-width`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: C.white, display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 14px 10px",
        borderBottom: `1px solid ${C.border}`, background: C.white, flexShrink: 0,
      }}>
        <span style={{
          fontWeight: 700, fontSize: 14, color: C.dark,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {resource.title || "PDF"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...gStyle.btnSecondary, padding: "6px 12px", fontSize: 12,
              textDecoration: "none", display: "flex", alignItems: "center",
            }}
          >
            ⤢ Open in new tab
          </a>
          <button
            onClick={onClose}
            aria-label="Close PDF"
            style={{
              width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${C.border}`,
              background: C.white, color: C.dark, fontSize: 18, lineHeight: 1,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <iframe
        src={viewerSrc}
        title={resource.title || "PDF"}
        style={{ flex: 1, width: "100%", border: "none" }}
      />
    </div>
  );
}

// ── COACH: top-level library manager (upload once, reuse everywhere) ───────
function ResourceLibraryManager({ onBack }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [type, setType] = useState("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [defaultAccess, setDefaultAccess] = useState("private");
  const [file, setFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadResources = useCallback(async () => {
    const { data } = await supabase.from("resource_library")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setResources(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadResources(); }, [loadResources]);

  const resetForm = () => {
    setType("video"); setTitle(""); setDescription(""); setCategory("");
    setDefaultAccess("private"); setFile(null); setYoutubeUrl(""); setEditingId(null); setError("");
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setType(r.type);
    setTitle(r.title);
    setDescription(r.description || "");
    setCategory(r.category || "");
    setDefaultAccess(r.default_access);
    setFile(null);
    setYoutubeUrl(r.type === "video" ? (r.file_url || "") : "");
    setError("");
    setShowForm(true);
  };

  const uploadFile = async (f) => {
    const ext = f.name.split(".").pop();
    const path = `${type}s/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("resources")
      .upload(path, f, { cacheControl: "3600", upsert: false });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("resources").getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async () => {
    if (!title.trim()) { setError("Give it a title first."); return; }

    let fileUrl = null;

    if (type === "video") {
      const trimmedUrl = youtubeUrl.trim();
      if (!trimmedUrl && !editingId) { setError("Paste the YouTube link."); return; }
      if (trimmedUrl) {
        if (!extractYouTubeId(trimmedUrl)) {
          setError("Couldn't read a video ID from that link — check it's a full YouTube URL.");
          return;
        }
        fileUrl = trimmedUrl;
      }
    } else {
      if (!editingId && !file) { setError("Choose a PDF to upload."); return; }
    }

    setUploading(true);
    setError("");
    try {
      if (type === "pdf" && file) fileUrl = await uploadFile(file);

      if (editingId) {
        const payload = {
          type, title: title.trim(), description: description.trim() || null,
          category: category.trim() || null, default_access: defaultAccess,
        };
        if (fileUrl) payload.file_url = fileUrl;
        await supabase.from("resource_library").update(payload).eq("id", editingId);
      } else {
        await supabase.from("resource_library").insert({
          type, title: title.trim(), description: description.trim() || null,
          category: category.trim() || null, default_access: defaultAccess,
          file_url: fileUrl, sort_order: resources.length,
        });
      }
      resetForm();
      setShowForm(false);
      loadResources();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setUploading(false);
  };

  const deleteResource = async (id) => {
    await supabase.from("resource_library").delete().eq("id", id);
    loadResources();
  };

  if (loading) return <p style={{ color: C.muted, padding: 40 }}>Loading resource library…</p>;

  const grouped = groupByCategory(resources);
  const categories = Object.keys(grouped).sort();

  return (
    <div>
      <button onClick={onBack} style={{ ...gStyle.btnSecondary, marginBottom: 20 }}>← Back</button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: font.display, fontSize: 26, color: C.terracotta, margin: "0 0 4px" }}>Resource Library</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Videos and guides you can share across all your clients</p>
        </div>
        <button style={{ ...gStyle.btnPrimary, width: "auto" }} onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Resource
        </button>
      </div>

      {showForm && (
        <div style={{ ...gStyle.card, borderColor: C.terracotta, marginBottom: 24 }}>
          <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 16px" }}>
            {editingId ? "Edit Resource" : "New Resource"}
          </h3>

          <div style={{ marginBottom: 14 }}>
            <label style={gStyle.label}>Type</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ key: "video", label: "🎬 Video" }, { key: "pdf", label: "📄 PDF" }].map((t) => (
                <button key={t.key} onClick={() => !editingId && setType(t.key)} style={{
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  cursor: editingId ? "default" : "pointer", fontFamily: font.body, fontSize: 13, fontWeight: 600,
                  background: type === t.key ? C.terracotta : C.terracottaLight,
                  color: type === t.key ? C.white : C.terracottaDark,
                  opacity: editingId && type !== t.key ? 0.5 : 1,
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={gStyle.label}>Title</label>
              <input style={gStyle.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sign for 'sleep'" />
            </div>
            <div>
              <label style={gStyle.label}>Category (for grouping)</label>
              <input style={gStyle.input} list="resource-categories" value={category}
                onChange={(e) => setCategory(e.target.value)} placeholder="e.g. First Signs" />
              <datalist id="resource-categories">
                {[...new Set(resources.map((r) => r.category).filter(Boolean))].map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={gStyle.label}>Description</label>
            <textarea style={{ ...gStyle.input, minHeight: 60, resize: "vertical" }} value={description}
              onChange={(e) => setDescription(e.target.value)} placeholder="A short line explaining what this is…" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={gStyle.label}>Who gets this automatically?</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {RESOURCE_ACCESS_LEVELS.map((a) => (
                <button key={a.key} onClick={() => setDefaultAccess(a.key)} style={{
                  padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontFamily: font.body, fontSize: 13, fontWeight: 600,
                  background: defaultAccess === a.key ? C.terracotta : C.terracottaLight,
                  color: defaultAccess === a.key ? C.white : C.terracottaDark,
                }}>
                  {a.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
              "Private" means it's hidden until you grant it to specific clients from their profile's Resources tab.
            </p>
          </div>

          {type === "video" ? (
            <div style={{ marginBottom: 14 }}>
              <label style={gStyle.label}>YouTube link</label>
              <input
                style={gStyle.input}
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
              />
              <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                Upload the clip to YouTube as "Unlisted" first, then paste the link here. Unlisted keeps it off your channel and search — only people with the link (or this embedded player) can see it.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: 14 }}>
              <label style={gStyle.label}>{editingId ? "Replace file (optional)" : "File"}</label>
              <input type="file" accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {editingId && <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Leave empty to keep the existing file.</p>}
            </div>
          )}

          {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...gStyle.btnPrimary, width: "auto" }} onClick={save} disabled={uploading}>
              {uploading ? "Uploading…" : editingId ? "Save changes" : "Add to library"}
            </button>
            <button style={gStyle.btnSecondary} onClick={() => { resetForm(); setShowForm(false); }}>Cancel</button>
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <div style={{ ...gStyle.card, textAlign: "center", padding: 48, color: C.muted }}>
          Nothing in your library yet — click "+ Add Resource" to upload your first video or guide.
        </div>
      ) : (
        categories.map((cat) => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <h3 style={{ fontFamily: font.display, color: C.terracottaDark, fontSize: 16, margin: "0 0 12px" }}>{cat}</h3>
            {grouped[cat].map((r) => (
              <div key={r.id} style={{ ...gStyle.card, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{r.type === "video" ? "🎬" : "📄"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>{r.title}</span>
                    <span style={gStyle.tag(C.terracottaDark, C.terracottaLight)}>{accessLabel(r.default_access)}</span>
                  </div>
                  {r.description && <p style={{ fontSize: 13, color: C.mid, margin: "0 0 8px" }}>{r.description}</p>}
                  <a href={resourceFileUrl(r.file_url)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.blue }}>
                    View file →
                  </a>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button style={{ ...gStyle.btnSecondary, padding: "6px 12px", fontSize: 12 }} onClick={() => startEdit(r)}>Edit</button>
                  <button style={{ ...gStyle.btnDanger, padding: "6px 12px", fontSize: 12 }} onClick={() => deleteResource(r.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

// ── COACH: per-client Resources tab — see what's included, grant/revoke extras ──
function ClientResourceGrants({ clientId, clientData }) {
  const [resources, setResources] = useState([]);
  const [grantedIds, setGrantedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const clientPackage = clientData?.package || null;

  const load = useCallback(async () => {
    setLoading(true);
    const { data: allResources } = await supabase.from("resource_library")
      .select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    const { data: grants } = await supabase.from("client_resource_grants")
      .select("resource_id").eq("client_id", clientId);
    setResources(allResources || []);
    setGrantedIds(new Set((grants || []).map((g) => g.resource_id)));
    setLoading(false);
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const toggleGrant = async (resourceId, currentlyGranted) => {
    setBusyId(resourceId);
    if (currentlyGranted) {
      await supabase.from("client_resource_grants").delete()
        .eq("client_id", clientId).eq("resource_id", resourceId);
    } else {
      await supabase.from("client_resource_grants").insert({ client_id: clientId, resource_id: resourceId });
    }
    await load();
    setBusyId(null);
  };

  if (loading) return <p style={{ color: C.muted, padding: 40 }}>Loading resources…</p>;

  if (resources.length === 0) return (
    <div style={{ ...gStyle.card, textAlign: "center", padding: 48, color: C.muted }}>
      Your resource library is empty — add videos or guides from the 📚 Resources button up top first.
    </div>
  );

  const included = resources.filter((r) => resourceIncludedByDefault(r, clientPackage));
  const grantedExtras = resources.filter((r) => !resourceIncludedByDefault(r, clientPackage) && grantedIds.has(r.id));
  const browsable = resources.filter((r) => !resourceIncludedByDefault(r, clientPackage));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: font.display, color: C.terracotta, margin: "0 0 4px" }}>Included automatically</h3>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 12px" }}>
          {clientPackage
            ? `Based on their ${PACKAGES[clientPackage]?.label || clientPackage} package, plus anything marked "All clients."`
            : `This client has no package set — only "All clients" resources show here.`}
        </p>
        {included.length === 0 ? (
          <p style={{ fontSize: 13, color: C.muted }}>Nothing included automatically yet.</p>
        ) : (
          included.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 18 }}>{r.type === "video" ? "🎬" : "📄"}</span>
              <span style={{ fontSize: 14, color: C.dark, flex: 1 }}>{r.title}</span>
              <span style={gStyle.tag(C.success, C.successLight)}>Included</span>
            </div>
          ))
        )}
      </div>

      {grantedExtras.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: font.display, color: C.gold, margin: "0 0 12px" }}>Extra access granted</h3>
          {grantedExtras.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 18 }}>{r.type === "video" ? "🎬" : "📄"}</span>
              <span style={{ fontSize: 14, color: C.dark, flex: 1 }}>{r.title}</span>
              <button
                style={{ ...gStyle.btnSecondary, padding: "5px 12px", fontSize: 12 }}
                onClick={() => toggleGrant(r.id, true)}
                disabled={busyId === r.id}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 style={{ fontFamily: font.display, color: C.dark, margin: "0 0 4px" }}>Browse full library</h3>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 12px" }}>
          Toggle anything extra you'd like to give this client, regardless of their package.
        </p>
        {browsable.length === 0 ? (
          <p style={{ fontSize: 13, color: C.muted }}>Everything in your library is already included for this client.</p>
        ) : (
          browsable.map((r) => {
            const granted = grantedIds.has(r.id);
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 18 }}>{r.type === "video" ? "🎬" : "📄"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: C.dark }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{accessLabel(r.default_access)}</div>
                </div>
                <button
                  onClick={() => toggleGrant(r.id, granted)}
                  disabled={busyId === r.id}
                  style={{
                    padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                    fontFamily: font.body, fontSize: 12, fontWeight: 600,
                    background: granted ? C.success : C.terracottaLight,
                    color: granted ? C.white : C.terracottaDark,
                  }}
                >
                  {granted ? "✓ Granted" : "Grant"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── CLIENT: read-only viewer, grouped by category ───────────────────────────
function ClientResourcesViewer({ clientId }) {
  const [resources, setResources] = useState([]);
  const [clientPackage, setClientPackage] = useState(null);
  const [grantedIds, setGrantedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [viewingPdf, setViewingPdf] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: clientRow } = await supabase.from("clients").select("package").eq("id", clientId).maybeSingle();
      setClientPackage(clientRow?.package || null);

      const { data: allResources } = await supabase.from("resource_library")
        .select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      setResources(allResources || []);

      const { data: grants } = await supabase.from("client_resource_grants")
        .select("resource_id").eq("client_id", clientId);
      setGrantedIds(new Set((grants || []).map((g) => g.resource_id)));

      setLoading(false);
    };
    load();
  }, [clientId]);

  if (loading) return <p style={{ color: C.muted, padding: 40 }}>Loading resources…</p>;

  const accessible = resources.filter((r) => resourceIncludedByDefault(r, clientPackage) || grantedIds.has(r.id));

  if (accessible.length === 0) return (
    <div style={{ ...gStyle.card, textAlign: "center", padding: 48, color: C.muted }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
      <p style={{ fontSize: 16, marginBottom: 8 }}>No resources available yet.</p>
      <p style={{ fontSize: 13 }}>Your consultant will add videos and guides here as they become relevant.</p>
    </div>
  );

  const grouped = groupByCategory(accessible);
  const categories = Object.keys(grouped).sort();

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <h3 style={{ fontFamily: font.display, color: C.terracotta, fontSize: 18, margin: "0 0 14px" }}>{cat}</h3>
          <div className="resource-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {grouped[cat].map((r) => (
              <div key={r.id} style={gStyle.card}>
                <ResourceMedia resource={r} onOpenPdf={setViewingPdf} />
                <div style={{ fontWeight: 700, fontSize: 14, color: C.dark, margin: "10px 0 2px" }}>{r.title}</div>
                {r.description && <div style={{ fontSize: 12, color: C.mid }}>{r.description}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <style>{`
        @media screen and (max-width: 640px) {
          .resource-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <PdfViewerModal resource={viewingPdf} onClose={() => setViewingPdf(null)} />
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
