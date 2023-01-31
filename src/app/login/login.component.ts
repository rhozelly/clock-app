import {Component, DoCheck, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../core/services/authentication.service';
import {SettingsService} from "../core/services/settings.service";
import {MainService} from "../core/services/main.service";
import * as bcrypt from 'bcryptjs';
import {animate, animateChild, query, style, transition, trigger} from "@angular/animations";

import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import { HttpClient } from '@angular/common/http';
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
    private http:HttpClient
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

  ddd(){
    this.http.get("http://localhost:1337/login").subscribe((res:any)=>{
      console.log("===============");
      console.log(res.ip);

    })
    // this.main.decrypt('$2a$10$JjG2cxeHIdYVAnQ9CxFNaOXEv39cUVae/xOWwykZZ1I72a.KihfCu', );
  }

  public sendEmail(e: Event) {
    console.log(e.target);
    const data  = {
      to_name: 'John Doe',

    }
    // e.preventDefault();
    // emailjs.sendForm('service_hhn8p3g', 'template_jtrqbhh', e.target as HTMLFormElement, '1ZDnL4a8Vkz8jByIR')
    //   .then((result: EmailJSResponseStatus) => {
    //     console.log(result.text);
    //   }, (error) => {
    //     console.log(error.text);
    //   });
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
    const result2 = <any>await this.makeUserOnline(result1);
    const result3 = <any>await this.creatingLogs(result2);
    
    if (result2 && result3) {
      window.location.reload(); 
      this.snack('Login Successful!');
    } else {
      this.overlays = 'default__overlay';
      this.snack('Invalid Credentials.');
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
            if(valid){      
              localStorage.setItem('user', JSON.stringify(this.logging_in_user));
              localStorage.setItem('collection-id', this.logging_in_id_encrypted);
              resolve(valid);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });
    });
  }

  makeUserOnline(exist: any) {
    return new Promise(resolve => {
      if(exist){
        this.main.updateOnlineField(this.logging_in_id, true).then((result: any) => {
            resolve(true);
          }).catch((error: any) => {
          });
      } else {
        resolve(false);
      }
    })
  }

  creatingLogs(exist: any) {
    return new Promise(resolve => {
      if(exist){
        const value = {
          updated_at: new Date(),
          user_id: this.logging_in_id,
          tokens: this.token,
          uid: this.uid,
          browser: window.navigator.userAgent,
        };
        this.main.addLogsData(value).then((docRef) => {
          const valueToUpdate = {
            updated_at: new Date(),
            user_id: this.logging_in_id,
            tokens: this.token,
            uid: this.uid,
            recent_doc_id: docRef.id,
            browser: window.navigator.userAgent,
          };
          this.main.updateLogsData(valueToUpdate).then(two => {
            sessionStorage.setItem('cookies', JSON.stringify(docRef.id));
            resolve(true);
          }).catch(err => {
            resolve(false);
          })
        }).catch(err => {
          resolve(false);
        })
      } else {
        resolve(false);
      }
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
