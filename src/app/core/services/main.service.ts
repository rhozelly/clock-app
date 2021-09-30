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


  monthNow: any = new Date().toLocaleString('en-us', {month: 'short'});
  yearNow: any = new Date().getFullYear();

  constructor(private firestore: AngularFirestore,
              private http: HttpClient,) {
  }

  randomNumber(lengthNumber: any) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
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

  addLogin(value: any, id: any) {
    const data = {
      email: value.email,
      online: value.online,
      time_logged_in: value.time_logged_in,
      tokens: value.tokens,
    };
    return this.firestore.collection(this.logins).doc(id).set(data);
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

  // =================  Categories

  getTokenLogins() {
    return this.firestore.collection(this.cat).doc(this.token).valueChanges();
  }

  getNavigators() {
    return this.firestore.collection('navigator').valueChanges();
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

}
