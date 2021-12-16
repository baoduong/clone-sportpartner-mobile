import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class PremiumService {

    public premiumInPage = new BehaviorSubject(true);

    constructor() { }
}
