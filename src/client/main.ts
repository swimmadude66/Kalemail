import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './modules/app.module';

const conf = {};

if (process.env.PROD_MODE) {
    enableProdMode();
    conf['preserveWhitespaces'] = false;
}

platformBrowserDynamic().bootstrapModule(AppModule, conf);
