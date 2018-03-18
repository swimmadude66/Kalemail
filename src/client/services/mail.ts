import {Injectable} from '@angular/core';
import {Email} from '../models/mail';
import {Observable} from 'rxjs/Rx';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ParsedMail} from '../models/parsedmail';

@Injectable()
export class MailService {
    constructor (private _http: HttpClient) {}

    getAllMail(page?: number): Observable<Email[]> {
        const opts = {};
        if (page) {
            const params = new HttpParams({
                fromObject: {
                    page: '' + page
                }
            });
            opts['params'] = params;
        }
        return this._http.get<Email[]>('/api/mail', opts);
    }

    getMail(emailId: number): Observable<ParsedMail> {
        return this._http.get<ParsedMail>(`/api/mail/${emailId}`);
    }
}
