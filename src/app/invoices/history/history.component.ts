import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { MainService } from 'src/app/core/services/main.service';
import { ProfileService } from 'src/app/core/services/profile.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  latestInvoice: any = [];
  viewDataPass: any = [];
  viewDataId: any = [];
  deducs: any  =[];
  profile: any  =[];
  total_earning: any = 0;
  total_final_deductions: any  = 0;
  total_gross_pay: any  = 0;  
  companyInfo: any;
  yearSelection: any = [];
  viewSelectedHistory: boolean = false;
  selectedSearch: any;
  monthSelected: any;
  yearSelected: any;
  pagLength: any;
  pagSize: any = 10;
  lastListInvoiced: any;

  progressbarValue = 0;
  currentSecond: number = 0;

  emptyData: any;
  

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
  constructor(
    private inv: InvoiceService,
    private main: MainService,
    private prof: ProfileService) { }

  ngOnInit(): void {      
    this.getAllInvoice();
    this.getCompanyInfo();
    this.generateYearSelection();    
    this.startTimer();
  }

  startTimer() {
    const time = 5;
    const timer$ = interval(300);
    const sub = timer$.subscribe((sec) => {
      this.progressbarValue = 0 + sec * 100 / time;
      this.currentSecond = sec;
      if (this.currentSecond === time) {
        sub.unsubscribe();
      }
    });
  }

  selection(){    
    if(this.selectedSearch === 'month'){
      this.yearSelected = '';
      if(this.monthSelected){
        const a = new Date(this.monthSelected).getMonth() + 1;
        this.getAllLatestInvoicesByCategory(a, 'month_issued');    
      } 
    } else {
      this.monthSelected = '';   
      if(this.yearSelected){
        this.getAllLatestInvoicesByCategory(this.yearSelected, 'year_issued');    
      }
    }   
  }

  handlePageEvent(e: any) {
    console.log(e);
    
    this.startTimer(); 
    this.pagSize = e.pageSize;
    if(e.previousPageIndex > e.pageIndex) {     
      this.inv.prevAllLatestInvoicesForHistory(this.pagSize, this.lastListInvoiced).subscribe((res: any) =>{
        if(res){
          this.latestInvoice = res ? res : [];
          this.lastListInvoiced = this.latestInvoice[res.length - 1].payload.doc.data().date_issued ? this.latestInvoice[res.length - 1].payload.doc.data().date_issued.toDate() : '';   
        }
      })  
    } else if(e.previousPageIndex < e.pageIndex) {
      this.inv.nextAllLatestInvoicesForHistory(this.pagSize, this.lastListInvoiced).subscribe((res: any) =>{
        if(res){
          this.latestInvoice = res ? res : [];
          this.lastListInvoiced = this.latestInvoice[res.length - 1].payload.doc.data().date_issued ? this.latestInvoice[res.length - 1].payload.doc.data().date_issued.toDate() : '';   
        }
      })
    } else {
      this.getAllInvoice();      
    }
  }

  reset(){
    this.selectedSearch = '';
    this.monthSelected = '';
    this.yearSelected = '';
    this.getAllInvoice();
  }
  
  generateYearSelection(){
    const that = this;
    let currentYear = new Date().getFullYear(), years = [];
    let start = 1980;
    let ascYear = [];
    while ( start <= currentYear ) {
      ascYear.push(start++);        
    }   
    ascYear.slice().reverse().forEach(function(x: any) {
      that.yearSelection.push(x)
    });    
  }
  
  getCompanyInfo(){
    this.main.getCompanyInformation().subscribe((result: any) =>{
      this.companyInfo = result ? result : [];
    })
  }


  getUserProfile(id: any){
    this.prof.getUserProfile(id).subscribe((result: any) =>{
      this.profile = result ? result : [];
    })
  }

  getAllInvoice(){    
    this.inv.getAllLatestInvoicesTotal().subscribe((result: any) =>{
      this.pagLength = result ? result.docs.length : 0;
      if(result.docs.length > 0){       
        this.inv.getAllLatestInvoicesForHistory(this.pagSize, new Date()).subscribe((result: any) =>{
          this.latestInvoice = result ? result : [];
          this.lastListInvoiced = this.latestInvoice[result.length - 1].payload.doc.data().date_issued ? this.latestInvoice[result.length - 1].payload.doc.data().date_issued.toDate() : '';          
        })      
      }
    })
  }

  
  getAllLatestInvoicesByCategory(data: any, issued: any){
    this.inv.getAllLatestInvoicesByCategoryTotal(data, issued).subscribe((result: any) =>{
      this.pagLength = result ? result.docs.length : 0;
      if(result.docs.length > 0){
        this.inv.getAllLatestInvoicesByCategory(data, issued).subscribe((result: any) =>{
          this.latestInvoice = result ? result : [];
        })
      }
    })    
  }

   getDeductions(id: any){
    this.inv.getInvoicesOfDeduction(id).subscribe((res: any) =>{
      this.deducs = res ? res : [];
      this.total_final_deductions = parseFloat(this.deducs.sss) + parseFloat(this.deducs.philhealth) + parseFloat(this.deducs.pagibig) + parseFloat(this.deducs.tax);
    })
  }

  viewHistory(data: any){
    this.viewSelectedHistory = true;
    this.getDeductions(data.payload.doc.data().members_id);
    this.getUserProfile(data.payload.doc.data().members_id);
    this.viewDataPass = data.payload.doc.data();
    console.log(this.viewDataPass);
    
    this.viewDataId = data.payload.doc.id;   

    const regular = this.viewDataPass.regularhours || 0;
    const holiday = this.viewDataPass.holiday || 0;
    const total_rendered = parseFloat(regular) + parseFloat(holiday);    

    let total_earning = total_rendered * this.viewDataPass.hourlyrate;
    this.total_earning = total_earning.toFixed(2);
    this.total_gross_pay = this.total_earning - this.total_final_deductions;
  }

  back(){
    this.viewSelectedHistory = false;
  }

}
