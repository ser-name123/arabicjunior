/**
 * Proves the mail credentials work, and optionally sends one real message.
 *
 *   pnpm email:check                  — authenticate only, send nothing
 *   pnpm email:check you@example.com  — authenticate, then send a test mail
 *
 * Worth running after any change to the Brevo variables. The senders in the app
 * swallow failures on purpose so a customer's registration never dies over an
 * email, which means a bad key otherwise shows up only as mail that quietly
 * never arrives.
 */
import "dotenv/config";
import { verifyTransport, deliver } from "../api/utils/mailer";

const main = async () => {
  const recipient = process.argv[2];

  console.log("Sender:", process.env.BREVO_VERIFIED_SENDER_EMAIL || "(not set)");

  const result = await verifyTransport();
  console.log(`Transport: ${result.transport}`);

  if (!result.ok) {
    console.error(`FAILED: ${result.detail}`);
    process.exit(1);
  }
  console.log(`OK: ${result.detail}`);

  if (!recipient) {
    console.log("\nNo recipient given, so nothing was sent.");
    console.log("To send a real test:  pnpm email:check you@example.com");
    return;
  }

  console.log(`\nSending a test message to ${recipient} ...`);
  const sent = await deliver({
    senderName: "Arabic Juniors",
    to: [{ email: recipient, name: "Test" }],
    subject: "Arabic Juniors — mail test",
    htmlContent:
      "<p>If you are reading this, transactional email is working.</p>" +
      `<p>Sent over the <strong>${result.transport}</strong> transport.</p>`,
  });

  if (sent.messageId) {
    console.log(`Sent. Message id: ${sent.messageId}`);
    console.log("Check the inbox, and the spam folder — a new sending domain often lands there first.");
  } else {
    console.error("The send returned no message id. Look at the error logged above.");
    process.exit(1);
  }
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
