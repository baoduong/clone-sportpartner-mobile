import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-start-group-slider-item',
  templateUrl: './start-group-slider-item.component.html',
  styleUrls: ['./start-group-slider-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartGroupSliderItemComponent implements OnInit {

  @Input() IconName = '';
  @Input() Title = '';
  @Input() Content = '';

  constructor() { }

  ngOnInit(): void {
  }

}
