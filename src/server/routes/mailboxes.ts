import {Router} from 'express';
import {AppConfig} from '../config';

module.exports = (APP_CONFIG: AppConfig) => {
    const router = Router();
    const mail = APP_CONFIG.MailService;


    router.get('/', (req, res) => {
        mail.getMailboxes(req.query['page'])
        .subscribe(
            results => res.send(results),
            err => res.status(500).send(err)
        );
    });

    router.get('/search/:query', (req, res) => {
        mail.searchMailboxes(req.params['query'], req.query['page'])
        .subscribe(
            results => res.send(results),
            err => res.status(500).send(err)
        );
    });

    router.get('/:mailbox', (req, res) => {
        mail.getMailbox(req.params['mailbox'], req.query['page'])
        .subscribe(
            results => res.send(results),
            err => res.status(500).send(err)
        );
    });

    return router;
};
