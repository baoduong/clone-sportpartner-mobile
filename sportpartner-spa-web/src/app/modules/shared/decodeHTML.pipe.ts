import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'decodeContent'
})

export class DecodeHTMLPipe implements PipeTransform {
    transform(value: any, ...args: any[]): any {
        const txt = document.createElement('div');
        txt.innerHTML = value;
        return txt.textContent; // decodeURIComponent(txt.textContent);
    }
}
