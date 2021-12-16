import { GroupGuard } from './guards/groups.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlMatchResult, UrlSegment } from '@angular/router';
import { StartGroupComponent } from './start-group/start-group.component';
import { StartGroupGuard } from './guards/start-group-guard.guard';
import { RouterGuard } from './guards/router-guard.guard';

// Define routing for all soure
const routes: Routes = [
  {
    path: ':culture',
    canActivateChild: [RouterGuard],
    children: [
      {
        path: 'start-groups',
        component: StartGroupComponent,
      },
      {
        path: 'group',
        loadChildren: () => import('./modules/groups/groups.module').then(m => m.GroupsModule),
        canActivate: [StartGroupGuard, GroupGuard],
      },
      {
        path: 'members',
        loadChildren: () => import('./modules/members/members.module').then(m => m.MembersModule),
        canActivate: [StartGroupGuard]
      },
      {
        path: 'chat', loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule),
        canActivate: [StartGroupGuard]
      },
      {
        path: 'shares', loadChildren: () => import('./modules/shares-link/shares-link.module').then(m => m.SharesLinkModule),
        canActivate: [StartGroupGuard]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
