import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-carousel-item',
  templateUrl: './carousel-item.component.html',
  styleUrls: ['./carousel-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselItemComponent implements OnInit {
  @Input() type;
  @Input() text;
  @Input() number;

  iconType = {
    ['groups']: 'icon-medium-line-groups',
    ['discover']: 'icon-medium-line-location',
    ['memebers']: 'icon-medium-line-members',
    ['chat']: 'icon-medium-line-chat',
    ['premium']: 'icon-medium-line-premium',
    ['highFive']: 'icon-medium-line-high-five',
    ['like']: 'icon-medium-line-thumb',
  };

  constructor() {
  }

  ngOnInit(): void {
  }

  cssClass(type) {
    const classes = [];


    classes.push(this.iconType[type]);
    return classes.join(' ');
  }
}
