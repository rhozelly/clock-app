import {Component, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {TimesheetsDialogComponent} from "./timesheets-dialog/timesheets-dialog.component";
import {MainService} from "../core/services/main.service";
import {SettingsService} from "../core/services/settings.service";
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";
import {TimesheetService} from "../core/services/timesheet.service";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";
import {AngularFirestore} from "@angular/fire/firestore";
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.css']
})
export class TimesheetsComponent implements OnInit, OnDestroy {
  dialogHeightSize: any = '640px';
  dialogMaxWeightSize: any = '80vw';
  dialogWeightSize: any = '50%';
  myID: any = '';
  logs: any = [];
  dates: any = [];

  end_length: any = '';
  start_length: any = '';
  first_response: any = [];
  last_response: any = [];
  pagination_click: any = 0;


  monthNow: any = new Date().toLocaleDateString('en-US', {month: "short"}).toUpperCase();
  yearNow: any = new Date().getFullYear();
  dateNow: any;
  dateBefore: any;

  
  // MatPaginator Output
  pageEvent: PageEvent;
  lastDateOnTheArray: any  = [];
  pageIndex: any = 0;
  pageSize: any;

  constructor(
    private dialog: MatDialog,
    private main: MainService,
    private sett: SettingsService,
    private time: TimesheetService,
    public breakpointObserver: BreakpointObserver,
    private firestore: AngularFirestore,
  ) {
  }

