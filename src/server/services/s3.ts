import {Observable} from 'rxjs/Rx';
import {IStorageService} from './istorage';
import {ParsedMail} from '../models/parsedmail';
import {S3} from 'aws-sdk';
import * as uuid from 'uuid/v4';

export class S3StorageService implements IStorageService {
    public type = 's3';

    private s3: S3;

    constructor(
        private _bucketName: string,
        private _folder?: string,
        _region?: string,
        _awsaccesskey?: string,
        _awssecretkey?: string
    ) {
        let opts: S3.ClientConfiguration = {
            region: 'us-east-1'
        };
        if (_awsaccesskey) {
            opts.accessKeyId = _awsaccesskey;
        }
        if (_awssecretkey) {
            opts.secretAccessKey = _awssecretkey;
        }
        if (_region) {
            opts.region = _region;
        }
        this.s3 = new S3(opts);
    }

    public save(mail: ParsedMail): Observable<string> {
        let id = uuid();
        if (this._folder) {
            id = this._folder + '/' + id;
        }
        return Observable.create(observer => {
            this.s3.upload({Bucket: this._bucketName, Key: id, Body: JSON.stringify(mail)}, (err, data: S3.ManagedUpload.SendData) => {
                if (err) {
                    console.error(err);
                    observer.error(err);
                } else {
                    observer.next(`${data.Bucket}:::${data.Key}`);
                    observer.complete();
                }
            });
        });
    }

    public retrieve(location: string): Observable<ParsedMail> {
        const locationParts = location.split(':::');
        const bucket = locationParts[0];
        const key = locationParts[1];
        return Observable.create(observer => {
            this.s3.getObject({Bucket: bucket, Key: key}, (err, data: S3.GetObjectOutput) => {
                if (err) {
                    console.error(err);
                    observer.error(err);
                } else {
                    observer.next(JSON.parse(data.Body.toString()));
                    observer.complete();
                }
            });
        });
    }
}
