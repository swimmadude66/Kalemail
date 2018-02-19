import {ActivatedRoute} from '@angular/router';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ParsedMail, Attachment} from '../../models/parsedmail';
import {saveAs} from 'file-saver';
import JSONFormatter from 'json-formatter-js';

@Component({
    selector: 'mail',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html'
})
export class MailComponent implements OnInit {

    email: ParsedMail;
    emailContentsLink: string;
    viewRaw = false;

    @ViewChild('emailViewer') emailViewer;
    @ViewChild('rawViewer') rawViewer;

    constructor(private _route: ActivatedRoute) {}

    ngOnInit() {
        this.email = this._route.snapshot.data['email'];
        this.emailContentsLink = `/api/mail/${this._route.snapshot.paramMap.get('emailId')}/contents`;
        this.emailViewer.nativeElement.srcdoc = this.email.html;
        const formatter = new JSONFormatter(this.email);
        this.rawViewer.nativeElement.appendChild(formatter.render());
    }

    download(attachment: Attachment) {
        if (attachment && attachment.filename && attachment.content) {
            const content = new Buffer(attachment.content, 'base64');
            const blob = new Blob([content], { type: attachment.contentType || 'text/plain' });
            saveAs(blob, attachment.filename);
        }
    }
}
