import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient();

export async function sendEmailWithSES(address: string, subject: string, body: string) {
    const emailDomain = process.env.EMAIL_DOMAIN;
    if (!emailDomain) {
        throw new Error('EMAIL_DOMAIN env var missing');
    }
    const command = new SendEmailCommand({
        Source: `hapi-team@${process.env.EMAIL_DOMAIN}`,
        Destination: { ToAddresses: [address] },
        Message: {
            Subject: { Data: subject },
            Body: { Text: { Data: body } },
        },
    });

    await ses.send(command);
}
