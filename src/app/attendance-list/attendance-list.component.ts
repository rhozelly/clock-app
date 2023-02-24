import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AttendanceService} from '../core/services/attendance.service';
import {MainService} from '../core/services/main.service';
import * as moment from 'moment';
import { PageEvent } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ProfileService } from '../core/services/profile.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertMessageComponent } from '../alert-message/alert-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { SettingsService } from '../core/services/settings.service';
import { L } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-attendance-list',
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.css']
})
export class AttendanceListComponent implements OnInit {
  @ViewChild('calendar') calendar: ElementRef<HTMLElement>;
  defaultProfileImage: string = 'assets/app-images/sample-avatar.jpg'
  yearNow: any = new Date().getFullYear();
  monthNow: any = new Date().toLocaleString('en-us', {month: 'short'});
  myID: any = [];
  atts: any = [];
  settings_time: any = [];
  total_atts: any = [];
  hours: any = [];
  lates: any = [];
  undertimes: any = [];
  overtimes: any = [];
  pageIndex: any = 0;
  lastDateArray: any;
  members: any = [];

  
  myControl = new FormControl();
  filteredOptions: Observable<any[]>;
  selected_members_id: any;
  pendingRequests: any = [];
  requests: any = [];
  emp_id: any;
  prof: any;
  role_dec_logged: any;
  holidays: any = [];
  leaves: any = [];
  presentDate: any = [];
  selectedDate: any = new Date();

  dateSelected: any;
  timeIn: any = '--';
  timeOut: any = '--';
 
  totalMonthlyAbsences: any  = [] ;
  totalFirstAbsences: any  = 0;
  totalSecondAbsences: any  = 0;
  totalFirstPresent: any = 0;
  totalSecondPresent: any = 0;
  totalFirstWorkingHours: any = 0;
  totalSecondWorkingHours: any = 0;
  totalFirstLate: any = 0;
  totalSecondLate: any = 0;
  x: any  = new Date();
  totalWorkHours = 0;
  bimonthlySelection: boolean = true;

  presentDates: any = [];
  totalFirstApprovedOvertime: any = 0;
  totalSecondApprovedOvertime: any = 0;

  constructor(private att: AttendanceService,
              private main: MainService,
              private profile: ProfileService,
              private dialog: MatDialog,
              private router: Router,
              private _snackBar: MatSnackBar,            
              private route: ActivatedRoute,
              private sett: SettingsService
  ) {
  }

  private _filter(value: any) {
    const filterValue = value.toString().toLowerCase();
    return this.members.filter((member_names: any) => member_names.name.toLowerCase().includes(filterValue));
  }


