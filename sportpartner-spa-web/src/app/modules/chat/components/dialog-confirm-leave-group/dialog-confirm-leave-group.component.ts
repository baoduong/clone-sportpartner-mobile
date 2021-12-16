import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppConfig } from 'src/app/app.config';
import { updateJoinGroupStatus } from 'src/app/modules/groups/store/group.actions';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-dialog-confirm-leave-group',
  templateUrl: './dialog-confirm-leave-group.component.html',
  styleUrls: ['./dialog-confirm-leave-group.component.scss'],
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
    ])
  ]
})
export class DialogConfirmLeaveGroupComponent implements OnInit {

  @Input() isShowDialog;
  @Input() groupId;
  @Output() isCloseDialog = new EventEmitter();
  @Output() confirmLeaveGroup = new EventEmitter();

  constructor(
    private appConfig: AppConfig,
    private store: Store<{}>,
    private route: Router,
    private loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.isCloseDialog.emit(false);
  }

  leaveGroup(groupId) {
    const params = {
      groupId: groupId,
      isJoining: false,
      languageCode: this.appConfig.config.language
    };
    this.store.dispatch(updateJoinGroupStatus({ payload: params }));
    this.loaderService.isLoading.next(false);
    this.isCloseDialog.emit(true);
    this.confirmLeaveGroup.emit(true);
  }

}