  ngOnInit(): void {
    this.dateNow = this.monthNow + '-' + this.yearNow;
    this.getMonthBefore();
    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.main.decrypt(collection_id, 'collection-id');
    this.breakpointObserver.observe(['(min-width: 768px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.dialogHeightSize = '640px';
          this.dialogMaxWeightSize = '80vw';
          this.dialogWeightSize = '50%';
        } else {
          this.dialogWeightSize = '100%';
          this.dialogHeightSize = '100%';
          this.dialogMaxWeightSize = '100%';
        }
      });
    this.getTimesheets(this.myID);
  }

  handlePageEvent(event: PageEvent) {
    console.log(event.pageSize);
    let new_array: any = [];
    if(this.pageIndex < event.pageIndex){
      this.pageIndex += 1;
      this.time.nextEmployeeTimesheet(this.myID, this.lastDateOnTheArray, event.pageSize + 1).subscribe((result: any) =>{
        if(result.length > 0){
          this.logs  = [];
          this.lastDateOnTheArray = result[result.length - 1].payload.doc.data().date.toDate();
          result.forEach((e: any) =>{
            const arr = {
              doc_id : e.payload.doc.id,
              desc : e.payload.doc.data().desc.length > 0 ? e.payload.doc.data().desc : "",
              project: e.payload.doc.data().project.length > 0 ? e.payload.doc.data().project : "",
              time: e.payload.doc.data().time ? e.payload.doc.data().time : "",
              date : e.payload.doc.data().date
            }   
            new_array.push(arr);   
          })   
          const a = Array.from(new_array.reduce((m: any, t: any) => m.set(t.date.toDate().toLocaleDateString('en-US'), t), new Map()).values());
          this.logs = a ? a : [];   
        }  
      })
    } else if(this.pageIndex > event.pageIndex) {
      this.pageIndex -= 1;
      this.time.prevEmployeeTimesheet(this.myID, this.lastDateOnTheArray, event.pageSize).subscribe((result: any) =>{
        if(result.length > 0){
          this.logs  = [];
          this.lastDateOnTheArray = result[result.length - 1].payload.doc.data().date.toDate();
          result.forEach((e: any) =>{
            const arr = {
              doc_id : e.payload.doc.id,
              desc : e.payload.doc.data().desc.length > 0 ? e.payload.doc.data().desc : "",
              project: e.payload.doc.data().project.length > 0 ? e.payload.doc.data().project : "",
              time: e.payload.doc.data().time ? e.payload.doc.data().time : "",
              date : e.payload.doc.data().date
            }   
            new_array.push(arr);   
          })   
          const a = Array.from(new_array.reduce((m: any, t: any) => m.set(t.date.toDate().toLocaleDateString('en-US'), t), new Map()).values());
          this.logs = a ? a : [];   
        }  
      })      
    } else {
      console.log('ads');
      
    }
  }

  ngOnDestroy(): void{    
    // this.time.getEmployeesTimesheet(id).
  }
  getMonthBefore(){
    const current = new Date();
    current.setMonth(current.getMonth()-1);
    const previousMonth = current.toLocaleString('default', { month: 'short' }).toUpperCase();
    this.dateBefore = previousMonth  + '-' + this.yearNow;
  }

  async getTimesheets(id: any) {    
    const result1 = <any>await this.progressOne(id);
    const result2 = <any>await this.progressTwo();
    
    //   const nowData = this.firestore.collection('timesheets').doc(id).collection(this.dateNow,
    //     ref => ref.orderBy('date', 'desc').limit(4)).snapshotChanges();
    //   const beforeData = this.firestore.collection('timesheets').doc(id).collection(this.dateBefore,
    //     ref => ref.orderBy('date', 'desc').limit(4)).snapshotChanges();
    //   const combi_query = combineLatest<any[]>(nowData, beforeData).pipe(
    //     map(arr => arr.reduce((acc, cur) => acc.concat(cur))),      )
    // setTimeout(() => {

    //   combi_query.subscribe((result: any) => {
    //     result.forEach((e: any) =>{
    //       // DIPOTA
    //       this.start_length = result.length;
    //       this.end_length = result.length - 1;
    //       if (result) {
    //         // const log = result ? result : [];
    //         // this.first_response = log[0];
    //         // this.last_response = log[log.length - 1];
    //         //   log.forEach((e: any) => {
    //         //   console.log(e.date);            
    //         //   e.date = e?.date != undefined ? e?.date.toDate() : e?.date;
    //         //   this.dates.push(e?.date.toLocaleDateString('en-US'))
    //         //   })
    //         //   const results = Array.from(log.reduce((m: any, t: any) => m.set(t.date.toLocaleDateString('en-US'), t), new Map()).values());
    //         //   this.logs = results ? results : [];        
    //       }
    //     })
        
    //   })
    // }, 500);
  }

  progressOne(id: any){
    return new Promise(resolve => {
      let new_array: any = [];
      this.time.getEmployeesTimesheet(id, 5).subscribe((result: any) =>{
        if(result.length > 0){
          const log = result ? result : [];
          this.lastDateOnTheArray = result[result.length - 1].payload.doc.data().date.toDate();
          
          // this.lastDateOnTheArray = result.
          result.forEach((e: any) =>{
            const arr = {
              doc_id : e.payload.doc.id,
              desc : e.payload.doc.data().desc.length > 0 ? e.payload.doc.data().desc : "",
              project: e.payload.doc.data().project.length > 0 ? e.payload.doc.data().project : "",
              time: e.payload.doc.data().time ? e.payload.doc.data().time : "",
              date : e.payload.doc.data().date
            }   
            new_array.push(arr);   
          })   
          const a = Array.from(new_array.reduce((m: any, t: any) => m.set(t.date.toDate().toLocaleDateString('en-US'), t), new Map()).values());
          this.logs = a ? a : [];  
        }        
      })
    });
  }

  progressTwo(){
    
  }

  next() {
    this.pagination_click++;
    const fooPosts = this.firestore.collection('timesheets').doc(this.myID).collection(this.dateNow,
      ref => ref.orderBy('date', 'desc').limit(4).startAfter(this.last_response)).valueChanges();
    const barPosts = this.firestore.collection('timesheets').doc(this.myID).collection(this.dateBefore,
      ref => ref.orderBy('date', 'desc').limit(4)).valueChanges();
    const combi_query = combineLatest<any[]>(fooPosts, barPosts).pipe(
      map(arr => arr.reduce((acc, cur) => acc.concat(cur))),
    )
    combi_query.subscribe((result: any) => {
      if (result) {
        const log = result ? result : [];
        this.first_response = log[0];
        this.last_response = log[log.length - 1];
        this.pagination_click++;
        log.forEach((e: any) => {
          // let e = a.payload.doc.data();
          e.date = e?.date != undefined ? e?.date.toDate() : e?.date;
          this.dates.push(e?.date.toLocaleDateString('en-US'))
        })
        const results = Array.from(log.reduce((m: any, t: any) => m.set(t.date.toLocaleDateString('en-US'), t), new Map()).values());
        this.logs = results ? results : [];
      }
    })
  }

  timesheetDialog(view: any, data: any) {
    const dialogRef = this.dialog.open(TimesheetsDialogComponent, {
      width: this.dialogWeightSize,
      height: this.dialogHeightSize,
      maxWidth: this.dialogMaxWeightSize,
      disableClose: true,
      data: {view: view, data: data}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === 'success') {
        // this.snack('Timesheet logged successfully!', 'X', 'green-snackbar')
        this.logs = [];
        this.getTimesheets(this.myID);
      } else if (result === 'failed') {
        // this.snack('Timesheet logged failed!', 'X', 'red-snackbar')
      }
    });
  }

  snack(m: any, a: any, c: any) {
    this.sett.snackbar(m, a, 2000, c);
  }

}
