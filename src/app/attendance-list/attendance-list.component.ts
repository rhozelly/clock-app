import {Component, OnInit} from '@angular/core';
import {AttendanceService} from '../core/services/attendance.service';
import {MainService} from '../core/services/main.service';
import * as moment from 'moment';
import { PageEvent } from '@angular/material/paginator';

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


  constructor(private att: AttendanceService,
              private main: MainService
  ) {
  }

  ngOnInit(): void {
    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.main.decrypt(collection_id, 'collection-id');
    const sub = this.yearNow + '-' + this.monthNow;
    this.calculateHours();
    this.getAttendance();
  }

  calculateHours() {
    this.main.getSettings().subscribe((res: any) => {
      this.settings_time = res || [];
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
        console.log(this.lastDateArray);
        
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
  getAttendance(){
    this.att.getAttendance(this.myID).subscribe((result: any) =>{
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
}
