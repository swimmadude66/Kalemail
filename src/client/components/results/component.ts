import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BaseSubscriberComponent} from '../base/component';
import {TestResult} from '../../models/tests';
import {EmailTestsService} from '../../services/tests';


@Component({
    selector: 'results',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class ResultsComponent extends BaseSubscriberComponent implements OnInit {

    testId: string;
    results: TestResult[];

    error: string;
    processing = true;

    constructor (
        private _test: EmailTestsService,
        private _route: ActivatedRoute
    ){
        super();
    }

    ngOnInit() {
        this.testId = this._route.snapshot.paramMap.get('testid');
        this.addSubscription(
            this._test.getTestResults(this.testId)
            .subscribe(
                results => {
                    this.processing = false;
                    this.results = results;
                },
                err => {
                    console.error(err);
                    this.error = err.toString();
                    this.processing = false;
                }
            )
        );
    }
}
