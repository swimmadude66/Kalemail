import {MailService} from '../services/';
import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {ParsedMail} from '../models/parsedmail';

@Injectable()
export class MailResolver implements Resolve<ParsedMail> {

    constructor(
        private _mailService: MailService
    ) {}
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ParsedMail> {
        return this._mailService.getMail(+route.paramMap.get('emailId'));
    }
}
