/**
 * Escape a user-supplied string so it matches literally inside a RegExp.
 *
 * Search boxes fed straight into `new RegExp(input, "i")` let a visitor supply
 * a pattern rather than a term. Two consequences:
 *   - `(a+)+$` and friends backtrack catastrophically, pinning the event loop
 *   - `.` or `.*` quietly match far more rows than the user asked for
 */
export const escapeRegex = (input: string): string =>
  input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Build a case-insensitive "contains" matcher from untrusted input. */
export const containsRegex = (input: string): RegExp =>
  new RegExp(escapeRegex(input), "i");
