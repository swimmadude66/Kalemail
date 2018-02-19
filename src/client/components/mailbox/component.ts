import {ActivatedRoute, Router} from '@angular/router';
import {Email} from '../../models/mail';
import {Component, OnInit} from '@angular/core';
import {EmailTestsService} from '../../services/tests';
import {MailboxService} from '../../services/mailbox';

@Component({
    selector: 'mailbox',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html'
})
export class MailboxComponent implements OnInit {

    mailbox: string;
    emails: Email[] = [];
    page = 0;

    constructor(
        private _test: EmailTestsService,
        private _mailboxService: MailboxService,
        private _route: ActivatedRoute,
        private _router: Router
    ) {}

    ngOnInit() {
        this.mailbox = this._route.snapshot.paramMap.get('mailbox');
        this._route.queryParamMap.subscribe(
            queryParamMap => {
                this.page = Math.max(+(queryParamMap.get('page') || 1), 1);
                this.loadEmail(this.page);
            }
        );
    }

    loadEmail(page: number) {
        this._mailboxService.getMailbox(this.mailbox, page).subscribe(
            emails => this.emails = emails,
            err => console.error(err)
        );
    }

    openEmail(emailId: number) {
        this._router.navigate(['/mail', emailId]);
    }

    triggerTest(event, emailId: number) {
        event.preventDefault();
        event.stopPropagation();
        this._test.createTest(emailId)
        .subscribe(testId => {
            console.log(testId);
            this.emails.find(e => e.EmailId === emailId).LastTestId = testId;
        },
        err => {
            console.error('Could not create test...', err);
        });
    }

}
