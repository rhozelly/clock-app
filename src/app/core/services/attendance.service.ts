import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AngularFirestore, fromCollectionRef} from '@angular/fire/firestore';
import * as myGlobals from '../../../../globals';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  att: any = 'attendance';
  atts: any = 'attendances';

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient
  ) {}


  getDaysOfTheMonth(id: any, subCollection: any) {
    return this.firestore.collection(this.att).doc(id).collection(subCollection).snapshotChanges();
  }


  timeIn(id: any, subcollection: any, key: any) {
    const timeNow = new Date().getTime();
    const data = {key: timeNow};
    return this.firestore.collection(this.att).doc(id).collection(subcollection).add(data);
  }

  // getAttendanceToday(id: any, sub_collection: any) {
  //   return this.firestore.collection(this.att).doc(id).collection(sub_collection, ref => ref.orderBy('date_time', 'desc').limit(1)).snapshotChanges();
  // }

  // addAttendance(id: any, subcollection: any, time_in: any, date_time: any) {
  //   const data = {
  //     time_in: time_in,
  //     time_out: '',
  //     date_time: date_time,
  //   };
  //   return this.firestore.collection(this.att).doc(id).collection(subcollection).add(data);
  // }

  timeout(id: any, subcollection: any, specificdocument: any, time_out: any,) {
    const data = {time_out: time_out};
    return this.firestore.collection(this.att).doc(id).collection(subcollection).doc(specificdocument).update(data);
  }

  updateRecentDate(date: any, doc: any, id: any) {
    const data = {
      recent_date_updated: date,
      recent_doc_id: doc,
    };
    return this.firestore.collection(this.att).doc(id).set(data);
  }

  checkSubCollectionAttendance(id: any, sub: any) {
    return this.firestore.collection(this.att).doc(id).collection(sub).get();
  }

  checkFieldDateAttendance(id: any, sub: any, date: any){
    return this.firestore.collection(this.att).doc(id)
      .collection(sub, ref => ref.where('date_time', '>=', new Date(date)).orderBy('date_time', 'asc')
      ).snapshotChanges();
  }

  // ===== Test Add Attendance
  getFirstAdd() {
    const data = {
      recent_date_updated: '',
      recent_doc_id: '',
    }
    const datas = {
      date_time: new Date(),
      time_in: '',
      time_out: '',
    };
    this.firestore.collection(this.att).doc('9L7J2021').set(data);
    this.firestore.collection(this.att).doc('9L7J2021').collection('2021-AUG').doc().set(datas);
  }
  //  ====================== Attendance List =================  //


  getAttendanceListByUser(id: any, sub_collection: any) {
    return this.firestore.collection(this.att).doc(id)
    .collection(sub_collection, ref => ref.orderBy('date_time', 'desc').limit(10)).snapshotChanges();
  }

  
  //  ====================== Attendance Revise =================  //

  getAttendance(id: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_att)
    .collection(id, ref => ref
    .where('date', '<=', new Date())
    .orderBy('date', 'desc')
    .limit(10)).snapshotChanges();
  }

  nextAttendance(id: any, startAfter: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_att)
    .collection(id, ref => ref
    .orderBy('date', 'desc')
    .startAfter(startAfter)
    .limit(10)).snapshotChanges();
  }

  prevAttendance(id: any, endAt: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_att)
    .collection(id, ref => ref
    .orderBy('date', 'desc')
    .endBefore(endAt)
    .limit(10)).snapshotChanges();
  }

  getAttendanceToday(id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_att).collection(id, ref => ref
      .where('date', '<=', myGlobals.today)
      .where('date', '>=', myGlobals.today).limit(1)).snapshotChanges();
  }


  attendanceExist(code: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_att)
    .collection(code, ref => ref
    .where('date', '<=', myGlobals.today)
    .orderBy('date', 'desc').limit(1))
    .snapshotChanges();
  }


  logTimein(id: any, time_in: any, date_time: any) {
    const data = {
      time_in: time_in,
      time_out: '',
      date: date_time,
    };
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_att).collection(id).add(data);
  }

  updateTimeinTable(id: any, res_id: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_time_in).collection(id).add({
      doc_id: res_id,
      acc_id: id,      
      browser: myGlobals.browser,
      product_sub: myGlobals.prod_sub
    });
  }
  
  checkAccountIdIfExists(id: any) {
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_att)
    .collection(id, ref => ref
      .where('date', '<=', myGlobals.today)
      .orderBy('date', 'desc')
      .limit(1))
      .snapshotChanges();
  }

  proceedToTimingOut(doc_id: any, id: any){
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_att)
    .collection(id)
    .doc(doc_id)
    .update({time_out: myGlobals.today});    
  }

}
