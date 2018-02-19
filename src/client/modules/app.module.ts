import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {MailboxService, MailService, EmailTestsService} from '../services';
import {MailResolver} from '../resolvers';
import {
    AppComponent,
    DashboardComponent,
    ResultsComponent,
    MailComponent,
    MailboxComponent
} from '../components/';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        CommonModule,
        RouterModule.forRoot(
            [
                {path: '', component: DashboardComponent},
                {path: 'mailbox/:mailbox', component: MailboxComponent},
                {path: 'mail/:emailId', component: MailComponent, resolve: {email: MailResolver}},
                {path: 'results/:testid', component: ResultsComponent},
                {path: '**', redirectTo: '/'}
            ]
        )
    ],
    declarations: [
        AppComponent,
        DashboardComponent,
        MailboxComponent,
        MailComponent,
        ResultsComponent
    ],
    providers: [
        MailService,
        MailboxService,
        MailResolver,
        EmailTestsService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
