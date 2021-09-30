import {Component, DoCheck, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../core/services/authentication.service';
import {SettingsService} from "../core/services/settings.service";
import {MainService} from "../core/services/main.service";
import * as bcrypt from 'bcryptjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, DoCheck {

  form: FormGroup;
  public loginInvalid = false;
  private formSubmitAttempt = false;
  private returnUrl: string;
  token: any = '';
  successful_login: boolean = false;

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
    this.getTokenLogins();
  }

  ngDoCheck() {
    // this.authService.checkState();
  }

  getTokenLogins() {
    this.main.getTokenLogins().subscribe((res: any) => {
      this.token = res.logins ? res.logins : [];
    });
  }


  async onSubmit(): Promise<void> {
    this.loginInvalid = false;
    this.formSubmitAttempt = false;
    this.authService.login(this.form.get('uname')?.value).subscribe((results: any) => {
      //u$3r_3nc
      //pri^_3nc
      //r0l3_3nc
      if (results.length > 0) {
        const data = results[0].payload.doc.data();
        const role = data.role ? data.role.toLowerCase() : '';
        const id = results[0].payload.doc.id;
        let priv_enc = this.main.encrypt(data.priv ? data.priv : '', 'pri^_3nc');
        let role_enc = this.main.encrypt(data.role ? data.role : '', 'r0l3_3nc');
        const user = {pe: priv_enc, re: role_enc};
        bcrypt.compare(this.form.get('password')?.value, data.password, (err: any, valid: any) => {
          const id_encrypted = this.main.encrypt(id, 'collection-id');
          if (valid) {
            this.main.updateOnlineField(id, true);
            this.snack('Login Successful!');
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('collection-id', id_encrypted);
            this.router.navigateByUrl([role] + '/main-dashboard');
          } else {
            this.snack('Invalid Password.');
            this.loginInvalid = true;
            this.router.navigateByUrl('/login');
          }
        })
      }
    });
  }

  //     if (results.length > 0) {
  //       const data = results[0].payload.doc.data();
  //       const id = results[0].payload.doc.id;
  //       const id_encrypted = this.main.encrypt(id, 'collection-id');
  //       let encrypted = SHA256(data).toString();
  //       localStorage.setItem('user', encrypted);
  //       pass_decrypted = this.main.decrypt(data.password, this.token);
  //       this.successful_login = this.form.get('password')?.value === pass_decrypted;
  //       if (this.successful_login) {
  //         this.snack('Login Successful!');
  //         // localStorage.setItem('user', JSON.stringify(user));
  //         localStorage.setItem('collection-id', id_encrypted);
  //         this.router.navigateByUrl('/dashboard');
  //       } else {
  //         this.snack('Invalid Password.');
  //         this.loginInvalid = true;
  //         this.router.navigateByUrl('/login');
  //       }
  //     } else {
  //       this.snack('Invalid Username.');
  //       this.router.navigateByUrl('/login');
  //       this.loginInvalid = true;
  //     }
  //   });
  //   // try {
  //   //   const email = this.form.get('uname')?.value;
  //   //   const password = this.form.get('password')?.value;
  //   //   await this.authService.login(email, password);
  //   //   this.snack('Invalid Credentials');
  //   // } catch (err) {
  //   //   this.loginInvalid = true;
  //   // }
  // } else {
  //   this.formSubmitAttempt = true;
  // }

  snack(m: any) {
    this.sett.snackbar(m, 'X', 2000, 'orange-snackbar');
  }
}
