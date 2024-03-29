import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {ActivatedRoute, Router} from '@angular/router';
import {MainService} from "./main.service";

import * as myGlobals from '../../../../globals';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  acc: any = 'account';
  isLoggedIn: boolean = false;

  constructor(private fireAuth: AngularFireAuth,
              private firestore: AngularFirestore,
              private route: ActivatedRoute,
              private main: MainService,
              private router: Router,) {
  }

  createUserWithEmailAndPassword(email: string, password: string) {
    this.fireAuth.createUserWithEmailAndPassword(email, password).then(
      cred => {
        console.log(cred.user)
      }
    )
  }

  // logins(email: string, password: string) {
  //   this.fireAuth.signInWithEmailAndPassword(email, password).then(cred => {
  //     console.log(cred.user)
  //   })
  // }

  login(uname: any) {
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_accs)
    .collection(myGlobals.tbl_acc, ref => ref.where("uname", "==", uname)).snapshotChanges();
  }

  logout() {
    this.fireAuth.signOut().then(() => {
      console.log('User successfully signed out.')
    })
  }

  checkState() {
    // this.fireAuth.onAuthStateChanged((user: any) => {
    //   if (user) {
    //     // localStorage.setItem('user', JSON.stringify(user));
    //     // localStorage.setItem('collection-id', '0052021');
    //     this.router.navigate([this.role_dec_logged + '/dashboard']);
    //   } else {
    //     this.router.navigateByUrl('/login');
    //   }
    // })
  }

  getCompanyLocation(){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_app).snapshotChanges();
  }

}
