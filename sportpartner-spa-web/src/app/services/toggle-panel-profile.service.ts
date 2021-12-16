import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PanelType } from '../const.enum';

@Injectable({
  providedIn: 'root'
})
export class ToggleSidePanelChatDetail {
  public isShowPanel$ = new BehaviorSubject(false);
  public panelType$ = new BehaviorSubject<string>(PanelType.USER_PROFILE);

  IdPanel = '';

  set setIdPanel(id: string) {
    this.IdPanel = id;
  }
  get idPanel() {
    return this.IdPanel;
  }
  constructor() { }
}
