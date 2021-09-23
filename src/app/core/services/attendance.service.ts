import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  att: any = 'attendance';

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient
  ) {
  }


  getDaysOfTheMonth(id: any, subCollection: any) {
    return this.firestore.collection(this.att).doc(id).collection(subCollection).snapshotChanges();
  }


  timeIn(id: any, subcollection: any, key: any) {
    const timeNow = new Date().getTime();
    const data = {key: timeNow};
    return this.firestore.collection(this.att).doc(id).collection(subcollection).add(data);
  }

  getAttendanceToday(id: any, sub_collection: any) {
    // return this.firestore.collection(this.att).doc(id).collection(sub_collection).snapshotChanges().subscribe(res =>{
    //   if(res.length > 0){
    return this.firestore.collection(this.att).doc(id).collection(sub_collection, ref => ref.orderBy('date_time', 'desc').limit(1)).snapshotChanges();
    // } else {
    //   const attendance_data = {
    //     date_time: new Date(),
    //     time_in: '',
    //     time_out: '',
    //   };
    //   this.firestore.collection(this.att).doc(id).collection(sub_collection).doc().set(attendance_data);
    // }
    // })
    // return this.firestore.collection(this.att).doc(id).collection(sub_collection, ref => ref.orderBy('date_time', 'desc').limit(1)).snapshotChanges();
  }

  addAttendance(id: any, subcollection: any, time_in: any, date_time: any) {
    const data = {
      time_in: time_in,
      time_out: '',
      date_time: date_time,
    };
    return this.firestore.collection(this.att).doc(id).collection(subcollection).add(data);
  }

  timeout(id: any, subcollection: any, specificdocument: any, time_out: any,) {
    const data = {time_out: time_out};
    return this.firestore.collection(this.att).doc(id).collection(subcollection).doc(specificdocument).update(data);
  }

  updateRecentDate(date: any, doc: any, id: any) {
    const data = {
      recent_date_updated: date,
      recent_doc_id: doc
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

  // ===== Test add attendance
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
}
