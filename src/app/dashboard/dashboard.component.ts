import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../core/services/authentication.service';
import {MainService} from "../core/services/main.service";
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
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
  
  constructor(private authService : AuthenticationService,
              private mainService: MainService,
              private router: Router,
              private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    this.mainService.getNavigators().subscribe((res: any) =>{
      this.navigators = res ? res : [];
    })
  }

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
