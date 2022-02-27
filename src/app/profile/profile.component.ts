import {Component, OnInit} from '@angular/core';
import {MainService} from "../core/services/main.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ProfileService} from "../core/services/profile.service";
import {AngularFireStorage} from "@angular/fire/storage";
import {map} from "rxjs/operators";

import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileFormGroup: FormGroup;
  bloodTypes: any;
  profiles: any;
  myBloodType: any;
  myID: any;

  ref: any;
  task: any;
  uploadProgress: any;
  downloadURL: any;
  uploadState: any;

  defaultProfileImage: any = [];
  dataImage: any = [];
  files: any = [];
  invoices: any = [];
  invoicesGrouped: any = [];

  yearNow: any = new Date().getFullYear();

  constructor(private mainService: MainService,
              private profileService: ProfileService,
              private storage: AngularFireStorage,
              private sanitizer: DomSanitizer,
              private fb: FormBuilder) {
    this.bloodTypes = [];
    this.profiles = [];
    this.profileFormGroup = this.fb.group({
      first_name: [""],
      last_name: [""],
      contact_no: [""],
      blood_type: [""],
      address: [""],
      email_add: [""],
      emergency_contact: [""],
      emergency_name: [""],
    });
  }

  ngOnInit(): void {
    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.mainService.decrypt(collection_id, 'collection-id');
    this.getUserProfile();
    this.getBloodTypes();
    this.getInvoices();
    this.defaultProfileImage = this.profileService.defaultImage();
  }

  getBloodTypes() {
    this.mainService.getBloodType().subscribe((res: any) => {
      this.bloodTypes = res ? res.bloodtypes : [];
    })
  }

  getInvoices() {
    this.profileService.getInvoices(this.myID).subscribe(result => {
      result.map(doc => {
        const array = {
          id: doc.payload.doc.id,
          data: doc.payload.doc.data(),
        }
        console.log(array);        
        this.invoices = array;
        this.invoicesGrouped.push(this.invoices)
      })
    })
  }

  getUserProfile() {
    this.profileService.getUserProfile(this.myID).subscribe((res: any) => {
      res.profile_img = res.profile_img ? res.profile_img : this.defaultProfileImage;
      this.profiles = res ?  res : [];
      if(this.profiles.length > 0){
        this.files = this.profiles.files !== null ? this.profiles.files : null;
      }
      this.myBloodType = this.profiles.blood_type;
      this.patchProfileData(this.profiles);
    })
  }

  patchProfileData(data: any) {
    this.profileFormGroup = this.fb.group({
      first_name: data.first_name,
      last_name: data.last_name,
      contact_no: data.contact_no,
      blood_type: data.blood_type,
      address: data.address,
      email_add: data.email_add,
      emergency_contact: data.emergency_contact,
      emergency_name: data.emergency_name,
    });
  }

  updateProfile() {
    this.profileFormGroup.get("blood_type")?.setValue(this.myBloodType);
    this.profileService.updateProfile(this.profileFormGroup.value, this.myID).then((res: any) => {
    })
  }

  onSelectFile(event: any) {
    const filePath = 'profiles/' + this.myID + '-profile';
    this.ref = this.storage.ref(filePath);
    this.task = this.ref.put(event.target.files[0]);
    this.uploadProgress = this.task.percentageChanges();
    this.uploadState = this.task.snapshotChanges().pipe(map((s: any) => s.state));
    this.ref.getDownloadURL().subscribe((url: any) => {
      this.profileService.uploadImagesUrl(url, this.myID).then((res: any) => {
      })
    })
  }
}
