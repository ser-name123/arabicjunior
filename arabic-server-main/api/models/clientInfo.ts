import { Schema } from "mongoose";

/**
 * Context about the person who filled in a form: what they used, where they
 * were, and what time it was for them.
 *
 * Kept as its own schema so the trial form, the student form and anything added
 * later all record the same shape.
 *
 * Half of it comes from the browser and is therefore self-reported — a user
 * agent can be changed, a timezone can be spoofed. The IP-derived half is
 * harder to fake but only ever approximate, and on a VPN it describes the
 * server, not the person. Treat all of it as a strong hint, never as proof.
 */
export interface ClientInfo {
  // --- from the browser -----------------------------------------------
  userAgent: string;
  browser: string;
  operatingSystem: string;
  deviceType: string;
  timezone: string;
  gmtOffset: string;
  localTime: string;
  language: string;
  languages: string;
  screenSize: string;
  viewportSize: string;
  pixelRatio: string;
  colorDepth: string;
  cpuCores: string;
  deviceMemory: string;
  touchSupport: string;
  connectionType: string;
  referrer: string;
  pageUrl: string;

  // --- resolved on the server from the request --------------------------
  ipAddress: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  postalCode: string;
  ipTimezone: string;
  isp: string;
  /** Set when the IP lookup failed, so a blank city is not read as "no data". */
  lookupError: string;
}

export const clientInfoSchema = new Schema<ClientInfo>(
  {
    userAgent: { type: String, default: "" },
    browser: { type: String, default: "" },
    operatingSystem: { type: String, default: "" },
    deviceType: { type: String, default: "" },
    timezone: { type: String, default: "" },
    gmtOffset: { type: String, default: "" },
    localTime: { type: String, default: "" },
    language: { type: String, default: "" },
    languages: { type: String, default: "" },
    screenSize: { type: String, default: "" },
    viewportSize: { type: String, default: "" },
    pixelRatio: { type: String, default: "" },
    colorDepth: { type: String, default: "" },
    cpuCores: { type: String, default: "" },
    deviceMemory: { type: String, default: "" },
    touchSupport: { type: String, default: "" },
    connectionType: { type: String, default: "" },
    referrer: { type: String, default: "" },
    pageUrl: { type: String, default: "" },

    ipAddress: { type: String, default: "" },
    country: { type: String, default: "" },
    countryCode: { type: String, default: "" },
    region: { type: String, default: "" },
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    ipTimezone: { type: String, default: "" },
    isp: { type: String, default: "" },
    lookupError: { type: String, default: "" },
  },
  { _id: false }
);

export default clientInfoSchema;
