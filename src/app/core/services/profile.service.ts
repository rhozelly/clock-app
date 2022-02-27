import {Injectable, Query} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {HttpClient} from "@angular/common/http";
import {AngularFireStorage} from "@angular/fire/storage";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";
import * as myGlobals from '../../../../globals';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  profile: any = 'profile';
  private basePath = '/profiles';
  yearNow: any = new Date().getFullYear();

  last: any = [];

  constructor(private firestore: AngularFirestore,
              private storage: AngularFireStorage,
              private http: HttpClient) {
  }

  getProfile(id: any) {
    const account_data = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_accs).collection(myGlobals.tbl_acc).doc(id).valueChanges();
    const profile_data = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro).doc(id).valueChanges();
    return combineLatest<any[]>(account_data, profile_data).pipe(
      map(arr => arr.reduce((acc, cur) =>
          console.log(cur),
        // acc.concat(cur)
      )),
    )
  }

  checkCollectionId(id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro).doc(id).get();
  }

  defaultImage() {
    return 'https://firebasestorage.googleapis.com/v0/b/attendance-app-92cbe.appspot.com/o/profiles%2Fprofile-default.jpg?alt=media&token=227292e8-f973-42dc-bc01-63e2f9c7b5a8';
  }

  getUserProfile(id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro).doc(id).valueChanges();
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
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro)
    .doc(id)
    .update(data);
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
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro)
    .doc(id)
    .set(data);
  }

  uploadImagesUrl(url: any, id: any) {
    const data = {profile_img: url};
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro)
    .doc(id)
    .update(data);
  }

  getFiles(url: any) {
    return this.storage.refFromURL(url);
  }

  getInvoices(id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro).doc(id).collection(this.yearNow.toString(), ref => ref.orderBy('15', 'asc').limit(3)).snapshotChanges();
  }

  getInvoicesByMonth(id: any, month: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro).doc(id).collection(this.yearNow.toString()).doc(month).valueChanges();
  }

  async getAllProfilesss() {
    const firstPage = this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro, ref => ref
    .orderBy('full_name', 'asc')
    .limit(2));
    const snapshot = await firstPage.get();
    snapshot.forEach((val: any) =>{
      this.last = val.docs[val.docs.length - 1];
    })
    
    const nextPage = this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro, ref => ref
    .orderBy('full_name', 'asc')
    .startAfter(this.last.data().full_name)
    .limit(2));


    nextPage.valueChanges().subscribe((res: any) =>{
      console.log(res);      
    })
  }

  getAllProfiles() {
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro,
       ref => ref.orderBy('last_name', 'asc')
    .limit(12))
    .snapshotChanges();
  }

  
  getAllProfilesLength() {
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro)
    .get();
  }

  searchProfiles(searched: any) {
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro, ref => ref
    .orderBy('full_name', 'asc')
    .where('full_name', '>=', searched)
    .limit(3))
    .snapshotChanges();
  }
}
