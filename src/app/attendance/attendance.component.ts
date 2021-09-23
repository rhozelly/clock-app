import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SettingsService} from "../core/services/settings.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AttendanceService} from '../core/services/attendance.service';
import * as moment from 'moment';
import {MainService} from "../core/services/main.service";
import { getLocaleTimeFormat } from '@angular/common';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent implements OnInit {
  formId: FormGroup;
  dateToday: any = new Date();
  yearNow: any = new Date().getFullYear();
  monthNow: any = new Date().toLocaleString('en-us', {month: 'short'});
  myID: any;
  code: any;
  lengthCode: number = 8;
  date: any = ('0' + (new Date().getMonth() + 1)).slice(-2) + '-' + new Date().getDate() + '-' + new Date().getFullYear();
  attendanceDate: boolean;
  alreadyLoggedIn: boolean;
  currentDocumentID: any;
  secondCollection: any;
  displayMomentAgo: any;

  constructor(private fb: FormBuilder,
              private router: Router,
              private sb: MatSnackBar,
              private attService: AttendanceService,
              private sett: SettingsService,
              private main: MainService,
  ) {
    this.formId = this.fb.group({ id: ['', null]});
    this.code = [];
    this.attendanceDate = false;
    this.alreadyLoggedIn = false;
    this.displayMomentAgo = [];
  }

  ngOnInit(): void {
    this.secondCollection = this.yearNow + '-' + this.monthNow.toUpperCase();
    this.checkAttendance(this.myID, this.secondCollection);
    this.formId.controls['id'].valueChanges.subscribe(input => {
      if (this.formId.controls['id'].value.length === 8) {
        this.checkAccId(input);
      }
    });
  }

  checkAttendance(id: any, subcollection: any) {
    this.attService.getAttendanceToday(id, subcollection).subscribe((results: any) => {
      results.map((result: any) => {
        const a = result.payload.doc.data().date_time.toDate();
        const timeout = result.payload.doc.data().time_out;
        this.currentDocumentID = result.payload.doc.id;
        const latestAttendanceStored = this.formatDate(a);
        this.attendanceDate = latestAttendanceStored === this.date;
        if (this.attendanceDate) {
          this.displayMomentAgo = moment(new Date(result.payload.doc.data().date_time.toDate())).fromNow();
          this.alreadyLoggedIn = timeout.length > 0;
        } else {
          this.alreadyLoggedIn = false;
          this.displayMomentAgo = [];
        }
      });
    })
  }

  formatDate(date: any) {
    return ('0' + (new Date(date).getMonth() + 1)).slice(-2) + '-' + new Date(date).getDate() + '-' + new Date(date).getFullYear();
  }

  checkCode() {
    if (this.code.length >= this.lengthCode) {
      const sub = this.yearNow + '-' + this.monthNow;
      this.attService.checkSubCollectionAttendance(this.code, sub.toUpperCase()).subscribe((queryShot: any) => {
        if (queryShot.docs.length > 0) {
          this.checkFieldDateAttendance(this.code, sub.toUpperCase());
        } else {
          this.openSnackBar('ID DOES NOT EXIST', 'x', 'red-snackbar')
        }
      });
    }
  }

  checkFieldDateAttendance(id: any, sub: any) {
    // const clock_in = moment(new Date()).format("h:mm A");
    const clock_in = new Date();
    const date_today = new Date().toLocaleDateString('sv-SE');
    this.attService.checkFieldDateAttendance(id, sub, date_today).subscribe((result: any) => {
      if (result.length > 0) {
        const value = result[0];
        const day_value = value.payload.doc.data().date_time.toDate().getDate();
        const timeout = value.payload.doc.data().time_out;
        this.currentDocumentID = value.payload.doc.id;
        if (day_value === new Date().getDate()) {
          if (timeout.length > 0) {
            this.attendanceDate = false;
            this.displayMomentAgo = '';
            this.openSnackBar('Already clocked out!', 'X', 'red-snackbar');
          } else {
            this.displayMomentAgo = moment(new Date(value.payload.doc.data().date_time.toDate())).fromNow();
            this.attendanceDate = true;
          }
        } else {
          this.attService.addAttendance(id, this.secondCollection, clock_in, new Date()).then(resolved => {
            if (resolved.id) {
              this.openSnackBar('Timed in!', 'X', 'green-snackbar');
              this.attService.updateRecentDate(this.dateToday, resolved.id, id).then(resolveRecent => {
              }).catch(errorRecent => {
              });
            }
          }).catch(error => {
            this.openSnackBar('Something went wrong!', 'X', 'red-snackbar');
          })
        }
      } else {
        this.attService.addAttendance(id, this.secondCollection, clock_in, new Date()).then(resolved => {
        if (resolved.id) {
          this.openSnackBar('Timed in!', 'X', 'green-snackbar');
          this.attService.updateRecentDate(this.dateToday, resolved.id, id).then(resolveRecent => {
          }).catch(errorRecent => {
          });
        }
      }).catch(error => {
        this.openSnackBar('Something went wrong!', 'X', 'red-snackbar');
      })

      }
    })
  }

  cancelClockOut() {
    this.attendanceDate = false;
    this.displayMomentAgo = '';
  }


  checkAccId(input: any) {
    this.sett.checkAccID(input).subscribe((res: any = null) => {      
      if (res !== null) {
        this.router.navigate(['/dashboard']);
      } else {
        this.openSnackBar('ID does not match!', 'ok', 'red-snackbar')
      }
      this.formId.controls['id'].setValue('');
    })
  }

  timeOut() {
    // const timeout = moment(new Date()).format("h:mm A");
    const timeout = new Date();    
    this.attService.timeout(this.code, this.secondCollection, this.currentDocumentID, timeout).then(resolve => {
      this.openSnackBar('Successful time out!', 'X', 'green-snackbar')
    }).catch(error => {
      this.openSnackBar('Something went wrong!', 'X', 'red-snackbar')
    })
  }

  openSnackBar(message: string, action: string, c: any) {
    this.sb.open(message, action, {
      duration: 2500,
      panelClass: c
    });
  }
}
