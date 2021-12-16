import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupDetailModel } from 'src/models/group-detail.model';
import { AppConfig } from 'src/app/app.config';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-group-card-item',
  templateUrl: './group-card-item.component.html',
  styleUrls: ['./group-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toggleShowGroupCard', [
      transition(':enter', [
        style({ opacity: 0 }), // From
        animate('0.3s ease', style({ opacity: 1 })), // to
      ]),
      transition(':leave', [
        style({ opacity: 1 }), // From
        animate('0.1s ease', style({ opacity: 0 })), // to
      ]),
    ])
  ]
})
export class GroupCardItemComponent implements OnInit {

  @Input() groupDetail: GroupDetailModel;

  constructor(private router: Router, private route: ActivatedRoute, private appConfig: AppConfig) { }

  ngOnInit(): void { }

  goDetaiGroup() {
    this.router.navigateByUrl(`${this.appConfig.config.culture}/group/${this.groupDetail.urlPathSport}/${this.groupDetail.urlPathCity}`);
  }

}
