import * as request from 'request';
import {ParsedMail} from '../models/parsedmail';
import {Observable} from 'rxjs/Rx';
import {TestResult} from '../models/tests';

export class EmailOnAcidService {

    private API;

    constructor(
        apiKey: string,
        apiPass: string
    ) {
        if (apiKey) {
            this.API = request.defaults({
                auth: {
                    username: apiKey,
                    password: apiPass
                },
                headers: {Accept: 'application/json'}
            });
        }
    }

    createTest(mail: ParsedMail): Observable<string> {
        let contents = mail.html;
        if (!contents || !contents.length) {
            return Observable.throw('No html in email!');
        }
        const req = {
            subject: mail.subject || mail.messageId,
            html: contents,
            image_blocking: false
        };
        return Observable.create(
            observer => {
                this.API.post({url: 'https://api.emailonacid.com/v5/email/tests', body: req, json: true}, (err, response, body) => {
                    if (err) {
                        console.error(err);
                        observer.error(err);
                    } else {
                        if (response && response.statusCode === 200) {
                            observer.next(body.id);
                            observer.complete();
                        } else {
                            console.error(body);
                            observer.error(body);
                        }
                    }
                });
            }
        );
    }

    getTestResults(testId: string): Observable<TestResult[]> {
        return Observable.create(
            observer => {
                if (!testId || !testId.length) {
                    observer.error('No test Id provided');
                } else {
                    this.API.get(`https://api.emailonacid.com/v5/email/tests/${testId}/results`, (err, response, body) => {
                        if (err) {
                            console.error(err);
                            observer.error(err);
                        } else {
                            if (response && response.statusCode === 200) {
                                try {
                                    body = JSON.parse(body);
                                    const results = [];
                                    Object.keys(body).forEach(k => {
                                        if (body.hasOwnProperty(k)) {
                                            results.push(body[k]);
                                        }
                                    });
                                    observer.next(results);
                                    observer.complete();
                                } catch (parseErr) {
                                    console.error('Could not parse', body);
                                    observer.error('Could not parse test results');
                                }
                            } else {
                                console.error(body);
                                observer.error('Could not extract test results');
                            }
                        }
                    });
                }
            }
        );
    }
}
