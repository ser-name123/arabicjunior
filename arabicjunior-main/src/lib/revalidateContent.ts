/**
 * Asks the site to drop its cached marketing pages after an admin save, so the
 * change is live straight away rather than at the next scheduled regeneration.
 *
 * Deliberately never throws: the record is already saved by the time this runs,
 * and a failed cache purge only means the edit appears a few minutes later. It
 * must not turn a successful save into an error message.
 */
export async function revalidateContent(token: string | null | undefined) {
  if (!token) return;

  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Could not refresh the public pages:", err);
  }
}
