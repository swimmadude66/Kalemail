import {MailboxService} from '../services/mailbox';
import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {Email} from '../models/mail';

@Injectable()
export class MailboxResolver implements Resolve<Email[]> {

    constructor(
        private _mailboxService: MailboxService
    ) {}
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Email[]> {
        return this._mailboxService.getMailbox(route.paramMap.get('mailbox'), Math.max(+(route.queryParamMap.get('page') || 0), 0));
    }
}
