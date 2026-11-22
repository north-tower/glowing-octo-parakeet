import "../../scripts/load-project-env";

/** Force dev Mailgun path (console log) so tests can read OTP without API calls. */
process.env.MAILGUN_API_KEY = "";
if (process.env.NODE_ENV === "production") {
  (process.env as { NODE_ENV?: string }).NODE_ENV = "test";
}