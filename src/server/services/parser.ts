import * as envelope from 'envelope';
import {Readable} from 'stream';
import {Observable} from 'rxjs/Rx';
import {ParsedMail, Address} from '../models/parsedmail';
import {Envelope} from '../models/envelope';

export class EmailParser {
    constructor() {}

    async parse(rawEmail: Readable | Buffer | string): Promise<ParsedMail> {
        if (rawEmail.constructor === Buffer.constructor) {
            return this.parseBuffer(<Buffer>rawEmail);
        } else if (typeof rawEmail === 'string') {
            return this.parseBuffer(new Buffer(rawEmail));
        } else {
            const buf = await this.parseStream(<Readable>rawEmail);
            return this.parseBuffer(buf);
        }
    }

    async parseStream(stream: Readable): Promise<Buffer> {
        return Observable.create(observer => {
            const parts: Buffer[] = [];
            stream.on('data', (data: Buffer) => {
                parts.push(data);
            });
            stream.on('end', () => {
                const total: Buffer = Buffer.concat(parts);
                observer.next(total);
                observer.complete(total);
            });
            stream.on('error', (err) => {
                observer.error(err);
            });
        }).toPromise();
    }

    parseBuffer(buf: Buffer): ParsedMail {
        const email = new envelope(buf);
        return this.parseEnvelope(email);
    }

    parseEnvelope(email: Envelope): ParsedMail {
        let parsedMail: ParsedMail;
        if ('header' in email) {
            const headers = email['header'];
            let to = headers['to'];
            let cc = headers['cc'];
            let bcc = headers['bcc'];
            if (!Array.isArray(to)) {
                to = [to];
            }
            if (cc && !Array.isArray(cc)) {
                cc = [cc];
            }
            if (bcc && !Array.isArray(bcc)) {
                bcc = [bcc];
            }

            parsedMail = {
                messageId: headers['messageId'],
                from: headers['from'],
                subject: headers['subject'] || '<==NO SUBJECT==>',
                date: new Date(headers['date']),
                headers: <any>headers,
                to: <Address[]>to,
                cc: <Address[]>cc,
                bcc: <Address[]>bcc,
            };
            if (headers['contentType'] && headers['contentType']['mime']) {
                if (/text\/html/i.test(headers['contentType']['mime'])) {
                    parsedMail.html = <string>email[0];
                    return parsedMail;
                } else if (/text\/plain/i.test(headers['contentType']['mime'])) {
                    parsedMail.text = <string>email[0];
                    parsedMail.html = <string>email[0];
                    return parsedMail;
                }
            }
        }
        Object.keys(email)
        .filter(k => k !== 'header')
        .forEach(emailKey => {
            const part = email[emailKey];
            this._processPart(part, parsedMail);
        });
        if (!parsedMail.html || !parsedMail.html.length) {
            parsedMail.html = `${parsedMail.text || ''}`;
        }
        return parsedMail;
    }

    private _processPart(part, email): void {
        if (part['header']) {
            if (this._isAttachment(part)) {
                this._processAttachment(part, email);
            } else if (part['header']['contentType'] && part['header']['contentType']['mime']) {
                if (/text\/html/i.test(part['header']['contentType']['mime'])) {
                    email.html = part['0'];
                } else if (/multipart\//i.test(part['header']['contentType']['mime'])){
                    this._processPart(part['0'], email);
                } else {
                    try {
                        email.text = part['0'].toString(); // force string, just in case
                    } catch (e) {
                        const json = JSON.stringify(part['0']);
                        console.error('Expected string part, got', JSON.stringify(part));
                        email.text = json;
                    }
                }
            }
            else {
                try {
                    email.text = part['0'].toString(); // force string, just in case
                } catch (e) {
                    const json = JSON.stringify(part['0']);
                    console.error('Expected string part, got', JSON.stringify(part));
                    email.text = json;
                }
            }
        } else {
            try {
                email.text = part.toString(); // force string, just in case
            } catch (e) {
                const json = JSON.stringify(part);
                console.error('Expected string entirety, got', json);
                email.text = json;
            }
        }
    }

    private _processAttachment(part, email: ParsedMail): void {
        email.attachments = email.attachments || [];
        let contentType = 'text/plain';
        let content;
        let filename;
        if (part['header']['contentType']) {
            if (part['header']['contentType']['mime']){
                contentType = part['header']['contentType']['mime'];
            }
            if (part['0']['type'] && part['0']['type'] === 'Buffer') {
                content = part['0']['data'].toString('base64');
            } else if (!(/text\//i.test(contentType))) {
                content = part['0'].toString('base64');
            } else {
                content = new Buffer(part['0']).toString('base64');
            }
            if (part['header']['contentType']['name']) {
                filename = part['header']['contentType']['name'];
            } else {
                filename = part['header']['contentDisposition']['filename'];
            }
        } else {
            content = new Buffer(part['0']).toString('base64');
            filename = part['header']['contentDisposition']['filename'];
        }
        email.attachments.push({
            filename,
            contentType,
            content,
        });
    }

    private _isAttachment(part): boolean {
        return (part['header'])
        && (part['header']['contentDisposition'])
        && (part['header']['contentDisposition']['mime'])
        && (part['header']['contentDisposition']['mime'] === 'attachment')
        && (
            (part['header']['contentDisposition']['filename'])
            ||
            (part['header']['contentType'] && part['header']['contentType']['name'])
        );
    }


}
