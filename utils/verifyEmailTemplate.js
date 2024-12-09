const getVerifyEmailTemplate = ({ username, redirectUrl }) => {
  return `
    <p>Dear <b>${username}</b>,</p>
    <p>Thank you for registering to <b>BlinkMart</b>. Kindly click on the button below to <b>verify</b> your email.</p>
    <a href=${redirectUrl} >
        <button style="color: white; background-color: blue; cursor: pointer; padding: 10px; border-radius: 9px; font-weight: bold">
            Verify Email
        </button>
    </a>
    `;
};

export default getVerifyEmailTemplate;
