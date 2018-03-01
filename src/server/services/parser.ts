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
            if (part['header']) {
                if (this._isAttachment(part)) {
                    parsedMail.attachments = parsedMail.attachments || [];
                    let contentType = 'text/plain';
                    let content;
                    let filename;
                    if (
                        part['header']['contentType']
                        && part['header']['contentType']['mime']
                    ) {
                        contentType = part['header']['contentType']['mime'];
                        if (!(/text\//i.test(part['header']['contentType']['mime']))) {
                            content = part['0'].toString('base64');
                        } else {
                            content = new Buffer(part['0']).toString('base64');
                        }
                        if ('name' in part['header']['contentType']['mime']) {
                            filename = part['header']['contentType']['mime']['name'];
                        }
                    } else {
                        content = new Buffer(part['0']).toString('base64');
                        filename = part['header']['contentDisposition']['filename'];
                    }
                    parsedMail.attachments.push({
                        filename,
                        contentType,
                        content,
                    });
                } else if (
                    ('contentType' in part['header'])
                    && ('mime' in part['header']['contentType'])
                    && (/text\/html/i.test(part['header']['contentType']['mime']))
                ) {
                    parsedMail.html = part['0'];
                } else {
                    try {
                        parsedMail.text = part['0'].toString(); // force string, just in case
                    } catch (e) {
                        const json = JSON.stringify(part['0']);
                        console.error('Expected string, got', json);
                        parsedMail.text = json;
                    }
                }
            } else {
                try {
                    parsedMail.text = part.toString(); // force string, just in case
                } catch (e) {
                    const json = JSON.stringify(part);
                    console.error('Expected string, got', json);
                    parsedMail.text = json;
                }
            }
        });
        if (!parsedMail.html || !parsedMail.html.length) {
            parsedMail.html = `${parsedMail.text || ''}`;
        }
        return parsedMail;
    }

    private _isAttachment(part): boolean {
        return (part['header'])
        && ('contentDisposition' in part['header'])
        && ('mime' in part['header']['contentDisposition'])
        && (part['header']['contentDisposition']['mime'] === 'attachment')
        && (
            ('filename' in part['header']['contentDisposition'])
            ||
            (part['hader']['contentType'] && part['hader']['contentType']['mime'] && 'name' in part['hader']['contentType']['mime'])
        );
    }


}
