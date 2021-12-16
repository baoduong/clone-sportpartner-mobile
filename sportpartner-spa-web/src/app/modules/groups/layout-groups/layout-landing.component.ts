import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, query, group, animate, animateChild } from '@angular/animations';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-landing',
  templateUrl: './layout-landing.component.html',
  styleUrls: ['./layout-landing.component.scss'],
  animations: [
    trigger('routeAnimationsGroups', [
      transition('* => *', [
        group([
          query(':leave', [
            style({ opacity: 1 }), // From
            animate('0.5s ease-in-out', style({ opacity: 0 })) // To
          ], { optional: true }),
          query(':enter', [
            style({ opacity: 0 }), // From
            animate('0.5s ease-in-out', style({ opacity: 1 })), // to

          ], { optional: true })
        ]),
      ]),
    ])
    // animation triggers go here
  ]
})
export class LayoutLandingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet.activatedRouteData.state;
  }
}
