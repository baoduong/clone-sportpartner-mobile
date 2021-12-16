import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharesLinkComponent } from './share-link/shares-link.component';
import { RouteAnimationsComponent } from '../shared/components/route-animations/route-animations.component';
import { GetSharesLinkResolver } from './share-link/shares-link.resolver';

const routes: Routes = [
  {
    path: '',
    component: SharesLinkComponent,
    /* data: {
      state: 'AnimationShareLink',
    }, */
    resolve: {
      data: GetSharesLinkResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharesLinkRoutingModule { }
