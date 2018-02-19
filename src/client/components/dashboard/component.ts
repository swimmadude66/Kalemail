import {ActivatedRoute, Router} from '@angular/router';
import {Mailbox} from '../../models/mail';
import {MailboxService} from '../../services/mailbox';
import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
    selector: 'dashboard',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

    private _subscriptions = [];
    page = 1;
    mailboxes: Mailbox[];
    query: string;
    currentQuery: string;

    constructor(
        private _mailboxService: MailboxService,
        private _route: ActivatedRoute,
        private _router: Router
    ) {}

    ngOnInit() {
        this._route.queryParamMap.subscribe(
            qparams => {
                this.page = Math.max(1, +(qparams.get('page') || 1));
                this.getMailboxes(this.page);
            }
        );
    }

    ngOnDestroy() {
        this._subscriptions.forEach(
            sub => sub.unsubscribe()
        );
        this._subscriptions = [];
    }

    getMailboxes(page?: number) {
        this._subscriptions.forEach(
            sub => sub.unsubscribe()
        );
        this._subscriptions = [];
        if (this.currentQuery && this.currentQuery.length) {
            this._subscriptions.push(
                this._mailboxService.searchMailboxes(this.currentQuery, page)
                .subscribe(
                    mailboxes => this.mailboxes = mailboxes
                )
            );
        } else {
            this._subscriptions.push(
                this._mailboxService.getMailboxes(page)
                .subscribe(
                    mailboxes => this.mailboxes = mailboxes
                )
            );
        }

    }

    searchMailboxes(query: string, page?: number) {
        this._subscriptions.forEach(
            sub => sub.unsubscribe()
        );
        this._subscriptions = [];
        this._subscriptions.push(
            this._mailboxService.searchMailboxes(query, page)
            .subscribe(mailboxes => {
                this.currentQuery = query;
                this.query = undefined;
                this.mailboxes = mailboxes;
            })
        );
    }

    clearSearch() {
        this.currentQuery = undefined;
        this._subscriptions.forEach(
            sub => sub.unsubscribe()
        );
        this._subscriptions = [];
        this._subscriptions.push(
            this._mailboxService.getMailboxes(0).subscribe(
                mailboxes => this.mailboxes = mailboxes
            )
        );
    }

    openMailbox(mailbox: Mailbox) {
        this._router.navigate(['/mailbox', mailbox.mailbox], {queryParams: {page: 0}});
    }
}
