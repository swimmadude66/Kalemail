import {Email, Mailbox} from '../models/mail';
import {Observable} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable()
export class MailboxService {

    constructor(
        private _http: HttpClient
    ) {}

    getMailboxes(page?: number): Observable<Mailbox[]> {
        const opts = {};
        if (page) {
            const params = new HttpParams({
                fromObject: {
                    page: ''+page
                }
            });
            opts['params'] = params;
        }
        return this._http.get<Mailbox[]>('/api/mailboxes', opts);
    }

    searchMailboxes(query: string, page?: number): Observable<Mailbox[]> {
        const opts = {};
        if (page) {
            const params = new HttpParams({
                fromObject: {
                    page: ''+page
                }
            });
            opts['params'] = params;
        }
        return this._http.get<Mailbox[]>(`/api/mailboxes/search/${query}`, opts);
    }

    getMailbox(mailbox: string, page?: number): Observable<Email[]> {
        const opts = {};
        if (page) {
            const params = new HttpParams({
                fromObject: {
                    page: ''+page
                }
            });
            opts['params'] = params;
        }
        return this._http.get<Email[]>(`/api/mailboxes/${mailbox}`, opts);
    }
}
