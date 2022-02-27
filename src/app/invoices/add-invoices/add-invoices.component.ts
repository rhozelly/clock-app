import { Component, OnInit, OnDestroy } from '@angular/core';
import {FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import { renderMicroColGroup } from '@fullcalendar/angular';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { MainService } from 'src/app/core/services/main.service';
import * as myGlobals from '../../../../globals';
import * as moment from 'moment';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ProfileService } from 'src/app/core/services/profile.service';

@Component({
  selector: 'app-add-invoices',
  templateUrl: './add-invoices.component.html',
  styleUrls: ['./add-invoices.component.css']
})
export class AddInvoicesComponent implements OnInit, OnDestroy  {
  dateNow = new Date();
  myControl = new FormControl();
  options: any = [];
  filteredOptions: Observable<any[]>;
  myID: any;

  invoices: any = [];
  invoicedby: any = [];
  info: any = [];
  deduction: any = [];
  other_deduction: any = [];
  other_deductions: any = [];
  other_earnings: any = [];

  attendances: any = [];

  hourlyRate: any;
  dailyRate: any = [];
  totalRate: any;

  members: any = [];
  member_names: any = [];
  selected_members_id: any = [];

  invoiceForm: FormGroup;
  additionalForm: FormGroup;

  generate_results: any = [];
  daily_hours: any = [];
  daily_minutes: any = [];
  hourly_rate: any = 0;
  regular_hours: any = 0;
  holiday_hours: any  = 0;

  generated_salary: any = 0;
  generated_salary_with_deduction: any = 0;
  total_hours_rendered: any = 0;
  total_deductions: any = 0;


  latestInvoiceId: any;
  companyInfo: any;

  holidays: any = [];
  holiday_list: any = [];
  betweenDates: any =[];
  total_earning: any = 0;
  total_benefits_deductions: any = 0;
  total_other_deductions: any = 0;
  total_final_deductions: any = 0;
  total_gross_pay: any = 0;
  sum_of_hours: any  = 0;

  checked : boolean = true;

  additions: any = [];
  typeOfDeducs: any = [];
  typeOfEarns: any = [];
  typeOf: any = [];
  earnings_amount: any = 0;
  deduction_amount: any = 0;

  selectedInvoiced: any;


  constructor(private inv: InvoiceService,
              private main: MainService,
              private profile: ProfileService,
              private sb: SettingsService,
              private fb: FormBuilder) {}

  private _filter(value: any) {
    const filterValue = value.toString().toLowerCase();
    return this.members.filter((member_names: any) => member_names.name.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    this.initiateForms();
    this.getCompanyInfo();
    this.getMembers();
    this.getLastestInvoice();
    this.getHolidays();
    this.getInvoicedBy();

    this.additionalForm.get('additions')?.valueChanges.subscribe(value => {
      if (value === '0') {
        this.getInvoicesOtherDeductions('type_of_deduction');
      } else  if(value === '1'){
        this.getInvoicesOtherDeductions('type_of_earnings');
      } else {
        this.typeOf = [];
      }
    })
    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.main.decrypt(collection_id, 'collection-id');

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((mem: any | null) =>
      mem ? this._filter(mem) : this.members.slice()),
    );
  }

  onChange(){
    
    this.total_earning = this.sum_of_hours * this.hourly_rate;
    if(this.checked){
      this.total_final_deductions = parseFloat(this.total_benefits_deductions.toFixed(2)) + parseFloat(this.deduction_amount.toFixed(2));
    } else {
      this.total_final_deductions = parseFloat(this.deduction_amount.toFixed(2));
    }
    
    this.total_gross_pay = this.total_earning - this.total_final_deductions;
  }

  getInvoicedBy(){
    this.inv.getInvoicedBy().subscribe((result: any) =>{
      this.invoicedby = result ? result.invoice_by : [];
    })
  }

  addAdditions(){
    const additionsData = {
      type: this.additionalForm.get('types')?.value,
      status: false,
      date: new Date(),
      amount: this.additionalForm.get('amount')?.value,
    }

    if(this.selected_members_id.length > 0){
      const others = this.additionalForm.get('additions')?.value === '0' ? 'other_deductions' : 'other_earnings';
      if(this.additionalForm.valid){
        this.inv.addOthers(this.selected_members_id, others, additionsData).then(resolve =>{
          if(resolve) {
            this.sb.snackbar('Successfully added', 'X', 2000, 'green-snackbar');
            this.additionalForm.reset();
          } else {
            this.sb.snackbar('Adding additional failed', 'X', 2000, 'red-snackbar');
          }
        });
      } else {
        this.sb.snackbar('Please complete the fields.', 'X', 2000, 'red-snackbar');
      }
    } else {
      this.sb.snackbar('Please select a member.', 'X', 2000, 'red-snackbar');
    }
  }

  ngOnDestroy(): void{
  }

  initiateForms(){
    this.invoiceForm = this.fb.group({
      invoice_no: [null],
      invoice_by: [null],
      start_date: [null],
      end_date: [null],
      email_add: [null],
      member: [null],
      position: [null],
    });
    this.additionalForm = this.fb.group({
      additions: new FormControl(),
      types: [null, Validators.required],
      amount: [null,  Validators.required],
    });
  }

