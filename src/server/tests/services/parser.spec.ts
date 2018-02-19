import {expect} from 'chai';
import {EmailParser} from '../../services/parser';
import {Envelope} from '../../models/envelope';

describe('ParserService', () => {

    let parser: EmailParser;

    describe('parseEnvelope', () => {
        beforeEach(() => {
            parser = new EmailParser();
        });

        it('should parse raw text emails', () => {
            const email: Envelope = {
                header: {
                    messageId: 'messageidPlainText',
                    from: {
                        address: 'test@kalemail.local',
                    },
                    subject: 'plaintext Email',
                    date: new Date().toString(),
                    to: {address: 'test@kalemail.local'},
                },
                '0': 'This is a plaintext email'
            };

            const parsed = parser.parseEnvelope(email);
            expect(parsed).contains.keys(['messageId', 'to', 'from', 'subject', 'date', 'text', 'html']);

            expect(parsed.to).to.be.an('array', 'to is not an array');
            expect(parsed.to).to.have.length.at.least(1, 'less than one memeber in to field');
            expect(parsed.to[0]).to.contain.keys('address');
            expect(parsed.to[0].address).to.equal('test@kalemail.local', 'to field is not correct');


            expect(parsed.from).to.contain.keys('address');
            expect(parsed.from.address).to.equal('test@kalemail.local', 'from field is not correct');

            expect(parsed.subject).to.equal('plaintext Email', 'subjects do not match!');

            expect(parsed.text).to.equal('This is a plaintext email', 'plaintext body incorrectly parsed');

            expect(parsed.html).to.equal('This is a plaintext email', 'html body incorrectly parsed');
        });

        it('should parse html emails', () => {
            const email: Envelope = {
                header: {
                    messageId: 'messageidHtml',
                    from: {
                        address: 'test@kalemail.local',
                    },
                    subject: 'Html Email',
                    date: new Date().toString(),
                    to: {address: 'test@kalemail.local'},
                },
                '0': {
                    header: {
                        contentType: {
                            mime: 'text/html',
                            charset: 'utf8'
                        }
                    },
                    '0': '<h1>THIS IS AN HTML EMAIL</h1>'
                }
            };

            const parsed = parser.parseEnvelope(email);
            expect(parsed).contains.keys(['messageId', 'to', 'from', 'subject', 'date', 'html']);

            expect(parsed.to).to.be.an('array', 'to is not an array');
            expect(parsed.to).to.have.length.at.least(1, 'less than one memeber in to field');
            expect(parsed.to[0]).to.contain.keys('address');
            expect(parsed.to[0].address).to.equal('test@kalemail.local', 'to field is not correct');


            expect(parsed.from).to.contain.keys('address');
            expect(parsed.from.address).to.equal('test@kalemail.local', 'from field is not correct');

            expect(parsed.subject).to.equal('Html Email', 'subjects do not match!');

            expect(parsed.html).to.equal('<h1>THIS IS AN HTML EMAIL</h1>', 'html body incorrectly parsed');
        });

        it('should parse attachments', () => {
            const email: Envelope = {
                header: {
                    messageId: 'messageidAttachment',
                    from: {
                        address: 'test@kalemail.local',
                    },
                    subject: 'Html Email with Attachment',
                    date: new Date().toString(),
                    to: {address: 'test@kalemail.local'},
                    contentType: {
                        mime: 'multipart/mixed'
                    }
                },
                '0': {
                    header: {
                        contentDisposition: {
                            mime: 'attachment',
                            filename: 'test.txt'
                        },
                        contentType: {
                            mime: 'text/plain'
                        }
                    },
                    '0': 'Hello World!'
                },
                '1': {
                    header: {
                        contentType: {
                            mime: 'text/html',
                            charset: 'utf8'
                        }
                    },
                    '0': '<h1>THIS IS AN HTML EMAIL</h1>'
                }
            };

            const parsed = parser.parseEnvelope(email);
            expect(parsed).contains.keys(['messageId', 'to', 'from', 'subject', 'date', 'html', 'attachments']);

            expect(parsed.to).to.be.an('array', 'to is not an array');
            expect(parsed.to).to.have.length.at.least(1, 'less than one memeber in to field');
            expect(parsed.to[0]).to.contain.keys('address');
            expect(parsed.to[0].address).to.equal('test@kalemail.local', 'to field is not correct');


            expect(parsed.from).to.contain.keys('address');
            expect(parsed.from.address).to.equal('test@kalemail.local', 'from field is not correct');

            expect(parsed.subject).to.equal('Html Email with Attachment', 'subjects do not match!');

            expect(parsed.html).to.equal('<h1>THIS IS AN HTML EMAIL</h1>', 'html body incorrectly parsed');

            expect(parsed.attachments).to.be.an('array', 'attachments is not an array');
            expect(parsed.attachments).to.have.length.at.least(1, 'no attachments!');
            expect(parsed.attachments[0]).to.contain.keys(['filename', 'content']);
            expect(parsed.attachments[0].filename).to.equal('test.txt', 'filename is incorrect');
            expect(parsed.attachments[0].content).to.equal(new Buffer('Hello World!').toString('base64'), 'attachment content is incorrect');
        });

        it('should parse alternatives', () => {
            const email: Envelope = {
                header: {
                    messageId: 'messageidAlaternative',
                    from: {
                        address: 'test@kalemail.local',
                    },
                    subject: 'Alternative Email',
                    date: new Date().toString(),
                    to: {address: 'test@kalemail.local'},
                    contentType: {
                        mime: 'multipart/alternative'
                    }
                },
                '0': {
                    header: {
                        contentType: {
                            mime: 'text/plain'
                        }
                    },
                    '0': 'Hello World!'
                },
                '1': {
                    header: {
                        contentType: {
                            mime: 'text/html',
                            charset: 'utf8'
                        }
                    },
                    '0': '<h1>THIS IS AN HTML EMAIL</h1>'
                }
            };

            const parsed = parser.parseEnvelope(email);
            expect(parsed).contains.keys(['messageId', 'to', 'from', 'subject', 'date', 'html', 'text']);

            expect(parsed.to).to.be.an('array', 'to is not an array');
            expect(parsed.to).to.have.length.at.least(1, 'less than one memeber in to field');
            expect(parsed.to[0]).to.contain.keys('address');
            expect(parsed.to[0].address).to.equal('test@kalemail.local', 'to field is not correct');


            expect(parsed.from).to.contain.keys('address');
            expect(parsed.from.address).to.equal('test@kalemail.local', 'from field is not correct');

            expect(parsed.subject).to.equal('Alternative Email', 'subjects do not match!');

            expect(parsed.html).to.equal('<h1>THIS IS AN HTML EMAIL</h1>', 'html body incorrectly parsed');

            expect(parsed.text).to.equal('Hello World!', 'text body was not preserved');
        });

        it('should parse emails with multiple recipients', () => {
            const email: Envelope = {
                header: {
                    messageId: 'messageidMulti',
                    from: {
                        address: 'test@kalemail.local',
                    },
                    subject: 'multi Email',
                    date: new Date().toString(),
                    to: [
                        {address: 'test@kalemail.local'},
                        {address: 'test2@kalemail.local', name: 'The Second Guy'},
                    ],
                    cc: [
                        {address: 'testcc@kalemail.local'},
                        {address: 'testcc2@kalemail.local', name: 'The Second CC Guy'},
                    ],
                },
                '0': 'This is a plaintext email'
            };

            const parsed = parser.parseEnvelope(email);
            expect(parsed).contains.keys(['messageId', 'to', 'cc', 'from', 'subject', 'date', 'text', 'html']);

            expect(parsed.to).to.be.an('array', 'to is not an array');
            expect(parsed.to).to.have.length.at.least(2, 'less than 2 memeber in to field');
            expect(parsed.to).to.satisfy(to => to.every(t => !!t.address), 'not all recipients have an address!');
            expect(parsed.to[0].address).to.equal('test@kalemail.local', 'to field is not correct');
            expect(parsed.to[1].address).to.equal('test2@kalemail.local', 'to field is not correct');
            expect(parsed.to[1].name).to.equal('The Second Guy', 'name field is not correctly parsed from to');

            expect(parsed.cc).to.be.an('array', 'to is not an array');
            expect(parsed.cc).to.have.length.at.least(2, 'less than 2 memeber in to field');
            expect(parsed.cc[0]).to.contain.keys(['address']);
            expect(parsed.cc[1]).to.contain.keys(['address', 'name']);
            expect(parsed.cc[0].address).to.equal('testcc@kalemail.local', 'cc field is not correct');
            expect(parsed.cc[1].address).to.equal('testcc2@kalemail.local', 'cc field is not correct');
            expect(parsed.cc[1].name).to.equal('The Second CC Guy', 'name field is not correctly parsed from to');


            expect(parsed.from).to.contain.keys('address');
            expect(parsed.from.address).to.equal('test@kalemail.local', 'from field is not correct');
        });
    });
});
