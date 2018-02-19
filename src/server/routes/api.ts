import {Router} from 'express';
import {AppConfig} from '../config';

module.exports = (APP_CONFIG: AppConfig) => {
    const router = Router();

    router.use('/mail', require('./mail')(APP_CONFIG));
    router.use('/mailboxes', require('./mailboxes')(APP_CONFIG));
    router.use('/tests', require('./tests')(APP_CONFIG));

    return router;
};
