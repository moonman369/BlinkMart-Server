const getVerifyEmailTemplate = ({ username, redirectUrl }) => {
  return `
    <p>Dear <b>${username}</b>,</p><br/>
    <p>Thank you for registering to <b>BlinkMart</b>. Kindly click on the button below to <b>verify</b> your email.</p>
    <a href=${redirectUrl} >
        <button hstyle="color: white; background-color: blue, margin-top: 10px">
            Verify Email
        </button>
    </a>
    `;
};

export default getVerifyEmailTemplate;
