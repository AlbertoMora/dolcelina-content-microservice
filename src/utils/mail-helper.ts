import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';

/**
 * @docs: https://developers.mailersend.com
 */
export const mailsender = new MailerSend({
    apiKey: process.env.MAILER_SEND_APIKEY ?? '',
});

export interface IMailModel {
    mail: string;
    name: string;
    alias?: string;
}

export const sendEmail = async (
    subject: string,
    html: string,
    from: IMailModel,
    to: IMailModel[],
) => {
    const sentFrom = new Sender(from.mail, from.name);
    const recipients = to.map(x => new Recipient(x.mail, x.name));

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(subject)
        .setHtml(html);

    await mailsender.email.send(emailParams);
};
