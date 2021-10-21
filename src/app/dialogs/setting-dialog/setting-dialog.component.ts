import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder} from "@angular/forms";
import {AngularFirestore} from '@angular/fire/firestore';
import {MainService} from "../../core/services/main.service";
import {SettingsService} from "../../core/services/settings.service";

@Component({
  selector: 'app-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.css']
})
export class SettingDialogComponent implements OnInit {
  selected_dialog_title: any = '';
  arrays: any = [];
  positions: any = [];
  clients: any = [];
  data: any = '';
  idata: any = '';
  label_input: any = '';

  show_button: boolean = false;
  alert_message: boolean = false;

  @ViewChild("arr") arr: ElementRef;

  constructor(public dialogRef: MatDialogRef<SettingDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public msg: any,
              private main: MainService,
              private sett: SettingsService) {
  }

  ngOnInit(): void {
    this.selected_dialog_title = this.msg.action || '';
    switch (this.msg.id) {
      case 1:
        this.label_input = 'Enter Blood Type';
        this.getBloodTypes();
        break;
      case 2:
        this.label_input = 'Enter Position';
        this.getPositions();
        break;
      case 3:
        this.label_input = 'Enter Client';
        this.getClients();
        break;
      default:
        this.label_input = '';
        break;
    }
  }

  clearData() {
    this.data = '';
    this.idata = '';
    this.show_button = false;
    this.alert_message = false;
  }

  bindData(data: any, i: any) {
    this.data = data;
    this.idata = i;
    this.show_button = true;
  }

  showAlert(data: any, x: any) {
    this.data = data;
    this.idata = x;
    this.alert_message = true;
  }


  saveData(x: any) {
    let doc = this.msg.id == 1 ? 'blood-type' : this.msg.id === 2 ? 'positions' : this.msg.id === 3 ? 'clients' : '';
    let key = this.msg.id == 1 ? 'bloodtypes' : this.msg.id === 2 ? 'position' : this.msg.id === 3 ? 'clients' : '';
    let msg = x === 'add' ? 'Added' : x === 'update' ? 'Updated' : x === 'delete' ? 'Removed' : '';
    const array_now = this.arrays;

    if (x === 'add') {
      array_now.push(this.data);
    } else if (x === 'update') {
      array_now.splice(this.idata, 1, this.data);
    } else if (x === 'delete') {
      array_now.splice(this.idata, 1);
    }

    this.main.updateCategories(doc, array_now, key).then((resolve: any) => {
      this.sett.snackbar(msg + ' Successfully!', 'X', 1000, 'green-snackbar');
      this.clearData();
    }).catch((error: any) => {
      this.sett.snackbar(msg + ' Failed!', 'X', 1000, 'red-snackbar');
    })
  }

// **************************** Categories

  getBloodTypes() {
    this.main.getBloodType().subscribe((result: any) => {
      this.arrays = result ? result.bloodtypes : [];
      this.arrays.sort();
    })
  }

  getPositions() {
    this.main.getPositions().subscribe((result: any) => {
      this.arrays = result ? result.position : [];
      this.arrays.sort();
    })
  }

  getClients() {
    this.main.getClients().subscribe((result: any) => {
      this.arrays = result ? result.clients : [];
      this.arrays.sort();
    })
  }

}
