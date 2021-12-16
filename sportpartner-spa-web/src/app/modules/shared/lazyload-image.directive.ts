import { Directive, HostBinding, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appImgLazyLoad]'
})
export class ImageLazyLoadDirective implements OnInit {
  @HostBinding('src')
  @Input() src = '';

  @HostBinding('class')
  elClass = 'init-lazyload';

  constructor(private el: ElementRef, private ren: Renderer2) { }

  ngOnInit() {
    const img = new Image();
    img.setAttribute('src', this.src);
    img.onload = () => {
      setTimeout(() => {
        this.ren.addClass(this.el.nativeElement, 'show');
      }, 500);
    };
  }
}
