import type { Request } from "express";

export interface IPWhoIsResponse {
  ip: string;
  success: boolean;
  type?: string;
  continent?: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

/**
 * Gets location data from ipwho.is based on client's IP address
 */
export async function getClientLocation(
  req: Request
): Promise<IPWhoIsResponse> {
  const rawIP =
  req.headers["cf-connecting-ip"]?.toString() ||
  req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
  req.socket?.remoteAddress ||
  "";

  const ip = rawIP === "::1" || rawIP === "127.0.0.1" ? "" : rawIP;

  try {
    const response = await fetch(`https://ipwho.is/${ip}`);
    const data: IPWhoIsResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch IP info");
    }

    return data;
  } catch (err: any) {
    return {
      ip,
      success: false,
      message: err.message || "Unknown error",
    } as IPWhoIsResponse;
  }
}
