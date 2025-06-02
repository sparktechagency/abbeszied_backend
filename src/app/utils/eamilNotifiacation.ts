import { sendEmail } from './mailSender';
interface OtpSendEmailParams {
  sentTo: string;
  subject: string;
  name: string;
}

const userCreateEmail = async ({
  sentTo,
  subject,
  name,
}: OtpSendEmailParams): Promise<void> => {
  await sendEmail(
    sentTo,
    subject,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello dear, ${name}</h1>
      <h2 >Your account create successfully.</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;"> 
        <p style="font-size: 14px; color: #666;">Please check your account.</p>
      </div>
    </div>`,
  );
};
const otpSendEmail = async ({ sentTo, subject, name, otp, expiredAt }: any) => {
  await sendEmail(
    sentTo,
    subject,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello dear, ${name}</h1>
      <h2 style="color: #4CAF50;">Your One Time OTP</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiredAt.toLocaleString()}</p>
      </div>
    </div>`,
  );
};
export { userCreateEmail, otpSendEmail };
