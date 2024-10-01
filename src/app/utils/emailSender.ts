import nodemailer from 'nodemailer';
import config from '../config';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
// import * as fs from 'fs';
// import * as path from 'path';

const sendEmail = async (
  to: string,
  html: string,
  priority: 'high' | 'low' | 'normal' = 'normal',
  replyTo: string = 'queue-meet@support.com',
  subject: string = 'User password change mail',
) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: config.node_env === 'production',
    auth: {
      user: config.sender_email,
      pass: config.sender_app_password,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `Queue-Meet ${config.sender_email}`,
      to,
      subject,
      text: 'Reset your password withen 10 minutes',
      priority,
      replyTo,
      html,
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log('error found', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error)?.message,
    );
  }
};
/*
const createEmailContent = async (data: object, templateType: string) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      `src/views/${templateType}.template.hbs`
    );
    const content = await ReadFile(templatePath, 'utf8');

    const template = Handlebars.compile(content);

    return template(data);
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message
    );
  }
};
*/

export const EmailHelper = {
  sendEmail,
  // createEmailContent,
};
