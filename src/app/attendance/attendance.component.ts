import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SettingsService} from "../core/services/settings.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AttendanceService} from '../core/services/attendance.service';
import * as moment from 'moment';
import {MainService} from "../core/services/main.service";
import {getLocaleTimeFormat} from '@angular/common';
import * as myGlobals from '../../../globals';
import { Position } from '@angular/compiler';
import { AuthenticationService } from '../core/services/authentication.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent implements OnInit {
  formId: FormGroup;
  time: any = moment().format('LT');
  timeNow: any = moment().format('h:mm A'); 
  dateNow: any = moment().format('dddd, MMMM DD'); 

  // dateToday: any = new Date();
  dateToday: any = moment().format();
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

  todayExist: boolean = false;

  latitude: number;
  longitude: number;
  company: any;

  officeLocation: boolean = true;

  constructor(private fb: FormBuilder,
              private router: Router,
              private sb: MatSnackBar,
              private attService: AttendanceService,
              private sett: SettingsService,
              private main: MainService,
              private auth: AuthenticationService
  ) {
    this.formId = this.fb.group({id: ['', null]});
    this.code = [];
    this.attendanceDate = false;
    this.alreadyLoggedIn = false;
    this.displayMomentAgo = [];
  }

  ngDoCheck() {
    this.timeNow = moment().format('h:mm A'); 
    this.dateNow = moment().format('dddd, MMMM DD'); 
  }

  ngOnInit(): void {
    this.getCompanyLocation();
    this.secondCollection = this.yearNow + '-' + this.monthNow.toUpperCase();
    if(this.myID !== undefined){
      if(this.myID.length > 0 ){
        this.checkAttendance(this.myID);
      }
    }
    this.formId.controls['id'].valueChanges.subscribe(input => {
      if (this.formId.controls['id'].value.length === 8) {
        this.checkAccId(input);
      }
    });

  }

  getCompanyLocation(){
    this.auth.getCompanyLocation().subscribe((res: any) =>{
      this.company = res.payload.data();
      this.navigateLocation();
      
    })
  }

  navigateLocation(){    
    navigator.geolocation.getCurrentPosition(position => {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.officeLocation = this.company.latitude === this.latitude && this.company.longitude === this.longitude;
    });
  }

  checkAttendance(id: any) {
    this.attService.getAttendanceToday(id).subscribe((results: any) => {
      console.log(results);
      
      // results.map((result: any) => {
      //   const a = result.payload.doc.data().date_time.toDate();
      //   const timeout = result.payload.doc.data().time_out;
      //   this.currentDocumentID = result.payload.doc.id;
      //   const latestAttendanceStored = this.formatDate(a);
      //   this.attendanceDate = latestAttendanceStored === this.date;
      //   if (this.attendanceDate) {
      //     this.displayMomentAgo = moment(new Date(result.payload.doc.data().date_time.toDate())).fromNow();
      //     this.alreadyLoggedIn = timeout.length > 0;
      //   } else {
      //     this.alreadyLoggedIn = false;
      //     this.displayMomentAgo = [];
      //   }
      // });
    })
  }

  formatDate(date: any) {
    return ('0' + (new Date(date).getMonth() + 1)).slice(-2) + '-' + new Date(date).getDate() + '-' + new Date(date).getFullYear();
  }

  checkCode() {
    if (this.code.length >= this.lengthCode) {
      const sub = this.yearNow + '-' + this.monthNow.toUpperCase();
      
      let todayDate = moment(new Date(), 'DD-MM-YYYY');
      this.attService.attendanceExist(this.code).subscribe((query: any) =>{        
        if(query.length > 0){
            query.forEach((element: any) => {
              let id = element.payload.doc.id;
              let pastDate = moment(element.payload.doc.data().date.toDate(), 'DD-MM-YYYY');
                const latest_date_logged_in = element.payload.doc.data().date.toDate().getDate();
                if(myGlobals.date_today === latest_date_logged_in){             
                    this.todayExist = element.payload.doc.exists;   
                } else {
                  let dDiff = todayDate.diff(pastDate);
                  if (dDiff > 0) {
                      let default_out = new Date(element.payload.doc.data().date.toDate()).setHours(17, 0, 0);
                      let time_out = new Date(default_out);
                      if(element.payload.doc.data().time_out.length === 0) {
                        this.attService.timeout(this.code, id, time_out).then((resolve: any) =>{
                            this.todayExist = false;
                            this.checkFieldDateAttendance(this.code);
                        });
                      }
                    }


                    // this.todayExist = false;        
                    // this.checkFieldDateAttendance(this.code);
                }                     
              });
        } else {
          this.todayExist = false;  
          this.main.checkAccountId(this.code).subscribe((exist: any) =>{
              if(exist.payload.exists){
                  this.checkFieldDateAttendance(this.code);
              }         
          })
        }
      })
    } else {
      this.openSnackBar('ID length is below the required length.', 'x', 'red-snackbar');
    }
  }

  checkFieldDateAttendance(id: any) {
    const clock_in = new Date();
    this.attService.logTimein(id, clock_in, myGlobals.today).then(resolved => {
      if (resolved.id) {
        // Update Needed Tables
        this.attService.updateTimeinTable(id, resolved.id).then(resolve_update_table => {
          const arr = {
            time: new Date(),
            members_id: id,
            action: 'timed in'
          };
          this.addLogsforAttendance(arr);          
        }).catch(error_update_table => {
          this.openSnackBar('Something went wrong!', 'X', 'red-snackbar');
        });
      } else {
        this.openSnackBar('Something went wrong!', 'X', 'red-snackbar');
      }
    })
  }


  addLogsforAttendance(data: any){
    this.main.addLogsForAttendance(data).then(res =>{
      if(res === undefined){
        this.openSnackBar('Timed in!', 'X', 'green-snackbar');
      }
    })
  }

  cancelClockOut() {
    this.todayExist = false;
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

  async timeOut() {
    const result1 = <any>await this.checkAccountIdIfExists();
    const result2 = <any>await this.proceedToTimingOut(result1);    
    if (result2 === undefined) {
      const arr = {
        time: new Date(),
        members_id: this.code,
        action: 'checked out'
      };
      this.addLogsforAttendance(arr);
      this.openSnackBar('Time Out', 'X', 'green-snackbar');
    }
  }

  checkAccountIdIfExists(){
    return new Promise(resolve => {
      this.attService.checkAccountIdIfExists(this.code).subscribe((result: any) =>{     
        if(result.length > 0){      
          this.todayExist = false; 
          const datenow = result[0].payload.doc.data().date.toDate().getDate();
          if(datenow === myGlobals.date_today){
            resolve(result[0].payload.doc.id);
          }        
        }
      })
    })
  }

  proceedToTimingOut(doc_id: any){
    return new Promise(resolve => {
      this.attService.proceedToTimingOut(doc_id, this.code).then((res: any) =>{
        resolve(res);
      });
    })
  }

  openSnackBar(message: string, action: string, c: any) {
    this.sb.open(message, action, {
      duration: 2500,
      panelClass: c
    });
  }
}
