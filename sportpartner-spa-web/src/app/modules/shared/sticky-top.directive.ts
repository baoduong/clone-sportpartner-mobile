import { Directive, HostBinding, AfterViewInit } from '@angular/core';

@Directive({ selector: '[appStickyTop]' })
export class StickyTopDirective {

  @HostBinding('class')
  elementClass = 'sticky-on-top action';
  constructor() { }
}
