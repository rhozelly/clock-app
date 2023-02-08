import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MainService} from "../../core/services/main.service";
import {ProfileService} from "../../core/services/profile.service";
import {AngularFireStorage} from "@angular/fire/storage";
import {SettingsService} from "../../core/services/settings.service";
import {MatStepper} from "@angular/material/stepper";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import { InvoiceService } from 'src/app/core/services/invoice.service';
import {MatDialog} from "@angular/material/dialog";
import { AlertMessageComponent } from 'src/app/alert-message/alert-message.component';
import * as bcrypt from 'bcryptjs';
@Component({
  selector: 'app-add-employee-dialog',
  templateUrl: './add-employee-dialog.component.html',
  styleUrls: ['./add-employee-dialog.component.css']
})
export class AddEmployeeDialogComponent implements OnInit {
  defaultProfileImage: string = 'assets/app-images/profile-default.jpg';
  employeeForm: FormGroup;
  accountForm: FormGroup;
  deductionForm: FormGroup;
  bloodTypes: any;
  positions: any;
  position: any;
  bloodType: any;
  roles: any;
  role: any;
  myID: any;

  ref: any;
  task: any;
  uploadProgress: any;
  uploadState: any;
  downloadURL: any;

  invalidEmail: any = '';
  message: any = '';
  imagePath: any = '';
  imgURL: any = '';
  fileImage: any = [];
  showContainer: any;
  token: any;

  // Responsive Related
  orientation: any = 'horizontal';
  mode: any = 'determinate';
  unameExist: boolean = false;
  disabledButton: boolean = false;
  hidePercentage: boolean = false;
  percentage: any = 0;

  changePass: any = [];
  hidePasswordForm = true;

  basicPayModel: any;

  constructor(
              private dialog: MatDialog,
              public dialogRef: MatDialogRef<AddEmployeeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public employee: any,
              private mainService: MainService,
              private storage: AngularFireStorage,
              private profileService: ProfileService,
              private sett: SettingsService,
              private fb: FormBuilder,
              public breakpointObserver: BreakpointObserver,
              private inv: InvoiceService,
  ) {
    this.employeeForm = this.fb.group({
      first_name: [null, Validators.required],
      last_name: [null, Validators.required],
      full_name: [null],
      contact_no: [null, Validators.maxLength(12)],
      profile_img: [null],
      blood_type: [null],
      address: [null],
      email_add: [null, [Validators.required, Validators.email]],
      emergency_contact: [null],
      emergency_name: [null],
      created_at: [null],
      updated_at: [new Date()],
      files: [null],
      online: [false],
    });
    this.accountForm = this.fb.group({
      uname: [null, Validators.required],
      password: [null, Validators.required],
      created_at: [null],
      priv: [null],
      profile_id: [null, Validators.required],
      role: [null],
      position: [null],
      archived: [false],
      updated_at: [new Date()],
      basicpay: [null, Validators.required],
      hourlyrate: [null, Validators.required],
      dailyrate: [null, Validators.required],
      date_joined: [null, Validators.required],
    }); 
    this.deductionForm = this.fb.group({
      sss: [0],
      pagibig: [0],
      philhealth: [0],
      tax: [0],
    })  
  }

  alertMessage(view: any, data: any) {
    const dialogRef = this.dialog.open(AlertMessageComponent, {
      data: {action: view, data: data}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if(result === 'yes'){
        this.removeCollections();
      }
    });
  }

  ngOnInit(): void {
    this.accountForm.get('basicpay')?.valueChanges.subscribe(value =>{
      if (value !== null) {
        this.computePays(value);
      }      
    });


    this.breakpointObserver.observe(['(max-width: 1024px)']).subscribe(result => {
      this.orientation = result.matches ? 'vertical' : 'horizontal';
    });

    this.getPositions();
    this.getBloodTypes();
    this.getRole();
    this.getTokenLogins();
    
    if (this.employee.action === 'add') {
      this.myID = localStorage.getItem('collection-id');
    } else {
      this.imgURL = this.employee.data.profile_img;
      this.bloodType = this.employee.data.blood_type;
      this.patchEmployeeForm(this.employee.data);
      this.getAccount(this.employee.data.id);
      this.getInvoicesOfDeduction(this.employee.data.id);
    }
    this.accountForm.get('uname')?.valueChanges.subscribe(x => {
      this.mainService.checkUsername(x).subscribe((res: any) => {
        this.unameExist = res.length > 0;
        this.checkFormIfTouched()
      })
    });

    this.employeeForm.valueChanges.subscribe(res => {
      this.checkFormIfTouched()
    });

    
  }

