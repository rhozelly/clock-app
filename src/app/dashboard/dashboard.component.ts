import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../core/services/authentication.service';
import {MainService} from "../core/services/main.service";
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";

import * as moment from 'moment';
import { ProfileService } from '../core/services/profile.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  navs =  [
    {name: 'Dashboard', icon: 'dashboard_icon'},
    {name: 'Employees', icon: 'member_icon_blue'},
    {name: 'Timesheets', icon: 'timesheet_icon'},
    {name: 'Attendance', icon: 'attendance_icon'},
    {name: 'Calendar', icon: 'calendar_icon'}
    ];
  navigators: any;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(map(result => result.matches),shareReplay());
  page: any;
  notifs: any  =[];
  notifsPassed: any  =[];
  totalMember: any;

  user: any;
  role_dec_logged: any;
  clients: any = [];
  events: any = [];

  profiles: any =[];
  
  constructor(private authService : AuthenticationService,
              private mainService: MainService,
              private router: Router,
              private prof: ProfileService,
              private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    this.getAllLogs();
    this.getAllProfilesLength();
    this.getClients();
    this.getEvents();
    this.mainService.getNavigators().subscribe((res: any) =>{
      this.navigators = res ? res : [];
    })

    this.user = localStorage.getItem('user') ? new Object(localStorage.getItem('user')).toString() : '';
    let role = this.user.length > 0 ? JSON.parse(this.user).re : '';
    let role_dec = this.mainService.decrypt(role ? role : '', 'r0l3_3nc');
    this.role_dec_logged = role_dec.toLowerCase();
    
  }

  getEvents(){
    this.mainService.getEvents(2).subscribe((result: any) =>{
      if(result){
        this.events = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",  "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        result.forEach((e: any) =>{
          const data: any = {
            event_date: e.payload.doc.data().event_date ? e.payload.doc.data().event_date.toDate() : '',
            event_title: e.payload.doc.data().event_title ? e.payload.doc.data().event_title : '',
            doc_id: e.payload.doc.id,
            event_month: e.payload.doc.data().event_date ? monthNames[e.payload.doc.data().event_date.toDate().getMonth()] : '',
          }
          this.events.push(data);   
        });
      }     
    });
  }


  getClients(){
    this.mainService.getTasks(10).subscribe((result: any) =>{
      this.clients = result ? result : [];    
    })
  }

  createInvoice(){    
    if(this.role_dec_logged === 'admin'){
      this.router.navigate([this.role_dec_logged + `/add-invoices`]);
    }
  }

  getAllProfilesLength(){
    this.prof.getAllProfilesLength().subscribe((res: any) =>{
      this.totalMember = res ? res.docs.length : 0;      
    });
  }

  getAllLogs(){
    this.mainService.getLogsForAttendance().subscribe((result: any) =>{
      this.notifs = [];
      this.notifsPassed = [];
      this.notifs = result ? result : [];
      this.notifs.forEach((val: any) =>{
        this.prof.getUserProfile(val.members_id).subscribe((results: any) =>{
          if(results){
            const data = {
              full_name: results.full_name || '',
              time: moment(val.time.toDate()).fromNow(),
              action: val.action
            }
            this.notifsPassed.push(data);
          }
        });
      });
    });
  }

  getProfile(id: any){}

  logOut() {
    localStorage.clear()
    this.authService.logout();
  }

  selectedNav(selected: any) {
    this.router.navigate([selected]);
 }

  openProfile(){
    this.router.navigate(['my-profile']);
  }

}
