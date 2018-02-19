import {Email, Mailbox} from '../models/mail';
import {Observable} from 'rxjs/Rx';
import {DatabaseService} from './db';
import {IStorageService} from './istorage';
import {ParsedMail} from '../models/parsedmail';

export class MailService {

    constructor (
        private storage: IStorageService,
        private db: DatabaseService
    ) {}

    saveMail(to: string[], mail: ParsedMail): Observable<any> {
        // Save contents to Storage service
        return this.storage.save(mail)
        .flatMap(
            location => {
                // Save Storage link to DB with Subject, DT, From
                const emailQuery = 'INSERT INTO `emails` (`Location`, `Subject`, `From`) VALUES (?, ?, ?);';
                return this.db.query(emailQuery, [location, mail.subject, mail.from.address])
                .map(result => result.insertId);
            }
        )
        .flatMap(
            emailId => {
                // Save Each "to" mapped to Email ID in Emails_To
                const emailMap = to.map(t => [t, emailId]);
                const mapQ = 'INSERT INTO `emails_to` (`To`, `EmailId`) VALUES ' + this.db.escape(emailMap) + ';';
                return this.db.query(mapQ, emailMap);
            }
        );
    }

    getMailboxes(page?: number): Observable<Mailbox[]> {
        let q = 'Select `to` as mailbox, Count(*) as messageCount, Max(`CreatedDate`) as latestMessage \
        from `emails_to` \
        Group By mailbox \
        ORDER BY latestMessage DESC';
        if (page) {
            q += this.db.generatePageQuery(page);
        }
        q += ';';
        return this.db.query(q);
    }

    searchMailboxes(query: string, page?: number): Observable<Mailbox[]> {
        let q = 'Select `to` as mailbox, Count(*) as messageCount, Max(`CreatedDate`) as latestMessage \
        from `emails_to` \
        Where `to` like ? \
        Group By mailbox \
        ORDER BY latestMessage DESC';
        if (page) {
            q += this.db.generatePageQuery(page);
        }
        q += ';';
        return this.db.query(q, [`%${query}%`]);
    }

    getMailbox(mailbox: string, page?: number): Observable<Email[]> {
        let q = 'Select `emails`.* from `emails_to` \
        join `emails` on `emails`.`EmailId`=`emails_to`.`EmailId` \
        Where `To` = ? \
        ORDER BY `CreatedDate` DESC';
        if (page) {
            q += this.db.generatePageQuery(page);
        }
        q += ';';
        return this.db.query(q, [mailbox]);
    }

    getAllMail(page?: number): Observable<Email[]> {
        let q = 'Select * from `emails` ORDER BY `CreatedDate` DESC';
        if (page) {
            q += this.db.generatePageQuery(page);
        }
        q += ';';
        return this.db.query(q);
    }

    getMail(emailId: number): Observable<ParsedMail> {
        const q = 'Select * from `emails` Where `EmailId`=? LIMIT 1;';
        return this.db.query(q, emailId)
        .flatMap(
            emails => {
                if (emails.length < 1) {
                    return Observable.throw(404);
                } else {
                    const email = emails[0];
                    return this.storage.retrieve(email.Location);
                }
            }
        );
    }

}
