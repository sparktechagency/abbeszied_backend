export const generateOtp = () => {
  const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit number between 1000 and 9999
  return otp.toString();
};
