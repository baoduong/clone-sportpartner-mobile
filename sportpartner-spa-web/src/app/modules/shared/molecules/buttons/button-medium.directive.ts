import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[appBtnCoral2]'
})
export class ButtonCoral2Directive {
  @HostBinding('class')
  elementClass = 'btn btn-coral-2';

  constructor() {
  }
}

@Directive({
  selector: '[appBtnAzure2]'
})
export class ButtonAzure2Directive {
  @HostBinding('class')
  elementClass = 'btn btn-azure-2';

  constructor() {
  }
}

@Directive({
  selector: '[appBtnAzure6]'
})
export class ButtonAzure6Directive {
  @HostBinding('class')
  elementClass = 'btn btn-azure-6';

  constructor() {
  }
}

@Directive({
  selector: '[appBtnOutlineAzure2]'
})
export class ButtonOutlineAzure2Directive {
  @HostBinding('class')
  elementClass = 'btn btn-outline-azure-2';

  constructor() {
  }
}
