import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-icon',
  templateUrl: './loading-icon.component.html',
  styleUrls: ['./loading-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingIconComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
