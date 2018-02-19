export interface Attachment {
    filename: string;
    content: any;
    contentType?: string;
}

export interface Address {
    address: string;
    name?: string;
}

export interface ParsedMail {
    messageId: string;
    headers: {[key: string]: string};
    subject: string;
    to: Address[];
    from: Address;
    RCPTO?: string[];
    attachments?: Attachment[];
    html?: string;
    text?: string;
    date?: Date;
    cc?: Address[];
    bcc?: Address[];
    replyTo?: Address;
}
