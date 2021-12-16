import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { transition, style, animate, trigger } from '@angular/animations';
import { RouterStateService } from 'src/app/services/router-state.service';
import { Router } from '@angular/router';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'app-heading',
  templateUrl: './heading.component.html',
  styleUrls: ['./heading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('leaveHeading', [
      transition(':leave', [
        style({ opacity: 1 }), // From
        animate('0.5s ease-out', style({ opacity: 0 })), // To
      ])
    ])
  ]
})
export class HeadingComponent implements OnInit, AfterViewInit {
  @ViewChild('stickTop') stickTop: ElementRef;

  constructor(private ren: Renderer2,
    private router: Router,
    private routerStateService: RouterStateService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // this.ren.addClass(this.stickTop.nativeElement, 'action');
    }, 500);
  }

  back() {
    this.router.navigate([`${this.routerStateService.getPreviousUrl()}`]);
  }
}
