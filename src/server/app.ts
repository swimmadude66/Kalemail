import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import {readFileSync} from 'fs';
import {minify} from 'html-minifier';
import * as http from 'http';
import * as https from 'https';
import * as libqp from 'libqp';
import * as morgan from 'morgan';
import {createTransport, Transporter} from 'nodemailer';
import {join} from 'path';
import {Subject} from 'rxjs/Rx';
import {Session, SMTPServer} from 'smtp-server';
import {Readable} from 'stream';
import {
    DatabaseService,
    EmailOnAcidService,
    EmailParser,
    MailService,
    IStorageService,
    FileSystemStorageService,
    S3StorageService
} from './services';
import {ParsedMail} from './models/parsedmail';
import {AppConfig, EnvironmentConfig} from './config';

dotenv.config({silent: true});

const ENVIRONMENT_CONFIG: EnvironmentConfig = {
    environment: process.env.ENVIRONMENT || 'dev',
    httpport: process.env.NODE_PORT || 3000,
    smtpport: process.env.SMTP_PORT || 25,
    log_level: process.env.MORGAN_LOG_LEVEL || 'short',
    https: process.env.HTTPS || false,
    forwardAddress: (process.env.FORWARD ? JSON.parse(process.env.FORWARD) : undefined),
    fileSystemStorageRoot: process.env.FILESYSTEM_ROOT,
    s3Bucket: process.env.S3_BUCKET,
    s3Folder: process.env.S3_FOLDER,
    s3AccessKey: process.env.S3_ACCESS || process.env.AWS_ACCESS_KEY_ID,
    s3SecretKey: process.env.S3_SECRET || process.env.AWS_SECRET_ACCESS_KEY,
    s3Region: process.env.S3_REGION,
    emailOnAcidApiKey: process.env.EOAAPI,
    emailOnAcidPass: process.env.EOAPASS
};

const app = express();

app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan(ENVIRONMENT_CONFIG.log_level));

let server;
if (ENVIRONMENT_CONFIG.https) {
    let ssl_config = {
        key: process.env.SSLKEY ? tryLoad(process.env.SSLKEY) : undefined,
        cert: process.env.SSLCERT ? tryLoad(process.env.SSLCERT) : undefined,
        ca: process.env.SSLCHAIN ? tryLoad(process.env.SSLCHAIN) : undefined,
        pfx: process.env.SSLPFX ? tryLoad(process.env.SSLPFX) : undefined,
        passphrase: process.env.SSLPASS || undefined
    };
    server = https.createServer(ssl_config, app);
    const redir = express();
    redir.get('*', (req, res, next) => {
        let httpshost = `https://${req.headers.host}${req.url}`;
        return res.redirect(httpshost);
    });
    redir.listen(80);
} else {
    server = http.createServer(app);
}

const db = new DatabaseService();
let storage: IStorageService;

if (ENVIRONMENT_CONFIG.s3Bucket && ENVIRONMENT_CONFIG.s3Bucket.length) {
    try {
        storage = new S3StorageService(
            ENVIRONMENT_CONFIG.s3Bucket,
            ENVIRONMENT_CONFIG.s3Folder,
            ENVIRONMENT_CONFIG.s3Region,
            ENVIRONMENT_CONFIG.s3AccessKey,
            ENVIRONMENT_CONFIG.s3SecretKey
        );
    } catch (e) {
        console.error('Could not connect to S3 with provided creds');
    }
} else {
    console.error('Please provide S3 credentials!');
    process.exit(1);
}


const mailservice = new MailService(storage, db);

const APP_CONFIG: AppConfig = {
    EnvironmentConfig: ENVIRONMENT_CONFIG,
    MailService: mailservice,
    Database: db
};

let forward_transporter: Transporter;
if (ENVIRONMENT_CONFIG.forwardAddress) {
    const port = ENVIRONMENT_CONFIG.forwardAddress.port || 587;
    forward_transporter = createTransport({
        host: ENVIRONMENT_CONFIG.forwardAddress.host,
        port,
        secure: ENVIRONMENT_CONFIG.forwardAddress.secure || (port === 465), // true for 465, false for other ports
        auth: ENVIRONMENT_CONFIG.forwardAddress.auth || undefined
    });
}


/* Email Handler */
const mailSubject = new Subject<ParsedMail>();
// The subject lets us debounce on the fly
mailSubject
.distinct(m => m.messageId && m.RCPTO)
.subscribe(
    mail => {
        if (mail.html) {
            mail.html = minify(mail.html, {collapseWhitespace: true, minifyCSS: true, minifyJS: true});
        }
        mailservice.saveMail(mail.RCPTO, mail)
        .subscribe(
            _ => console.log('mail saved')
        );
    }
);

// Default smtp settings
let smtpSettings: any = {
    logger: true,
    name: 'kalemail-server',
    disableReverseLookup: true,
    disabledCommands: ['AUTH'],
};

if (process.env.SMTP_SETTINGS) {
    try {
        smtpSettings = JSON.parse(process.env.SMTP_SETTINGS);
    } catch (e) {
        smtpSettings = {};
        console.log('Could not parse smtp settings');
    }
}

const smtpServer = new SMTPServer({
    ...smtpSettings,
    onData: (stream: Readable, session: Session, callback) => {
        const parser = new EmailParser();
        const rcp = session.envelope.rcptTo.map(t => t.address);
        parser.parseStream(stream)
        .then(
            rawEmail => {
                const mail: ParsedMail = parser.parseBuffer(rawEmail);
                mailSubject.next({...mail, RCPTO: rcp})
                if (forward_transporter) {
                    const decodedMail = libqp.decode(rawEmail, {lineLength: false});
                    forward_transporter.sendMail({
                        envelope: {
                            from: session.envelope.mailFrom.address,
                            to: rcp
                        },
                        messageId: mail.messageId,
                        raw: decodedMail
                    }, (err, info) => {
                        if (err) {
                            console.error(err);
                        }
                        if (info) {
                            console.log(info);
                        }
                    });
                }
                callback();
            },
            err => {
                console.error(err);
                callback(err);
            }
        );

    }
});

/*-------- API --------*/
app.use('/api', require('./routes/api')(APP_CONFIG));

/*------- Angular client on Root ------- */
app.set('view engine', 'html');
app.use(express.static(join(__dirname, '../client')));
app.get('/*', function (req, res) {
    return res.sendFile(join(__dirname, '../client/index.html'));
});

app.all('*', function (req, res) {
    return res.status(404).send('404 UNKNOWN ROUTE');
});

server.listen(ENVIRONMENT_CONFIG.httpport);
smtpServer.listen(ENVIRONMENT_CONFIG.smtpport);

console.log('API live on port', ENVIRONMENT_CONFIG.httpport);
console.log('SMTP live on port', ENVIRONMENT_CONFIG.smtpport);

module.exports = server;

function tryLoad(filePath: string): any {
    if (!filePath || !filePath.length) {
        return undefined;
    }
    try {
        return readFileSync(filePath);
    } catch (err) {
        console.log('Could not load', filePath);
        return undefined;
    }
}