  getInvoicesOtherDeductions(data: any){
    this.main.getCategories().subscribe((result: any) =>{
      this.typeOf = result ? result[data] : [];
    })
  }


  getInvoices(id: any){
    this.inv.getInvoices(id).subscribe((res: any) =>{
      this.invoices = res ? res : [];
    })
  }

  getDeductions(id: any){
    this.inv.getInvoicesOfDeduction(id).subscribe((res: any) =>{
      this.deduction = res ? res : [];
    })
  }

  getInvoicesOtherDeduction(id: any){
    this.inv.getInvoicesOtherDeduction(id).subscribe((res: any) =>{
      this.other_deduction = res ? res : [];
    })
  }


  getOtherDeductions(id: any){
    this.deduction_amount = 0;
    this.inv.getOtherDeductions(id).subscribe((res: any) =>{
      this.other_deductions = res ? res : [];
      this.other_deductions.forEach((val: any) =>{
        this.deduction_amount += parseFloat(val.payload.doc.data().amount);
      })
    })
  }

  removePerm(id: any, value: any){
    const val = value === 0 ? 'other_deductions' : 'other_earnings';
    this.inv.removePermanently(this.selected_members_id, val, id).then((resolve: any) =>{
      if(resolve === undefined){
        this.sb.snackbar('Was removed successfully', 'X', 2000, 'green-snackbar');
      } else {
        this.sb.snackbar('Failed.', 'X', 2000, 'red-snackbar');
      }
    }).catch(error =>{
      console.log(error);
    });
  }


  getOtherEarnings(id: any){
    this.earnings_amount = 0;
    this.inv.getOtherEarnings(id).subscribe((res: any) =>{
      this.other_earnings = res ? res : [];
      this.other_earnings.forEach((val: any) =>{
        this.earnings_amount += parseFloat(val.payload.doc.data().amount);
      })
    })
  }

  getHolidays(){
    this.sb.getAllHolidays().subscribe((res: any) =>{
      this.holidays = [];
      res.forEach((e: any) =>{
        this.holidays.push(e.payload.doc.data());
      })
    })
  }

  getInvoiceInfo(id: any){
    this.inv.getInvoicesOfInfo(id).subscribe((res: any) =>{
      this.info = res ? res : [];
    })
  }

  getLastestInvoice(){
    this.inv.getAllLatestInvoices().subscribe((res: any) =>{
      if(res.length > 0){
        const latest_invoice_no = res ? res[0].payload.doc.id : 0;        
        let convert_number = parseInt(latest_invoice_no) + 1;
        let invoice_number = ("00000" + convert_number).slice(-5);
        this.latestInvoiceId = invoice_number;
        this.invoiceForm.get('invoice_no')?.setValue(invoice_number);
      } else {
        this.latestInvoiceId = '00001';
        this.invoiceForm.get('invoice_no')?.setValue(this.latestInvoiceId);
      }
    })
  }

  getMembers(){
    this.profile.getAllProfiles().subscribe((res: any) =>{
      this.members = [];
      if(res){
        res.forEach((e: any) =>{
          const data = {
            name: e.payload.doc.data().first_name + ' ' + e.payload.doc.data().last_name,
            id: e.payload.doc.id,
            email_add: e.payload.doc.data().email_add,
            position: e.payload.doc.data().position
          }
          this.members.push(data);
        })
      } else {
        this.members = [];
      }
    })
  }

  async generate(){

    const result1 = <any>await this.checkForms();
    const result2 = <any>await this.getSelectedMembersInfo(result1);
    const result3 = <any>await this.summationUp(result2);

  }

  summationUp(id: any){
    return new Promise(resolve => {
      this.generate_results = [];
      let gross = 0;
      this.daily_minutes = [];
      this.total_hours_rendered = [];
      this.hourly_rate = 0;
      this.generated_salary = [];
      this.total_benefits_deductions = [];
      this.generated_salary_with_deduction = [];
      this.holiday_hours = [];
      this.total_earning = [];
      this.total_final_deductions = 0;
      this.total_gross_pay = [];

      const start = this.invoiceForm.get('start_date')?.value ? this.invoiceForm.get('start_date')?.value : null;
      const end = this.invoiceForm.get('end_date')?.value ? this.invoiceForm.get('end_date')?.value : null;
      this.inv.getManualAttendance(id, start, end).subscribe((res: any) =>{
        this.generate_results = res ?  res : [];
        this.generate_results.forEach((e: any) => {
          // Convert to minutes before adding and subtracting...
          const a = moment(e.time_out.toDate());
          const b = moment(e.time_in.toDate());
          const duration = moment.duration(a.diff(b));
          const minutes = parseFloat(duration.asMinutes().toFixed(2));
          this.daily_minutes.push(minutes);
        })
        const summation_of_minutes = this.daily_minutes.reduce((d: any, c: any) => d + c, 0);
        const total_hours_rendered = Math.floor( summation_of_minutes/60 ) + summation_of_minutes % 60 / 100;

        this.total_hours_rendered = total_hours_rendered.toFixed(2);

        let hourly = this.info.daily_rate / 8;
        this.hourly_rate = hourly.toFixed(2);

        this.generated_salary = (this.info.daily_rate / 8 )* this.total_hours_rendered;

        this.total_benefits_deductions = parseFloat(this.deduction.sss) + parseFloat(this.deduction.pagibig) + parseFloat(this.deduction.philhealth) + parseFloat(this.deduction.tax);
        this.generated_salary_with_deduction = this.generated_salary - this.total_deductions;
        this.holiday_hours = this.holiday_list.length * 8;
        this.sum_of_hours = this.holiday_hours + this.regular_hours;
        this.total_earning = (this.sum_of_hours * this.hourly_rate) + this.earnings_amount;
        
        if(this.checked){
          this.total_final_deductions = parseFloat(this.total_benefits_deductions.toFixed(2)) + parseFloat(this.deduction_amount.toFixed(2));
        } else {
          this.total_final_deductions = parseFloat(this.deduction_amount.toFixed(2));
        }
        gross = this.total_earning.toFixed(2) - this.total_final_deductions.toFixed(2);
        this.total_gross_pay = gross.toFixed(2);
      })
    });
  }

