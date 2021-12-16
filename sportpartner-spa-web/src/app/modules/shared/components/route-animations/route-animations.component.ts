import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { trigger, style, query, transition, group, animate } from '@angular/animations';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-route-animations',
  templateUrl: './route-animations.component.html',
  styleUrls: ['./route-animations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('routeAnimations', [
      transition('* => *', [
        style({ position: 'relative' }),
        query(':enter, :leave', style({
          position: 'absolute',
          right: 0, left: 0, top: 0, bottom: 0,
          height: '100vh',
          // width: '100vw',
          // overflow: 'hidden',
        }), { optional: true }),
        query(':enter', [
          style({ opacity: 0 }), // From
          animate('0.5s ease-in', style({ opacity: 1 })), // to
        ], { optional: true }),
        query(':leave', [
          style({ opacity: 1 }), // From
          animate('0.3s ease-out', style({ opacity: 0 })), // To
        ], { optional: true }),

        // group([ ]),

      ]),
    ]),
  ]
})
export class RouteAnimationsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet.activatedRouteData.state;
  }

}
