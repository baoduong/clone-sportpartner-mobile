import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToggleNavigationBarService {
  public isShowNavigationBar = new BehaviorSubject(true);
  constructor() { }
}
