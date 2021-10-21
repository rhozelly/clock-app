import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MainService} from "../../core/services/main.service";
import {TimesheetService} from "../../core/services/timesheet.service";
import {Form, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SettingsService} from "../../core/services/settings.service";
import {AlertMessageComponent} from "../../alert-message/alert-message.component";

@Component({
  selector: 'app-timesheets-dialog',
  templateUrl: './timesheets-dialog.component.html',
  styleUrls: ['./timesheets-dialog.component.css']
})
export class TimesheetsDialogComponent implements OnInit {
  clients: any = [];
  myID: any = '';
  timesheetForm: FormGroup;
  disableButton = false;
  currentProjects: any = [];
  projectDocumentId: any = [];

  constructor(public dialogRef: MatDialogRef<TimesheetsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public timesheet: any,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private main: MainService,
              private time: TimesheetService,
              private sett: SettingsService,
  ) {
    this.timesheetForm = this.fb.group({
      date: ['', Validators.required],
      updated_at: [new Date()],
      items: this.fb.array([this.createProjects()]),
    })
  }

  ngOnInit(): void {
    this.getClientsList();
    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.main.decrypt(collection_id, 'collection-id');
    if (this.timesheet.view === 'add') {

    } else if (this.timesheet.view === 'update') {
      const to_search_date = this.timesheet.data.date;
      const to_search_sub_collection = this.timesheet.data.date.toLocaleString('en-us', {month: 'short'}).toUpperCase() + '-' + this.timesheet.data.date.getFullYear();
      this.timesheetForm.get('date')?.setValue(to_search_date);
      this.getTimesheetByDate(this.myID, to_search_date, to_search_sub_collection)
    } else {
    }
  }

  getTimesheetByDate(id: any, date: any, sub_collection: any) {
    this.time.getTimesheetByDate(id, date, sub_collection).subscribe((result: any) => {
      this.projects.removeAt(this.projects.length - 1);
      this.currentProjects = [];
      this.currentProjects = result ? result : [];
      this.projects.clear();
      if (result) {
        this.countProjects(result);
      }
    })
  }


//  =======  Crud Function ======= //

  actionTimesheet() {
    if (this.timesheet.view === 'add') {
      if (this.timesheetForm.valid && this.timesheetForm.get('items')?.valid) {
        this.disableButton = true;
        let second_data;
        this.timesheetForm.get('items')?.value.forEach((val: any) => {
          second_data = {
            project: val.project,
            desc: val.desc,
            date: this.timesheetForm.get('date')?.value,
            time: val.time,
            updated_at: new Date(),
          }
          const sub_collection = second_data.date.toLocaleString('en-us', {month: 'short'}) + '-' + this.timesheetForm.get('date')?.value.getFullYear();
          this.time.addEmployeesTimesheet(this.myID, second_data, sub_collection.toUpperCase()).then(res => {
            this.dialogRef.close({action: 'success', from: 'add'});
          }).catch(error => {
            this.dialogRef.close('failed');
          })
        })
      } else {
        this.snack('All fields are required', 'X', 'red-snackbar');
        this.disableButton = false;
      }
    } else if (this.timesheet.view === 'update') {
      const sub_collection = this.timesheetForm.get('date')?.value;
      const collection = sub_collection.toLocaleString('en-us', {month: 'short'}).toUpperCase() + '-' + sub_collection.getFullYear();
      const array = this.timesheetForm.get('items')?.value ? this.timesheetForm.get('items')?.value : [];

      this.projects.clear();
      array.forEach((e: any, i: any) => {
        this.time.updateEmployeesTimesheet(this.myID, e, collection, this.projectDocumentId[i]).then(resolve => {
          this.dialogRef.close({action: 'success', from: 'update'});
          this.snack('Timesheet log updated!', 'X', 'green-snackbar');
        }).catch(error => {
          console.log('error:: ', error);
          this.dialogRef.close('failed');
          this.snack('Timesheet log update failed!', 'X', 'red-snackbar');
        })
      })
    }

  }

  removeProject() {
    const dialogRef = this.dialog.open(AlertMessageComponent, {
      disableClose: true,
      data: {action: 'timesheet', data: 'delete'}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === 'yes') {
        const items = this.timesheetForm.get('items')?.value ? this.timesheetForm.get('items')?.value : [];
        const sub_collection = this.timesheetForm.get('date')?.value.toLocaleString('en-us', {month: 'short'}) + '-' + this.timesheetForm.get('date')?.value.getFullYear();
        items.forEach((e: any, i: any) => {
          this.time.removeEmployeesTimesheet(this.myID, sub_collection.toUpperCase(), this.projectDocumentId[i]).then(resolve => {
            this.projects.clear();
            this.dialogRef.close('success');
            this.snack('Timesheet log deleted!', 'X', 'green-snackbar');
          }).catch(error => {
            console.log('error:: ', error);
            this.dialogRef.close('failed');
            this.snack('Timesheet log delete failed!', 'X', 'red-snackbar');
          })
        })
      }
    });
  }

  snack(m: any, a: any, c: any) {
    this.sett.snackbar(m, a, 2000, c);
  }

//  =======  Array List ======= //

  get projects() {
    return this.timesheetForm.get('items') as FormArray;
  }

  createProjects() {
    return this.fb.group({
      time: ['', Validators.required],
      desc: ['', Validators.required],
      project: ['', Validators.required],
    });
  }

  addItem() {
    this.projects.push(this.createProjects());
  }

  removeItem(i: any) {
    this.projects.removeAt(i);
  }

  countProjects(data: any) {
    data.forEach((e: any) => {
      this.projectDocumentId.push(e.payload.doc.id);
      this.patchProjects(e.payload.doc.data());
    });
  }

  patchProjects(data: any) {
    const control = this.timesheetForm.get('items') as FormArray;
    control.push(this.projectsRows(data));
  }

  projectsRows(data: any) {
    return this.fb.group({
      time: [data.time],
      desc: [data.desc],
      project: [data.project],
    });
  }

  getClientsList() {
    this.main.getClients().subscribe((result: any) => {
      this.clients = result ? result.clients : [];
    })
  }

}
