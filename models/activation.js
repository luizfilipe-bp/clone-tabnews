import email from "infra/email";

async function sendEmailToUser(user) {
  await email.send({
    from: "Example <test@example.com>",
    to: user.email,
    subject: "Activate Your Account",
    text: `Hello ${user.username},\n\nPlease click the link below to activate your account:\n\nhttps://link...\n\nThank you!`,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
