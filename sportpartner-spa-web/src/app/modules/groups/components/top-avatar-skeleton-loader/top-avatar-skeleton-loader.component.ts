import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-top-avatar-skeleton-loader',
  templateUrl: './top-avatar-skeleton-loader.component.html',
  styleUrls: ['./top-avatar-skeleton-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopAvatarSkeletonLoaderComponent implements OnInit {

  @Input() topListImage: Array<any>;

  listAvatar = new BehaviorSubject<any>(null);

  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    this.profileService.getRecentMemberAvatar(this.topListImage).subscribe(res => {
      const avatars = res as Array<any>;
      this.listAvatar.next(avatars.map(a => a.avatar));
    });
  }
}
