import * as z from 'zod'
import {sendEmailWithMailgun} from "../services/mailgun";


export async function sendEmail(address: string, subject: string, body: string) {
    if (!z.validate(z.email(), address)) {
        throw new Error(`${address} is not a valid email`)
    }
    await sendEmailWithMailgun(address, subject, body)
}
