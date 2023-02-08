import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import * as moment from 'moment';
import * as myGlobals from '../../../../globals';
import { Query } from '@firebase/firestore-types'
import {tbl_inv} from "../../../../globals";

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private firestore: AngularFirestore) {}


  getInvoicesOfDeduction(id: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
    .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_ben).valueChanges();
  }

  getInvoicesOtherDeduction(id: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
    .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_other).collection(myGlobals.tbl_others, ref => ref.where('status', '==', false)).valueChanges();
  }

  getInvoicesOfInfo(id: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
    .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_invs_info).valueChanges();
  }

  getInvoices(id: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
    .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_inv).valueChanges();
  }

  getLastestInvoiceId(){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_invs)
    .collection(myGlobals.tbl_inv, ref => ref.orderBy('timestamp','asc').limit(1)).snapshotChanges();
  }


  getOtherDeductions(id: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
      .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_other).collection(myGlobals.tbl_others, ref => ref.where('status', '==', false)).snapshotChanges();
  }


  getOtherEarnings(id: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
      .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_earnings).collection(myGlobals.tbl_others, ref => ref.where('status', '==', false)).snapshotChanges();
  }

  removePermanently(id: any, others: any, id_other: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
      .doc(id).collection(myGlobals.tbl_invs).doc(others).collection(myGlobals.tbl_others).doc(id_other).delete();
  }

  updateInvoices(id: any, data: any){
    let batch = this.firestore.firestore.batch();

    const benefits_deduction = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
    .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_ben).ref;
    batch.update(benefits_deduction, data.benefits);

    const invoices_info = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
    .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_invs_info).ref;
    batch.update(invoices_info, data.infos);

    const invoices = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
    .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_inv).ref;
    batch.update(invoices, data.invoices);

    return batch.commit();
  }

  setInvoices(id: any, data: any){
    let batch = this.firestore.firestore.batch();

    const benefits_deduction = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
    .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_ben).ref;
    batch.set(benefits_deduction, data.benefits);

    const invoices_info = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
    .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_invs_info).ref;
    batch.set(invoices_info, data.infos);

    const invoices = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro)
    .doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_inv).ref;
    batch.set(invoices, data.invoices);

    return batch.commit();
  }

  getAttendanceHour(id: any){
    const date_to_format = new Date();
    // Adding + 1 operator to Date, due to firestore where query not accepting '<='
    const day = ("0" + date_to_format.getDate() + 1).slice(-2);
    const month = ("0" + date_to_format.getMonth() + 1).slice(-2);
    const year = date_to_format.getFullYear();
    const date_formatted = year + '-' + month + '-' + day;

    const nthDay = moment(date_to_format).subtract(7, 'days');
    const nthDay_formatted = nthDay.format("YYYY-MM-DD");

    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_att)
    .collection(id, ref => ref
      .where("date", "<", new Date(date_formatted)).orderBy('date', 'desc').limit(10))
      .valueChanges();

  }

  getManualAttendance(id: any, start: any, end: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_att)
    .collection(id, ref => ref
      .where("date", "<=", new Date(end))
      .where("date", ">=", new Date(start))
      .orderBy('date', 'desc'))
      .valueChanges();
  }

  addOthers(id: any, others: any, data: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros)
      .collection(myGlobals.tbl_pro).doc(id).collection(myGlobals.tbl_invs)
      .doc(others).collection(myGlobals.tbl_others).add(data);
  }

  
  getInvoicedBy(){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).valueChanges();
  }

  
  addInvoice(id: any, data: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_invs).collection(myGlobals.tbl_inv).doc(id).set(data);
  }
  
  getAllLatestInvoices(){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_invs)
    .collection(myGlobals.tbl_inv, ref => ref
    .orderBy('date_issued', 'desc')).snapshotChanges();
  }

  // ========================================== //
  // ================ History  ================ //
  // ========================================== //

  // getAllLatestInvoicesForHistory(index: any){
  //   return this.firestore.collection(myGlobals.db)
  //   .doc(myGlobals.tbl_invs)
  //   .collection(myGlobals.tbl_inv, ref => ref
  //   .orderBy('date_issued', 'desc').limit(index)).snapshotChanges();
  // }

  getAllLatestInvoicesForHistory(index: any, start: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_invs)
    .collection(myGlobals.tbl_inv, ref => ref
    .orderBy('date_issued', 'desc')
    .startAt(start)
    .limit(index)).snapshotChanges();
  }

  nextAllLatestInvoicesForHistory(index: any, start: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_invs)
    .collection(myGlobals.tbl_inv, ref => ref
    .orderBy('date_issued', 'desc')
    .startAfter(start)
    .limit(index)).snapshotChanges();
  }

  prevAllLatestInvoicesForHistory(index: any, end: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_invs)
    .collection(myGlobals.tbl_inv, ref => ref
    .orderBy('date_issued', 'desc')
    .endAt(end)
    .limit(index)).snapshotChanges();
  }

  getAllLatestInvoicesTotal(){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_invs)
    .collection(myGlobals.tbl_inv, ref => ref
    .orderBy('date_issued', 'desc')).get();
  }
  
  getAllLatestInvoicesByCategory(month_number: any, data_issued: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_invs)
    .collection(myGlobals.tbl_inv, ref => ref
    .where(data_issued, '==', month_number).limit(10)).snapshotChanges();    
  }

  getAllLatestInvoicesByCategoryTotal(month_number: any, data_issued: any){
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_invs)
    .collection(myGlobals.tbl_inv, ref => ref
    .where(data_issued, '==', month_number)).get();    
  }





}
