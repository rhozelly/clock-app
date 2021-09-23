import {Component, DoCheck, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router, Event as NavigationEvent} from '@angular/router';
import {AuthenticationService} from './core/services/authentication.service';
import {MainService} from "./core/services/main.service";
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {ProfileService} from "./core/services/profile.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements DoCheck, OnInit {
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
  rolePrivs: any = [];
  active_class: string = '';
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private authService: AuthenticationService,
              private mainService: MainService,
              private profileService: ProfileService,
              private router: Router,
              private breakpointObserver: BreakpointObserver) {
    this.profile = [];
  }

  ngOnInit() {
    this.getPrivileges();
    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.mainService.decrypt(collection_id, 'collection-id');
    this.user = localStorage.getItem('user') ? new Object(localStorage.getItem('user')).toString() : '';
    let role = this.user.length > 0 ? JSON.parse(this.user).re : '';
    let role_dec = this.mainService.decrypt(role ? role : '', 'r0l3_3nc');
    this.role_dec_logged = role_dec.toLowerCase();
    this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
    if (this.currentRoute === '/login') {
      this.router.navigate(['/login']);
    } else if (this.currentRoute === '/attendance') {
      this.router.navigate(['/attendance']);
    } else {
      if (localStorage.getItem('user')) {
        this.mainService.getNavigators().subscribe((res: any) => {
          this.router.navigate([this.role_dec_logged + '/dashboard']);
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

        if (this.myID.length > 0) {
          this.mainService.getLogin(this.myID).subscribe((res: any) => {
            this.isLoggedIn = res ? res.online : [];
          });
          this.profileService.getUserProfile(this.myID).subscribe((res: any) => {
            this.profile = res ? res : [];
          });
        }
      }
    }
    let user = localStorage.getItem('user');
    this.page = !!user;
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
    localStorage.clear()
    this.authService.logout();
    this.router.navigate(['login']);
    window.location.reload();
  }

  selectedNav(selected: any) {
    this.active_class = 'active-list-item';
    this.router.navigate([this.role_dec_logged + '/' + selected]);
  }

  openProfile() {
    this.router.navigate([this.role_dec_logged + '/my-profile']);
  }
}
