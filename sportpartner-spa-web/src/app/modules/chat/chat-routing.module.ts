import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat.component';
import { GetFirstListConversationResolver } from './chat.resolver';

const routes: Routes = [
  {
    path: '', component: ChatComponent,
    data: { state: 'AnimationChat' },
    resolve: {
      data: GetFirstListConversationResolver
    }
  },
  {
    path: ':conversationId',
    component: ChatComponent,
    data: { state: 'AnimationChat' },
    resolve: {
      data: GetFirstListConversationResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
