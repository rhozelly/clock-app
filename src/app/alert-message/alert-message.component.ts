import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.css']
})
export class AlertMessageComponent implements OnInit {
  msgs: any = '';

  constructor(public dialog: MatDialogRef<AlertMessageComponent>,
              @Inject(MAT_DIALOG_DATA) public message: any) {
  }

  ngOnInit(): void {
    this.msgs = 'Are you sure you want to ' + this.message.data + ' this ' + this.message.action + ' ?';
  }

  action(action: any) {
    this.dialog.close(action);
  }


}
