import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './groups-routing.module';

import { SharedModule } from '../shared/shared.module';
import { LayoutLandingComponent } from './layout-groups/layout-landing.component';
import { CarouselItemComponent } from './components/carousel-item/carousel-item.component';
import { GroupCardItemComponent } from './components/group-card-item/group-card-item.component';
import { RecentMessageItemComponent } from './components/recent-message-item/recent-message-item.component';
import { LandingGroupsComponent } from './landing-groups/landing-groups.component';
import { QuickSearchGroupComponent } from './components/quick-search-group/quick-search-group.component';
import { BannerInviteFriendsComponent } from './components/banner-invite-friends/banner-invite-friends.component';
import { YourGroupsComponent } from './your-groups/your-groups.component';
import { LoadingIconComponent } from './components/loading-icon/loading-icon.component';
import { BannerCuriousMoreGroupsComponent } from './components/banner-curious-more-groups/banner-curious-more-groups.component';
import { DiscoverGroupsComponent } from './discover-groups/discover-groups.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { SendMessageComponent } from './components/send-message/send-message.component';
import { TopAvatarSkeletonLoaderComponent } from './components/top-avatar-skeleton-loader/top-avatar-skeleton-loader.component';
import { ListMemberComponent } from './components/list-member/list-member.component';
import { NoMessageItemComponent } from './components/no-message-item/no-message-item.component';
import { GetGroupCardLandingResolver } from './landing-groups/landing-group.resolver';
import { DialogConfirmLeaveGroupComponent } from './components/dialog-confirm-leave-group/dialog-confirm-leave-group.component';
import { StatictisItemComponent } from './components/statictis-item/statictis-item.component';
// import { ListMemberItemComponent } from '../shared/components/list-member-item/list-member-item.component';
import { RecentMemberComponent } from './components/recent-member/recent-member.component';
import { GroupCardSkeletonLoaderComponent } from './components/group-card-skeleton-loader/group-card-skeleton-loader.component';
import { DiscoveredGroupIdsResolver } from './discover-groups/discover-group-ids.resolver';
import { LazyLoadGroupCardByIdsDirective } from './lazyload-skeletion-groups.directive';

@NgModule({
  declarations: [
    LayoutLandingComponent,
    LandingGroupsComponent,
    CarouselItemComponent,
    GroupCardItemComponent,
    DiscoverGroupsComponent,
    RecentMessageItemComponent,
    QuickSearchGroupComponent,
    BannerInviteFriendsComponent,
    YourGroupsComponent,
    LoadingIconComponent,
    BannerCuriousMoreGroupsComponent,
    GroupDetailComponent,
    SendMessageComponent,
    TopAvatarSkeletonLoaderComponent,
    ListMemberComponent,
    NoMessageItemComponent,
    DialogConfirmLeaveGroupComponent,
    StatictisItemComponent,
    // ListMemberItemComponent,
    RecentMemberComponent,
    GroupCardSkeletonLoaderComponent,

    LazyLoadGroupCardByIdsDirective
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    SharedModule,
  ],
  providers: [
    GetGroupCardLandingResolver,
    DiscoveredGroupIdsResolver
  ]
})
export class GroupsModule { }
