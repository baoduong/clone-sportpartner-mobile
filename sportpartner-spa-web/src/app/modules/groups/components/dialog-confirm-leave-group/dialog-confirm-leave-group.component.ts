import { AppConfig } from 'src/app/app.config';
import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { state, style, trigger, transition, animate } from '@angular/animations';
import { DeviceTypes } from 'src/app/const.enum';
@Component({
  selector: 'app-dialog-confirm-leave-group',
  templateUrl: './dialog-confirm-leave-group.component.html',
  styleUrls: ['./dialog-confirm-leave-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('ClosingDialog', [
      state('mobileClosing', style({
        'bottom': '-100vh'
      })),
      state('desktopClosing', style({
        'opacity': 0
      })),
      transition('* => mobileClosing', [
        animate('0.3s')
      ]),
      transition('* => desktopClosing', [
        animate('0.3s')
      ])
    ])
  ]
})
export class DialogConfirmLeaveGroupComponent implements OnInit {
  @Output() confirmedLeavesGroup: EventEmitter<boolean> = new EventEmitter();
  @Output() listenningIsLeavingGroup = new BehaviorSubject<boolean>(false);
  @Input() isShowing = true;

  stateAnimation = '';

  constructor(private detectDevice: DetectDeviceService,
    private appConfig: AppConfig) { }

  ngOnInit(): void {
  }

  closeDialog() {
    if (this.appConfig.config.deviceType$.value === DeviceTypes.desktop) {
      this.stateAnimation = 'desktopClosing';
    } else {
      this.stateAnimation = 'mobileClosing';
    }

    setTimeout(() => {
      this.listenningIsLeavingGroup.next(false);
      this.stateAnimation = '';
    }, 350);
  }

  leaveGroup() {
    this.confirmedLeavesGroup.next(true);
  }
}
