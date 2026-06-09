import webserver from "infra/webserver";
import activation from "models/activation";
import user from "models/user";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  let createUserResponseBody;
  let activationTokenId;

  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "registrationflow@example.com",
          password: "password123",
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registrationflow@example.com",
      features: ["read:activation_token"],
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<test@example.com>");
    expect(lastEmail.recipients[0]).toBe("<registrationflow@example.com>");
    expect(lastEmail.subject).toBe("Activate Your Account");
    expect(lastEmail.text).toContain("RegistrationFlow");

    activationTokenId = orchestrator.extractUUID(lastEmail.text);
    expect(lastEmail.text).toContain(
      `${webserver.origin}/cadastro/ativar/${activationTokenId}`,
    );

    const activationTokenObject =
      await activation.findOneValidById(activationTokenId);

    expect(activationTokenObject.user_id).toBe(createUserResponseBody.id);
    expect(activationTokenObject.used_at).toBe(null);
  });

  test("Activate user account", async () => {
    const activationUserResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
      },
    );

    expect(activationUserResponse.status).toBe(200);

    const activationUserResponseBody = await activationUserResponse.json();

    expect(Date.parse(activationUserResponseBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername(
      createUserResponseBody.username,
    );
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("Login with activated account", async () => {});

  test("Get user information", async () => {});
});
