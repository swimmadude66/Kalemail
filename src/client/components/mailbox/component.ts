import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {BaseSubscriberComponent} from '../base/component';
import {Email} from '../../models/mail';
import {EmailTestsService} from '../../services/tests';
import {MailboxService} from '../../services/mailbox';

@Component({
    selector: 'mailbox',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html'
})
export class MailboxComponent extends BaseSubscriberComponent implements OnInit {

    mailbox: string;
    emails: Email[] = [];
    page = 0;

    constructor(
        private _test: EmailTestsService,
        private _mailboxService: MailboxService,
        private _route: ActivatedRoute,
        private _router: Router
    ){
        super();
    }

    ngOnInit() {
        this.mailbox = this._route.snapshot.paramMap.get('mailbox');
        this.addSubscription(
            this._route.queryParamMap.subscribe(
                queryParamMap => {
                    this.page = Math.max(+(queryParamMap.get('page') || 1), 1);
                    this.loadEmail(this.page);
                }
            )
        );
    }

    loadEmail(page: number) {
        this.addSubscription(
            this._mailboxService.getMailbox(this.mailbox, page)
            .subscribe(
                emails => this.emails = emails,
                err => console.error(err)
            )
        );
    }

    openEmail(emailId: number) {
        this._router.navigate(['/mail', emailId]);
    }

    triggerTest(event, emailId: number) {
        event.preventDefault();
        event.stopPropagation();
        this.addSubscription(
            this._test.createTest(emailId)
            .subscribe(testId => {
                console.log(testId);
                this.emails.find(e => e.EmailId === emailId).LastTestId = testId;
            },
            err => {
                console.error('Could not create test...', err);
            })
        );
    }

}