  basicPayChange(){
    this.computePays(this.accountForm.get('basicpay')?.value);
  }

  computePays(val: any){
    let hourlyrate = 0;
    let dailyrate = 0;
    if(val !== undefined){
      const half = val / 2;
      dailyrate = half / 11;
      hourlyrate = dailyrate / 8;
    }
    this.accountForm.get('dailyrate')?.setValue(parseFloat(dailyrate.toFixed(2)));
    this.accountForm.get('hourlyrate')?.setValue(parseFloat(hourlyrate.toFixed(2)));
  }


  checkAccountFormField() {
    if (this.accountForm.get('role')?.dirty || this.accountForm.get('uname')?.dirty) {
      this.checkFormIfTouched();
    }
    this.mainService.checkUsername(this.accountForm.get('uname')?.value).subscribe((res: any) => {
      if (res.length > 0) {
        if (res[0].payload.doc.id === this.employee.data.id) {
          this.unameExist = false;
        }
      }
      this.unameExist = res.length > 0;
    })
  }

  previous(stepper: MatStepper) {
    stepper.previous();
  }

  next(stepper: MatStepper) {
    this.checkFormIfTouched()
    if (stepper.selectedIndex === 0) {
      //  Basic Information
      if (this.employeeForm.valid) {
        stepper.next();
      } else {
        this.employeeForm.markAllAsTouched();
      }
    } else if (stepper.selectedIndex === 1) {
      //  Account Information
      if (this.accountForm.valid) {
        stepper.next();
      } else {
        this.accountForm.markAllAsTouched();
      }
    }
  }

  patchEmployeeForm(data: any) {
    this.employeeForm = this.fb.group({
      first_name: [data.first_name],
      full_name: [data.first_name + data.last_name],
      last_name: [data.last_name],
      contact_no: [data.contact_no],
      profile_img: [data.profile_img],
      blood_type: [data.blood_type],
      address: [data.address],
      email_add: [data.email_add],
      emergency_contact: [data.emergency_contact],
      emergency_name: [data.emergency_name],
      created_at: [data.created_at],
      updated_at: [data.updated_at],
      files: [data.files],
      online: [data.online]
    });
  }

  patchAccountForm(data: any) {
    this.accountForm = this.fb.group({
      uname: [data.uname],
      password: [],
      created_at: [data.created_at],
      priv: [data.priv],
      profile_id: [data.profile_id],
      role: [data.role],
      position: [data.position],
      updated_at: [''],
      archived: [data.archived],
      basicpay: [data.basicpay],
      hourlyrate: [data.hourlyrate],
      dailyrate: [data.dailyrate],
      date_joined: [new Date(data.date_joined.toDate())],
    });
  }
  
  patchDeductionForm(data: any) {
    this.deductionForm = this.fb.group({
      sss: [data.sss],
      pagibig: [data.pagibig],
      philhealth: [data.philhealth],
      tax: [data.tax],
    });
  }


  getAccount(id: any) {
    this.mainService.getAccount(id).subscribe((value: any) => {
      if (value) {
        this.patchAccountForm(value);
      }
    });
  }

  getInvoicesOfDeduction(id : any){
    this.inv.getInvoicesOfDeduction(id).subscribe((res: any) =>{
      if(res){
        this.patchDeductionForm(res);
      }   
    })
  }

  getBloodTypes() {
    this.mainService.getBloodType().subscribe((res: any) => {
      if (res && res.bloodtypes.length > 0) {
        this.bloodTypes = res.bloodtypes;
      }
    })
  }


  getPositions() {
    this.mainService.getCategories().subscribe((res: any) => {
      if (res && res.position.length > 0) {
        this.positions = res['position'];
      }
    })
  }

