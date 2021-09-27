import { Component, OnInit } from '@angular/core';
import { AttendanceService } from '../core/services/attendance.service';
import { MainService } from '../core/services/main.service';
import * as moment from 'moment';

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
  total_atts: any = [];

  constructor(private att: AttendanceService,
    private main: MainService
    ) { }

  ngOnInit(): void {
    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.main.decrypt(collection_id, 'collection-id');
    const sub = this.yearNow + '-' + this.monthNow;

    this.att.getAttendanceListByUser(this.myID, sub.toUpperCase()).subscribe((res: any) => {
      res.forEach((val:any )=>{
        // val.payload.doc.data().date_time.toDate();
        const clocked_in = val.payload.doc.data().time_in ? val.payload.doc.data().time_in.toDate() : 0;
        const clocked_out = val.payload.doc.data().time_out ? val.payload.doc.data().time_out.toDate() : 0;
        const milisecondsDiff = clocked_out - clocked_in;
    
        const a = Math.floor(milisecondsDiff/(1000*60*60)).toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":" + (Math.floor(milisecondsDiff/(1000*60))%60).toLocaleString(undefined, {minimumIntegerDigits: 2})  + ":" + (Math.floor(milisecondsDiff/1000)%60).toLocaleString(undefined, {minimumIntegerDigits: 2}) ;
        const newstr = a.replace(':', "."); 
        const news = newstr.slice(0, -3)
        
        
        // const ms = moment(clocked_in, "DD/MM/YYYY HH:mm:ss").diff(moment(clocked_out, "DD/MM/YYYY HH:mm:ss"));
        // console.log(ms);
               

       
        // const a = parseFloat(clocked_in) + parseFloat(clocked_out);
        this.total_atts.push(news + ' hours');
        this.atts.push(val.payload.doc.data());


      })
      // this.atts = res ? res : [];
      // console.log( this.atts );
    })
  }

}
