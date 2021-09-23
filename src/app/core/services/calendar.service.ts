import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
    attendance : string = 'attendance';
    private basePath = '/profiles';

    constructor(
        private firestore: AngularFirestore,
        private storage: AngularFireStorage,
        private http: HttpClient    
    ) {
    
    }

    getAttendance(){
        const user_id : any = localStorage.getItem('user_id');
        return this.firestore.collection('attendance').doc(user_id).collection('2021-AUG', ref => ref.orderBy('date_time', 'asc')).valueChanges();
    }
}
