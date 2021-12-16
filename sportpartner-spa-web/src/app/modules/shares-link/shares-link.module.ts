import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharesLinkRoutingModule } from './shares-link-routing.module';
import { SharesLinkComponent } from './share-link/shares-link.component';
import { SharedModule } from '../shared/shared.module';
import { IconContentItemComponent } from './components/icon-content-item/icon-content-item.component';
import { PortalModule } from '@angular/cdk/portal';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { GetSharesLinkResolver } from './share-link/shares-link.resolver';
@NgModule({
  declarations: [
    SharesLinkComponent,
    IconContentItemComponent
  ],
  imports: [
    CommonModule,
    SharesLinkRoutingModule,
    SharedModule,
    ClipboardModule,
    PortalModule
  ],
  providers: [
    GetSharesLinkResolver
  ]
})
export class SharesLinkModule { }
