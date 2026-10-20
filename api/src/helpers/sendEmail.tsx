import * as z from 'zod'
import {sendEmailWithMailgun} from "../services/mailgun";
import {sendEmailWithSES} from "../services/simpleEmailService";

const EmailProviderSchema = z.enum(["mock", "aws", "mailgun"]);
type EmailProviderType = z.infer<typeof EmailProviderSchema>;
let emailProvider: EmailProviderType | null = null;

const providerEnv = process.env.EMAIL_PROVIDER
if (!providerEnv) {
    console.warn(`Missing environment variable "EMAIL_PROVIDER".\nUsing default: "mock"`)
    console.warn("Emails will not be sent, only logged to console!")
    emailProvider = "mock"
} else {
    try {
        emailProvider = EmailProviderSchema.parse(providerEnv)
    } catch (e) {
        console.error(`Invalid environment variable "EMAIL_PROVIDER"! Provided: "${providerEnv}". Allowed values: ${EmailProviderSchema}`)
        console.error("Emails will not be sent, only logged to console!")
    }
}


export async function sendEmail(address: string, subject: string, body: string) {
    if (!z.validate(z.email(), address)) {
        throw new Error(`${address} is not a valid email`)
    }
    switch (emailProvider) {
        case null:
        case "mock":
            console.warn("Email send requested but no provider configured.")
            console.warn("Printing email:")
            console.log(`to: ${address}`)
            console.log(`subject: ${subject}`)
            console.log("body:")
            console.log(body)
            console.log("\n")
            break
        case "mailgun":
            await sendEmailWithMailgun(address, subject, body)
            break
        case "aws":
            await sendEmailWithSES(address, subject, body)
            break
    }
}
