import type { Request } from "express";
import { getClientLocation } from "./getClientLocation";
import type { ClientInfo } from "../models/clientInfo";

/**
 * Merges what the browser reported with what the server can work out from the
 * request, into the single record stored against a submission.
 *
 * The IP is read here rather than trusted from the body: a client can put
 * anything in a JSON field, but it cannot choose the address its packets
 * arrive from.
 */

const asString = (value: unknown): string =>
  typeof value === "string" ? value.slice(0, 600) : value == null ? "" : String(value).slice(0, 600);

/**
 * The address the request actually came from.
 *
 * Cloudflare sits in front of this site, so cf-connecting-ip is the reliable
 * one; x-forwarded-for is the fallback for any other proxy. Both are headers
 * and so forgeable in principle — only trustworthy because the proxy in front
 * overwrites them.
 */
export const getClientIp = (req: Request): string => {
  const raw =
    req.headers["cf-connecting-ip"]?.toString() ||
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "";

  // ::ffff:1.2.3.4 is an IPv4 address wearing an IPv6 hat.
  return raw.replace(/^::ffff:/, "");
};

export const buildClientInfo = async (req: Request): Promise<ClientInfo> => {
  const reported = (req.body?.clientContext ?? {}) as Record<string, unknown>;

  const info: ClientInfo = {
    userAgent: asString(reported.userAgent) || asString(req.headers["user-agent"]),
    browser: asString(reported.browser),
    operatingSystem: asString(reported.operatingSystem),
    deviceType: asString(reported.deviceType),
    timezone: asString(reported.timezone),
    gmtOffset: asString(reported.gmtOffset),
    localTime: asString(reported.localTime),
    language: asString(reported.language) || asString(req.headers["accept-language"]),
    languages: asString(reported.languages),
    screenSize: asString(reported.screenSize),
    viewportSize: asString(reported.viewportSize),
    pixelRatio: asString(reported.pixelRatio),
    colorDepth: asString(reported.colorDepth),
    cpuCores: asString(reported.cpuCores),
    deviceMemory: asString(reported.deviceMemory),
    touchSupport: asString(reported.touchSupport),
    connectionType: asString(reported.connectionType),
    referrer: asString(reported.referrer) || asString(req.headers["referer"]),
    pageUrl: asString(reported.pageUrl),

    ipAddress: getClientIp(req),
    country: "",
    countryCode: "",
    region: "",
    city: "",
    postalCode: "",
    ipTimezone: "",
    isp: "",
    lookupError: "",
  };

  try {
    const location = await getClientLocation(req);

    if (location?.success) {
      info.country = asString(location.country);
      info.countryCode = asString(location.country_code);
      info.region = asString(location.region);
      info.city = asString(location.city);
      info.postalCode = asString(location.postal);
      info.ipTimezone = asString(location.timezone?.id ?? location.timezone);
      info.isp = asString(location.connection?.isp ?? location.connection?.org);
      if (location.ip) info.ipAddress = asString(location.ip);
    } else {
      // Recorded rather than swallowed, so a blank city in the admin screen is
      // distinguishable from "we looked and there was nothing there".
      info.lookupError = asString(location?.message) || "IP lookup failed";
    }
  } catch (error: any) {
    info.lookupError = asString(error?.message) || "IP lookup failed";
  }

  return info;
};

export default buildClientInfo;
