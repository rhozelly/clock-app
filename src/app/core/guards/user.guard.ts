import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthenticationService} from "../services/authentication.service";
import {MainService} from "../services/main.service";

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  user: any;

  constructor(private router: Router,
              private authService: AuthenticationService,
              private main: MainService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const url: string = state.url;
    return this.isLoggedIn(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }

  isLoggedIn(url: string): boolean {
    if (localStorage.length > 0 && localStorage.getItem('collection-id')) {
      this.user = new Object(localStorage.getItem('user')).toString();
      let role = JSON.parse(this.user).re;
      let role_dec = this.main.decrypt(role ? role : '', 'r0l3_3nc');
      const logged_in = role_dec.toLowerCase()
      if (logged_in === 'user') {
        this.authService.isLoggedIn = true;
        return true;
      }
    }
    this.authService.isLoggedIn = false;
    this.router.navigate(['/login']);
    return false;
  }

}
