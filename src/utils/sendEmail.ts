import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async ({ to, subject, text }: EmailOptions) => {
  try {
    const transporter = nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN!,
      })
    );

    const info = await transporter.sendMail({
      from: {
        address: 'hello@demomailtrap.com',
        name: 'Mailtrap Test',
      },
      to,
      subject,
      text,
    });

    console.log('Email sent:', info);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};
