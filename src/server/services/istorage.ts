import {Observable} from 'rxjs/Rx';
import {ParsedMail} from '../models/parsedmail';

export interface IStorageService {
    type: string;

    save(mail: ParsedMail): Observable<string>;
    retrieve(location: string): Observable<ParsedMail>;
}
