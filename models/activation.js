import database from "infra/database";
import webserver from "infra/webserver";
import email from "infra/email";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000;

async function findOneByUserId(userId) {
  const activationTokenObject = await runSelectQuery(userId);
  return activationTokenObject;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          user_id = $1
        LIMIT 
          1
      ;`,
      values: [userId],
    });
    return results.rows[0];
  }
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES 
          ($1, $2)
        RETURNING 
          *
      ;`,
      values: [userId, expiresAt],
    });
    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Example <test@example.com>",
    to: user.email,
    subject: "Activate Your Account",
    text: `Hello ${user.username},\n\nPlease click the link below to activate your account:\n\n${webserver.origin}/cadastro/ativar/${activationToken.id}\n\nThank you!`,
  });
}

const activation = {
  create,
  findOneByUserId,
  sendEmailToUser,
};

export default activation;
