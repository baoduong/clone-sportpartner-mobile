import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-list-chat-box-suggestion-item',
  templateUrl: './list-chat-box-suggestion-item.component.html',
  styleUrls: ['./list-chat-box-suggestion-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListChatBoxSuggestionItemComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
