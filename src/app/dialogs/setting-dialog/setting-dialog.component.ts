import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder} from "@angular/forms";
import {AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.css']
})
export class SettingDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SettingDialogComponent>,
              private fire: AngularFirestore,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public setting: any) { }

  ngOnInit(): void {
  }

}
