export class Email {
    EmailId: number;
    Location: string;
    From: string;
    Subject: string;
    CreatedDate: Date;
    LastTestId?: string;
}

export class Mailbox {
    mailbox: string;
    messageCount: number;
    latestMessage: Date;
}
