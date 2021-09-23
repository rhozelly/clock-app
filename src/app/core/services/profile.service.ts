import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {HttpClient} from "@angular/common/http";
import {AngularFireStorage} from "@angular/fire/storage";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  profile: any = 'profile';
  private basePath = '/profiles';
  yearNow: any = new Date().getFullYear();

  constructor(private firestore: AngularFirestore,
              private storage: AngularFireStorage,
              private http: HttpClient) {
  }

  getProfile(id: any) {
    const account_data = this.firestore.collection('account').doc(id).valueChanges();
    const profile_data = this.firestore.collection(this.profile).doc(id).valueChanges();
    return combineLatest<any[]>(account_data, profile_data).pipe(
      map(arr => arr.reduce((acc, cur) =>
          console.log(cur),
        // acc.concat(cur)
      )),
    )
  }

  checkCollectionId(id: any) {
    return this.firestore.collection(this.profile).doc(id).get();
  }

  defaultImage() {
    return 'https://firebasestorage.googleapis.com/v0/b/attendance-app-92cbe.appspot.com/o/profiles%2Fprofile-default.jpg?alt=media&token=227292e8-f973-42dc-bc01-63e2f9c7b5a8';
  }

  getUserProfile(id: any) {
    return this.firestore.collection(this.profile).doc(id).valueChanges();
  }

  updateProfile(values: any, id: any) {
    const data = {
      first_name: values.first_name,
      last_name: values.last_name,
      contact_no: values.contact_no,
      address: values.address,
      blood_type: values.blood_type,
      email_add: values.email_add,
      emergency_contact: values.emergency_contact,
      emergency_name: values.emergency_name
    };
    return this.firestore.collection(this.profile).doc(id).update(data);
  }

  addNewEmployee(values: any, id: any) {
    const data = {
      first_name: values.first_name.toLowerCase(),
      last_name: values.last_name.toLowerCase(),
      contact_no: values.contact_no,
      address: values.address.toLowerCase(),
      blood_type: values.blood_type,
      email_add: values.email_add,
      emergency_contact: values.emergency_contact,
      emergency_name: values.emergency_name.toLowerCase(),
      updated_at: new Date(),
      created_at: new Date(),
      files: [],
      profile_img: [values.profile_img],
    };
    return this.firestore.collection(this.profile).doc(id).set(data);
  }

  uploadImagesUrl(url: any, id: any) {
    const data = {profile_img: url};
    return this.firestore.collection(this.profile).doc(id).update(data);
  }

  getFiles(url: any) {
    return this.storage.refFromURL(url);
  }

  getInvoices(id: any) {
    return this.firestore.collection(this.profile).doc(id).collection(this.yearNow.toString(), ref => ref.orderBy('15', 'asc').limit(3)).snapshotChanges();
  }

  getInvoicesByMonth(id: any, month: any) {
    return this.firestore.collection(this.profile).doc(id).collection(this.yearNow.toString()).doc(month).valueChanges();
  }

  getAllProfiles() {
    return this.firestore.collection(this.profile, ref => ref.orderBy('last_name', 'asc').limit(12)).snapshotChanges();
  }

  searchProfiles(searched: any) {
    return this.firestore.collection(this.profile, ref => ref
      .orderBy('first_name', 'asc')
      .where('first_name', '>=', searched)
      .limit(10)).snapshotChanges();
  }
}
