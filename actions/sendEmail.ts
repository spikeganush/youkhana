"use server";

import { createElement } from "react";
import { Resend } from "resend";
import { validateString, getErrorMessage } from "@/lib/utils";
import ContactFormEmail from "@/email/contact-form-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (formData: FormData) => {
  const senderEmail = formData.get("senderEmail");
  const message = formData.get("message");

  // simple server-side validation
  if (!validateString(senderEmail, 500)) {
    return {
      error: "Invalid sender email",
    };
  }
  if (!validateString(message, 5000)) {
    return {
      error: "Invalid message",
    };
  }

  let data;
  try {
    data = await resend.emails.send({
      from: "Youkhana Contact Form <contact@callmespike.me>",
      to: "yyyoukhanaa@gmail.com",
      subject: "Message from Youkhana website contact form",
      reply_to: senderEmail,
      react: createElement(ContactFormEmail, {
        message: message,
        senderEmail: senderEmail,
      }),
    });
  } catch (error: unknown) {
    return {
      error: getErrorMessage(error),
    };
  }

  return {
    data,
  };
};

export const sendVerificationEmail = async ({
  identifier,
  url,
}: {
  identifier: string;
  url: string;
}) => {
  try {
    const data = await resend.emails.send({
      from: "Youkhana Admin <noreply@callmespike.me>",
      to: identifier,
      subject: "Sign in to Youkhana",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Sign in to Youkhana</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">Click the button below to sign in to your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">Sign In</a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">Or copy and paste this URL into your browser:</p>
              <p style="font-size: 12px; color: #667eea; word-break: break-all; background: white; padding: 10px; border-radius: 5px; border: 1px solid #e0e0e0;">${url}</p>
              <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">If you didn't request this email, you can safely ignore it.</p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error sending verification email:", error);
    throw new Error(getErrorMessage(error));
  }
};
