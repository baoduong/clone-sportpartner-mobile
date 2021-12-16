import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MembersRoutingModule } from './members-routing.module';
import { MembersComponent } from './members.component';
import { SharedModule } from '../shared/shared.module';
import { MembersProfileComponent } from './members-profile/members-profile.component';
import { TypingMessageComponent } from './components/typing-message/typing-message.component';


@NgModule({
  declarations: [
    MembersComponent,
    MembersProfileComponent,
    TypingMessageComponent
  ],
  imports: [
    CommonModule,
    MembersRoutingModule,
    SharedModule
  ]
})
export class MembersModule { }
