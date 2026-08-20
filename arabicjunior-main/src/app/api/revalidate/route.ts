import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Clears the cached marketing pages so an admin edit shows up immediately
 * instead of at the next ten-minute regeneration.
 *
 * Those pages are statically generated on purpose — making them dynamic would
 * put an API call in front of every visitor, which on a sleeping free-tier
 * instance is a very slow first paint. This is the escape hatch: the admin
 * screens call it after a successful save.
 *
 * Access is gated on the caller's admin token. A shared secret would have to be
 * NEXT_PUBLIC_ to reach the browser, which is not a secret at all; instead the
 * token is handed to the API, and the purge only runs if the API accepts it.
 * Without this an anonymous caller could drop the cache in a loop and force a
 * regeneration on every request.
 */

/**
 * Every statically generated page that reads from the API. A page missing here
 * keeps serving its cached copy after a save, so the admin sees "updated" while
 * the live page does not change for up to ten minutes.
 */
const PATHS = [
  "/",
  "/our-teachers",
  "/about-us",
  "/pricing",
  "/careers",
  // Reads the contact details and the SEO section below the form.
  "/contact-us",
  // Renders the same FAQ and testimonial sections as the homepage.
  "/welcome",
];

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, message: "No token" }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { success: false, message: "API base URL is not configured" },
      { status: 500 }
    );
  }

  try {
    // Any admin-only endpoint works as the check; this one is cheap.
    const check = await fetch(`${base}/admin/teachers?limit=1`, {
      headers: { Authorization: authHeader },
      cache: "no-store",
    });

    if (!check.ok) {
      return NextResponse.json(
        { success: false, message: "Not authorised" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error("Could not verify the admin token before revalidating:", err);
    return NextResponse.json(
      { success: false, message: "Could not reach the API" },
      { status: 502 }
    );
  }

  for (const path of PATHS) {
    revalidatePath(path);
  }

  return NextResponse.json({ success: true, revalidated: PATHS });
}
