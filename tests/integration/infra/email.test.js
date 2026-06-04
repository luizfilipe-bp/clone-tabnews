import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Example <test@example.com>",
      to: "Recipient <recipient@example.com>",
      subject: "Test Email",
      text: "This is a test email from automated tests.",
    });

    await email.send({
      from: "Example <test@example.com>",
      to: "Recipient <recipient@example.com>",
      subject: "Test Last Email",
      text: "This is a test of the last email from automated tests.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<test@example.com>");
    expect(lastEmail.recipients[0]).toBe("<recipient@example.com>");
    expect(lastEmail.subject).toBe("Test Last Email");
    expect(lastEmail.text).toBe(
      "This is a test of the last email from automated tests.\n",
    );
  });
});
