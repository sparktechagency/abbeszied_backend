"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportWarning = exports.otpSendEmail = exports.userCreateEmail = void 0;
const mailSender_1 = require("./mailSender");
const userCreateEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sentTo, subject, name, }) {
    yield (0, mailSender_1.sendEmail)(sentTo, subject, `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello dear, ${name}</h1>
      <h2 >Your account create successfully.</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;"> 
        <p style="font-size: 14px; color: #666;">Please check your account.</p>
      </div>
    </div>`);
});
exports.userCreateEmail = userCreateEmail;
const otpSendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sentTo, subject, name, otp, expiredAt }) {
    yield (0, mailSender_1.sendEmail)(sentTo, subject, `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello dear, ${name}</h1>
      <h2 style="color: #4CAF50;">Your One Time OTP</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiredAt.toLocaleString()}</p>
      </div>
    </div>`);
});
exports.otpSendEmail = otpSendEmail;
const reportWarning = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sentTo, subject, seller, name, message, }) {
    yield (0, mailSender_1.sendEmail)(sentTo, subject, `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
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
</body>`);
});
exports.reportWarning = reportWarning;
