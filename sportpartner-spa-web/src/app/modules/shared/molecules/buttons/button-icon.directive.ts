import { Directive, Input, HostBinding, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appBtnIconCoral2]',
})
export class ButtonCoral2IconDirective implements AfterViewInit {
  @Input() IconName;

  @HostBinding('class')
  elementClass = 'btn btn-coral-2';

  constructor(private ele: ElementRef, private ren: Renderer2) {

  }

  ngAfterViewInit() {
    const icon = this.ren.createElement('i');
    // this.ren.addClass(icon, 'mdi');
    this.ren.addClass(icon, this.IconName);
    this.ren.insertBefore(this.ele.nativeElement, icon, this.ele.nativeElement.firstChild);
  }
}

@Directive({
  selector: '[appBtnIconAzure2]',
})
export class ButtonAzure2IconDirective implements AfterViewInit {
  @Input() IconName;

  @HostBinding('class')
  elementClass = 'btn btn-azure-2';

  constructor(private ele: ElementRef, private ren: Renderer2) {

  }

  ngAfterViewInit() {
    const icon = this.ren.createElement('i');
    // this.ren.addClass(icon, 'mdi');
    this.ren.addClass(icon, this.IconName);
    this.ren.insertBefore(this.ele.nativeElement, icon, this.ele.nativeElement.firstChild);
  }
}
