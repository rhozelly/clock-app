import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttendanceService } from 'src/app/core/services/attendance.service';
import { SettingsService } from 'src/app/core/services/settings.service';

@Component({
  selector: 'app-request-dialog',
  templateUrl: './request-dialog.component.html',
  styleUrls: ['./request-dialog.component.css']
})
export class RequestDialogComponent implements OnInit {
  now: any = new Date();
  status: any;
  icons: any =  {check: 'check_circle',denied: 'cancel',pending: 'hourglass_empty'};
  
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
  constructor(public dialogRef: MatDialogRef<RequestDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private sett: SettingsService,
              private att: AttendanceService) {
                this.initiateReuqestForm();
               }

  ngOnInit(): void {
    this.requestForm.get('request_for')?.valueChanges.subscribe((val: any) =>{
       this.categorySelected = val.field || ''; 
       this.categoryValue = val.name || ''; 
    })
    
    if(this.data.view === "employee"){
      this.generateTime();
      this.name = this.data.data.first_name + ' ' + this.data.data.last_name;
      
    }

    this.status = this.data.view === 'request' ? this.data.data.status : '';   
  }

  initiateReuqestForm(){
    this.requestForm = this.fb.group({
      amount: [null],
      date: [null, Validators.required],
      date_added: [new Date()],
      hours: [null],
      id: [this.data.data.id],
      name: [this.data.data.full_name],
      reason: [null],
      request_for: [null, Validators.required],
      status: ["pending"],
      status_updated: [null],
    });
  }

  generateTime() {
    for (let i = 1; i <= 8; i++) {
      this.hours.push(i)
    }
  }
  getColor(){
    return this.status === 'approved' ? '#3c8348' :  this.status === 'denied' ? '#da6965' : this.status === 'pending' ? 'grey' : 'grey';
  }

  updateRequest(action: any){
      this.att.requestUpdate(action, this.data.data.doc_id, new Date()).then(doc =>{
          this.snack('Status Request Updated', 'X', 'green-snackbar');
          this.dialogRef.close();
      })
      .catch(error =>{
          this.snack('Status Request Failed', 'X', 'red-snackbar');
      })
  }
  
  snack(m: any, a: any, c: any) {
    this.sett.snackbar(m, a, 2000, c);
  }

  submit(){
    if(this.requestForm.valid){
      this.requestForm.get('request_for')?.setValue(this.categoryValue);
      this.att.requestAdd(this.requestForm.getRawValue()).then(doc =>{
          this.snack('Request form was successfully submitted.', 'X', 'green-snackbar');
          this.dialogRef.close();
      })
      .catch(error =>{
          this.snack('Something went wrong.', 'X', 'red-snackbar');      
      })
    } else {
        this.snack('Please complete the forms.', 'X', 'red-snackbar');
    }
  }

}
