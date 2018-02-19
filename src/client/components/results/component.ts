import {Component, OnInit} from '@angular/core';
import {TestResult} from '../../models/tests';
import {ActivatedRoute} from '@angular/router';
import {EmailTestsService} from '../../services/tests';


@Component({
    selector: 'results',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class ResultsComponent implements OnInit {

    testId: string;
    results: TestResult[];

    error: string;
    processing = true;

    constructor (
        private _test: EmailTestsService,
        private _route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.testId = this._route.snapshot.paramMap.get('testid');
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
        );
    }
}
