import { Directive, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[appClickOutside]'
})
export class ClickOutSidetDirective {

    constructor(private _elementRef: ElementRef) { }

    @Output() clickOutside: EventEmitter<any> = new EventEmitter();

    firstClick = true;

    @HostListener('document:click', ['$event.target']) onMouseEnter(targetElement) {
        const clickedInside = this._elementRef.nativeElement.contains(targetElement);
        if (!clickedInside && !this.firstClick) {
            this.clickOutside.emit(null);
        }
        this.firstClick = false;
    }
}