  getRole() {
    this.mainService.getRoles().subscribe((res: any) => {
      if (res && res.role.length > 0) {
        this.roles = res.role;
      }
    })
  }

  getTokenLogins() {
    this.mainService.getTokenLogins().subscribe((res: any) => {
      if (res.logins !== undefined) {
        this.token = res.logins;
      }
    });
  }

  removeCollections() {
    this.mainService.deleteEmployee(this.employee.data.id).then((res: any) => {
      this.snack('Employee was removed successfully.', 'X', 'green-snackbar');
      this.dialogRef.close();
    }).catch(error => {
      this.snack('Action was unsuccessful.', 'X', 'red-snackbar');
    })
  }

  updateEmployee() {
    let ref;
    const that = this;
    this.disabledButton = true;
    this.hidePercentage = true;
    this.invalidEmail = '';
    const accData = {
      uname: this.accountForm.get('uname')?.value,
      role: this.accountForm.get('role')?.value,
      position: this.accountForm.get('position')?.value,
      updated_at: new Date(),
    }

    const invoiceData = {
      basic_pay: this.accountForm.get('basicpay')?.value,
      daily_rate: this.accountForm.get('dailyrate')?.value,
    }

    
    const invoiceAccountData = {
      basicpay: this.accountForm.get('basicpay')?.value,
      dailyrate: this.accountForm.get('dailyrate')?.value,
      hourlyrate: this.accountForm.get('hourlyrate')?.value,
    }
    
    if (this.employeeForm.touched || this.accountForm.touched) {
      this.disabledButton = false;
    }
    if (this.fileImage.length === undefined) {
      const filePath = 'profiles/' + this.employee.data.id + '-profile';
      this.storage.upload(filePath, this.fileImage).then(() => {
        ref = this.storage.ref(filePath);
        ref.getDownloadURL().subscribe(url => {
          if (url) {
            this.downloadURL = url;
            this.employeeForm.get("profile_img")?.setValue(this.downloadURL);
          }
        })
        ref.put(this.fileImage).task.on('state_changed', function progress(snapshot: any) {
            that.percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          }, function error() {
            console.log('Error in updating image: ', error)
          }, function complete() {
            that.unameExist = true;
            that.mainService.updateEmployeeAccountandProfile(that.employee.data.id, accData, that.employeeForm.getRawValue(), that.deductionForm.getRawValue(), invoiceData, that.accountForm.getRawValue()).then(res => {
              that.dialogRef.close();
            }).catch(error => {
              console.log('Error in batch updating employee: ', error)
            })
          }
        );
      });
    } else {
      this.mainService.updateEmployeeAccountandProfile(this.employee.data.id, accData, this.employeeForm.getRawValue(), that.deductionForm.getRawValue(), invoiceData, this.accountForm.getRawValue())
        .then((resolve: any) => {
          this.dialogRef.close();
          this.snack('Updated', 'X', 'green-snackbar')
        }).catch(error => {
        this.snack('Failed to update.', 'X', 'red-snackbar')
        this.dialogRef.close();
      })
    }
  }

