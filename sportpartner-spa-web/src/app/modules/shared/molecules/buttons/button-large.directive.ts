import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[appBtnCoral2Large]'
})
export class ButtonCoral2LargeDirective {
  @HostBinding('class')
  elementClass = 'btn btn-large btn-coral-2';

  constructor() {
  }
}

@Directive({
  selector: '[appBtnAzure2Large]'
})
export class ButtonAzure2LargeDirective {
  @HostBinding('class')
  elementClass = 'btn btn-large btn-azure-2';

  constructor() {
  }
}
