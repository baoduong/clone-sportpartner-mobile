import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingGroupsComponent } from './landing-groups/landing-groups.component';
import { YourGroupsComponent } from './your-groups/your-groups.component';
import { DiscoverGroupsComponent } from './discover-groups/discover-groups.component';
import { RouteAnimationsComponent } from '../shared/components/route-animations/route-animations.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { GroupDetailResolver } from './group-detail/group-detail.resolver';
import { GetGroupCardLandingResolver } from './landing-groups/landing-group.resolver';
import { LatestMessageResolver } from './landing-groups/latest-message.resolver';
import { YourGroupsResolver } from './your-groups/your-groups.resolver';
import { DiscoveredGroupIdsResolver } from './discover-groups/discover-group-ids.resolver';

const routes: Routes = [
  {
    path: '',
    component: LandingGroupsComponent,
    data: {
      state: 'AnimationLanding',
    },
    resolve: {
      data: GetGroupCardLandingResolver,
      latestMsg: LatestMessageResolver
    },
  },
  {
    path: 'your-groups',
    component: YourGroupsComponent,
    data: { state: 'AnimationYourGroup' },
    resolve: {
      data: YourGroupsResolver
    }
  },
  {
    path: 'discover-groups',
    component: DiscoverGroupsComponent,
    data: { state: 'AnimationDiscoverGroup' },
    resolve: {
      data: DiscoveredGroupIdsResolver,
    }
  },
  {
    path: ':sport/:city',
    component: GroupDetailComponent,
    data: {
      state: 'AnimationGroupDetail',
    },
    resolve: {
      data: GroupDetailResolver,
      // listMember: ListMemberResolver
    }
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  providers: [
    GroupDetailResolver
  ]
})
export class LandingRoutingModule { }
