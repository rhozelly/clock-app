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
import {animate, style, transition, trigger} from "@angular/animations";

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



  constructor(private authService: AuthenticationService,
              private mainService: MainService,
              private profileService: ProfileService,
              private router: Router,
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
    
    // 2 minutes

    // this.idid = setInterval(() => {
    //   this.idle = this.count === 1;
    //   if (this.idle) {
    //     this.mainService.getLogs(this.myID).subscribe((res: any) => {
    //       // console.log(res);
    //     })
    //     // pending
    //     //check logs
    //     //then logout
    //     // this.battleInit();
    //   }
    //   // console.log(this.auto_logout_time);      
    // }, this.auto_logout_time); // 10 minutes

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
    this.isLoggedIn = this.collectionId !== null;
  }

  logOut() {
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
            window.location.reload();
          }, 1500);
        }
      });
    } else {
      console.log('here else');

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
          window.location.reload();
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
