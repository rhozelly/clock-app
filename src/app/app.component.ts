import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {NavigationEnd, Router, Event as NavigationEvent} from '@angular/router';
import {AuthenticationService} from './core/services/authentication.service';
import {MainService} from "./core/services/main.service";
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {ProfileService} from "./core/services/profile.service";
import { AttendanceService } from './core/services/attendance.service';
import * as myGlobals from '../../globals';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent implements DoCheck, OnInit {
  // @HostListener('window:beforeunload', ['$event'])
  // beforeunloadHandler(event: any) {
  //   setTimeout((x: any) => {
  //     this.mainService.test(event);
  //   }, 2000)
  // }

  defaultProfileImage: string = 'assets/app-images/profile-default.jpg';
  page: any;
  collectionId: any;
  currentRoute: any;
  isLoggedIn: any;
  navigators: any = [];
  profile: any;
  myID: any;
  role_dec_logged: any;
  user: any;
  roleExist: boolean = true;
  loggedIn: boolean = true;
  rolePrivs: any = [];
  active_class: string = '';
  session_cookie: any = '';
  uid: any = '';
  auto_logout_time: any;

  clicked: boolean = false;

  overlays: any = 'default__overlay';
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  interval: any;
  idid: any;
  idids: any;
  idle: boolean = false;
  changeText: boolean = false;
  count: number = 0;
  copyright: any = '';
  company_logo: any = '';
  showFilter: boolean = false;

  sub_navs: any = [];
  menu: any = [];

  todayExist: boolean = false;
  spinner: boolean = false;

  constructor(private authService: AuthenticationService,
              private mainService: MainService,
              private profileService: ProfileService,
              private attService: AttendanceService,
              private router: Router,
              private sb: MatSnackBar,
              private breakpointObserver: BreakpointObserver) {
    this.profile = [];
  }

  movementCount() {
    this.count++;
  }

  ngOnDestroy() {
    if (this.idid) {
      clearInterval(this.idid);
    }
    if (this.idids) {
      clearInterval(this.idids);
    }
  }

  ngOnInit() {
    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.mainService.decrypt(collection_id, 'collection-id');
    
    if (collection_id !== null) {
      this.uid = this.mainService.randomNumber(25);
      const tokens = this.mainService.randomNumber(12);
      const cookies = this.getSession();
      if (cookies === null) {
        sessionStorage.setItem('cookies', JSON.stringify(this.uid));
        const data = {
          user_id: this.myID,
          tokens: tokens,
          uid: this.uid,
        };
        this.mainService.addLogsData(data);
      }
    } else {

    }


    this.idids = setInterval(() => {
      if (this.count > 0) {
        this.count = 0;
      }
    }, 120000); 

    this.getPrivileges();
    this.getCopyright();
    this.getAutoLogout();

    this.user = localStorage.getItem('user') ? new Object(localStorage.getItem('user')).toString() : '';
    
    let role = this.user.length > 0 ? JSON.parse(this.user).re : '';
    let role_dec = this.mainService.decrypt(role ? role : '', 'r0l3_3nc');
    this.role_dec_logged = role_dec.toLowerCase();
    this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        this.menu = this.currentRoute.split('/');
        // if(this.role_dec_logged){  
        //   if(this.menu[2]){
        //     this.router.navigate([this.role_dec_logged + `/${this.menu[2]}`]);
        //   }
        // }
      }
    });
    if (this.currentRoute === '/login') {
      this.router.navigate(['/login']);
    } else if (this.currentRoute === '/attendance') {
      this.router.navigate(['/attendance']);
    } else {      
      if (localStorage.getItem('user')) {
        this.mainService.getNavigators().subscribe((res: any) => {
          this.checkAttendanceToday()
          if(this.menu[2] === undefined){
              this.router.navigate([this.role_dec_logged + '/dashboard']);
          } else {
            if(this.menu[3] === undefined) {
                this.router.navigate([this.role_dec_logged + `/${this.menu[2]}`]);
            } else {
                if(this.menu[2] !== 'dashboard'){
                  this.router.navigate([this.role_dec_logged + `/${this.menu[2]}/${this.menu[3]}`]);
                } else {
                  this.router.navigate([this.role_dec_logged + '/dashboard']);
                }
            }
          }
          if (res !== undefined) {
            if (res.length > 0) {
              if (this.rolePrivs[0].toString() === 'all') {
                this.navigators = res ? res : [];
              } else {
                this.rolePrivs.forEach((val: any) => {
                  let nav = res ? res[parseFloat(val) - 1] : [];
                  this.navigators.push(nav);
                })
              }
            }
          }
        })
        
        this.isLoggedIn = this.myID.length > 0;
        if (this.myID.length > 0) {
            this.mainService.getLogin(this.myID).subscribe((res: any) => {
            // this.isLoggedIn = res ? res.online : [];
          });
          this.profileService.getUserProfile(this.myID).subscribe((res: any) => {
            this.profile = res ? res : [];
          });
        } else {
        } 
      }
    }
    let user = localStorage.getItem('user');
    this.page = !!user;
    
    if(this.myID !== undefined){
      if(this.myID !== null){
        this.isLoggedIn = true;
        // window.location.reload();
        // this.router.navigate(['admin/dashboard']);
      } else {
        this.isLoggedIn = false;
      }
    } else {
      this.isLoggedIn = false;
    }
    
  }

  time(){
    this.checkFieldDateAttendance(this.myID);
  }

  checkFieldDateAttendance(id: any) {
    const clock_in = new Date();
    this.attService.logTimein(id, clock_in, myGlobals.today).then(resolved => {
      if (resolved.id) {
        // Update Needed Tables
        this.attService.updateTimeinTable(id, resolved.id).then(resolve_update_table => {
          const arr = {
            time: new Date(),
            members_id: id,
            action: 'timed in'
          };
          this.addLogsforAttendance(arr);          
        }).catch(error_update_table => {
          this.openSnackBar('Something went wrong!', 'X', 'red-snackbar');
        });
      } else {
        this.openSnackBar('Something went wrong!', 'X', 'red-snackbar');
      }
    })
  }
  addLogsforAttendance(data: any){
    this.mainService.addLogsForAttendance(data).then(res =>{
      if(res === undefined){
        this.openSnackBar('Timed in!', 'X', 'green-snackbar');
      }
    })
  }
  openSnackBar(message: string, action: string, c: any) {
    this.sb.open(message, action, {
      duration: 2500,
      panelClass: c
    });
  }

  checkAttendanceToday(){
    let todayDate = moment(myGlobals.date_today, 'DD-MM-YYYY');
    this.attService.attendanceExist(this.myID).subscribe((query: any) =>{  
      if(query.length > 0){
        query.forEach((element: any) => {
          let id = element.payload.doc.id;
          let pastDate = moment(element.payload.doc.data().date.toDate(), 'DD-MM-YYYY');
            const latest_date_logged_in = element.payload.doc.data().date.toDate().getDate();
            if(myGlobals.date_today === latest_date_logged_in){             
                this.todayExist = element.payload.doc.exists;   
            } else {}
              let dDiff = todayDate.diff(pastDate);
              if (dDiff > 0) {
                // Logout Yesterday
                  let default_out = new Date(element.payload.doc.data().date.toDate()).setHours(17, 0, 0);
                  let time_out = new Date(default_out);
                  if(element.payload.doc.data().time_out.length === 0) {
                    this.attService.timeout(this.myID, id, time_out).then((resolve: any) =>{
                        this.todayExist = false;
                        this.checkFieldDateAttendance(this.myID);
                    });
                  }
                }
          });
    } else {
      this.todayExist = false;  
      this.mainService.checkAccountId(this.myID).subscribe((exist: any) =>{
          if(exist.payload.exists){
              this.checkFieldDateAttendance(this.myID);
          }         
      })
    }
            
    });
  }

  getAutoLogout() {
    this.mainService.getAutoLogout().subscribe((result: any) =>{
      this.auto_logout_time = result.auto_logout || 6000;
    })
  }

  getSession() {
    return sessionStorage.getItem('cookies');
  }

  getPrivileges() {
    this.mainService.getPriv().subscribe((result: any) => {
      const keys = Object.keys(result);
      let value: any;
      keys.forEach((val: any, i: any, data: any) => {
        if (val === this.role_dec_logged) {
          value = data[i]
        }
        this.roleExist = val === this.role_dec_logged;
        return;
      })
      const priv = result[value];
      this.rolePrivs = priv ? priv.split(',') : [];
    })
  }

  ngDoCheck(): void {
    this.collectionId = localStorage.getItem('collection-id');
    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.mainService.decrypt(collection_id, 'collection-id');
    this.user = localStorage.getItem('user') ? new Object(localStorage.getItem('user')).toString() : '';
 
    if(this.myID !== undefined){
      if(this.myID !== null){
        if(this.myID.length > 0){
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      } else  {
        this.isLoggedIn = false;
      }
    } else {
      this.isLoggedIn = false;
    }
  }

  logOut() {
    this.spinner = true;
    const that = this;   
    if (sessionStorage.getItem('cookies')) {
      let session_cookie: any = sessionStorage.getItem('cookies');
      this.session_cookie = session_cookie.replace(/"/g, '')
      this.overlays = 'overlay__overlay';
      this.mainService.getLogsData(this.myID, this.session_cookie).subscribe((val: any) => {
        if (!val.empty) {
          this.mainService.removeLogs(val.id);
          this.mainService.updateOnlineField(this.myID, false);
          setTimeout(function () {
            localStorage.clear()
            sessionStorage.clear()
            that.authService.logout();
            that.router.navigate(['login']);
            that.isLoggedIn = false;
            that.spinner = false;
          }, 1500);
        }
      });
    } else {
      this.mainService.offline(this.myID);
      setTimeout(function () {
        that.mainService.findUserId(that.myID).subscribe((res: any) => {
          let bool = !res.empty;
          // that.mainService.updateOnlineField(that.myID, bool);
        });
        setTimeout(function () {
          localStorage.clear()
          sessionStorage.clear()
          that.authService.logout();
          that.router.navigate(['login']);
          that.isLoggedIn = false;
          that.spinner = false;
          // window.location.reload();
        }, 2500);
      }, 1500);
    }
  }

  selectedNav(selected: any) {
    if(selected.nav_name === 'invoices'){
      // if(selected.sub_nav.length > 0) {
      //   selected.sub_nav.forEach((y: any) => {
      //     const sub_nav_replace  = y.replace(/\s+/g, '-').toLowerCase();   
      //     this.sub_navs.push(sub_nav_replace);      
      //   });
        this.router.navigate([this.role_dec_logged + '/' + 'add-invoices']);
      // }
      // this.showFilter = this.showFilter ? false : true ;     
    } else if(selected.nav_name === 'reports') {
      this.router.navigate([this.role_dec_logged + '/' + 'invoice-report']);
    } else if(selected.nav_name === 'attendance' && this.role_dec_logged === 'admin') {
      this.router.navigate([this.role_dec_logged + '/' + 'calendar']);    
    } else if(selected.nav_name === 'attendance' && this.role_dec_logged === 'user') {
      this.router.navigate([this.role_dec_logged + '/attendance', this.myID]);
    } else {
      this.router.navigate([this.role_dec_logged + '/' + selected.nav_name]);
    }
  }

  subNav(i: any){
    this.router.navigate([this.role_dec_logged + '/' + this.sub_navs[i]]);
  }

  openProfile() {
    this.router.navigate([this.role_dec_logged + '/my-profile']);
  }

  
  settings() {
    this.router.navigate([this.role_dec_logged + '/settings']);
  }


  getCopyright() {
    this.mainService.getCompanyInformation().subscribe((result: any) => {
      this.copyright = result.copyright || '';
      this.company_logo = result.company_logo || '';
    })
  }
}
