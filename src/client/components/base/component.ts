import {OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

export class BaseSubscriberComponent implements OnDestroy{

    private _subscriptions:Subscription[] = [];

    ngOnDestroy(): void {
        this.cleanSubscriptions();
    }

    addSubscription(sub: Subscription): void {
        this._subscriptions.push(sub);
    }

    cleanSubscriptions(): void {
        this._subscriptions.forEach(s => {
            if (s.unsubscribe) {
                s.unsubscribe();
            }
        });
        this._subscriptions = [];
    }

    getSubscriptions(): Subscription[] {
        return this._subscriptions;
    }
}