  ngOnInit(): void {
    this.getHolidays();
    let id = this.route.snapshot.params.id;
    if(id !== undefined){
        this.selected_members_id = id;
        this.getApprovedLeaves(id)
        this.getAllProfileById(id);
        this.getAttendance(id);
    }
    
    
    let user = localStorage.getItem('user') ? new Object(localStorage.getItem('user')).toString() : '';    
    let role = user.length > 0 ? JSON.parse(user).re : '';
    let role_dec = this.main.decrypt(role ? role : '', 'r0l3_3nc');
    this.role_dec_logged = role_dec.toLowerCase();
    

    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.main.decrypt(collection_id, 'collection-id');
    const sub = this.yearNow + '-' + this.monthNow;
    this.calculateHours();
    this.getMembers();

    
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((mem: any | null) =>
      mem ? this._filter(mem) : this.members.slice()),
    );
  }

  triggerFalseClick() {    
    this.totalFirstPresent = 0;
    this.totalSecondPresent = 0;
    this.totalFirstWorkingHours = 0;
    this.totalSecondWorkingHours= 0;
    this.totalFirstAbsences = 0;
    this.totalSecondAbsences= 0;
    
    let date = new Date(this.x.getFullYear(), this.x.getMonth(), 1);
    let dates = [];

    while (date.getMonth() === this.x.getMonth()) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
      
      const xAbsences = this.totalMonthlyAbsences.find((d: any) => {
          const newDate = new Date(d);
          const dd = newDate.getDate();
          const mm = newDate.getMonth();
          const yy = newDate.getFullYear();
          return (
            dd === date.getDate() && mm === date.getMonth() && yy === date.getFullYear()
          );        
      })

      if(xAbsences){
          if(xAbsences.getDate() <= 15){
              this.totalFirstAbsences++;
          } else {
              this.totalSecondAbsences++;
          }
      }

      const xPresent = this.presentDate.find((d: any) => {
          const newDate = new Date(d);
          const dd = newDate.getDate();
          const mm = newDate.getMonth();
          const yy = newDate.getFullYear();
          return (
            dd === date.getDate() && mm === date.getMonth() && yy === date.getFullYear()
          );        
      })
      if(xPresent){
        if(xPresent.getDate() <= 15 && xPresent.getMonth()+1 === this.x.getMonth()+1){
          this.totalFirstPresent++;
        } else if (xPresent.getDate() >= 16 && xPresent.getMonth()+1 === this.x.getMonth()+1) {
          this.totalSecondPresent++;
        }
      }

      const xHours = this.presentDates.find((d: any) => {
        const newDate = new Date(d.date);
        const dd = newDate.getDate();
        const mm = newDate.getMonth() + 1;
        const yy = newDate.getFullYear();
        return (
          dd === date.getDate() && mm === date.getMonth()+1 && yy === date.getFullYear()
        );        
    })
    if(xHours){    
      if(xHours.date.getDate() <= 15 && xHours.date.getMonth()+1 === this.x.getMonth()+1){
   
        let arr = moment(xHours.start).format('HH:mm')
        if(arr > '08:30') {
          let default_in = new Date(xHours.date).setHours(8, 30, 0);
          let dur = moment.duration(moment(xHours.start).diff(moment(default_in)));
          let late = parseFloat(dur.asHours().toFixed(2));
          this.totalFirstLate += late;
        }
          
      } else if(xHours.date.getDate() >= 16 && xHours.date.getMonth()+1 === this.x.getMonth()+1) {
        let arr = moment(xHours.start).format('HH:mm')
        if(arr > '08:30') {
          let default_in = new Date(xHours.date).setHours(8, 30, 0);
          let dur = moment.duration(moment(xHours.start).diff(moment(default_in)));
          let late = parseFloat(dur.asHours().toFixed(2));
          this.totalSecondLate += late;
        }
      }
    }
      
    }
    this.getApprovedOvertimeRequestsById();
    this.totalFirstWorkingHours = this.totalFirstPresent * 8;
    this.totalSecondWorkingHours = this.totalSecondPresent * 8;

    this.totalFirstLate = this.convertUnitTimetoHour(this.totalFirstLate);
    this.totalSecondLate = this.convertUnitTimetoHour(this.totalSecondLate);
    
  }

getHolidays(){
  this.sett.getAllHolidays().subscribe((results: any) =>{
    this.holidays = [];
    if(results.length > 0){
      results.forEach((val: any) =>{
        if(val.payload.doc.data().holiday_date){
          this.holidays.push(val.payload.doc.data().holiday_date);
        }
      })
    }  
  })
}

