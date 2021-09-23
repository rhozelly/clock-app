import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthguardGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      if (localStorage.getItem('user') != null || localStorage.getItem('user') != undefined) {
        return true;
      }
      else {
        this.routes.navigate(['/login']);
        return false;
      }
  }
  constructor( private routes: Router){}
}
