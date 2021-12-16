import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

const ITEMS_PER_LAZYLOAD = 4;

@Component({
  templateUrl: './discover-groups.component.html',
  styleUrls: ['./discover-groups.component.scss'],
  animations: [
    trigger('LoadMoreBtn', [
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.5s', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class DiscoverGroupsComponent implements OnInit, AfterViewInit, OnDestroy {

  objIds$: Observable<any>;

  otherGroupIds = [];

  groupInArea = [];

  @ViewChild('ortherGroupsContainer', { read: ViewContainerRef }) vcrOrtherGroupsContainer: ViewContainerRef;
  @ViewChild('groupInAreaContainer', { read: ViewContainerRef }) vcrGroupInAreaContainer: ViewContainerRef;
  @ViewChild('tplSkeleton') tplSkeleton: TemplateRef<any>;

  constructor(
    titleService: Title,
    translateService: TranslateService,
    private cd: ChangeDetectorRef,
    private store: Store<{ groupReducer: any }>,
  ) {
    /* const title = translateService.instant('Web-Group.DISCOVER.title');
    titleService.setTitle(title); */
    translateService.get('Web-Group.DISCOVER.title').subscribe(value => {
      titleService.setTitle(value);
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.store.select(state$ => state$.groupReducer)
      .pipe(
        distinctUntilChanged(),
        map(loaded => loaded.discoverGroupIds),
      )
      .subscribe(res => {

        this.otherGroupIds = [...res.ortherGroups];
        this.showSkeletonOtherGroup(this.otherGroupIds.splice(0, ITEMS_PER_LAZYLOAD));

        this.groupInArea = [...res.groupInArea];
        this.showSkeletonGroupInArea(this.groupInArea.splice(0, ITEMS_PER_LAZYLOAD));

        this.cd.detectChanges();
      }).unsubscribe(); // No need kept subscribe
  }

  ngOnDestroy() {
    this.vcrOrtherGroupsContainer.clear();
    this.vcrGroupInAreaContainer.clear();
  }

  loadMoreDiscoverGroup() {
    this.showSkeletonOtherGroup(this.otherGroupIds.splice(0, ITEMS_PER_LAZYLOAD));
    this.cd.markForCheck();
  }

  loadMoreGroupInArea() {
    this.showSkeletonGroupInArea(this.groupInArea.splice(0, ITEMS_PER_LAZYLOAD));
    this.cd.markForCheck();
  }

  showSkeletonOtherGroup(data) {
    const loaded = this.vcrOrtherGroupsContainer.createEmbeddedView(this.tplSkeleton, { list: data });
    loaded.detectChanges();
  }

  showSkeletonGroupInArea(data) {
    const loaded = this.vcrGroupInAreaContainer.createEmbeddedView(this.tplSkeleton, { list: data });
    loaded.detectChanges();
  }
}
