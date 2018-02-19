import {Address} from './parsedmail';
// Until @types/envelope is created, this model will be close enough
export interface EnvelopeHeader {
    messageId: string;
    from: Address;
    subject: string;
    date: string;
    to: Address | Address[];
    cc?: Address | Address[];
    bcc?: Address | Address[];
    received?: string[];
    dkimSignature?: string;
    mimeVersion?: string;
    contentType?: {
        mime: string;
        boundary?: string;
    };
}

export interface EnvelopePartHeader {
    contentType?: {
        mime: string;
        charset?: string;
        filename?: string;
    };
    contentDisposition?: {
        mime?: string;
        charset?: string;
        filename?: string;
    };
}

export interface EnvelopePart {
    header?: EnvelopePartHeader;
    [key: number]: string;
}


export interface Envelope {
    header: EnvelopeHeader;
    [key: number]: EnvelopePart | string;
}
