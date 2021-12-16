import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MembersComponent } from './members.component';
import { LayoutComponent } from '../shared/components/layout/layout.component';
import { RouteAnimationsComponent } from '../shared/components/route-animations/route-animations.component';
import { MembersProfileComponent } from './members-profile/members-profile.component';
import { MemberProfileResolver } from './members-profile/members-profile.resolver';

const routes: Routes = [
  {
    path: ':userId',
    component: MembersProfileComponent,
    data: {
      state: 'AnimationMemberProfile',
      // hideNavMobile: true
    },
    resolve: {
      data: MemberProfileResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MembersRoutingModule { }
