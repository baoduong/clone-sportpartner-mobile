import { EventEmitter } from '@angular/core';
import { Directive, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { delay } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { GroupService } from 'src/app/services/group.service';
import { GroupDetailModel } from 'src/models/group-detail.model';
import * as GroupActions from './store/group.actions';

@Directive({ selector: '[appLazyLoadGroupCardByIds]' })
export class LazyLoadGroupCardByIdsDirective implements OnInit {

    @Input() ids: number[];

    @Output() eventItems = new EventEmitter(true);

    constructor(private groupService: GroupService, private appConfig: AppConfig) { }

    ngOnInit() {
        this.groupService.getGroupsByIds({
            culture: this.appConfig.config.culture,
            languageCode: this.appConfig.config.language
        }, this.ids)
            .pipe(delay(1500))
            .subscribe(res => {
                this.eventItems.emit(res);
            });
    }
}
