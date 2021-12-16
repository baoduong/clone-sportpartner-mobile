import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-statictis-item',
  templateUrl: './statictis-item.component.html',
  styleUrls: ['./statictis-item.component.scss']
})
export class StatictisItemComponent implements OnInit {

  @Input() backgroundDesktop;
  @Input() backgroundMobile;

  totalMember = 4.326;
  totalMessage = 12.532;

  constructor() { }

  ngOnInit(): void {
  }

}
