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
import { AttendanceService } from 'src/app/core/services/attendance.service';

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
  overtime: any = [];
  overtime_sentences: any = [];
  hourly_rate: any = 0;
  regular_hours: any = 0;
  rendered_hours: any = 0;
  holiday_hours: any  = 0;

  daily_rate: any  = 0;


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
  total_overtime: any = 0;
  total_hours: any = 0;
  sum_of_hours: any  = 0;

  checked : boolean = true;

  additions: any = [];
  typeOfDeducs: any = [];
  typeOfEarns: any = [];
  typeOf: any = [];
  earnings_amount: any = 0;
  deduction_amount: any = 0;

  selectedInvoiced: any;


  category: any = [
    {cat: 'Regular Days', days: '', hours: '', amount: '' },
    {cat: 'Regular OT', days: '', hours: '', amount: '' },
    {cat: 'Special Holiday', days: '', hours: '', amount: '' },
    {cat: 'Special Hol. OT', days: '', hours: '', amount: '' },
    {cat: 'Absences', days: '', hours: '', amount: '' },
    {cat: 'Undertime', days: '', hours: '', amount: '' },
  ];
  deductions: any = [
    {cat: 'Cash Advance', abb: 'ca', days: '', hours: '', amount: '' },
    {cat: 'SSS Contribution', abb: 'sss', days: '', hours: '', amount: '' },
    {cat: 'Phil Contribution', abb: 'phil', days: '', hours: '', amount: '' },
    {cat: 'Pag-Ibig Contribution', abb: 'pag', days: '', hours: '', amount: '' },
  ];

  // Payroll Variables
  empId: any;
  holidayListed: any = [];
  totalWorkDays: any = 0;

  regularDays: any = 0;
  regularHours: any = 0;
  regularAmount: any = 0;
  regularHol: any = 0;
  regularHolHours: any = 0;
  regularHolAmount: any = 0;
  specialHol: any = 0;
  specialHolHour: any = 0;
  specialHolAmount: any = 0;
  specialHolOT: any = 0;
  specialHolOTHours: any = 0;
  specialHolOTAmount: any = 0;
  OT: any = 0;
  OThours: any = 0;
  OTAmount: any = 0;
  absences: any = 0;
  undertime: any = 0;

  // Deductions
  ca: any = [];
  totalCa: any = 0;
  sss: any = 0;
  phil: any = 0;
  pag: any = 0;

  // Taxes
  taxStatus: any = false;
  salaryTaxStatus: any;
  trackDTR: any;
  taxIncome: any =0;
  tax: any =0;
  taxNet: any =0;

  // Summary
  basicPay: any = 0;
  OTPay: any = 0;
  holPay: any = 0;
  grossPay: any = 0;

  undertimeDeduction: any = 0;
  sssDeduction: any = 0;
  philDeduction: any = 0;
  pagDeduction: any = 0;
  sssTotalDeduction: any = 0;
  philTotalDeduction: any = 0;
  pagTotalDeduction: any = 0;

  totalSSSMonthlyContribution: any  = 0;
  totalPhilMonthlyContribution: any  = 0;
  totalPagMonthlyContribution: any  = 0;

  totalDeductions: any =0;
  netPay: any =0;



  constructor(private inv: InvoiceService,
              private main: MainService,
              private profile: ProfileService,
              private sb: SettingsService,
              private att: AttendanceService,
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
      if(res.length > 0){
        res.forEach((e: any) =>{
            this.holidays.push(e.payload.doc.data());
        })
      }
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

    
    let gross = 0;
    this.total_hours = result3;    
    this.total_earning = this.total_hours * this.hourly_rate;
    gross = this.total_earning.toFixed(2) - this.total_final_deductions.toFixed(2);
    this.total_gross_pay = gross.toFixed(2);
  }

  addUpAdditionals(){
    if(this.other_earnings.length > 0){
      this.other_earnings.forEach((el: any)=>{
        console.log(el.payload.doc.data());
        
      })
    }
  }

  example(){
    this.inv.getManualAttendance('36DE2022', '2023-01-02', '2023-01-13').subscribe((res: any) =>{
      this.generate_results = res ?  res : [];
      this.generate_results.forEach((e: any) => {
          let timeout = e.time_out.toDate();
          let timein = e.time_in.toDate();
          let timein_formatted = moment(timein);
          let timeout_formatted = moment(timeout);
          let dur = moment.duration(timeout_formatted.diff(timein_formatted));
          let hours = dur.asHours();
          let hoursRounded = hours.toFixed(2);

          

        }
      )
    });
  }

  summationUp(id: any){
    // Re sum for per hour render
    return new Promise(resolve => {
      this.generate_results = [];
      this.daily_minutes = [];
      this.total_hours_rendered = [];
      this.hourly_rate = 0;
      this.daily_rate = 0;
      this.generated_salary = [];
      this.total_benefits_deductions = [];
      this.generated_salary_with_deduction = [];
      this.holiday_hours = [];
      this.total_earning = [];
      this.total_final_deductions = 0;
      this.total_gross_pay = [];

      const start = this.invoiceForm.get('start_date')?.value ? this.invoiceForm.get('start_date')?.value : null;
      const end = this.invoiceForm.get('end_date')?.value ? this.invoiceForm.get('end_date')?.value : null;
        let sum = 0;
        this.inv.getManualAttendance(id, start, end).subscribe((res: any) =>{
        this.generate_results = res ?  res : [];
        this.generate_results.forEach((e: any, i: any) => {

          // Get Rates
          let halfpay = this.info.basic_pay / 2;
          let daily_rate = halfpay / 11;
          let hourly_rate = daily_rate / 8;
          this.daily_rate = daily_rate.toFixed(2);
          this.hourly_rate = hourly_rate.toFixed(2);

          // Get Hours Rendered    
          let default_out = new Date(e.date.toDate()).setHours(17, 0, 0);
          let timeout = e.time_out.length > 0 ? e.time_out.toDate() : default_out;
          
          let timein = e.time_in.toDate();
          let timein_formatted = moment(timein);
          let timeout_formatted = moment(timeout);

          let dur = moment.duration(timeout_formatted.diff(timein_formatted));
          let hours = parseFloat(dur.asHours().toFixed(2));
          
          if(dur.asHours() > 8){
            hours = 8;
          }

          console.log(hours, e.date.toDate());
          sum += hours;
          
          // if(hours > 8){
          //   overtime += hours - 8
          //   let overtime_format =  overtime.toString().split('.');

          //   //Formula in Hours
          //   ot_hour = overtime_format[0];

          //   //Formula in Minutes
          //   ot_min = this.getFirstNDigits(overtime_format[1]);
          //   ot_min_formatted = parseFloat('0.' + ot_min) * 60;

          //   // this.overtime_sentences = ot_hour + ` hour/s and ` + ot_min_formatted + ' minutes'; 
          //   // this.overtime.push(overtime);
          // }   
          
          this.rendered_hours = sum.toFixed(2);       

          // Convert to minutes before adding and subtracting...
          let x = e.time_in.toDate();
          
          var c = moment(x).add(8, 'hour');
          
          const a = e.time_out.length !== 0 ? moment(e.time_out.toDate()) : c;
          const b = moment(e.time_in.toDate());
          const duration = moment.duration(a.diff(b));
          const minutes = parseFloat(duration.asMinutes().toFixed(2));
          this.daily_minutes.push(minutes);
        })
        let total_hours = parseFloat(this.rendered_hours) + parseFloat(this.total_overtime);
        resolve(total_hours);


        const summation_of_minutes = this.daily_minutes.reduce((d: any, c: any) => d + c, 0);
        const total_hours_rendered = Math.floor( summation_of_minutes/60 ) + summation_of_minutes % 60 / 100;

        this.total_hours_rendered = total_hours_rendered.toFixed(2);

        let hourly = this.info.daily_rate / 8;
        this.hourly_rate = hourly.toFixed(2);

        this.total_benefits_deductions = parseFloat(this.deduction.sss) + parseFloat(this.deduction.pagibig) + parseFloat(this.deduction.philhealth) + parseFloat(this.deduction.tax);
        this.generated_salary_with_deduction = this.generated_salary - this.total_deductions;
        this.holiday_hours = this.holiday_list.length * 8;
        this.sum_of_hours = this.holiday_hours + this.regular_hours;
            if(this.checked){
              this.total_final_deductions = parseFloat(this.total_benefits_deductions.toFixed(2)) + parseFloat(this.deduction_amount.toFixed(2));
            } else {
              this.total_final_deductions = parseFloat(this.deduction_amount.toFixed(2));
            }
        })
        
    });
  }

  getApprovedOvertimeRequestsById(id: any){
    let arr: any =[];
    let start = new Date(this.invoiceForm.get('start_date')?.value);
    let end = new Date(this.invoiceForm.get('end_date')?.value);

    if(this.invoiceForm.get('start_date')?.value && this.invoiceForm.get('end_date')?.value) {
        this.att.getApprovedOvertimeRequestsById(start, end, id).subscribe((result: any) =>{
          let sum: any = [];
            if(result.length > 0){
                result.forEach((el: any) =>{
                  let a =+ parseFloat(el.payload.doc.data().hours); 
                  arr.push(a);
                })                
            }  
              
          this.total_overtime = arr?.reduce((a: number, b: number) => a + b, 0);
        })   
    }
  }

  getFirstNDigits(number: any) {
    return Number(String(number).slice(0, 2));
  }
  

  getSelectedMembersInfo(id: any){
    return new Promise(resolve => {
      this.getBetweenDays();
      this.getApprovedOvertimeRequestsById(id);
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
      this.regularDays = this.betweenDates.length || 0;
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

  // Payroll Revisions

  
  selectedEmployee(x: any){
    // this.invoiceForm.get('email_add')?.setValue(x.email_add);
    // this.invoiceForm.get('position')?.setValue(x.position);
    // this.empId = x.id;
  }
  
  async getPayroll(){
    this.empId = '36DE2022';
    this.invoiceForm.get('start_date')?.setValue('2023-01-16');
    this.invoiceForm.get('end_date')?.setValue('2023-02-01');
    this.invoiceForm.get('invoice_no')?.setValue('0005');
    // const id = <any>await this.formsCheck();
    const result1 = <any>await this.getEmployeeInfo(this.empId);
    
    const result2 = <any>await this.generateGatherInformation(this.empId);
    // const result3 = <any>await this.summationUp(result2);
  }

  formsCheck(){
    return new Promise(resolve => {
       if(this.invoiceForm.get('invoice_no')?.value) {
            if(this.invoiceForm.get('start_date')?.value && this.invoiceForm.get('end_date')?.value) {
                  if(this.myControl.value){
                      resolve(this.empId);
                  } else {
                      this.sb.snackbar('Please select a employee.', 'X', '2000', 'red-snackbar');
                      resolve(null);
                  }
            } else {
              this.sb.snackbar('Please select a from and to date.', 'X', '2000', 'red-snackbar');
              resolve(null);
            }
      } else {
        this.sb.snackbar('Enter a invoice number.', 'X', '2000', 'red-snackbar');
        resolve(null);
      }
    });
  }

  
  getEmployeeInfo(id: any){
    return new Promise(resolve => {
      this.getWorkDays();
      this.getApprovedOTById(id);
      this.getApprovedCARequests(id);
      this.getInvoices(id);
      this.getDeductions(id);
      this.getInvoiceInfo(id);
      this.getInvoicesOtherDeduction(id);
      this.getOtherDeductions(id);
      // this.getOtherEarnings(id);
      resolve(id);
    });
  }

  
  getWorkDays(){
    this.betweenDates = [];
    const startDate = new Date(this.invoiceForm.get('start_date')?.value)
    const endDate = new Date(this.invoiceForm.get('end_date')?.value);

    const yearStart = startDate.getFullYear();
    const monthStart = startDate.getMonth() + 1;

    let a = startDate.getDate() -1;
    let b = a === 1 ? 15 : 31;

    let regulardays : any  = [];
    while (a < b) {
      a++;
      const m = moment(yearStart  + '-' + monthStart + '-' + a).day();
      if(m !==6 && m !== 0){
        const c = yearStart  + '-' +  ('0' + (monthStart)).slice(-2) + '-' + a;
        this.betweenDates.push(yearStart  + '-' + monthStart + '-' + a)
        this.holidays.forEach((e: any) => {
          if(e.holiday_date !== c){
            regulardays.push(c);
          } else {
            this.holidayListed.push(c);
          }
        })
      this.totalWorkDays = this.betweenDates.length;
      }      
    
    }
    // let unique = [...new Set(regulardays)];
  }  

  getApprovedOTById(id: any){
    let arr: any =[];
    let start = new Date(this.invoiceForm.get('start_date')?.value);
    let end = new Date(this.invoiceForm.get('end_date')?.value);
    if(this.invoiceForm.get('start_date')?.value && this.invoiceForm.get('end_date')?.value) {
        this.att.getApprovedOvertimeRequestsById(start, end, id).subscribe((result: any) =>{
            if(result.length > 0){
                result.forEach((el: any) =>{
                  let hours =+ parseFloat(el.payload.doc.data().hours); 
                  arr.push(hours);
                })     
              this.OT = result.length;           
              this.OThours = arr?.reduce((a: number, b: number) => a + b, 0);
            }                
        })   
    }
  }
  
  generateGatherInformation(id: any){
      return new Promise(resolve => {
        const start = this.invoiceForm.get('start_date')?.value ? this.invoiceForm.get('start_date')?.value : null;
        const end = this.invoiceForm.get('end_date')?.value ? this.invoiceForm.get('end_date')?.value : null;
          let sum = 0;
          let sumUndertime = 0;
          this.inv.getManualAttendance(id, start, end).subscribe((res: any) =>{
          this.generate_results = res ?  res : [];    
          this.regularDays = this.generate_results.length || 0;   
          this.absences = this.totalWorkDays - this.regularDays;

              this.generate_results.forEach((e: any, i: any) => {
                  // Get Rates
                  let halfpay = this.info.basic_pay / 2;
                  let daily_rate = halfpay / 11;
                  let hourly_rate = daily_rate / 8;

                  this.daily_rate = daily_rate.toFixed(2);
                  this.hourly_rate = hourly_rate.toFixed(2);

                  // Get Hours Rendered    
                  let default_out = new Date(e.date.toDate()).setHours(17, 0, 0);
                  let timeout = e.time_out.length > 0 ? e.time_out.toDate() : default_out;
                  
                  let timein = e.time_in.toDate();
                  let timein_formatted = moment(timein);
                  let timeout_formatted = moment(timeout);

                  let dur = moment.duration(timeout_formatted.diff(timein_formatted));
                  let hours = parseFloat(dur.asHours().toFixed(2));

                  //Cap Until 8 hours
                  if(dur.asHours() >= 7.50){
                    hours = 8;
                  }
                  sum += hours;
                  this.regularHours = sum.toFixed(2); 
                  this.regularAmount = parseFloat(this.regularHours) * parseFloat(this.hourly_rate);

                  //Undertime
                  
                  let default_undertime = new Date(e.date.toDate()).setHours(8, 30, 0);
                  let undDur = moment.duration(timein_formatted.diff(default_undertime));
                  let undHour = parseFloat(undDur.asHours().toFixed(2));
                  
                  if(undHour < 8.50){
                    sumUndertime += undHour;
                    this.undertime = sumUndertime.toFixed(2);
                  }
                  let undertimeDeduction = parseFloat(this.undertime) * parseFloat(this.hourly_rate);
                  this.undertimeDeduction = undertimeDeduction.toFixed(2);
                  //Overtime
                  this.OTAmount = parseFloat(this.OThours) * parseFloat(this.hourly_rate);
                  
                  //Special Holiday (Special Holiday Pay = (Hourly rate × 130% × 8 hours))
                  this.checkHolidayDate(
                    moment(e.date.toDate()).format('YYYY-MM-DD'),
                    this.holidayListed,
                    e);
                  
                  let specialHolAmount = (this.hourly_rate * 1.3 * 8) - parseFloat(this.daily_rate);
                  this.specialHolAmount = specialHolAmount.toFixed(2);
              });
          this.calculateSSSMonthly(this.info.basic_pay);

          let basicPay = parseFloat(this.regularAmount);
          this.basicPay = basicPay.toFixed(2)
          this.OTPay = this.OTAmount + this.specialHolOTAmount;
          this.holPay = this.specialHolAmount + this.regularHolAmount;

          this.totalDeductions = 
          parseFloat(this.sssDeduction) + 
          parseFloat(this.pagDeduction) + 
          parseFloat(this.philDeduction) + 
          parseFloat(this.undertimeDeduction) + 
          parseFloat(this.totalCa) + 
          parseFloat(this.deduction.tax);

          this.grossPay = parseFloat(this.basicPay) + parseFloat(this.OTPay) + parseFloat(this.holPay);

          this.taxIncome= this.grossPay - this.totalDeductions;
          this.tax = this.deduction.tax || 0;
          this.taxNet= this.taxIncome - this.tax;
          this.netPay = parseFloat(this.grossPay) - parseFloat(this.totalDeductions);
        });

      
      });
  }

  checkHolidayDate(attendance: any, holiday: any, array: any){
    if(holiday.length > 0){
      holiday.forEach((el: any) => {
        if(el === attendance){
          let timeout_formatted = moment(array.time_out.toDate());
          let timein_formatted = moment(array.time_in.toDate());
          let dur = moment.duration(timeout_formatted.diff(timein_formatted));
          let hours = parseFloat(dur.asHours().toFixed(2));

          //Cap Until 8 hours
          if(dur.asHours() >= 7.50){
            hours = 8;
          }
          this.specialHolHour += hours;          
        }
      });
    }
  }


  calculateSSSMonthly(monthly: any){
    let employers = 0;
    let employees = 0;
    // SSSS (50%/50%)
    this.sssDeduction = monthly.toFixed(2)  * 0.045;
    employers = monthly.toFixed(2)  * 0.085;
    employers = employers+ 30;
    this.totalSSSMonthlyContribution = employees + employers;
    // Philhealth (50%/50%)
    this.totalPhilMonthlyContribution = monthly.toFixed(2) * 0.035;
    this.philDeduction = this.totalPhilMonthlyContribution.toFixed(2) / 2;
    // Pagibig
    this.totalPagMonthlyContribution = 200;
    this.pagDeduction = this.totalPagMonthlyContribution / 2;
  }

  getApprovedCARequests(id: any){
    let start = new Date(this.invoiceForm.get('start_date')?.value);
    let end = new Date(this.invoiceForm.get('end_date')?.value);
    this.att.getApproveCARequestsById(start, end, id).subscribe((res: any) =>{
       this.ca = res.length >  0 ? res: [];
       this.totalCa = 0;
       if(this.ca.length > 0){
          this.ca.forEach((el: any) =>{
              this.totalCa += parseFloat(el.payload.doc.data().amount)
          });  
       }       
    })
  }


}
