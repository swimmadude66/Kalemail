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
        const params = new HttpParams();
        params.set('page', '' + page);
        return this._http.get<Mailbox[]>('/api/mailboxes', {params});
    }

    searchMailboxes(query: string, page?: number): Observable<Mailbox[]> {
        const params = new HttpParams();
        params.set('page', '' + page);
        return this._http.get<Mailbox[]>(`/api/mailboxes/search/${query}`, {params});
    }

    getMailbox(mailbox: string, page?: number): Observable<Email[]> {
        const params = new HttpParams();
        params.set('page', '' + page);
        return this._http.get<Email[]>(`/api/mailboxes/${mailbox}`, {params});
    }
}
