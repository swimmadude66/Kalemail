import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {BaseSubscriberComponent} from '../base/component';
import {Mailbox} from '../../models/mail';
import {MailboxService} from '../../services/mailbox';

@Component({
    selector: 'dashboard',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html'
})
export class DashboardComponent extends BaseSubscriberComponent implements OnInit {

    page = 1;
    mailboxes: Mailbox[];
    query: string;
    currentQuery: string;
    private _searchSub: Subscription;

    constructor(
        private _mailboxService: MailboxService,
        private _route: ActivatedRoute,
        private _router: Router
    ){
        super();
    }

    ngOnInit() {
        this.addSubscription(
            this._route.queryParamMap.subscribe(
                qparams => {
                    this.page = Math.max(1, +(qparams.get('page') || 1));
                    this.getMailboxes(this.page);
                }
            )
        );
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this._cleanUpSearch();
    }

    getMailboxes(page?: number) {
        this.page = page;
        this._cleanUpSearch();
        if (this.currentQuery && this.currentQuery.length) {
            this._searchSub = this._mailboxService
                .searchMailboxes(this.currentQuery, page)
                .subscribe(
                    mailboxes => this.mailboxes = mailboxes
                );
        } else {
            this._searchSub = this._mailboxService
                .getMailboxes(page)
                .subscribe(
                    mailboxes => this.mailboxes = mailboxes
                );
        }

    }

    searchMailboxes(query: string, page?: number) {
        this._cleanUpSearch();
        this._searchSub = this._mailboxService
        .searchMailboxes(query, page)
        .subscribe(mailboxes => {
            this.currentQuery = query;
            this.query = undefined;
            this.mailboxes = mailboxes;
        });
    }

    clearSearch() {
        this.currentQuery = undefined;
        this._cleanUpSearch();
        this._searchSub = this._mailboxService
        .getMailboxes(0)
        .subscribe(
            mailboxes => this.mailboxes = mailboxes
        );
    }

    openMailbox(mailbox: Mailbox) {
        this._router.navigate(['/mailbox', mailbox.mailbox], {queryParams: {page: 0}});
    }

    private _cleanUpSearch() {
        if (this._searchSub && this._searchSub.unsubscribe) {
            this._searchSub.unsubscribe();
            this._searchSub = undefined;
        }
    }
}
