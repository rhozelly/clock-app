import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AngularFirestore, fromCollectionRef} from '@angular/fire/firestore';
import * as myGlobals from '../../../../globals';
import * as moment from 'moment';

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

  // timeout(id: any, subcollection: any, specificdocument: any, time_out: any,) {
  //   const data = {time_out: time_out};
  //   return this.firestore.collection(this.atts).doc(id).collection(subcollection).doc(specificdocument).update(data);
  // }
  timeout(id: any, subcollection: any, time_out: any,) {
    const data = {time_out: time_out};
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_att).collection(id).doc(subcollection).update(data);
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

  
  //  ====================== Attendance Beta Test 2.0 =================  //
  getAllAttendanceIds(){
     return this.firestore.collection(myGlobals.db)
      .doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro, ref => ref
        .limit(20)).snapshotChanges();;
  }

  getAllAttendancesOftheMonth(id: any){
    let date = new Date();
    let start = new Date(date.getFullYear(), date.getMonth(), 1);
    let end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return this.firestore.collection(myGlobals.db)
     .doc(myGlobals.tbl_att).collection(id, ref => ref
      .where('date', '<=', end)
      .where('date', '>=', start)
      .orderBy('date', 'desc')
      .limit(20)).snapshotChanges();
  }
  
  //  ====================== Attendance Revise =================  //
  getAllAttendance(id: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_att)
    .collection(id, ref => ref
    .where('date', '<=', new Date())
    .orderBy('date', 'desc')).snapshotChanges();
  }

  getAttendance(id: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_att)
    .collection(id, ref => ref
    .where('date', '<=', new Date())
    .orderBy('date', 'desc')
    .limit(30)).snapshotChanges();
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
  
  //  ====================== REQUESTS =================  //

  getRequestById(id: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_reqs)
    .collection(myGlobals.tbl_req, ref => ref
      .where('id', '==', id)
      .orderBy('date', 'desc').limit(20))
      .snapshotChanges();
  }

  getPendingRequest(id: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_reqs)
    .collection(myGlobals.tbl_req, ref => ref
      .where('id', '==', id)
      .where('status', '==', 'pending'))
      .snapshotChanges();
  }
  
  getAllRequests(){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_reqs)
    .collection(myGlobals.tbl_req, ref => ref.orderBy('date', 'desc')).snapshotChanges();
  }

  getPendingRequests(){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_reqs)
    .collection(myGlobals.tbl_req, ref => ref
      .where('status', '==', 'pending'))
      .snapshotChanges();
  }

  requestAdd(add: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_reqs).collection(myGlobals.tbl_req).add(add);
  }

  requestUpdate(req: any, doc_id: any, updated: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_reqs).collection(myGlobals.tbl_req).doc(doc_id).update({status: req, status_updated: updated});
  }

  getApprovedLeaves(id: any){
    return this.firestore.collection(myGlobals.db)      
    .doc(myGlobals.tbl_reqs).collection(myGlobals.tbl_req, ref => ref
      .where('id', '==', id)
      .where('status', '==', 'approved')
      .where('request_for', '==', 'leave')).snapshotChanges();
  }

  getAllOvertimeByFirstRange(id: any){
    let date = new Date();
    let one = new Date(date.getFullYear(), date.getMonth(), 1);
    let fifteen = new Date(date.getFullYear(), date.getMonth(), 15);
    
    // return this.firestore.collection(myGlobals.db)
    //  .doc(myGlobals.tbl_att).collection(id, ref => ref
    //   .where('date', '<=', one)
    //   .where('date', '>=', fifteen)
    //   .where('status', '==', 'approved')
    //   .orderBy('date', 'desc')
    //   .limit(15)).snapshotChanges();
  }
  
  getAllOvertimeEndRange(){
      let date = new Date();
      let sixteen = new Date(date.getFullYear(), date.getMonth(), 15);
      let thirty = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return this.firestore.collection(myGlobals.db)      
      .doc(myGlobals.tbl_reqs).collection(myGlobals.tbl_req, ref => ref
        .where('date', '<=', thirty)
        .where('date', '>=', sixteen)
        .where('status', '==', 'approved')
        .where('request_for', '==', 'overtime')
        .limit(15)).snapshotChanges();
  }

  
  
  getApprovedOvertimeRequestsById(startDate: any, endDate:any, id: any){
    let start = new Date(startDate.getFullYear(), startDate.getMonth(), 15);
    let end = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    return this.firestore.collection(myGlobals.db)      
    .doc(myGlobals.tbl_reqs).collection(myGlobals.tbl_req, ref => ref
      .where('id', '==', id)
      .where('date', '<=', end)
      .where('date', '>=', start)
      .where('status', '==', 'approved')
      .where('request_for', '==', 'overtime')
      .limit(15)).snapshotChanges();
  }
  
  
  getApproveCARequestsById(startDate: any, endDate:any, id: any){
    let start = new Date(startDate.getFullYear(), startDate.getMonth(), 15);
    let end = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    return this.firestore.collection(myGlobals.db)      
    .doc(myGlobals.tbl_reqs).collection(myGlobals.tbl_req, ref => ref
      .where('id', '==', id)
      .where('date', '<=', end)
      .where('date', '>=', start)
      .where('request_for', '==', 'ca')
      .where('status', '==', 'approved')
      .limit(15)).snapshotChanges();
  }

  findAttendance(collection: any, date: any){
    let dateFormatted = new Date(date);   
      return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_att).collection(collection, ref => ref
        .where('date', '>=', dateFormatted).orderBy('date', 'asc').limit(1)).snapshotChanges();
  }

  revokeAttendance(collection: any, id: any){
      return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_att).collection(collection).doc(id).delete();
  }
  
  addAttendance(collection: any, data: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_att).collection(collection).add(data);
  }

  addLogsHistory(action: any, id: any){
    const data = {
      action: action,
      members_id: id,
      time: new Date()
    };
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_ls)
    .collection(myGlobals.tbl_l)
    .add(data);
  }

  requestFilterBy(order: any, asc: any){
    console.log(order);
    console.log(asc);
    
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_reqs).collection(myGlobals.tbl_req, ref => ref
      .orderBy(order.toString(), asc.toString())).snapshotChanges();      
  }
 
  requestSearchBy(search: any, order: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_reqs).collection(myGlobals.tbl_req, ref => ref
      .where(order.toString(), '>=', search).where(order.toString(), '<=', search + '~')
      .orderBy(order.toString(), 'asc')).snapshotChanges();      
  }
 


}
function getDocs(tbl_att: string) {
  throw new Error('Function not implemented.');
}

