import {Observable} from 'rxjs/Rx';
import {IStorageService} from './istorage';
import {ParsedMail} from '../models/parsedmail';
import {readFile, writeFile, existsSync, accessSync, constants} from 'fs';
import {join} from 'path';
import * as uuid from 'uuid/v4';

export class FileSystemStorageService implements IStorageService {
    public type = 'FileSytem';

    constructor (
        private baseDir: string
    ) {
        if (!this._canAccess(baseDir)) {
            throw(new Error(`Cannot access ${baseDir}`));
        }
    }


    save(mail: ParsedMail): Observable<string> {
        const id = uuid();
        const fpath = join(this.baseDir, id).replace(/\\/g, '/');
        return Observable.create(
            observer => {
                writeFile(fpath, JSON.stringify(mail), (err) => {
                    if (err) {
                        observer.error(err);
                    } else {
                        observer.next(fpath);
                        observer.complete();
                    }
                });
            }
        );
    }

    retrieve(location: string): Observable<ParsedMail> {
        return Observable.create(
            observer => {
                readFile(location, (err, data) => {
                    if (err) {
                        observer.error(err);
                    } else {
                        try {
                            observer.next(JSON.parse(data.toString()));
                            observer.complete();
                        } catch (error) {
                            observer.error(error);
                        }
                    }
                });
            }
        );
    }

    private _canAccess(dir: string) {
        return existsSync(dir) && accessSync(dir, constants.W_OK) && accessSync(dir, constants.R_OK);
    }
}
