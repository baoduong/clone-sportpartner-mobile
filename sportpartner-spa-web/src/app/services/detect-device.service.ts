import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { map, share, takeLast, distinctUntilChanged, last, distinct, debounceTime, filter } from 'rxjs/operators';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { BehaviorSubject } from 'rxjs';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { DeviceTypes } from '../const.enum';

@Injectable({ providedIn: 'root' })
export class DetectDeviceService {
    public deviceType$ = new BehaviorSubject<string>(DeviceTypes.mobile);
    public orientation$ = new BehaviorSubject<string>('portrait');

    wdWidth$ = new BehaviorSubject<number>(window.innerWidth);

    get deviceType() {
        return this.deviceType$.value;
    }

    constructor(
        mediaObserver: MediaObserver,
        breakpointObserver: BreakpointObserver) {
        mediaObserver.asObservable().pipe(
            distinctUntilChanged(),
            distinct(),
            debounceTime(100),
            map((changes: MediaChange[]) => {
                return changes.reduce(function (prev, current) {
                    return (prev.priority > current.priority) ? prev : current;
                });
            }),
            share()
        ).subscribe((mediaChange) => {
            switch (mediaChange.mqAlias) {
                case 'gt-lg':
                case 'lg':
                case 'md':
                case 'gt-xs':
                    this.deviceType$.next(DeviceTypes.desktop);
                    break;
                case 'lt-sm':
                case 'sm':
                    this.deviceType$.next(DeviceTypes.tablet);
                    break;
                case 'xs':
                    this.deviceType$.next(DeviceTypes.mobile);
                    break;
                default:
                    this.deviceType$.next(DeviceTypes.mobile);
                    break;
            }
        });

        const layoutChanges$ = breakpointObserver.observe([
            '(orientation: portrait)',
            '(orientation: landscape)',
            '(min-height: 500px)'
        ]);

        layoutChanges$
            .pipe(
                debounceTime(100)
            )
            .subscribe((result) => {
                for (const key in result.breakpoints) {
                    if (Object.prototype.hasOwnProperty.call(result.breakpoints, key)) {
                        const value = result.breakpoints[key];
                        if (!!value && window.innerWidth !== this.wdWidth$.value) {
                            const orientation = key.replace('orientation', '').replace(/\W/g, '');
                            this.orientation$.next(orientation);
                            this.wdWidth$.next(window.innerWidth);
                            break;
                        }
                    }
                }
                console.log('%c%s', 'color: #ffa640', 'orientation', this.orientation$.value);
                console.log('%c%s', 'color: #008acf', 'detect device type: ', this.deviceType$.value);

                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);

                console.log('%c⧭', 'color: #cc0088', 'Update vh');
            });
    }
}
