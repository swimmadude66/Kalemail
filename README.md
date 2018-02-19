# Mailkatcher
Run this as an email server to save incoming emails in a testable, searchable way. Includes raw email format, as well as Email on Acid integration

## Installation
1. Clone the project, and run `npm i`. Additionally, you can create a file named `.env` in the project root now, in which you can set any local overrides for environment variables used in the app.
2. Run `npm run gulp`. This will build the code in to a `dist` directory.
3. Run `npm start` and navigate to `localhost:3000` or your host and the port configured by `NODE_PORT`. The SMTP server will be running on poty 25 unless overridden by `SMTP_PORT`.

## EMail On Acid Integration
Mailkatcher supports litmus testing through a service called [EmailOnAcid](https://www.emailonacid.com/). To enable this feature, you need an Email on Acid account with API access. Simply add two keys to your environment variables:
```
EOAAPI=yourApiKey
EOAPASS=yourEmailOnAcidPassword
```

The "run test" buttons next to emails will now trigger litmus tests with your default test set. A link to the latest results will appear next to the button once the test is created.

