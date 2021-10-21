import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AngularFirestore} from '@angular/fire/firestore';
import * as CryptoJS from 'crypto-js'
import * as bcrypt from 'bcryptjs';
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";

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
    return this.firestore.collection(this.logins).doc(id).valueChanges();
  }

  getLoginOnline(id: any) {
    return this.firestore.collection(this.logins).doc(id).snapshotChanges();
  }

  updateOnlineField(id: any, bool: any) {
    return this.firestore.collection('profile').doc(id).update({online: bool});
  }

  getPriv() {
    return this.firestore.collection(this.pri).doc('roles').valueChanges();
  }

  updatePrivRole(key: any, value: any) {
    return this.firestore.collection(this.pri).doc('roles').update({[key]: value});
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
    return this.firestore.collection(this.acc).doc(id).set(data);
  }

  getAccount(id: any) {
    return this.firestore.collection(this.acc).doc(id).valueChanges();
  }

  checkUsername(uname: any) {
    return this.firestore.collection(this.acc, ref => ref.where("uname", "==", uname)).snapshotChanges();
  }

  deleteEmployee(id: any) {
    let batch = this.firestore.firestore.batch();

    const account_reference = this.firestore.collection(this.acc).doc(id).ref;
    batch.delete(account_reference);
    const profile_reference = this.firestore.collection(this.prof).doc(id).ref;
    batch.delete(profile_reference);
    const logins_reference = this.firestore.collection(this.logins).doc(id).ref;
    batch.delete(logins_reference);
    const attendance_reference = this.firestore.collection(this.att).doc(id).ref;
    batch.delete(attendance_reference);

    return batch.commit();
  }

  addNewEmployee(id: any, employee_data: any, profile_data: any, logins_data: any) {
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

    //--create batch--
    let batch = this.firestore.firestore.batch();

    //--create account collection--
    const account_reference = this.firestore.collection(this.acc).doc(id).ref;
    batch.set(account_reference, employee_data);

    //--create profile collection--
    const profile_reference = this.firestore.collection(this.prof).doc(id).ref;
    batch.set(profile_reference, profile_data);

    //--create profile collection--
    const logins_reference = this.firestore.collection(this.logins).doc(id).ref;
    batch.set(logins_reference, logins_data);

    //--create attendance collection--
    const attendance_reference = this.firestore.collection(this.att).doc(id).ref;
    batch.set(attendance_reference, att_first_collection);

    const attendance_second_reference = this.firestore.collection(this.att)
      .doc(id).collection(second_collection).doc().ref;
    batch.set(attendance_second_reference, att_second_collection);

    return batch.commit();
  }

  updateEmployeeAccountandProfile(id: any, employee_data: any, profile_data: any) {
    let batch = this.firestore.firestore.batch();

    const account_reference = this.firestore.collection(this.acc).doc(id).ref;
    batch.update(account_reference, employee_data);

    const profile_reference = this.firestore.collection(this.prof).doc(id).ref;
    batch.update(profile_reference, profile_data);

    return batch.commit();
  }

  changePassword(value: any, id: any) {
    const salt = bcrypt.genSaltSync(10);
    const pass = bcrypt.hashSync(value, salt);
    const data = {password: pass};
    return this.firestore.collection(this.acc).doc(id).update(data);
  }

  updateProfileImage(value: any, id: any) {
    const data = {
      profile_img: value
    };
    return this.firestore.collection(this.prof).doc(id).update(data);
  }

  // =================  Test

  testDelete(id: any) {
    return this.firestore.collection(this.acc).doc(id).delete();
  }

  // =================  Navigator
  getNavigators() {
    return this.firestore.collection('navigator').valueChanges();
  }

  // =================  Categories

  getTokenLogins() {
    return this.firestore.collection(this.cat).doc(this.token).valueChanges();
  }

  getBloodType() {
    return this.firestore.collection(this.cat).doc(this.bloodId).valueChanges();
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

  updateCategories(doc: any, value: any, key: any) {
    return this.firestore.collection(this.cat).doc(doc).update({[key]: value});
  }


  addLogsData(value: any) {
    const data = {
      updated_at: new Date(),
      user_id: value.user_id,
      tokens: value.tokens,
      uid: value.uid,
      browser: value.browser,
    };
    return this.firestore.collection(this.logins).doc().set(data);
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
    return this.firestore.collection(this.app).doc(id).set(data);
  }

  getCompanyInformation() {
    return this.firestore.collection(this.app).doc('company').valueChanges();
  }

  updateLogo(value: any) {
    return this.firestore.collection(this.app).doc('company').update({company_logo: value});
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
    return this.firestore.collection(this.app).doc('company').update(data);
  }

}
