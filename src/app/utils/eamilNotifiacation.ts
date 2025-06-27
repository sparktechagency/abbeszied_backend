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
const reportWarning = async ({
  sentTo,
  subject,
  seller,
  name,
  message,
}: any) => {
  await sendEmail(
    sentTo,
    subject,
    `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <img src="https://res.cloudinary.com/ddhhyc6mr/image/upload/v1745838639/hbtbqyhmubqaeeft5k85.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
    <h2 style="color: #d32f2f; font-size: 24px; margin-bottom: 20px;">Important Notice Regarding Your Product</h2>
    <div style="padding: 20px;">
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear ${seller},</p>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">We hope this email finds you well. We are writing to inform you that your product titled "${name}" has been reported for the following reason:</p>
        <div style="background-color: #f8f8f8; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0;">
            <p style="color: #555; font-size: 16px; margin: 0;">${message}</p>
        </div>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">As a valued member of our community, we kindly remind you to review our community guidelines. This warning serves as a notification that your product may not align with these guidelines.</p>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Please note that repeated violations may result in further action, including potential product removal or account restrictions.</p>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you believe this warning was issued in error, please contact our support team.</p>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">Best regards,<br>The Community Team</p>
    </div>
</div>
</body>`,
  );
};
export { userCreateEmail, otpSendEmail, reportWarning };
