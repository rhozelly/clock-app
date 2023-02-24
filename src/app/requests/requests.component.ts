import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertMessageComponent } from '../alert-message/alert-message.component';
import { AttendanceService } from '../core/services/attendance.service';
import { MainService } from '../core/services/main.service';
import { ProfileService } from '../core/services/profile.service';
import { SettingsService } from '../core/services/settings.service';
import { RequestDialogComponent } from '../dialogs/request-dialog/request-dialog.component';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  pendings: any;
  requests: any;
  filterBy: any;
  searchRequest: any;
  user: any;
  role_dec_logged: any;
  icons: any =  {check: 'check_circle',denied: 'cancel',pending: 'hourglass_empty'};
  id: any;

  //User Variable
  now: any = new Date();
  status: any;
  
  requestForm: FormGroup;
  category: any = [
   {name: 'overtime', field: 'time'},
   {name: 'halfday', field: 'time'},
   {name: 'sick leave', field: 'time'},
   {name: 'vacation leave', field: 'time'},
   {name: 'ca', field: 'amount'},
   {name: 'loan', field: 'amount'},
  ]
  categorySelected: any = "";
  categoryValue: any = "";
  name: any;
  hours: any  = [];
  profile: any  = [];
  constructor(private att: AttendanceService,
              private sett: SettingsService,
              private main: MainService,
              private fb: FormBuilder,
              private prof: ProfileService,
              private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.initiateReuqestForm();
    this.requestForm.get('request_for')?.valueChanges.subscribe((val: any) =>{
        this.categorySelected = val.field || ''; 
        this.categoryValue = val.name || ''; 
    })
    this.user = localStorage.getItem('user') ? new Object(localStorage.getItem('user')).toString() : '';    
    let id = localStorage.getItem('collection-id') ? new Object(localStorage.getItem('collection-id')).toString() : '';    
    let role = this.user.length > 0 ? JSON.parse(this.user).re : '';
    let role_dec = this.main.decrypt(role ? role : '', 'r0l3_3nc');
    this.role_dec_logged = role_dec.toLowerCase();

    this.id = this.main.decrypt(id, 'collection-id');
    this.getAllRequests();
    this.getUserProfile();
  }

  //User
  
  initiateReuqestForm(){
    this.requestForm = this.fb.group({
      amount: [null],
      date: [null, Validators.required],
      date_added: [new Date()],
      hours: [null],
      id: [null,Validators.required],
      name: [null,Validators.required],
      reason: [null],
      request_for: [null, Validators.required],
      status: ["pending"],
      status_updated: [null],
    });
  }

  getUserProfile(){
    this.prof.getUserProfile(this.id).subscribe((res: any) =>{
      this.profile = res ? res : [];      
      this.requestForm.get('name')?.setValue(this.profile.first_name  + ' ' + this.profile.last_name);
      this.requestForm.get('id')?.setValue(this.id);
    })
  }
  
  getPendingRequests(){
    this.att.getPendingRequests().subscribe((result: any) =>{
        if(result.length > 0){
          let arr: any = [];
          result.forEach((el: any) =>{
            const data = {
              date: el.payload.doc.data().date,
              date_added: el.payload.doc.data().date_added,
              hours:  el.payload.doc.data().hours,
              id:  el.payload.doc.data().id,
              name:  el.payload.doc.data().name,
              reason:  el.payload.doc.data().reason,
              request_for: el.payload.doc.data().request_for,
              status: el.payload.doc.data().status,
              status_updated: el.payload.doc.data().status_updated,
              doc_id: el.payload.doc.id
            }
            arr.push(data);
          })
          this.pendings = arr;
        } else {this.pendings = []; }  
    })
  }

  getAllRequests(){
    this.att.getAllRequests().subscribe((result: any) =>{
      if(result.length > 0){
        let arr: any = [];
        result.forEach((el: any) =>{
          const data = {
            date: el.payload.doc.data().date,
            date_added: el.payload.doc.data().date_added,
            hours:  el.payload.doc.data().hours,
            id:  el.payload.doc.data().id,
            name:  el.payload.doc.data().name,
            reason:  el.payload.doc.data().reason,
            request_for: el.payload.doc.data().request_for,
            status: el.payload.doc.data().status,
            status_updated: el.payload.doc.data().status_updated,
            doc_id: el.payload.doc.id
          }
          arr.push(data);
        })
        this.requests = arr;
      } else {this.requests = []; }  
    })
  }

  openRequest(x: any){
    const dialogRef = this.dialog.open(RequestDialogComponent, {
      data: {data: x, view: 'request'},
      width: '460px'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
        this.getPendingRequests();
        this.getAllRequests();
    });
  }
  
  getColor(status: any){
    return status === 'approved' ? '#3c8348' :  status === 'denied' ? '#da6965' : status === 'pending' ? 'grey' : 'grey';
  }

  requestFilterBy(order: any, asc: any){
    this.att.requestFilterBy(order, asc).subscribe((result: any) =>{
      if(result.length > 0){
        let arr: any = [];
        result.forEach((el: any) =>{
          const data = {
            date: el.payload.doc.data().date,
            date_added: el.payload.doc.data().date_added,
            hours:  el.payload.doc.data().hours,
            id:  el.payload.doc.data().id,
            name:  el.payload.doc.data().name,
            reason:  el.payload.doc.data().reason,
            request_for: el.payload.doc.data().request_for,
            status: el.payload.doc.data().status,
            status_updated: el.payload.doc.data().status_updated,
            doc_id: el.payload.doc.id
          }
          arr.push(data);
        })
        this.requests = arr;
      } else {
        this.requests = [];
        this.getAllRequests()
      }  
    })
  }
  searchRequests(){
    let order = this.filterBy || 'name';
    this.att.requestSearchBy(this.searchRequest,order).subscribe((result: any) =>{
      if(result.length > 0){
        let arr: any = [];
        result.forEach((el: any) =>{
          const data = {
            date: el.payload.doc.data().date,
            date_added: el.payload.doc.data().date_added,
            hours:  el.payload.doc.data().hours,
            id:  el.payload.doc.data().id,
            name:  el.payload.doc.data().name,
            reason:  el.payload.doc.data().reason,
            request_for: el.payload.doc.data().request_for,
            status: el.payload.doc.data().status,
            status_updated: el.payload.doc.data().status_updated,
            doc_id: el.payload.doc.id
          }
          arr.push(data);
        })
        this.requests = arr;
      } else {
        this.requests = [];
        this.getAllRequests()
      }  
    })
  }

  
  
  alertMessage(view: any, data: any, doc_id: any) {
    const dialogRef = this.dialog.open(AlertMessageComponent, {
      data: {action: view, data: data}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
        if(result === 'yes'){
           this.updateRequest(data, doc_id);
        }
    });
  }
  snack(m: any, a: any, c: any) {
    this.sett.snackbar(m, a, 2000, c);
  }

  updateRequest(action: any, doc_id: any){
    this.att.requestUpdate(action, doc_id, new Date()).then(doc =>{
        this.snack('Status Request Updated', 'X', 'green-snackbar');
    })
    .catch(error =>{
        this.snack('Status Request Failed', 'X', 'red-snackbar');
    })
  }

  

  submit(){
    console.log(this.requestForm.getRawValue());
    
    if(this.requestForm.valid){
      this.requestForm.get('request_for')?.setValue(this.categoryValue);
      this.att.requestAdd(this.requestForm.getRawValue()).then(doc =>{
          this.snack('Request form was successfully submitted.', 'X', 'green-snackbar');
          this.requestForm.reset();
      })
      .catch(error =>{
          this.snack('Something went wrong.', 'X', 'red-snackbar');      
      })
    } else {
        this.snack('Please complete the forms.', 'X', 'red-snackbar');
    }
  }
}