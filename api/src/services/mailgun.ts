export async function sendEmailWithMailgun(address: string, subject: string, body: string) {
    const form = new FormData();
    const emailDomain = process.env.MAILGUN_DOMAIN;
    const mailgunKey = process.env.MAILGUN_KEY;
    if (!emailDomain) {
        throw new Error('MAILGUN_DOMAIN env var missing');
    }
    if (!mailgunKey) {
        throw new Error('MAILGUN_KEY env var missing');
    }
    form.append('from', `HAPI Showcase <password-reset@${emailDomain}>`);
    form.append('to', address);
    form.append('subject', subject);
    form.append('text', body);

    const res = await fetch(`https://api.mailgun.net/v3/${emailDomain}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`api:${mailgunKey}`).toString('base64')
        },
        body: form
    })
    if (!res.ok) {
        throw new Error(res.statusText)
    }
}
