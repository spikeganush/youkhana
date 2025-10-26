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

export const sendInvitationEmail = async ({
  email,
  invitationUrl,
  role,
  expiryDays = "7",
}: {
  email: string;
  invitationUrl: string;
  role: string;
  expiryDays?: string;
}) => {
  try {
    const data = await resend.emails.send({
      from: "Youkhana Admin <noreply@callmespike.me>",
      to: email,
      subject: "You're Invited to Youkhana Admin",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                You've been invited to join the Youkhana admin space as a <strong>${role}</strong>.
              </p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                Click the button below to accept your invitation and create your account.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">Accept Invitation</a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">Or copy and paste this URL into your browser:</p>
              <p style="font-size: 12px; color: #667eea; word-break: break-all; background: white; padding: 10px; border-radius: 5px; border: 1px solid #e0e0e0;">${invitationUrl}</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 12px; color: #999; margin: 5px 0;">
                  This invitation will expire in ${expiryDays} days.
                </p>
                <p style="font-size: 12px; color: #999; margin: 5px 0;">
                  If you didn't expect this invitation, you can safely ignore this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error sending invitation email:", error);
    throw new Error(getErrorMessage(error));
  }
};

export const sendRentalInquiryEmail = async ({
  customerName,
  customerEmail,
  customerPhone,
  productTitle,
  productHandle,
  selectedVariant,
  startDate,
  endDate,
  rentalDays,
  message,
  dailyRate,
  weeklyRate,
  monthlyRate,
  deposit,
  estimatedTotal,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productTitle: string;
  productHandle: string;
  selectedVariant?: {
    title: string;
    options: { name: string; value: string }[];
  };
  startDate?: string;
  endDate?: string;
  rentalDays?: number;
  message?: string;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  deposit?: number;
  estimatedTotal?: number;
}) => {
  try {
    const productUrl = `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://youkhana.com"
    }/product/${productHandle}`;

    // Format dates if provided
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return "Not specified";
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const data = await resend.emails.send({
      from: "Youkhana Rentals <rentals@callmespike.me>",
      to: "florian.jourdain@gmail.com", // Testing email
      reply_to: customerEmail,
      subject: `New Rental Inquiry: ${productTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">New Rental Inquiry</h1>
              </div>

              <div style="padding: 30px;">
                <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">${productTitle}</h2>

                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; font-size: 16px; color: #333;">Customer Information</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Name:</strong></td>
                      <td style="padding: 8px 0; color: #333;">${customerName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                      <td style="padding: 8px 0; color: #333;"><a href="mailto:${customerEmail}" style="color: #667eea; text-decoration: none;">${customerEmail}</a></td>
                    </tr>
                    ${
                      customerPhone
                        ? `
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                      <td style="padding: 8px 0; color: #333;"><a href="tel:${customerPhone}" style="color: #667eea; text-decoration: none;">${customerPhone}</a></td>
                    </tr>
                    `
                        : ""
                    }
                  </table>
                </div>

                ${
                  selectedVariant
                    ? `
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; font-size: 16px; color: #333;">Selected Options</h3>
                  <p style="margin: 0; color: #666;"><strong>Variant:</strong> ${
                    selectedVariant.title
                  }</p>
                  ${selectedVariant.options
                    .map(
                      (opt) => `
                    <p style="margin: 5px 0; color: #666;"><strong>${opt.name}:</strong> ${opt.value}</p>
                  `
                    )
                    .join("")}
                </div>
                `
                    : ""
                }

                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; font-size: 16px; color: #333;">Rental Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Start Date:</strong></td>
                      <td style="padding: 8px 0; color: #333;">${formatDate(
                        startDate
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>End Date:</strong></td>
                      <td style="padding: 8px 0; color: #333;">${formatDate(
                        endDate
                      )}</td>
                    </tr>
                    ${
                      rentalDays
                        ? `
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Duration:</strong></td>
                      <td style="padding: 8px 0; color: #333;">${rentalDays} day${
                            rentalDays !== 1 ? "s" : ""
                          }</td>
                    </tr>
                    `
                        : ""
                    }
                  </table>
                </div>

                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; font-size: 16px; color: #333;">Pricing</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #666; width: 150px;"><strong>Daily Rate:</strong></td>
                      <td style="padding: 8px 0; color: #333;">$${dailyRate.toFixed(
                        2
                      )}/day</td>
                    </tr>
                    ${
                      weeklyRate
                        ? `
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Weekly Rate:</strong></td>
                      <td style="padding: 8px 0; color: #333;">$${weeklyRate.toFixed(
                        2
                      )}/week</td>
                    </tr>
                    `
                        : ""
                    }
                    ${
                      monthlyRate
                        ? `
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Monthly Rate:</strong></td>
                      <td style="padding: 8px 0; color: #333;">$${monthlyRate.toFixed(
                        2
                      )}/month</td>
                    </tr>
                    `
                        : ""
                    }
                    ${
                      deposit
                        ? `
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Security Deposit:</strong></td>
                      <td style="padding: 8px 0; color: #333;">$${deposit.toFixed(
                        2
                      )}</td>
                    </tr>
                    `
                        : ""
                    }
                    ${
                      estimatedTotal
                        ? `
                    <tr style="border-top: 2px solid #667eea;">
                      <td style="padding: 12px 0 8px 0; color: #333;"><strong>Estimated Total:</strong></td>
                      <td style="padding: 12px 0 8px 0; color: #667eea; font-size: 18px; font-weight: bold;">$${estimatedTotal.toFixed(
                        2
                      )}</td>
                    </tr>
                    `
                        : ""
                    }
                  </table>
                </div>

                ${
                  message
                    ? `
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; font-size: 16px; color: #333;">Customer Message</h3>
                  <p style="margin: 0; color: #666; white-space: pre-wrap;">${message}</p>
                </div>
                `
                    : ""
                }

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${productUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;">View Product</a>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                  <p style="font-size: 12px; color: #999; margin: 5px 0;">
                    This is an automated notification from your Youkhana rental system.
                  </p>
                  <p style="font-size: 12px; color: #999; margin: 5px 0;">
                    Reply to this email to respond directly to the customer.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error sending rental inquiry email:", error);
    throw new Error(getErrorMessage(error));
  }
};