  saveEmployee() {
    let ref;
    const that = this;
    this.disabledButton = true;
    this.hidePercentage = true;
    this.invalidEmail = '';
    let id = this.generateId();
    this.employeeForm.get('created_at')?.setValue(new Date());
    this.employeeForm.get('full_name')?.setValue(this.employeeForm.get('first_name')?.value + ' ' + this.employeeForm.get('last_name')?.value);
    this.accountForm.get('created_at')?.setValue(new Date());

    const dataLogins = {
      email: that.employeeForm.get('email_add')?.value,
      online: false,
      time_logged_in: '',
      tokens: '',
    };

    this.profileService.checkCollectionId(id).subscribe((result: any) => {
      if (result.exists === true) {
        id = this.generateId();
      } else {
        if (!this.unameExist) {
          if (this.employeeForm.get('email_add')?.invalid) {
            this.invalidEmail = 'Invalid email address';
          } else if (this.employeeForm.get('email_add')?.value.length === 0) {
            this.invalidEmail = 'Required field.';
          } else {
            if (this.employeeForm.valid) {
              if (this.accountForm.get('password')?.value.length !== 0) {
                const filePath = 'profiles/' + id + '-profile';
                const salt = bcrypt.genSaltSync(10);
                const pass = bcrypt.hashSync(that.accountForm.get('password')?.value, salt);
                console.log(pass);
                
                that.accountForm.get('password')?.setValue(pass);
                if (this.fileImage) {
                  this.storage.upload(filePath, this.fileImage).then(() => {
                    ref = this.storage.ref(filePath);
                    ref.getDownloadURL().subscribe(url => {
                      if (url) {
                        this.downloadURL = url;
                        this.employeeForm.get("profile_img")?.setValue(this.downloadURL);
                      }
                    })
                    ref.put(this.fileImage).task.on('state_changed', function progress(snapshot: any) {
                        that.percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      }, function error() {
                        console.log('Error in uploading image: ', error)
                      }, function complete() {
                        that.unameExist = true;
                        that.mainService.addNewEmployee(id, that.accountForm.getRawValue(), that.employeeForm.getRawValue(), dataLogins, that.deductionForm.getRawValue()).then(res => {
                          that.dialogRef.close();
                        }).catch(error => {
                          console.log('Error in batch adding new employee: ', error)
                        })
                      }
                    );
                  });
                } else {
                  this.mode = 'indeterminate';     
                  
                  console.log(id, that.accountForm.getRawValue(), that.employeeForm.getRawValue(), dataLogins,  that.deductionForm.getRawValue());             
                  that.mainService.addNewEmployee(id, that.accountForm.getRawValue(), that.employeeForm.getRawValue(), dataLogins,  that.deductionForm.getRawValue()).then(res => {
                    that.dialogRef.close();
                  }).catch(error => {
                    console.log('Error in batch adding new employee: ', error)
                  })
                }
              }
            } else {
              this.disabledButton = false;
              this.snack('Please answer the required fields.', 'X', 'red-snackbar');
            }
          }
        } else {
          this.disabledButton = false;
          this.snack('Username is already taken!', 'X', 'red-snackbar');
        }
      }
    })
  }

  generateId() {
    let a = this.makeid();
    let y = new Date().getFullYear();
    const formatted_id = a + y;
    return formatted_id;
  }

  makeid() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

  onSelectFile(files: any) {     
    if (files.target.files <= 0) {
      return;
    }
    const filesize = files.target.files[0].size / 1024;
    const filesize_rounded_off = filesize.toFixed(2);
    if (files.target.files[0].type == 'image/jpeg') {
      if (parseFloat(filesize_rounded_off) <= 1000) {
        this.fileImage = files.target.files[0];
        const reader = new FileReader();
        reader.onload = (loadEvent: any) => {
          const results = loadEvent.target.result;
          this.imgURL = results;
        };
        this.disabledButton = false;
        reader.readAsDataURL(this.fileImage);
      } else {
        this.snack('Image file size is too big', 'X', 'red-snackbar')
      }
    } else {
      this.snack('Image file only', 'X', 'red-snackbar')
    }
  }

  snack(m: any, a: any, c: any) {
    this.sett.snackbar(m, a, 2000, c);
  }

  checkFormIfTouched() {
    if (this.employee.action === 'update') {
      this.disabledButton = !(this.employeeForm.dirty || this.accountForm.dirty);
      if (this.fileImage.length === undefined) {
        this.disabledButton = false;
      }
    }
  }

  changePassword() {
    this.mainService.changePassword(this.changePass, this.employee.data.id).then(res => {
      this.snack('Password updated', 'X', 'green-snackbar');
      this.dialogRef.close();
    }).catch(err => {
      this.snack('Updating password failed', 'X', 'red-snackbar');
    })
  }

  removeProfilePicture() {
    const filePath = 'profiles/' + this.employee.data.id + '-profile.jpeg';
    if (this.employee.data.data.profile_img) {
      this.storage.refFromURL(this.employee.data.data.profile_img).delete().subscribe(res_1 => {
        this.imgURL = this.defaultProfileImage;
        this.mainService.updateProfileImage('', this.employee.data.id).then(res_2 => {
          this.dialogRef.close(true);
        }).catch(err_2 => {
          this.dialogRef.close(false);
        })
      })
    }
  }
}
