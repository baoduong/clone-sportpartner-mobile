import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
export interface ContentItems {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-shares-link-icon-content-item',
  templateUrl: './icon-content-item.component.html',
  styleUrls: ['./icon-content-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconContentItemComponent implements OnInit {

  @Input() item: ContentItems;

  constructor() { }

  ngOnInit(): void {

  }

}
