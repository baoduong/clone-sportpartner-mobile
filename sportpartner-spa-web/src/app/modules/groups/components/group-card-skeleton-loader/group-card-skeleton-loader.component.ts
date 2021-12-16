import { Component, OnInit, Input } from '@angular/core';
import { GroupService } from 'src/app/services/group.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-group-card-skeleton-loader',
  templateUrl: './group-card-skeleton-loader.component.html',
  styleUrls: ['./group-card-skeleton-loader.component.scss']
})
export class GroupCardSkeletonLoaderComponent implements OnInit {

  @Input() listIds;

  groupsData$ = new BehaviorSubject<any>([]);

  constructor(
    private groupService: GroupService
  ) { }

  ngOnInit(): void {
    this.groupsData$.next(new Array(this.listIds.length));
  }

  finishingLoadingGroupCard(data) {
    this.groupsData$.next(data);
  }

}