  getSelectedMembersInfo(id: any){
    return new Promise(resolve => {
      this.getBetweenDays();
      this.getInvoices(id);
      this.getDeductions(id);
      this.getInvoiceInfo(id);
      this.getInvoicesOtherDeduction(id);
      this.getOtherDeductions(id);
      this.getOtherEarnings(id);
      resolve(id);
    });
  }

  checkForms(){
    return new Promise(resolve => {
       if(this.invoiceForm.get('invoice_no')?.value) {
         if(this.invoiceForm.get('start_date')?.value && this.invoiceForm.get('end_date')?.value) {
             if(this.myControl.value){
               resolve(this.selected_members_id);
           } else {
             this.sb.snackbar('Please select a member.', 'X', '2000', 'red-snackbar');
           }
         } else {
           this.sb.snackbar('Please select a start and end date.', 'X', '2000', 'red-snackbar');
         }
       } else {
         this.sb.snackbar('Enter a invoice number.', 'X', '2000', 'red-snackbar');
       }
    });

  }

  selectedMember(x: any){
    this.invoiceForm.get('email_add')?.setValue(x.email_add);
    this.invoiceForm.get('position')?.setValue(x.position);
    this.selected_members_id = x.id;
  }


  getCompanyInfo(){
    this.main.getCompanyInformation().subscribe((result: any) =>{
      this.companyInfo = result ? result : [];
    })
  }

  getBetweenDays(){
    this.holiday_list = [];
    this.betweenDates = [];
    const startDate = new Date(this.invoiceForm.get('start_date')?.value)
    const endDate = new Date(this.invoiceForm.get('end_date')?.value);

    const yearStart = startDate.getFullYear();
    const monthStart = startDate.getMonth() + 1;

    let a = startDate.getDate() -1;
    let b = endDate.getDate();

    let regulardays : any  = [];
    while (a < b) {
      a++;
      const m = moment(yearStart  + '-' + monthStart + '-' + a).day();
      if(m !==6 && m !== 0){
        const c = yearStart  + '-' + monthStart + '-' + a;
        this.betweenDates.push(yearStart  + '-' + monthStart + '-' + a)
        this.holidays.forEach((e: any) => {
          if(e.holiday_date !== c){
            regulardays.push(c);
          } else {
            this.holiday_list.push(c);
          }
        })
      }
    }
    this.regular_hours = this.betweenDates.length * 8;

    let unique = [...new Set(regulardays)];
    // Regular Days
  }

  submitToInvoice() {
    const data = {
      members_id: this.selected_members_id,
      paydate:  new Date(this.invoiceForm.get('end_date')?.value),
      payroll: 'SEMI-MONTHLY',
      regularhours: this.regular_hours,
      hourlyrate: this.hourly_rate,
      monthlyrate: this.info.basic_pay,
      period_startdate: new Date(this.invoiceForm.get('start_date')?.value),
      period_enddate: new Date(this.invoiceForm.get('end_date')?.value),
      holiday: this.holiday_hours,
      invoiceby: this.selectedInvoiced,
      additional_earnings: this.other_earnings,
      additional_deduction: this.other_deductions,
      total_earnings: this.total_earning,
      total_deductions: this.total_final_deductions,
      gross_pay: this.total_gross_pay,
      date_issued: new Date(),
      month_issued: new Date(this.invoiceForm.get('end_date')?.value).getMonth(),
      year_issued: new Date(this.invoiceForm.get('end_date')?.value).getFullYear()
    }    
    this.inv.addInvoice(this.invoiceForm.get('invoice_no')?.value, data).then((resolve: any) => {
      if(resolve === undefined){
        this.sb.snackbar('Invoice was successfully added!', 'X', 2500, 'green-snackbar');
      } else {
        this.sb.snackbar('Failed', 'X', 2500, 'red-snackbar');
      }
    })
  }



}
