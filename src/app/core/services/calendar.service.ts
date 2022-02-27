import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import * as myGlobals from '../../../../globals';
import { MainService } from './main.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
    user: any;

    constructor(
        private firestore: AngularFirestore,
        private storage: AngularFireStorage,
        private http: HttpClient,
        private main: MainService
    ) {}

    getAttendance(){    
        const collection_id = localStorage.getItem('collection-id') ? localStorage.getItem('collection-id') :  '';
        const myID = this.main.decrypt(collection_id, 'collection-id');
        return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_att).collection(myID).valueChanges();
    }

    getAttendanceForTheMonth(id: any, end: any, start: any){
        return this.firestore.collection(myGlobals.db).doc(myGlobals.tbl_att)
        .collection(id, ref => ref
          .where("date", "<=", new Date(end))
          .where("date", ">", new Date(start))
          .orderBy('date', 'desc'))
          .valueChanges();
    }
}
