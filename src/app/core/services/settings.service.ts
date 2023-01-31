import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import * as myGlobals from '../../../../globals';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  profileCollection = 'profile';
  today = new Date().getTime();

  constructor(private firestore: AngularFirestore,
              private http: HttpClient,
              private sb: MatSnackBar) {
  }

  sendEmail(){    
   
  }


  checkAccID(id: any) {
    return this.firestore.collection(this.profileCollection).doc(id.toString()).valueChanges()
  }

  addProfileManual() {
    let id = '0062021';
    const data = {
      first_name: 'Antoniette',
      last_name: 'Del Castillo',
      address: 'Fortune Towne',
      blood_type: 'B',
      contact_us: '09168750093',
      created_at: this.today,
      email_add: 'arcdc29@icloud.com',
      emergency_name: 'Neil Dacudag',
      emergency_contact: '09168750093',
      updated_at: this.today,
    };
    return this.firestore.collection(this.profileCollection).doc(id).set(data);
  }

  snackbar(message: any, action: any, duration: any, classname: any) {
    this.sb.open(message, action, {
      duration: duration,
      panelClass: [classname]
    });
  }  

  addHoliday(data: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).collection(myGlobals.tbl_hol).add(data);
  }
  
  updateHoliday(data: any, id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).collection(myGlobals.tbl_hol).doc(id).update(data);
  }

  removeHoliday(id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).collection(myGlobals.tbl_hol).doc(id).delete();
  }
  
  selectedHolidayDate(date: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).collection(myGlobals.tbl_hol, ref => ref.where('holiday_date', '==', date)).snapshotChanges();
  }
  
  getAllHolidays() {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).collection(myGlobals.tbl_hol).snapshotChanges();
  }

  addClientInfo(data: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).collection(myGlobals.tbl_cli).add(data);
  }

  getClientInfo(){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).collection(myGlobals.tbl_cli).snapshotChanges();
  }
  
  updateClientInfo(id: any, data: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).collection(myGlobals.tbl_cli).doc(id).update(data);
  }
  
  removeClientInfo(id: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).collection(myGlobals.tbl_cli).doc(id).delete();
  }
}
