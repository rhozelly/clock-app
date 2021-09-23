import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular';
import * as moment from 'moment';
import { CalendarService } from '../core/services/calendar.service';
import { MainService } from '../core/services/main.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  data : any = [];
  calendarOptions!: CalendarOptions;

  constructor(private calendarService : CalendarService, private mainService:MainService) {

  }


  ngOnInit(){
    this.initCalendar();
    setTimeout(() => {
      this.calendarOptions = {
        initialView: 'dayGridMonth',
        dateClick: this.onDateClick.bind(this),
        events: this.data,
        aspectRatio: 2
      };
    }, 100);
  }

  initCalendar() {
    this.calendarService.getAttendance().subscribe((res) => {
      console.log(res);
      if(res){
        res.map((d) => {
          this.data.push({
            date : moment(d.date_time.toDate()).format("YYYY-MM-DD"),
            title : 'Present'
          })
        });
      }
    })
  }

  onDateClick(res : any) {
    alert('Clicked on date : ' + res.dateStr)
  }


}
