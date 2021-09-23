import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {HttpClient} from "@angular/common/http";
import * as moment from "moment";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  yearNow: any = new Date().getFullYear();
  monthNow: any = new Date().toLocaleString('en-us', {month: 'short'});

  time: any = 'timesheets';

  constructor(private firestore: AngularFirestore,
              private http: HttpClient,) {
  }

  getEmployeesTimesheets() {
  }

  getEmployeesTimesheet(id: any) {
    const fooPosts = this.firestore.collection(this.time).doc(id).collection('SEP-2021', ref => ref.orderBy('date', 'desc').limit(4)).valueChanges();
    const barPosts = this.firestore.collection(this.time).doc(id).collection('AUG-2021', ref => ref.orderBy('date', 'desc').limit(4)).valueChanges();
    return combineLatest<any[]>(fooPosts, barPosts).pipe(
      map(arr => arr.reduce((acc, cur) => acc.concat(cur))),
    )
  }


  getTimesheetByDate(id: any, date: any, sub_collection: any) {
    return this.firestore.collection(this.time).doc(id).collection(sub_collection, ref => ref.where('date', "==", date)).snapshotChanges();
  }

  addEmployeesTimesheet(id: any, second_data: any, sub_collection: any) {
    let batch = this.firestore.firestore.batch();
    // const first_data = {
    //   total_days_present: 15,
    //   current_month: 'SEPT'
    // }
    // const add_main_collection = this.firestore.collection(this.time).doc(id).ref;
    // batch.set(add_main_collection, first_data);

    const sub_main_collection = this.firestore.collection(this.time).doc(id).collection(sub_collection).doc().ref;
    batch.set(sub_main_collection, second_data);

    return batch.commit();
  }

  updateEmployeesTimesheet(id: any, second_data: any, sub_collection: any, doc_id: any) {
    let batch = this.firestore.firestore.batch();
    const sub_main_collection = this.firestore.collection(this.time).doc(id).collection(sub_collection).doc(doc_id).ref;
    batch.update(sub_main_collection, second_data);
    return batch.commit();
  }

  removeEmployeesTimesheet(id: any, sub_collection: any, doc_id: any) {
    return this.firestore.collection(this.time).doc(id).collection(sub_collection).doc(doc_id).delete()
  }


}
