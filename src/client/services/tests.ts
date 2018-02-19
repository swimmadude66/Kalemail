import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Rx';
import {TestResult} from '../models/tests';

@Injectable()
export class EmailTestsService {

    constructor(
        private _http: HttpClient
    ) {}

    createTest(mailId: number): Observable<string> {
        return this._http.post(`/api/tests/${mailId}`, null, {responseType: 'text'});
    }

    getTestResults(testId: string): Observable<TestResult[]> {
        return this._http.get<TestResult[]>(`/api/tests/${testId}`);
    }
}
