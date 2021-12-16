import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { TranslateService } from '@ngx-translate/core';

const TYPE_OVERLAY = {
    afterExpired: 'AfterExpired',
    almostExpired: 'AlmostExpired',
    specialOffer: 'SpecialOffer'
};

@Component({
    selector: 'app-overlay-expried',
    templateUrl: './overlay-expried.component.html',
    styleUrls: ['./overlay-expried.component.scss'],
    animations: [
        trigger('fadeOutOverLay', [
            transition(':leave', [
                style({ opacity: 1 }),
                animate('0.3s ease', style({ opacity: 0 }))
            ])
        ])
    ]
})
export class OverlayExpriedComponent {

    typeShowOverlay: string;
    mounthPeriod = 3;
    rootDomain: string;

    myProfile: MemberProfileModel;

    paymentSource = {
        almostExpired: 'PaymentBeforeExpirationOverlay',
        afterExpired: 'PaymentAfterExpirationOverlay',
        specialOffer: 'SpecialOfferPage'
    };

    constructor(
        private store: Store<{ profileReducer: any }>,
        private cookieService: CookieService,
        private appConfig: AppConfig,
        private translateService: TranslateService
    ) {
        const temp = location.host.split('.').reverse();
        this.rootDomain = '.' + temp[1] + '.' + temp[0];
        this.store.pipe(
            select(state$ => state$.profileReducer),
            map(loaded => loaded.myMemberProfile),
            filter(loaded => !!loaded),
            filter((loaded: MemberProfileModel) => loaded.offerOverlay && loaded.offerOverlay !== null),
            filter((loaded: MemberProfileModel) => {
                switch (loaded.offerOverlay.type) {
                    case TYPE_OVERLAY.afterExpired:
                        return !this.cookieService.check('.sp-shown-after-payment-expire-overlay');
                    case TYPE_OVERLAY.almostExpired:
                        return !this.cookieService.check('.sp-shown-before-payment-expire-overlay');
                    case TYPE_OVERLAY.specialOffer:
                        return !this.cookieService.check('.sp_show_overlay_special_offer');
                    default:
                        return false;
                }
            }),
            first()
        ).subscribe((myProfile: MemberProfileModel) => {
            this.myProfile = myProfile;

            switch (myProfile.offerOverlay.type) {
                case TYPE_OVERLAY.specialOffer:
                    this.showOverlaySpecialOffer();
                    break;
                case TYPE_OVERLAY.afterExpired:
                    this.showOverlayAfterExpire();
                    break;
                case TYPE_OVERLAY.almostExpired:
                    this.showOverlayAlmostExpire();
                    break;
                default:
                    break;
            }
        });
    }

    showOverlaySpecialOffer() {
        if (this.cookieService.check('.sp_show_overlay_special_offer')) {
            this.typeShowOverlay = null;
        } else {
            this.typeShowOverlay = TYPE_OVERLAY.specialOffer;
            document.body.style.overflow = 'hidden';
        }
    }

    showOverlayAfterExpire() {
        if (this.cookieService.check('.sp-shown-after-payment-expire-overlay')) {
            this.typeShowOverlay = null;
        } else {
            this.typeShowOverlay = TYPE_OVERLAY.afterExpired;
            document.body.style.overflow = 'hidden';
        }
    }

    showOverlayAlmostExpire() {
        if (this.cookieService.check('.sp-shown-before-payment-expire-overlay')) {
            this.typeShowOverlay = null;
        } else {
            this.typeShowOverlay = TYPE_OVERLAY.almostExpired;
            document.body.style.overflow = 'hidden';
        }
    }

    closeOverlay(cookieName) {
        this.typeShowOverlay = null;
        document.body.style.removeProperty('overflow');
        this.cookieService.set(cookieName, this.myProfile.publicId, null, '/', this.rootDomain);
    }

    gotoPayment(paymentSource) {
        if (paymentSource === this.paymentSource.specialOffer) {
            window.location.replace(`${window.location.origin}/${this.appConfig.config.culture}/specialoffer/p1landing?src=${paymentSource}`);
        } else {
            window.location.replace(`${window.location.origin}/${this.appConfig.config.culture}/payment/checkout?src=${paymentSource}&expireMonths=${this.mounthPeriod}`);
        }
    }

    gotoMatch() {
        window.location.replace(`${window.location.origin}/${this.appConfig.config.culture}/matches`);
    }
}
