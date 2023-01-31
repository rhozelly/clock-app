import {Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-attendance-list',
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.css']
})
export class AttendanceListComponent implements OnInit {
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


  constructor(private att: AttendanceService,
              private main: MainService,
              private profile: ProfileService,
              private dialog: MatDialog,
              private _snackBar: MatSnackBar
  ) {
  }

  private _filter(value: any) {
    const filterValue = value.toString().toLowerCase();
    return this.members.filter((member_names: any) => member_names.name.toLowerCase().includes(filterValue));
  }


  ngOnInit(): void {
    

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
    this.att.getAttendance(x).subscribe((result: any) =>{
      if(result.length > 0) {
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
    })
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
}
