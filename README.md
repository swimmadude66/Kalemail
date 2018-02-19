# Mailkatcher
Run this as an email server to save incoming emails in a testable, searchable way. Includes raw email format, as well as Email on Acid integration

## Installation

### Initialize Databse
The `scripts/sql/db-init.sql` file contains an init script which will create the necessary database and tables when run against a mysql instance. Alternatively, you can create a `mailkatcher-db.env` file containing the [environment variables needed by the Docker Mysql image](https://hub.docker.com/_/mysql/) and run `docker-compose up` to create 2 networked containers for the application. A `mailkatcher.env` file can also be created to pass environment variables to the app container.

### From Source
If you choose not to run using `docker-compose`, be sure to configure the app by either setting environment variables or creating a `.env` file at the project root with the environment variables defined inside. At a minimum, you will need to specify a storage location for both the emails and the email metadata.

These keys are:
```
DB_HOST=Host Of MySQL DB
DB_PORT=Database Port
DB_DATABASE=mailkatcher (or whatever you named it when running the init-script)
DB_USER=Login For Database User
DB_PASSWORD=Password For Database User

FILESYSTEM_ROOT=Accessible Folder for Email Storage
OR
S3_BUCKET=An S3 Bucket
S3_FOLDER=Optional subfolder of bucket
```

If you provide an S3 Bucket, you need to either run the app on a box with AWS IAM creds capable of accessing the bucket, or provide the creds in the environment variables:
```
S3_ACCESS=AKIAICFVECTHR56YNTGQ
S3_SECRET=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
S3_REGION=us-east-1
```

Once these variables are set:

1. Clone the project, and run `npm i`.
2. Run `npm run gulp`. This will build the code in to a `dist` directory.
3. Run `npm start` and navigate to `localhost:3000` or your host and the port configured by `NODE_PORT`. The SMTP server will be running on poty 25 unless overridden by `SMTP_PORT`.

## Email On Acid Integration
Mailkatcher supports litmus testing through a service called [EmailOnAcid](https://www.emailonacid.com/). To enable this feature, you need an Email on Acid account with API access. Simply add two keys to your environment variables:
```
EOAAPI=yourApiKey
EOAPASS=yourEmailOnAcidPassword
```

The "run test" buttons next to emails will now trigger litmus tests with your default test set. A link to the latest results will appear next to the button once the test is created.

## Email Forwarding
If you would like to use mailkatcher as an intermediary, without interfering with downstream smtp servers, provide an environment variable in the format:
```
FORWARD={"host":"yout.smtpserver.com", "port":<PORTNUM>, "secure":<true/false>}
```
This will forward the raw email to that server, and store a copy in mailkatcher
