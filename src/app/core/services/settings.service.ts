import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

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
}
