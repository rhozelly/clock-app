import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular';
import * as moment from 'moment';
import { CalendarService } from '../core/services/calendar.service';
import { MainService } from '../core/services/main.service';
import {MatDialog} from "@angular/material/dialog";
import { CalendarDialogComponent } from "../calendar/calendar-dialog/calendar-dialog.component";
import { AttendanceService } from '../core/services/attendance.service';
import { getLocaleFirstDayOfWeek } from '@angular/common';
import * as myGlobals from '../../../globals';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  data : any = [];
  calendarOptions!: CalendarOptions;

  mm: any = ('0' + (new Date().getMonth() + 1)).slice(-2);
  dd: any = ('0' + (new Date().getDate())).slice(-2);
  yy: any = new Date().getFullYear();
  dateNow: any = new Date();

  endDay = new Date().getDate();
  startDay = '01';
  startDate = this.yy + '-' + this.mm + '-' + this.startDay;
  endDate = this.yy + '-' + this.mm + '-' + this.endDay;

  endDateAttendance: any;

  numberDate: any = [];
  attendancesToDisplay: any = [];
  ids: any = [];
  summarizeWorkAttendance: any = [];
  arrayofattendance: any = [];
  overtimeEndRange: any  = [];
  overtimeStartRange: any  = [];


  constructor(private calendarService : CalendarService,
     private mainService:MainService,     
     private attendanceService: AttendanceService,
     private dialog: MatDialog,) {
  }

  enumerateDaysBetweenDates(s: any, e:any) {
    var dates = [];
    var currDate = moment(new Date(s)).startOf('day');
    var lastDate = moment(new Date(e)).startOf('day');
    while(currDate.add(1, 'days').diff(lastDate) < 0) {
      console.log(currDate.toDate());
      dates.push(currDate.clone().toDate());
    }    
  };

    
  ngOnInit() { 
    this.numberOfDates();
    this.getAllAttendanceIds();
    this.getAttendanceDetails();
  }  
  // dur = moment.duration(timeout_formatted.diff(timein_formatted))
  getAttendancesById(id: any){
    let arr: any = [];
    this.attendanceService.getAllAttendancesOftheMonth(id).subscribe((res: any) =>{
      for (let i = 0; i < this.attendancesToDisplay.length; i++) {
        if(id === this.attendancesToDisplay[i].id){
          if(res.length > 0){
              res.forEach((el: any) => { 
                arr.push( {
                    name: this.attendancesToDisplay[i].name,
                    id: id,
                    data: el.payload.doc.data(),
                    date: el.payload.doc.data().date.toDate().getDate(),
                    doc_id: el.payload.doc.id
                  }
                )      
              });  
            this.arrayofattendance.push(arr)
          }    
        }
      }
   })
  }
  
  getAllAttendanceIds(){
    this.attendanceService.getAllAttendanceIds().subscribe((res: any) =>{
      if(res.length !== 0){
          this.attendancesToDisplay= [];
          res.forEach((el: any) => {         
            this.attendancesToDisplay.push({            
              name: el.payload.doc.data().first_name + ' ' + el.payload.doc.data().last_name,
              id: el.payload.doc.id
            });     
            this.ids.push(el.payload.doc.id);
          });
          
          this.ids.forEach((el: any) =>{
            this.getAttendancesById(el);
          });
      } else {
        this.attendancesToDisplay = [];
      }      
    })
  }

  numberOfDates(){
    for (let i = 1; i <= 31; i++) {
        this.numberDate.push(i);
    }
  }

  initCalendar() {
    this.calendarService.getAttendance().subscribe((res) => {
      if(res){
        res.map((d) => {
          this.data.push({
            date : moment(d.date.toDate()).format("YYYY-MM-DD"),
            title : 'Present'
          })
        });
        setTimeout(() => {
          this.calendarOptions = {
            initialView: 'dayGridMonth',
            weekends: true,
            editable: true,
            selectable: true,
            dateClick: this.onDateClick.bind(this),
            eventDrop: this.onDateDrag.bind(this),
            events: [
              {date: '2022-02-04', title: 'Present'},
              {date: '2022-02-03', title: 'Present'},
              {date: '2022-02-03', title: 'ASD'},
              {date: '2022-02-07', title: 'Present'}
            ],
            eventColor: '#26a69a',
            aspectRatio: 2,    
          };
        }, 100);
      }
    })
  }

  onDateClick(res : any) {
    const dialogRef = this.dialog.open(CalendarDialogComponent, {
      data: res
    });
    dialogRef.afterClosed().subscribe((result: any) => {
    });
  }   
  
  onDateDrag(res : any) {
    console.log(res);
    
    // const dialogRef = this.dialog.open(CalendarDialogComponent, {
    //   data: res
    // });
    // dialogRef.afterClosed().subscribe((result: any) => {
    // });
  }
   
  onClickDate(view: any, data: any) {
    // const dialogRef = this.dialog.open(CalendarDialogComponent, {
    //   width: '50%',
    //   height: '640px',
    //   disableClose: true,
    //   data: {action: view, data: data}
    // });
    // dialogRef.afterClosed().subscribe((result: any) => {
    // });
  }

  // attendance overtime
  async getAttendanceDetails(){
    const result1 = <any>await this.getAllOvertimeEndRange();
    const result2 = <any>await this.overtimeEndRangeDetails(result1);
    const result3 = <any>await this.totalOvertime(result2);
  }
  getAllOvertimeEndRange(){
    return new Promise(resolve => {
        this.attendanceService.getAllOvertimeEndRange().subscribe((result: any) =>{
            if(result.length > 0){
              resolve(result);
            } else {
              resolve([]);
            }
        })
    });
  }

  overtimeEndRangeDetails(array: any){
    return new Promise(resolve => {
        this.overtimeEndRange = array.reduce((group: any, product: any) => {
          const { id } = product.payload.doc.data();
          group[id] = group[id] ?? [];      
          group[id].push(product.payload.doc.data());
          return group;
        }, {});
        resolve(this.overtimeEndRange);    
    });
  }

  totalOvertime(array: any){
    let keys = Object.keys(array);
    keys.forEach((el: any) => {
      array[el].overtime = array[el].filter((f: any) => f.id === el).reduce((acc: any, c: any) => parseFloat(acc) + parseFloat(c.hours), 0);
    });
  }
  

}

