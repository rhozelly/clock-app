import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular';
import * as moment from 'moment';
import { CalendarService } from '../core/services/calendar.service';
import { MainService } from '../core/services/main.service';
import {MatDialog} from "@angular/material/dialog";
import { CalendarDialogComponent } from "../calendar/calendar-dialog/calendar-dialog.component";

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



  constructor(private calendarService : CalendarService,
     private mainService:MainService,     
     private dialog: MatDialog,) {
  }

  enumerateDaysBetweenDates(s: any, e:any) {
    var dates = [];
    var currDate = moment(new Date(s)).startOf('day');
    var lastDate = moment(new Date(e)).startOf('day');
    // console.log(s);
    // console.log(e);
    
    while(currDate.add(1, 'days').diff(lastDate) < 0) {
      console.log(currDate.toDate());
      dates.push(currDate.clone().toDate());
      console.log(dates);
    }    
  };

    
  ngOnInit() {
    this.initCalendar();  
    this.calendarService.getAttendanceForTheMonth('RCKL2021', new Date(this.endDate), new Date(this.startDate)).subscribe((result: any) =>{
      let datee: any = [];  
      this.endDateAttendance = result[0].date.toDate();
      console.log(this.endDateAttendance);
      this.enumerateDaysBetweenDates(this.dateNow, this.endDateAttendance)

      var given = moment(new Date());
      var current = moment(new Date(this.endDateAttendance)).startOf('day');

      //Difference in number of days
      console.log(moment.duration(given.diff(current)).asDays());

      // let now = moment(new Date()), end = moment(new Date(this.endDateAttendance)), days = end.diff(now, 'days');
      // console.log(days);
      
      // console.log(moment.duration(moment(new Date()).diff(moment(new Date(this.endDateAttendance)))).asDays());
      
      // result.forEach((e: any) =>{
      //   const presentDate = ('0' + (e.date.toDate().getDate())).slice(-2);          
      //   for (let i = 1; i<=10; i++) {
      //     const arrays = ('0' + i).slice(-2);
      //     if(presentDate === arrays) {
      //       datee.push(arrays );            
      //     } else {
      //       datee.push(arrays + 'p');      
      //     }   
      //     console.log(datee);
      //   }
      // })  
    })
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
        console.log(this.data);
        
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

}
