import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_V1_API_KEY as string
);

interface SendEmailToAdminParams {
  subject: string;
  htmlContent: string;
}

export const sendEmailToAdmin = async ({
  subject,
  htmlContent,
}: SendEmailToAdminParams): Promise<brevo.CreateSmtpEmail> => {
  const emailParams: brevo.SendSmtpEmail = {
    sender: {
      name: "Arabic Juniors Notifications",
      email: process.env.BREVO_VERIFIED_SENDER_EMAIL as string, // must be a verified sender
    },
    to: [
      {
        email: "imran.gauri@gmail.com",
        name: "Admin",
      },
      {
        email: "rafat@arabicjuniors.com",
        name: "Admin",
      },
    ],
    bcc: [
      {
        email: 'dvinothkumar63@gmail.com',
        name: 'Admin'
      }
    ],
    subject,
    htmlContent,
  };

  try {
    const response = await apiInstance.sendTransacEmail(emailParams);
    console.log("Email sent to admin:", response.body);
    return response.body as brevo.CreateSmtpEmail;
  } catch (error: unknown) {
    if (error instanceof brevo.HttpError) {
      console.error("Brevo API error (non-blocking):", error.response);
    } else {
      console.error("Unexpected error sending email (non-blocking):", error);
    }
    // Return empty fallback instead of rethrowing to prevent 500 crashes on submit
    return {} as brevo.CreateSmtpEmail;
  }
};
