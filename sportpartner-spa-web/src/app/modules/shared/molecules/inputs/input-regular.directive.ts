import { Directive, HostBinding } from '@angular/core';

@Directive({ selector: '[appInputRegular]' })
export class InputRegularDirective {
  @HostBinding('class')
  elementClass = 'form-control regular-text-field';

  constructor() { }
}
