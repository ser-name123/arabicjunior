import * as brevo from '@getbrevo/brevo';
import { SendEmailParams } from '../types';

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_V1_API_KEY as string
);

export const sendEmail = async ({
  toEmail,
  toName,
  subject,
  htmlContent,
}: SendEmailParams): Promise<brevo.CreateSmtpEmail> => {
  const emailParams: brevo.SendSmtpEmail = {
    sender: {
      name: 'Arabic Juniors',
      email: process.env.BREVO_VERIFIED_SENDER_EMAIL as string, // must be a verified sender
    },
    to: [
      {
        email: toEmail,
        name: toName,
      },
    ],
    subject,
    htmlContent,
  };

  try {
    const response = await apiInstance.sendTransacEmail(emailParams);
    console.log('Email sent:', response.body);
    return response.body as brevo.CreateSmtpEmail;
  } catch (error: unknown) {
    if (error instanceof brevo.HttpError) {
      console.error('Brevo API error:', error.response);
    } else {
      console.error('Unexpected error sending email:', error);
    }
    throw error;
  }
};
