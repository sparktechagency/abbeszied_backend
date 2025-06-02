import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: config.host_email,
    port: 587,
    secure: false,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: config.nodemailer_host_email,
      pass: config.nodemailer_host_pass,
    },
  });
  // console.log('---------------------');
  // console.log(config.nodemailer_host_email);
  // console.log(config.nodemailer_host_pass);

  try {
    await transporter.sendMail({
      from: config.email_from, // sender address
      to, // list of receivers
      subject,
      text: '', // plain text body
      html, // html body
    });
  } catch (error) {
    console.log(error);
  }
};