getApprovedLeaves(id: any){
  this.att.getApprovedLeaves(id).subscribe((results: any) =>{
    this.leaves = [];
    if(results.length > 0){
      results.forEach((val: any) =>{
        if(val.payload.doc.data().date){
          this.leaves.push(val.payload.doc.data().date);
        }
      })
    }  
  })
}

  getAllProfileById(id: any){
    this.profile.getAllProfileById(id).subscribe((res: any) =>{
      this.prof = res.payload.data() || [];
    })
  }

  calculateHours() {
    this.main.getSettings().subscribe((res: any) => {
      this.settings_time = res || [];
    })
  }

  getMembers(){
    this.profile.getAllProfiles().subscribe((res: any) =>{
      this.members = [];
      if(res){
        res.forEach((e: any) =>{
          const data = {
            name: e.payload.doc.data().first_name + ' ' + e.payload.doc.data().last_name,
            id: e.payload.doc.id,
            email_add: e.payload.doc.data().email_add,
            position: e.payload.doc.data().position
          }
          this.members.push(data);
        })
      } else {
        this.members = [];
      }
    })
  }
    
  handlePageEvent(event: PageEvent) {
    let new_array: any = [];
      if(this.pageIndex < event.pageIndex){
        this.att.nextAttendance(this.myID, this.lastDateArray).subscribe((result: any) =>{
          if(result.length > 0) {
            this.pageIndex += 1;
            this.atts = [];
            this.hours = [];
            this.overtimes = [];

            this.lastDateArray =  result[result.length - 1].payload.doc.data().date.toDate();
            result.forEach((val: any) => {  
              if (val.payload.doc.data().time_in === undefined && val.payload.doc.data().date.length === 0) {
                this.atts = [];
              } else {            
                const clocked_in = val.payload.doc.data().time_in || val.payload.doc.data().time_in === undefined ? val.payload.doc.data().time_in.toDate() : 0;
                const now = moment(clocked_in).fromNow(true);             
                
                const clocked_out = val.payload.doc.data().time_out ? val.payload.doc.data().time_out.toDate() : 0;
                const milisecondsDiff = clocked_out - clocked_in;
                const a = Math.floor(milisecondsDiff / (1000 * 60 * 60)).toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":" + (Math.floor(milisecondsDiff / (1000 * 60)) % 60).toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":" + (Math.floor(milisecondsDiff / 1000) % 60).toLocaleString(undefined, {minimumIntegerDigits: 2});
                const newstr = a.replace(':', ".");
                const news = newstr.slice(0, -3);
                
                if (news.length > 5) {
                  this.total_atts.push(now);
                } else {
                  this.total_atts.push(news + ' hours');
                }
                
                const i = moment(clocked_in);
                const o = moment(clocked_out);
                const end = moment(this.settings_time.end.toDate());
                const start = moment(this.settings_time.start.toDate());
                this.atts.push(val.payload.doc.data());
                this.hours.push(o.diff(i, 'hours'));
                this.overtimes.push(end.diff(o, 'hours'));
              }
            });
          }
        });
      } else if(this.pageIndex > event.pageIndex) {
        this.att.prevAttendance(this.myID, this.lastDateArray).subscribe((result: any) =>{
          if(result.length > 0) {
            this.pageIndex -= 1;
            this.atts = [];
            this.hours = [];
            this.overtimes = [];
            this.lastDateArray =  result[result.length - 1].payload.doc.data().date.toDate();
            result.forEach((val: any) => {  
              if (val.payload.doc.data().time_in === undefined && val.payload.doc.data().date.length === 0) {
                this.atts = [];
              } else {            
                const clocked_in = val.payload.doc.data().time_in || val.payload.doc.data().time_in === undefined ? val.payload.doc.data().time_in.toDate() : 0;
                const now = moment(clocked_in).fromNow(true);             
                
                const clocked_out = val.payload.doc.data().time_out ? val.payload.doc.data().time_out.toDate() : 0;
                const milisecondsDiff = clocked_out - clocked_in;
                const a = Math.floor(milisecondsDiff / (1000 * 60 * 60)).toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":" + (Math.floor(milisecondsDiff / (1000 * 60)) % 60).toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":" + (Math.floor(milisecondsDiff / 1000) % 60).toLocaleString(undefined, {minimumIntegerDigits: 2});
                const newstr = a.replace(':', ".");
                const news = newstr.slice(0, -3);
                
                if (news.length > 5) {
                  this.total_atts.push(now);
                } else {
                  this.total_atts.push(news + ' hours');
                }
                
                const i = moment(clocked_in);
                const o = moment(clocked_out);
                const end = moment(this.settings_time.end.toDate());
                const start = moment(this.settings_time.start.toDate());
                this.atts.push(val.payload.doc.data());
                this.hours.push(o.diff(i, 'hours'));
                this.overtimes.push(end.diff(o, 'hours'));
              }            
            });
          }
        });        
      }
  }

  // Revisions
  getAttendance(x: any){
    this.att.getAllAttendance(x).subscribe((result: any) =>{
      if(result.length > 0) {
        this.atts = [];
        this.hours = [];
        this.overtimes = [];
        this.lastDateArray =  result[result.length - 1].payload.doc.data().date.toDate();

        const that = this;
        result.forEach((val: any) => {      
          // console.log(val.payload.doc.data().date.toDate());
          
          if (val.payload.doc.data().time_in === undefined && val.payload.doc.data().date.length === 0) {
            this.atts = [];
            this.presentDate = [];
          } else {   
                this.presentDate.push(val.payload.doc.data().date.toDate());
                const clocked_in = val.payload.doc.data().time_in || val.payload.doc.data().time_in === undefined ? val.payload.doc.data().time_in.toDate() : 0;
                const clocked_out = val.payload.doc.data().time_out !== '' ? val.payload.doc.data().time_out.toDate() : 0;
                
                let timein_formatted = moment(clocked_in);
                let timeout_formatted = moment(clocked_out);
                let dur = moment.duration(timeout_formatted.diff(timein_formatted));
                let hours = dur.asHours();
                this.presentDates.push({date: val.payload.doc.data().date.toDate(), hours: hours, start:val.payload.doc.data().time_in.toDate() })
                setTimeout((val: any) =>{
                    that.triggerFalseClick();
                }, 1000)
          }
          
        });
      }
    })
  }

  convertUnitTimetoHour(n: any){         
    var decimalTimeString = n.toString();
    var decimalTime = parseFloat(decimalTimeString);
    decimalTime = decimalTime * 60 * 60;
    let hourss: any = Math.floor((decimalTime / (60 * 60)));
    decimalTime = decimalTime - (hourss * 60 * 60);
    let minutes: any = Math.floor((decimalTime / 60));
    decimalTime = decimalTime - (minutes * 60);
    
    if(hourss < 10){
      hourss = "0" + hourss;
    }
    if(minutes < 10){
      minutes = "0" + minutes;
    }
    let r = hourss + ":" + minutes;
    return r;
  }

  selectedMember(x: any){
    this.selected_members_id = x.id;
    this.getAttendance(this.selected_members_id);
    this.getRequests();
    this.getPendingRequests();
  }

  getPendingRequests(){
    this.att.getPendingRequest(this.selected_members_id).subscribe((res: any) =>{
      if(res.length > 0){
          res.forEach((el: any) => { 
            let array = el.payload.doc.data() || [];
            array.month = moment(array.date.toDate()).format("MMM");
            array.year = moment(array.date.toDate()).format("YYYY");
            array.day = moment(array.date.toDate()).format("MM");
            array.doc_id = el.payload.doc.id
            this.pendingRequests.push(array);
          })
      } else {
        this.pendingRequests = [];
      }
    })
  }

  getRequests(){
    this.att.getRequestById(this.selected_members_id).subscribe((res: any) =>{
      if(res.length > 0){
          res.forEach((el: any) => { 
            let array = el.payload.doc.data() || [];
            array.month = moment(array.date.toDate()).format("MMM");
            array.year = moment(array.date.toDate()).format("YYYY");
            array.day = moment(array.date.toDate()).format("MM");
            array.doc_id = el.payload.doc.id
            this.requests.push(array);
          })
      } else {
        this.requests = [];
      }
    })
  }


  alertMessage(status: any, value: any) {
    const dialogRef = this.dialog.open(AlertMessageComponent, {
      data: {action: value.request_for, data: status === 'approved' ? 'approve' : status === 'denied' ? 'deny' : 'pending'}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if(result === 'yes'){
         let msg = value.request_for + ' ' + status;
        if(status === 'approved'){
          this.att.requestUpdate('approved', value.doc_id, new Date()).then(doc =>{
              this.openSnackBar(msg,'✅');            
          })
          .catch(error =>{
              this.openSnackBar('Something went wrong.','❌');            
          })
        } else if(status === 'denied') {  
          this.att.requestUpdate('denied', value.doc_id,  new Date()).then(doc =>{
               this.openSnackBar(msg,'✅');            
          })
          .catch(error =>{
              this.openSnackBar('Something went wrong.','❌');      
          })
        }
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {duration: 5*1000});
  }
  backToEmployee(){
    this.router.navigate([this.role_dec_logged + '/employees']);

  }
  checkDateClassQuarter(dateCheck: any, dateFrom: any, dateTo: any) {
    return (
      dateCheck.getTime() >= dateFrom.getTime() &&
      dateCheck.getTime() <= dateTo.getTime()
    );
  }

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      return this.checkDateStatus(date);
    };
  }

  checkDateStatus(date: any) { 
    this.x = date;
    // this.calculateAbsences(date.getMonth(), date.getMonth());
    const dateNow = new Date(); 
    if (this.getHolidayDate(date)) {
        return 'holiday';
    }  else if(this.getWeekend(date)) {
      return 'weekend';
    } else if(this.getLeavesDate(date)){      
      return 'leave';
    } else if(this.getDatePresent(date.getDate(),date.getMonth(),date.getFullYear())){   
      return 'present-date';
    } else if ((dateNow.getMonth() + 1) <= (date.getMonth() + 1) && dateNow.getDate() < date.getDate() && dateNow.getFullYear() === date.getFullYear()){
      return '';
    } else if ((dateNow.getMonth() + 1) >= (date.getMonth() + 1) && dateNow.getFullYear() >= date.getFullYear()){
      this.totalMonthlyAbsences.push(date);
      return 'absent';
    } else  {
      return '';
    }
  }

 
 getDatePresent(date: any, month: any, year: any) {
    const x = this.presentDate.find((d: any) => {
      const newDate = new Date(d);
      const dd = newDate.getDate();
      const mm = newDate.getMonth();
      const yy = newDate.getFullYear();
      return (
        dd === date && mm === month && yy === year
      );
    });
    return x;
  }

  getWeekend(date: any){
      const dayOfWeek = date.getDay();
      const isWeekend = (dayOfWeek === 6) || (dayOfWeek  === 0);
      return isWeekend;  
  }

  getHolidayDate(date: any){
      const x = this.holidays.find((d: any) => {
      const newDate = new Date(d);
      const dd = newDate.getDate();
      const mm = newDate.getMonth();
      const yy = newDate.getFullYear();
      return (
        dd === date.getDate() && mm === date.getMonth() && yy === date.getFullYear()
      );
    });
    return x;
  }

  getLeavesDate(date: any){
      const x = this.leaves.find((d: any) => {
      const newDate = new Date(d);
      const dd = newDate.getDate();
      const mm = newDate.getMonth()-1;
      const yy = newDate.getFullYear();
      return (
        dd === date.getDate() && mm === date.getMonth() && yy === date.getFullYear()
      );
    });
    return x;
  }

  monthSelected(){
    // console.log(this.totalMonthlyAbsences, 'total');
    // console.log(this.totalFirstAbsences, 'firsthalf');
    // console.log(this.totalSecondAbsences, 'secondhalf');
  }

  selectedDateChange(e: any): void{    
    this.timeIn = '--'
    this.timeOut = '--'
    this.selectedDate = e;
    this.dateSelected = moment(new Date(e)).format("dddd, MMMM DD YYYY");
    this.att.findAttendance(this.selected_members_id, e).subscribe((res: any) =>{
      
      res.forEach((val: any) =>{
        let clocked_in = val.payload.doc.data().time_in.toDate();
        let clocked_out = val.payload.doc.data().time_out !== '' ? val.payload.doc.data().time_out.toDate() : 0;
        const i = moment(clocked_in);
        const o = moment(clocked_out);
        
        this.timeIn = i.format("h:mm:ss A");
        this.timeOut = o.format("h:mm:ss A");
        
        let total_hours = 0; 
        if(clocked_out !== 0){
          let dur = moment.duration(o.diff(i));
          let hours = dur.asHours();
          total_hours += hours;
          this.totalWorkHours = total_hours;
        } else {
          this.timeIn = '--'
          this.timeOut = '--'
        }
        let date = val.payload.doc.data().date.toDate();
        if(date.getDate() !== e.getDate()){
          this.timeIn = '--'
          this.timeOut = '--'
          this.totalWorkHours = 0;
        }
      })
    })
    
  }

  semiSelectionClicked(){
    this.bimonthlySelection =  this.bimonthlySelection ? false : true;
    this.getApprovedOvertimeRequestsById();
  }

  getApprovedOvertimeRequestsById(){
    this.totalFirstApprovedOvertime = 0;
    this.totalSecondApprovedOvertime = 0;
    let arr: any =[];
    let arr2: any =[];
    
    let start = this.bimonthlySelection ?
    new Date(this.x.getFullYear(), this.x.getMonth(), 1) :
    new Date(this.x.getFullYear(), this.x.getMonth(), 16);
    let end = this.bimonthlySelection ?
    new Date(this.x.getFullYear(), this.x.getMonth(), 15) :
    new Date(this.x.getFullYear(), this.x.getMonth() + 1, 0);

    if(start && end) {
        this.att.getApprovedOvertimeRequestsById(start, end, this.selected_members_id).subscribe((result: any) =>{
            if(result.length > 0){
                result.forEach((el: any) =>{
                  if(el.payload.doc.data().date.toDate().getDate() <= end.getDate()){
                    let a =+ parseFloat(el.payload.doc.data().hours); 
                    arr.push(a);
                  }
                })                
            } 
          this.totalFirstApprovedOvertime = arr?.reduce((a: number, b: number) => a + b, 0);
          this.totalSecondApprovedOvertime = arr2?.reduce((a: number, b: number) => a + b, 0);
          
        })   
    }
  }
  
  getDecimalValueOnly(number: number){
    let getDecimalVal = number.toString().indexOf(".");
    return number.toString().substring(getDecimalVal+1);
  }

}
