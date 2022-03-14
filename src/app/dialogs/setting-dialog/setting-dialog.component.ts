import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AngularFirestore} from '@angular/fire/firestore';
import {MainService} from "../../core/services/main.service";
import {SettingsService} from "../../core/services/settings.service";
import {parse} from "@angular/compiler/src/render3/view/style_parser";
import { InvoiceService } from 'src/app/core/services/invoice.service';

@Component({
  selector: 'app-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.css']
})
export class SettingDialogComponent implements OnInit {
  selected_dialog_title: any = '';
  arrays: any = [];
  positions: any = [];
  clients: any = [];
  data: any = null;
  date: any = null;
  holiday_id: any = null;
  idata: any = '';
  label_input: any = '';

  show_button: boolean = false;
  alert_message: boolean = false;

  milli: any = '';
  seconds: any = '';
  
  invoicedby: any = [];
  clientLists: any = [];
  @ViewChild("arr") arr: ElementRef;
  clientForm: FormGroup;

  
  clientOnEdit: boolean = false;
  selectedClientDocId: any;

  constructor(public dialogRef: MatDialogRef<SettingDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public msg: any,
              private main: MainService,
              private inv: InvoiceService,
              private sett: SettingsService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      clients_name: ['', Validators.required],
      clients_address: [''],
      date_joined: [''],
      incharged: [''],
    });
    this.selected_dialog_title = this.msg.action || '';
    switch (this.msg.id) {
      case 1:
        this.label_input = 'Enter Blood Type';
        this.getCategories('blood-type');
        break;
      case 2:
        this.label_input = 'Enter Position';
        this.getCategories('position');
        break;
      case 3:
        this.label_input = 'Enter Client';
        this.getInvoiceBy();
        this.getClients('clients');
        break;
      case 4:
        this.label_input = 'Enter logout time';
        this.getCategories('time_logged_out');        
        break;        
      case 5:
        this.label_input = 'Enter Holiday';
        this.getAllHolidays();
        break;
      default:
        this.label_input = '';
        break;
    }
  }

  clearData() {
    this.data = '';
    this.date = '';
    this.idata = '';
    this.show_button = false;
    this.alert_message = false;
  }

  bindData(data: any, i: any) {
    this.data = this.msg.id === 5 ? data.holiday_name : data;
    this.date = this.msg.id === 5 ? data.holiday_date : '';
    this.holiday_id = this.msg.id === 5 ? data.id : null;
    this.idata = i;
    this.show_button = true;
  }

  showAlert(data: any, x: any) {
    this.holiday_id = this.msg.id === 5 ? data.id : null;
    this.data = this.msg.id === 5 ? data.holiday_name : data;
    this.idata = x;
    this.alert_message = true;
  }

  saveTime() {
    const data = this.data ? parseFloat(this.data) : 60000;
    this.main.updateCategories( data, 'time_logged_out').then((resolve: any) => {
      this.sett.snackbar('Time logout updated successfully!', 'X', 1000, 'green-snackbar');
      this.clearData();
      this.dialogRef.close();
    }).catch((error: any) => {
      this.sett.snackbar('Time logout update failed!', 'X', 1000, 'red-snackbar');
    })
  }

  getInvoiceBy(){
    this.inv.getInvoicedBy().subscribe((result: any) =>{
      this.invoicedby = result ? result['invoice_by'] : [];
    })
  }

  saveData(x: any) {
    // if(this.clientForm.valid){          
      if(this.msg.id === 5){
        if(this.date && this.data){
          const y = {
            holiday_date: this.date,
            holiday_name: this.data
          }
          if (x === 'add') {
            this.sett.addHoliday(y).then(resolve =>{
              this.sett.snackbar('Holiday successfully added', 'X', 2000, 'green-snackbar');
            }).catch((error: any) => {
              this.sett.snackbar('Adding holiday failed', 'X', 2000, 'red-snackbar');
            })
          } else if (x === 'update') { 
            this.sett.updateHoliday(y, this.holiday_id).then(resolve =>{
              this.sett.snackbar('Holiday successfully updated', 'X', 2000, 'green-snackbar');
            }).catch((error: any) => {
              this.sett.snackbar('Failed to updated.', 'X', 1000, 'red-snackbar')
            })
          } 
        } else if (x === 'delete') { 
          this.sett.removeHoliday(this.holiday_id).then(resolve =>{
            this.sett.snackbar('Holiday successfully removed', 'X', 2000, 'green-snackbar');
          }).catch((error: any) => {
            this.sett.snackbar('Failed to remove.', 'X', 1000, 'red-snackbar')
          })
        } else {
          this.sett.snackbar('Please complete the fields', 'X', 2000, 'red-snackbar');
        }

        if (x === 'delete') { 
          this.sett.removeHoliday(this.holiday_id).then(resolve =>{
            this.sett.snackbar('Holiday successfully removed', 'X', 2000, 'green-snackbar');
            this.clearData();
            this.dialogRef.close();
          }).catch((error: any) => {
            this.sett.snackbar('Failed to remove.', 'X', 1000, 'red-snackbar')
          })
        }
      } else if (this.msg.id === 3){
        if (x === 'add') {
          this.sett.addClientInfo(this.clientForm.getRawValue()).then(resolve =>{
            this.clientForm.reset();
            this.sett.snackbar('Client added.', 'X', 2000, 'green-snackbar');
          }).catch(error =>{
            console.log('Adding client error.')
          });
        } else if(x === 'update'){
          this.clientForm.get('date_joined')?.setValue(new Date(this.clientForm.get('date_joined')?.value));
          this.sett.updateClientInfo(this.selectedClientDocId, this.clientForm.getRawValue()).then(resolve =>{
            this.selectedClientDocId = '';
            this.clientForm.reset();
            this.sett.snackbar('Client added.', 'X', 2000, 'green-snackbar');
          }).catch(error =>{
            console.log('Adding client error.')
          });
        }
      } else {    
        let doc = this.msg.id == 1 ? 'blood-type' : this.msg.id === 2 ? 'positions' : this.msg.id === 3 ? 'clients' : '';
        let key = this.msg.id == 1 ? 'blood-type' : this.msg.id === 2 ? 'position' : this.msg.id === 3 ? 'clients' : '';
        let msg = x === 'add' ? 'Added' : x === 'update' ? 'Updated' : x === 'delete' ? 'Removed' : '';
        const array_now = this.arrays;  

          if (x === 'add') {
            array_now.push(this.data);
          } else if (x === 'update') {
            array_now.splice(this.idata, 1, this.data);
          } else if (x === 'delete') {
            array_now.splice(this.idata, 1);
          }      
          console.log(array_now);
          console.log(key);
          

        this.main.updateCategories(array_now, key).then((resolve: any) => {
          this.sett.snackbar(msg + ' Successfully!', 'X', 1000, 'green-snackbar');
          this.clearData();
        }).catch((error: any) => {
          this.sett.snackbar(msg + ' Failed!', 'X', 1000, 'red-snackbar');
        })
      }
    // } 
}

