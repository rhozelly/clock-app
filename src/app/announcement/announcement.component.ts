import { Component, OnInit } from '@angular/core';
import { MainService } from '../core/services/main.service';
import { SettingsService } from '../core/services/settings.service';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent implements OnInit {
  events: any  =[];
  eventDate: any;
  eventTitle: any;

  constructor(
    private main: MainService,
    private sett: SettingsService,
  ) { }

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents(){
    this.main.getEvents(10).subscribe((result: any) =>{
      if(result){
        this.events = [];
        result.forEach((e: any) =>{
          const data: any = {
            event_date: e.payload.doc.data().event_date ? e.payload.doc.data().event_date.toDate() : '',
            event_title: e.payload.doc.data().event_title ? e.payload.doc.data().event_title : '',
            doc_id: e.payload.doc.id
          }
          this.events.push(data);   
        })
      }     
    })
  }

  removeEvent(id: any){
    this.main.removeEvents(id).then(resolve => {      
      this.sett.snackbar('Event removed.', 'X', 1500, 'green-snackbar');
    }).catch(err =>{
      this.sett.snackbar('Removing event failed', 'X', 1500, 'red-snackbar')
    })
  }

  addEvent(){
    if(this.eventDate > 0 && this.eventTitle.length > 0) {
      const data: any = {
        event_date: new Date(this.eventDate),
        event_title: this.eventTitle,
      }
      this.main.addEvents(data).then(resolve => {
        this.sett.snackbar('Event added.', 'X', 1500, 'green-snackbar');
        this.eventDate = '';
        this.eventTitle = '';
      }).catch(error =>{
        console.log('Error on adding events.');        
      });           
    } else {
      this.sett.snackbar('Please complete the fields', 'X', 1500, 'red-snackbar')
    }
  }

}
