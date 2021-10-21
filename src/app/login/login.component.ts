import {Component, DoCheck, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../core/services/authentication.service';
import {SettingsService} from "../core/services/settings.service";
import {MainService} from "../core/services/main.service";
import * as bcrypt from 'bcryptjs';
import {animate, animateChild, query, style, transition, trigger} from "@angular/animations";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(10px)'}),
        animate('500ms', style({opacity: 1, transform: 'translateY(0)'})),
      ]),
      transition(':leave', [
        animate('500ms', style({opacity: 0, transform: 'translateY(10px)'})),
      ]),
    ]),
  ]
})
export class LoginComponent implements OnInit, DoCheck {
  form: FormGroup;
  public loginInvalid = false;
  private formSubmitAttempt = false;
  private returnUrl: string;
  token: any = '';
  uid: any = '';
  loggedIn: boolean = false;
  successful_login: boolean = false;


  logging_in_data: any = [];
  logging_in_id: any = '';
  logging_in_user: any = [];
  logging_in_user_role: any = '';
  logging_in_id_encrypted: any = '';

  overlays: any = 'default__overlay';
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private sett: SettingsService,
    private main: MainService,
  ) {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/dashboard';
    this.form = this.fb.group({
      uname: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.uid = this.main.randomNumber(25);
  }


  ngDoCheck() {
    // this.authService.checkState();

  }

  getTokenLogins() {
    this.main.getTokenLogins().subscribe((res: any) => {
      this.token = res.logins ? res.logins : [];
    });
  }


  async onSubmit() {
    this.loginInvalid = false;
    this.formSubmitAttempt = false;
    this.overlays = 'overlay__overlay';
    const result1 = <any>await this.getUsername();
    const result2 = <any>await this.makeUserOnline();
    const result3 = <any>await this.creatingLogs();
    if (result1 && result2 && result3) {
      sessionStorage.setItem('cookies', JSON.stringify(this.uid));
      localStorage.setItem('user', JSON.stringify(this.logging_in_user));
      localStorage.setItem('collection-id', this.logging_in_id_encrypted);
      this.snack('Login Successful!');
      window.location.reload();
    }
  }

  getUsername() {
    return new Promise(resolve => {
      this.authService.login(this.form.get('uname')?.value).subscribe((results: any) => {
        if (results.length > 0) {
          const data = results[0].payload.doc.data();
          this.logging_in_data = data;
          this.logging_in_user_role = data.role ? data.role.toLowerCase() : '';
          const id = results[0].payload.doc.id;
          this.logging_in_id_encrypted = this.main.encrypt(id, 'collection-id');
          this.logging_in_id = results[0].payload.doc.id;
          let priv_enc = this.main.encrypt(data.priv ? data.priv : '', 'pri^_3nc');
          let role_enc = this.main.encrypt(data.role ? data.role : '', 'r0l3_3nc');
          this.logging_in_user = {pe: priv_enc, re: role_enc};
          bcrypt.compare(this.form.get('password')?.value, data.password, (err: any, valid: any) => {
            resolve(valid);
          });
        }
      });
    });
  }

  makeUserOnline() {
    return new Promise(resolve => {
      this.main.updateOnlineField(this.logging_in_id, true).then(res => {
        resolve(true);
      }).catch(err => {
        resolve(false);
      });
    });
  }

  creatingLogs() {
    return new Promise(resolve => {
      const value = {
        updated_at: new Date(),
        user_id: this.logging_in_id,
        tokens: this.token,
        uid: this.uid,
        browser: window.navigator.userAgent,
      };
      this.main.addLogsData(value).then(res => {
        resolve(true);
      }).catch(err => {
        resolve(false);
      })
    });
  }


  // async onSubmit(): Promise<void> {
  //   this.loginInvalid = false;
  //   this.formSubmitAttempt = false;
  //   this.authService.login(this.form.get('uname')?.value).subscribe((results: any) => {
  //     //u$3r_3nc
  //     //pri^_3nc
  //     //r0l3_3nc
  //     if (results.length > 0) {
  //       const data = results[0].payload.doc.data();
  //       const role = data.role ? data.role.toLowerCase() : '';
  //       const id = results[0].payload.doc.id;
  //       let priv_enc = this.main.encrypt(data.priv ? data.priv : '', 'pri^_3nc');
  //       let role_enc = this.main.encrypt(data.role ? data.role : '', 'r0l3_3nc');
  //       const user = {pe: priv_enc, re: role_enc};
  //       bcrypt.compare(this.form.get('password')?.value, data.password, (err: any, valid: any) => {
  //         const id_encrypted = this.main.encrypt(id, 'collection-id');
  //         if (valid) {
  //           console.log('');
  //           this.main.updateOnlineField(id, true);
  //           const value = {
  //             updated_at: new Date(),
  //             user_id: id,
  //             tokens: this.token,
  //             uid: this.uid,
  //             browser: window.navigator.userAgent,
  //           };
  //           console.log('');
  //           this.main.addLogsData(value);
  //           sessionStorage.setItem('cookies', JSON.stringify(this.uid));
  //           this.snack('Login Successful!');
  //           localStorage.setItem('user', JSON.stringify(user));
  //           localStorage.setItem('collection-id', id_encrypted);
  //           this.router.navigateByUrl([role] + '/main-dashboard');
  //         } else {
  //           this.snack('Invalid Password.');
  //           this.loginInvalid = true;
  //           this.router.navigateByUrl('/login');
  //         }
  //       })
  //     }
  //     window.location.reload();
  //   });
  // }


  snack(m: any) {
    this.sett.snackbar(m, 'X', 2000, 'orange-snackbar');
  }
}
