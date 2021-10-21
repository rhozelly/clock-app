import {Component, HostBinding, OnInit} from '@angular/core';
import {OverlayContainer} from "@angular/cdk/overlay";
import {MainService} from "../core/services/main.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {SettingDialogComponent} from "../dialogs/setting-dialog/setting-dialog.component";
import {AngularFireStorage} from "@angular/fire/storage";
import {SettingsService} from "../core/services/settings.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  defaultImage: string = 'assets/app-images/profile-default.jpg';
  settings_menu = [
    {name: 'Account Settings', id: 1},
    {name: 'Categories', id: 2},
    {name: 'Application', id: 3},
  ]
  setting_page: number = 1;

  // Account Settings
  selected_acc_sett_roles: any = '';
  selected_acc_sett_roles_values: any;
  acc_sett_roles: any = [];
  acc_sett_roles_values: any = [];

  navs: any = [];
  navs_value: any = [];
  nav_array: any = [];

  showProgress: any = false;

  // Categories Variables
  catergories: any = [
    {title: 'Blood Types', paragraph: 'Categorized blood type.', id: 1},
    {title: 'Positions', paragraph: 'A function you serve at a company.', id: 2},
    {title: 'Clients', paragraph: 'Name of the customers that supports the company.', id: 3}
  ]
  blood_types: any = [];
  positions: any = [];
  clients: any = [];
  setting_tabs: FormGroup;

  company_form: FormGroup;
  com: any = [];
  fileImage: any = '';
  imgURL: any = '';
  downloadURL: any = '';

  ref: any;

  constructor(public overlayContainer: OverlayContainer,
              private main: MainService,
              private dialog: MatDialog,
              private storage: AngularFireStorage,
              private sett: SettingsService,
              private fb: FormBuilder) {
    this.setting_tabs = this.fb.group({
      tabs: [1],
    })
    this.company_form = this.fb.group({
      company_address: [''],
      company_id: [''],
      company_logo: [''],
      company_name: [''],
      copyright: [''],
      tagline: [''],
    })
  }

  @HostBinding('class') componentCssClass: any;

  onSetTheme(theme: any) {
    this.overlayContainer.getContainerElement().classList.add(theme);
    this.componentCssClass = theme;
  }

  ngOnInit(): void {
    this.setting_tabs.get('tabs')?.valueChanges.subscribe((value: any) => {
      switch (value) {
        case 1:
          this.getUserRoles();
          break;
        case 2:
          // this.getBloodTypes();
          // this.getPositions();
          break;
        case 3:
          this.getCompanyInformation();
          break;
        default:
          break;
      }
    })
  }

  showTab(x: any) {
    this.setting_tabs.get('tabs')?.setValue(parseFloat(x));
  }

// **************************** Dialog

  showDialog(action: any, id: any) {
    const dialogRef = this.dialog.open(SettingDialogComponent, {
      disableClose: true,
      data: {action: action, id: id}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
    });
  }

// **************************** Account Settings

  getUserRoles() {
    this.main.getPriv().subscribe((result: any) => {
      if (result) {
        this.acc_sett_roles = Object.keys(result);
        this.acc_sett_roles_values = result;
      }
    })
  }

  showSelectedUserRoles() {
    this.selected_acc_sett_roles_values = this.acc_sett_roles_values?.[this.selected_acc_sett_roles];
    this.main.getNavigators().subscribe((result: any) => {
      this.nav_array = result;
    })
    this.showProgress = true;
    setTimeout(() => {
      this.nav_array.forEach((value: any, i: any) => {
        this.nav_array[i].nav_value = false;
        if (this.selected_acc_sett_roles_values.toLowerCase() === 'all') {
          this.nav_array[i].nav_value = true;
        } else {
          const priv_value = this.acc_sett_roles_values?.[this.selected_acc_sett_roles];
          let priv_value_formatted = priv_value.split(',');
          priv_value_formatted.forEach((x: any) => {
            if (parseFloat(x) === parseFloat(value.nav_id)) {
              this.nav_array[i].nav_value = true;
            }
          })
        }
        this.navs = this.nav_array;
        this.showProgress = false;
      })
    }, 900)
  }

  privilegedChecked(id: any, checked: any, index: any) {
    this.navs[index].nav_value = !!checked;
  }

  savePrivilege() {
    this.navs_value = [];
    this.navs.forEach((value: any) => {
      if (value.nav_value) {
        this.navs_value.push(parseFloat(value.nav_id));
      }
    });
    const final_role_value = this.navs_value.join(',');
    this.main.updatePrivRole(this.selected_acc_sett_roles, final_role_value);
  }

// **************************** Application Settings

  getCompanyInformation() {
    this.main.getCompanyInformation().subscribe((result: any) => {
      this.patchCompanyValues(result);
    })
  }

  patchCompanyValues(x: any) {
    this.company_form = this.fb.group({
      company_address: x.company_address,
      company_id: x.company_id,
      company_logo: x.company_logo,
      company_name: x.company_name,
      copyright: x.copyright,
      tagline: x.tagline,
    })
  }

  onSelectFile(files: any) {
    if (files.target.files <= 0) {
      return;
    }
    const filesize = files.target.files[0].size / 1024;
    const filesize_rounded_off = filesize.toFixed(2);
    if (files.target.files[0].type == 'image/jpeg' || files.target.files[0].type == 'image/png') {
      if (parseFloat(filesize_rounded_off) <= 1000) {
        this.fileImage = files.target.files[0];
        const reader = new FileReader();
        reader.onload = (loadEvent: any) => {
          const results = loadEvent.target.result;
          this.company_form.get('company_logo')?.setValue(results);
        };
        reader.readAsDataURL(this.fileImage);
      } else {
        this.company_form.get('company_logo')?.setValue(null);
        this.sett.snackbar('Image file size is too big', 'X', 1000, 'red-snackbar')
      }
    } else {
      this.company_form.get('company_logo')?.setValue(null);
      this.sett.snackbar('Image file size is too big', 'X', 1000, 'red-snackbar')
    }
  }

  save() {
    let ref;
    const that = this;
    const filePath = 'company/' + this.company_form.get('company_name')?.value;
    if (this.fileImage) {
      this.showProgress = true;
      this.storage.upload(filePath, this.fileImage).then(() => {
        ref = this.storage.ref(filePath);
        ref.getDownloadURL().subscribe(url => {
          if (url) {
            this.downloadURL = url;
            this.main.updateLogo(url).then((resolve_logo: any) => {

            }).catch((error_logo: any) => {

            })
          }
        })
        ref.put(this.fileImage).task.on('state_changed', function progress(snapshot: any) {
            // that.percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          }, function error() {
            console.log('Error in uploading image: ', error)
          }, function complete() {
            that.showProgress = false;
            that.sett.snackbar('Saved!', 'X', 1000, 'green-snackbar')
          }
        );
      });
    } else {
      this.main.updateCompanyInformation(this.company_form.getRawValue()).then((resolve: any) => {
        this.sett.snackbar('Saved!', 'X', 1000, 'green-snackbar')
      }).catch((error: any) => {
        this.sett.snackbar('Failed to save.', 'X', 1000, 'red-snackbar')
      })
    }
  }


}
