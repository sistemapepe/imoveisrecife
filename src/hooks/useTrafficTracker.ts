import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

function getVisitorId(): string {
  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
}

function parseReferrer(ref: string): { source: string; medium: string; channel: string; social_network: string; referrer_domain: string } {
  if (!ref) return { source: "direct", medium: "direct", channel: "Direto", social_network: "", referrer_domain: "" };

  let domain = "";
  try { domain = new URL(ref).hostname.replace("www.", ""); } catch { return { source: "direct", medium: "direct", channel: "Direto", social_network: "", referrer_domain: "" }; }

  // Social networks
  const socials: Record<string, string> = {
    "instagram.com": "Instagram", "l.instagram.com": "Instagram",
    "facebook.com": "Facebook", "l.facebook.com": "Facebook", "m.facebook.com": "Facebook", "lm.facebook.com": "Facebook",
    "youtube.com": "YouTube", "m.youtube.com": "YouTube",
    "linkedin.com": "LinkedIn", "lnkd.in": "LinkedIn",
    "twitter.com": "Twitter", "x.com": "Twitter", "t.co": "Twitter",
    "tiktok.com": "TikTok", "vm.tiktok.com": "TikTok",
    "pinterest.com": "Pinterest",
    "reddit.com": "Reddit",
    "wa.me": "WhatsApp", "web.whatsapp.com": "WhatsApp", "api.whatsapp.com": "WhatsApp",
    "t.me": "Telegram", "telegram.org": "Telegram",
  };

  for (const [d, name] of Object.entries(socials)) {
    if (domain === d || domain.endsWith("." + d)) {
      return { source: name.toLowerCase(), medium: "social", channel: "Redes Sociais", social_network: name, referrer_domain: domain };
    }
  }

  // Search engines
  const searchEngines = ["google", "bing", "yahoo", "duckduckgo", "baidu", "yandex", "ecosia"];
  for (const se of searchEngines) {
    if (domain.includes(se)) {
      return { source: se, medium: "organic", channel: "Busca Orgânica", social_network: "", referrer_domain: domain };
    }
  }

  // Other referral
  return { source: domain, medium: "referral", channel: "Referência", social_network: "", referrer_domain: domain };
}

function getUTMParams(): { campaign: string; term: string; content: string; source?: string; medium?: string } {
  const params = new URLSearchParams(window.location.search);
  const result: any = {
    campaign: params.get("utm_campaign") || "",
    term: params.get("utm_term") || "",
    content: params.get("utm_content") || "",
  };
  if (params.get("utm_source")) result.source = params.get("utm_source");
  if (params.get("utm_medium")) result.medium = params.get("utm_medium");
  return result;
}

export function trackEvent(eventType: string, propertyId?: string) {
  const ref = document.referrer;
  const parsed = parseReferrer(ref);
  const utm = getUTMParams();

  // UTM overrides referrer-based source/medium
  const source = utm.source || parsed.source;
  const medium = utm.medium || parsed.medium;

  let channel = parsed.channel;
  if (utm.source || utm.medium) {
    if (medium === "cpc" || medium === "ppc") channel = "Mídia Paga";
    else if (medium === "email") channel = "E-mail";
    else if (medium === "social") channel = "Redes Sociais";
    else if (utm.source) channel = "Campanhas";
  }

  const event = {
    pathname: window.location.pathname.slice(0, 500),
    full_url: window.location.href.slice(0, 2000),
    referrer_url: ref.slice(0, 2000),
    referrer_domain: parsed.referrer_domain.slice(0, 255),
    source: source.slice(0, 100),
    medium: medium.slice(0, 100),
    channel: channel.slice(0, 100),
    social_network: parsed.social_network.slice(0, 100),
    campaign: (utm.campaign || "").slice(0, 255),
    term: (utm.term || "").slice(0, 255),
    content: (utm.content || "").slice(0, 255),
    landing_page: (sessionStorage.getItem("landing_page") || window.location.pathname).slice(0, 500),
    device_type: getDeviceType().slice(0, 50),
    browser: getBrowser().slice(0, 100),
    os: getOS().slice(0, 100),
    language: (navigator.language || "").slice(0, 50),
    country: "",
    session_id: getSessionId().slice(0, 255),
    visitor_id: getVisitorId().slice(0, 255),
    event_type: eventType,
    property_id: propertyId || null,
  };

  supabase.from("traffic_events").insert(event).then(({ error }) => {
    if (error) {
      logger.error("Failed to track traffic event", { eventType }, error as unknown as Error);
    }
  });
}

export function useTrafficTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    // Store landing page on first visit
    if (!sessionStorage.getItem("landing_page")) {
      sessionStorage.setItem("landing_page", window.location.pathname);
    }

    if (!tracked.current) {
      tracked.current = true;
      trackEvent("page_view");
    }
  }, []);
}
