import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AngularFirestore} from '@angular/fire/firestore';
import * as CryptoJS from 'crypto-js'
import * as bcrypt from 'bcryptjs';
import {combineLatest} from "rxjs";
import {map, reduce} from "rxjs/operators";
import * as myGlobals from '../../../../globals';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  logins: any = 'logins';
  acc: any = 'account';
  cat: any = 'categories';
  bloodId: any = 'blood-type';
  positionId: any = 'positions';
  roles: any = 'roles';
  token: any = 'tokens';
  prof: any = 'profile';
  att: any = 'attendance';
  cli: any = 'clients';
  pri: any = 'privileges';
  app: any = 'application';
  set: any = 'settings';


  monthNow: any = new Date().toLocaleString('en-us', {month: 'short'});
  yearNow: any = new Date().getFullYear();

  constructor(private firestore: AngularFirestore,
              private http: HttpClient,) {
  }

  randomNumber(lengthNumber: any) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < lengthNumber; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

  encrypt(value: any, key: any) {
    return CryptoJS.AES.encrypt(value.trim(), key.trim()).toString();
  }

  decrypt(value: any, key: any) {
    const val = value ? value : '';
    const ke = key ? key : '';
    return CryptoJS.AES.decrypt(val.trim(), ke.trim()).toString(CryptoJS.enc.Utf8);
  }

  getLogin(id: any) {
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_logs)
    .collection(myGlobals.tbl_log)
    .doc(id).valueChanges();
    // return this.firestore.collection(this.logins).doc(id).valueChanges();
  }

  getLoginOnline(id: any) {
    return this.firestore.collection(this.logins).doc(id).snapshotChanges();
  }

  updateOnlineField(id: any, bool: any) {
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro)
    .doc(id)
    .update({online: bool});
  }

  getPriv() {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pri).valueChanges();
  }

  updatePrivRole(key: any, value: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pri).update({[key]: value});
  }


  addAccount(value: any, id: any) {
    const data = {
      created_at: new Date(),
      password: value.password,
      uname: value.uname,
      priv: value.priv,
      profile_id: value.profile_id,
      role: value.role,
      updated_at: new Date(),
    };
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_accs).collection(myGlobals.tbl_acc).doc(id).set(data);
  }

  getAccount(id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_accs).collection(myGlobals.tbl_acc).doc(id).valueChanges();
  }

  checkUsername(uname: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_accs)
    .collection(myGlobals.tbl_acc, ref => ref.where("uname", "==", uname)).snapshotChanges();
  }

  checkAccountId(id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_accs).collection(myGlobals.tbl_acc).doc(id).snapshotChanges();
  }

  deleteEmployee(id: any) {
    let batch = this.firestore.firestore.batch();
    const account_reference = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_accs)
    .collection(myGlobals.tbl_acc).doc(id).ref;
    batch.delete(account_reference);
    const profile_reference = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro).doc(id).ref;
    batch.delete(profile_reference);
    const logins_reference = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_logs)
    .collection(myGlobals.tbl_log).doc(id).ref;
    batch.delete(logins_reference);
    return batch.commit();
  }

  addNewEmployee(id: any, employee_data: any, profile_data: any, logins_data: any, deduc_data: any) {
    const att_first_collection = {
      recent_date_updated: '',
      recent_doc_id: '',
    }
    const att_second_collection = {
      date_time: '',
      time_in: '',
      time_out: '',
    }
    const second_collection = this.yearNow + '-' + this.monthNow.toUpperCase();

    const invoiceinfo = {
      basic_pay: employee_data.basicpay,
      daily_rate: employee_data.dailyrate
    }
    //--create batch--
    let batch = this.firestore.firestore.batch();

    //--create account collection--
    const account_reference = this.firestore
    .collection(myGlobals.db).doc(myGlobals.tbl_accs)
    .collection(myGlobals.tbl_acc).doc(id).ref;
    batch.set(account_reference, employee_data);

    //--create profile collection--
    const profile_reference = this.firestore
    .collection(myGlobals.db).doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro).doc(id).ref;
    batch.set(profile_reference, profile_data);

    //--create login collection--
    const logins_reference = this.firestore
    .collection(myGlobals.db).doc(myGlobals.tbl_logs)
    .collection(myGlobals.tbl_log).doc(id).ref;
    batch.set(logins_reference, logins_data);
    
    //--create invoice info collection--
    const invoice_reference = this.firestore
    .collection(myGlobals.db).doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro).doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_inv_info).ref;
    batch.set(invoice_reference, invoiceinfo);
    
    //--create benefits collection--
    const benefits_reference = this.firestore
    .collection(myGlobals.db).doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro).doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_ben).ref;
    batch.set(benefits_reference, deduc_data);

    return batch.commit();
  }

  updateEmployeeAccountandProfile(id: any, employee_data: any, profile_data: any, deduc_data: any, invoice_data: any, invoice_acc_data: any) {
    let batch = this.firestore.firestore.batch();
    delete invoice_acc_data.password;
   
    const account_reference = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_accs)
    .collection(myGlobals.tbl_acc).doc(id).ref;
    batch.update(account_reference, employee_data);

    const profile_reference = this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro).doc(id).ref;
    batch.update(profile_reference, profile_data);
    
    //--create invoice info collection--
    const invoice_reference = this.firestore
    .collection(myGlobals.db).doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro).doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_inv_info).ref;
    batch.set(invoice_reference, invoice_data);

    const invoice_acc_reference = this.firestore
    .collection(myGlobals.db).doc(myGlobals.tbl_accs)
    .collection(myGlobals.tbl_acc).doc(id).ref;
    batch.update(invoice_acc_reference, invoice_acc_data);
    
    //--create benefits collection--
    const benefits_reference = this.firestore
    .collection(myGlobals.db).doc(myGlobals.tbl_pros)
    .collection(myGlobals.tbl_pro).doc(id).collection(myGlobals.tbl_invs).doc(myGlobals.tbl_ben).ref;    
    batch.set(benefits_reference, deduc_data);

    return batch.commit();
  }

  changePassword(value: any, id: any) {
    const salt = bcrypt.genSaltSync(10);
    const pass = bcrypt.hashSync(value, salt);
    const data = {password: pass};
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_accs).collection(myGlobals.tbl_acc).doc(id).update(data);
  }

  updateProfileImage(value: any, id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro).doc(id).update({profile_img: value});
  }

  // =================  Test

  testDelete(id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_accs).collection(myGlobals.tbl_acc).doc(id).delete();
  }

  // =================  Navigator
  getNavigators() {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_navs).collection(myGlobals.tbl_nav).valueChanges();
  }

  // =================  Categories

  getTokenLogins() {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).valueChanges();
  }

  getCategories() {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).valueChanges();
  }

  updateCategories(value: any, key: any) {
    // Needed the syntax in the future
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).update({[key]: value});
  }

  getBloodType() {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).valueChanges();
  }

  getPositions() {
    return this.firestore.collection(this.cat).doc(this.positionId).valueChanges();
  }

  getRoles() {
    return this.firestore.collection(this.cat).doc(this.roles).valueChanges();
  }

  getClients() {
    return this.firestore.collection(this.cat).doc(this.cli).valueChanges();
  }

  getSettings() {
    return this.firestore.collection(this.cat).doc(this.set).valueChanges();
  }

  // updateCategories(doc: any, value: any, key: any) {
  //   // Needed the syntax in the future
  //   return this.firestore.collection(this.cat).doc(doc).update({[key]: value});
  // }


  addLogsData(value: any) {    
    const data = {
      updated_at: new Date(),
      user_id: value.user_id,
      tokens: value.tokens,
      uid: value.uid,
      browser: myGlobals.browser,
      product_sub: myGlobals.prod_sub,
    };
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_logs)
    .collection(myGlobals.tbl_log)
    .doc(value.user_id).collection(myGlobals.tbl_ls)
    .add(data);
  }

  updateLogsData(value: any) {
    const data = {
      updated_at: new Date(),
      user_id: value.user_id,
      tokens: value.tokens,
      uid: value.uid,
      recent_doc_id: value.recent_doc_id,
      browser: myGlobals.browser,
      product_sub: myGlobals.prod_sub,
    };
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_logs)
    .collection(myGlobals.tbl_log)
    .doc(value.user_id)
    .set(data);
  }

  getLogsData(value: any, id: any) {
    return this.firestore.collection(myGlobals.db)
    .doc(myGlobals.tbl_logs)
    .collection(myGlobals.tbl_log)
    .doc(value.user_id).collection(myGlobals.tbl_ls).doc(id).get();
  }

  getLogs(value: any) {
    return this.firestore.collection('logins', ref => ref.where("uid", "==", value)).get();
  }

  removeLogs(id: any) {
    return this.firestore.collection('logins').doc(id).delete();
  }


  findUserId(value: any) {
    return this.firestore.collection('logins', ref => ref.where('user_id', "==", value)).get();
  }

  test(data: any) {
    return this.firestore.collection('test').doc().set({happened: data});
  }

  getAutoLogout() {
    return this.firestore.collection(this.cat).doc('time').valueChanges();
  }

  
  offline(id: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro).doc(id).update({online: false});
  }


  // =================  Application Settings


  setApplicationValue(value: any, id: any) {
    const data = {
      company_address: value.company_address,
      company_id: value.company_id,
      company_logo: value.company_logo,
      company_name: value.company_name,
      copyright: value.copyright,
      tagline: value.tagline,
    }
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_app).set(data);
  }

  getCompanyInformation() {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_app).valueChanges();
  }

  updateLogo(value: any) {
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_app).update({company_logo: value});
  }

  updateCompanyInformation(value: any) {
    const data = {
      company_address: value.company_address,
      company_id: value.company_id,
      company_logo: value.company_logo,
      company_name: value.company_name,
      copyright: value.copyright,
      tagline: value.tagline,
    }
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_app).update(data);
  }

  addingSampleData(){
    const data = {
      contact_no: 92751499882,
      created_at: new Date(),
      email_add: "joshua@gmail.com",
      emergency_contact:9275114982,
      emergency_name:"Al",
      first_name:"Joshua",
      joined_at: new Date(),
      last_name:"Jimenez",
      profile_img: "https://firebasestorage.googleapis.com/v0/b/attendance-app-92cbe.appspot.com/o/profiles%2FRCKL2021-profile?alt=media&token=d922c1f9-9e84-4050-b1ab-6da7080a57d3",
      updated_at: new Date(),
    }
  // return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_pros).collection(myGlobals.tbl_pro).doc('RCKL2021').set(data);
  }

  // addEvent(data: any){
  //   return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_eve).set(data);
  // }

  getTypeOfDeductions(data: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).set(data);
  }

  getTypeOfEarnings(data: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_cat).set(data);
  }

  
  getLogsForAttendance(){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_ls).collection(myGlobals.tbl_l, ref => ref.orderBy('time', 'desc').limit(10)).valueChanges();
  }


  
  addLogsForAttendance(data: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_ls).collection(myGlobals.tbl_l).add(data);
  }
  
  getTasks(index: any){
    return this.firestore
    .collection(myGlobals.db)
    .doc(myGlobals.tbl_cat)
    .collection(myGlobals.tbl_cli, ref => ref.orderBy('priority', 'asc').limit(index)).valueChanges();
  }

  // ============================ Events ============================  //

  getEvents(index: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_eve).collection(myGlobals.tbl_ev, ref => ref.orderBy('event_date', 'desc').limit(index)).snapshotChanges();
  }
  
  addEvents(data: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_eve).collection(myGlobals.tbl_ev).add(data);
  }
  
  removeEvents(id: any){
    return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_eve).collection(myGlobals.tbl_ev).doc(id).delete();
  }

}
