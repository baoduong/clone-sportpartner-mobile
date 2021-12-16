import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-module-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  loading: boolean;

  constructor(
    private loaderService: LoaderService
  ) {
    this.loaderService.isLoading.subscribe((v) => {
      this.loading = v;
    });
  }

  ngOnInit(): void {
  }

}
