import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import {
  EmailTemplateContexts,
  EmailTemplatesEnum,
  EmailTemplateSubjects,
} from '@/app/types/email-interface';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    to,
    template,
    context,
  }: {
    to: string;
    template: EmailTemplatesEnum;
    context: EmailTemplateContexts;
  } = body;

  if (!to || !template || !context) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    const templatePath = path.resolve('./templates', `${template}.handlebars`);
    const templateFile = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(templateFile);
    const html = compiledTemplate(context);

    const subject = EmailTemplateSubjects[template];

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 },
    );
  }
}
