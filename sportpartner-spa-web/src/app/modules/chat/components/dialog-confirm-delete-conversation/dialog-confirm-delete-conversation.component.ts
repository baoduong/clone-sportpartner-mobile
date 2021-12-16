import { ConversationListModel } from 'src/models/conversation-list.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, filter, map, distinctUntilChanged } from 'rxjs/operators';
import * as chatActions from '../../store/chat.actions';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-dialog-confirm-delete-conversation',
  templateUrl: './dialog-confirm-delete-conversation.component.html',
  styleUrls: ['./dialog-confirm-delete-conversation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationToggleDialogConfirm', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.3s ease', style({ opacity: 0 })),
      ])
    ])]
})
export class DialogConfirmDeleteConversationComponent implements OnInit {

  currentConversation$ = new BehaviorSubject<ConversationListModel>(undefined);
  destroy = new Subject();
  @Output() toggleDialogDeleted = new EventEmitter(false);
  constructor(
    private store: Store<{
      profileReducer,
      chatReducer
    }>,
    private appConfig: AppConfig
  ) {
    this.store.select(state$ => state$.chatReducer).pipe(
      takeUntil(this.destroy.asObservable()),
      filter(loaded => loaded.selectedConversation),
      map(loaded => loaded.selectedConversation),
      distinctUntilChanged(),
    ).subscribe(selectedConversation => {
      this.currentConversation$.next(selectedConversation);
    });
  }

  ngOnInit(): void {
  }

  toggleDialogDelete() {
    this.toggleDialogDeleted.emit();
  }

  deleteConversation() {
    this.store.dispatch(chatActions.deleteConversation({
      conversationId: this.currentConversation$.value.conversationId
    }));
    this.store.dispatch(chatActions.selectedConversationCompleted({
      conversation: undefined
    }));
    window.history.replaceState({}, 'Chat', `/${this.appConfig.config.culture}/chat`);
  }
}
