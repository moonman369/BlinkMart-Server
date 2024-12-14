export const getVerifyEmailTemplate = ({ username, redirectUrl }) => {
  return `
  <div style="font-family: Calibri; font-size: 16px;">
  <p>Dear <b>${username}</b>,</p>
    <p>Thank you for registering to <b>BlinkMart</b>. Kindly click on the button below to <b>verify</b> your email.</p>
    <a href=${redirectUrl} >
        <button style="color: white; background-color: blue; cursor: pointer; padding: 10px; border-radius: 9px; font-weight: bold">
            Verify Email
        </button>
        <br/>
        <p>Thanks and regards,</p>
        <p>BlinkMart</p>
    </a>
  </div>   
    `;
};

export const getForgotPasswordEmailTemplate = ({
  username,
  otp,
  otpValidityDurationInMinutes,
}) => {
  return `
    <div style="font-family: Calibri; font-size: 16px;">
    <p>Dear <b>${username}</b>,</p>
    <p>Forgot your BlinkMart Password? Dont worry!</b> Kindly use the following <b>OTP</b> for <b>resetting</b> your password.</p>
  <p >OTP: <span style="background: #7ffa9e; font-size: 20px; border-radius:5px; padding: 5px; border-style:solid; border-width: 2px">${otp}</span></p>
  <p><b>Note</b>: This OTP is valid for the next <b>${otpValidityDurationInMinutes} minutes</b>. Enter this OTP in the BlinkMart Forgot Password page to reset your password. </p>
    <br/>
    <p>Thanks and regards,</p>
    <p>BlinkMart</p>
    </div>
    `;
};