deleteClient() {  
  this.sett.removeClientInfo(this.selectedClientDocId).then((resolve: any) =>{
    if(resolve === undefined){
      this.alert_message = false;
      this.selectedClientDocId = '';
      this.sett.snackbar('Client deleted.', 'X', 1000, 'green-snackbar');
    }
  }).catch(error =>{
    if(error){      
      this.sett.snackbar('Deleting client failed.', 'X', 1000, 'red-snackbar');
    }
  })
}

toRemoveClient(id: any){  
  this.selectedClientDocId = id.length > 0 ? id : '';
  this.alert_message = this.alert_message ? false : true;
}

toEditClient(data: any){
  this.clientOnEdit = true;
  this.selectedClientDocId = data.id;
  let new_dj;

  if(data.date_joined) {
    const dj = new Date(data.date_joined.toDate());
    const y = dj.getFullYear();
    const m = ('0' + (dj.getMonth()+1)).slice(-2);
    const d = ('0' + (dj.getDate())).slice(-2)
    new_dj = y + '-' + m + '-' + d;
  }
  
  this.clientForm = this.fb.group({
    clients_name: [data.clients_name],
    clients_address: [data.clients_address],
    date_joined: [new_dj],
    incharged: [data.incharged],
  });
}

// **************************** Categories

getCategories(cat: any) {
    this.main.getCategories().subscribe((result: any) => {
      this.arrays = result ? result[cat] : [];
      if(cat !== 'time_logged_out'){
        this.arrays.sort();
      } else {
        this.data = result ? result[cat] : [];
      }
    })
  }

  getClients(cat: any) {
    this.sett.getClientInfo().subscribe((result: any) => {
      if(result) {
        this.clientLists = [];
        result.forEach((e: any) => {
          const data: any = {
            clients_address: e.payload.doc.data().clients_address,
            clients_name: e.payload.doc.data().clients_name,
            date_joined: e.payload.doc.data().date_joined,
            incharged: e.payload.doc.data().incharged,
            priority: e.payload.doc.data().priority,
            id: e.payload.doc.id
          }
          this.clientLists.push(data);
        });
      }
    })
  }

  getAllHolidays() {
    this.sett.getAllHolidays().subscribe((result: any) => {
      this.arrays = [];
      if(result){
        result.forEach((e: any) =>{
          const data = {
            holiday_date: e.payload.doc.data().holiday_date,
            holiday_name: e.payload.doc.data().holiday_name,
            id: e.payload.doc.id
          }
          this.arrays.push(data);
        })
      }      
      // this.data = result ? result.auto_logout : [];
    })
  }

}
