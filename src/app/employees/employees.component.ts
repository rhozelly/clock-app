import {Component, OnInit, ViewChild} from '@angular/core';
import {AddEmployeeDialogComponent} from "./add-employee-dialog/add-employee-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProfileService} from "../core/services/profile.service";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";
import {MainService} from "../core/services/main.service";


import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertMessageComponent } from '../alert-message/alert-message.component';
import { SettingsService } from '../core/services/settings.service';
import { AttendanceDialogComponent } from '../dialogs/attendance-dialog/attendance-dialog.component';
import { RequestDialogComponent } from '../dialogs/request-dialog/request-dialog.component';


@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: any;

  user: any;
  role_dec_logged: any;
  
  displayedColumns = [
    'avatar',
    'id',
    'full_name',
    'email_add',
    'action',
  ];
  displayButton: boolean = true;
  employees: any = [];
  employees_sub_array: any = [];
  searchfield: any = [];
  isOnline: boolean = false;
  defaultProfileImage: string = 'assets/app-images/sample-avatar.jpg'
  addEmployeeText: any = 'Add Emnployee';
  searchEmployeeField: any = 'space-between center"';

  myID: any;
  active: any = '';
  
  length: any;
  pageIndex: any;
  pageSize: any;
  previousPageIndex: any;

  prev_strt_at: any =[];
  prev_strt_at_sec: any =[];
  next_strt_at: any =[];
  next_strt_at_sec: any =[];
  
  employeeArray: any = [];
  employeeArrayCount: any = 0;
  employeeArr: any = [];
  employeePrevArr: any = [];
  
  constructor(
    private dialog: MatDialog,
    private profileService: ProfileService,
    private main: MainService,
    public breakpointObserver: BreakpointObserver,
    private router: Router,
    private sett: SettingsService,
    private snackBar: MatSnackBar,)
  {
      this.dataSource = [];
  }

  ngOnInit(): void {
    const collection_id = localStorage.getItem('collection-id');
    this.myID = this.main.decrypt(collection_id, 'collection-id');
    
    this.user = localStorage.getItem('user') ? new Object(localStorage.getItem('user')).toString() : '';    
    let role = this.user.length > 0 ? JSON.parse(this.user).re : '';
    let role_dec = this.main.decrypt(role ? role : '', 'r0l3_3nc');
    this.role_dec_logged = role_dec.toLowerCase();
    this.getEmployees();
    this.breakpointObserver.observe(['(max-width: 768px)'])
      .subscribe((state: BreakpointState) => {
        this.addEmployeeText = state.matches ? '' : 'Add Employee';
      });
  }

  changeClass(x: any){
    this.active = x ? 'active' : '';
  }

  openProfile(){
      this.router.navigate([this.role_dec_logged + '/employees-profile']);
  }

  paginationControl() {
    // merge(this.sort.sortChange, this.paginator.page)
    //   .pipe(
    //     startWith({}),
    //     switchMap(() => {
    //       this.isLoadingResults = true;
    //       return this.studentService.getAllStudents({
    //         search: this.lastSearch,
    //         active: this.sort.active,
    //         sort: this.sort.direction,
    //         page: this.paginator.pageIndex,
    //         size: this.paginator.pageSize
    //       });
    //     }),
    //     map(res => {
    //       let result;
    //       result = res;
    //       this.progressValue = result.count;
    //       this.filteredStudents = result.count;
    //       this.isLoadingResults = false;
    //       this.isRateLimitReached = false;
    //       return result.data;
    //     }),
    //     catchError(() => {
    //       this.isLoadingResults = false;
    //       this.isRateLimitReached = true;
    //       return observableOf([]);
    //     })
    //   ).subscribe(res => {
    //   let data;
    //   data = res;
    //   if (data && data.length) {
    //     this.loadStudentTable(data);

    //   } else {
    //     this.dataSource = [];
    //     this.noRecord = 'No Record Found';
    //   }
    // });
  }


  getEmployees() {
    this.profileService.getAllProfiles().subscribe((result: any) => {
      this.employees = [];
      this.prev_strt_at = result[0].payload.doc;
      this.next_strt_at = result[result.length-1].payload.doc;
      if (result.length > 0) {
        result.forEach((value: any) => {
          const data = value.payload.doc.data();
          data.id = value.payload.doc.id
          // this.employees = value.payload.doc.data();
          // const str = value.payload.doc.data().full_name;
          // const matches = str.match(/\b(\w)/g); 
          // const acronyms = matches.join('');
          // const acronym = acronyms.substring(0, 2); 
          this.employees.push(data);
          this.employeePrevArr.push(value.payload.doc);
          this.employeeArray.push(value.payload.doc);
        });
        this.dataSource = this.employees;
        this.employeeArrayCount = this.employeeArray.length || 0;
      }
      this.profileService.countAllProfiles().subscribe((res: any) =>{
          this.length = res.size;
      })
    });
  }
  
  firstInResponse(){ 
    this.profileService.getPrevAllProfiles(this.employeeArr[0]).subscribe((result: any) =>{
      if (result.length > 0) {
        this.next_strt_at = result[result.length-1].payload.doc;
        this.employees = [];
        this.employeePrevArr = [];
        result.forEach((value: any) => {
          const data = value.payload.doc.data();
          data.id = value.payload.doc.id
          this.employees.push(data);
          this.employeePrevArr.push(value.payload.doc);
        });
      }      
    })
  }

  firstInResponse1(){ 
    this.profileService.getPrevAllProfiles(this.employees[0]).subscribe((result: any) =>{
      if (result.length > 0) {
        this.next_strt_at = result[result.length-1].payload.doc;
        this.employees = [];
        this.employeePrevArr = [];
        result.forEach((value: any) => {
          const data = value.payload.doc.data();
          data.id = value.payload.doc.id
          this.employees.push(data);
          this.employeePrevArr.push(value.payload.doc);
        });
      }      
    })
  }

  lastInResponse(){
    this.profileService.getNextAllProfiles(this.next_strt_at).subscribe((result: any) =>{
      if (result.length > 0) {
        this.next_strt_at = result[result.length-1].payload.doc;
        this.employees = [];
        this.employeePrevArr = [];
        result.forEach((value: any) => {
          const data = value.payload.doc.data();
          data.id = value.payload.doc.id
          this.employees.push(data);
          this.employeePrevArr.push(value.payload.doc);
          this.employeeArray.push(value.payload.doc)
        });
      }      
    })
  }

  openEmployeeDialog(view: any, data: any) {
    const dialogRef = this.dialog.open(AddEmployeeDialogComponent, {
      width: '50%',
      height: '660px',
      disableClose: true,
      data: {action: view, data: data}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      this.getEmployees();
    });
  }

  searchEmployee() {
    if (this.searchfield.length) {
      this.profileService.searchProfiles(this.searchfield);
      this.profileService.searchProfiles(this.searchfield).subscribe(result => {
        
        this.employees = [];
        if (result.length > 0) {
          result.forEach((value: any) => {
            const str = value.payload.doc.data().full_name;
            const matches = str.match(/\b(\w)/g); 
            const acronyms = matches.join('');
            const acronym = acronyms.substring(0, 2);      
            this.employees.push({data: value.payload.doc.data(), id: value.payload.doc.id, avatar: acronym});
          });
          this.dataSource = this.employees;
        }
      })
    } else {
      this.getEmployees();
    }
  }
  changeView(){ 
    this.displayButton = this.displayButton ? false : true;
  }

  
  alertMessage(view: any, data: any) {
    const dialogRef = this.dialog.open(AlertMessageComponent, {
      data: {action: view, data: data}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if(result === 'yes'){
        this.removeCollections(data);
      }
    });
  }
  snack(m: any, a: any, c: any) {
    this.sett.snackbar(m, a, 2000, c);
  }
  removeCollections(data: any) {
    this.main.deleteEmployee(data).then((res: any) => {
        this.snack('Employee was removed successfully.', 'X', 'green-snackbar');
    }).catch(error => {
        this.snack('Action was unsuccessful.', 'X', 'red-snackbar');
    })
  }


  
  
  openAttendanceDialog(view: any, data: any) {
    const dialogRef = this.dialog.open(AttendanceDialogComponent, {
      data: {action: view, data: data},
      width:'350px'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if(result === 'yes'){
        console.log(result);
        
      }
    });
  }
  openRequest(data: any){
    const dialogRef = this.dialog.open(RequestDialogComponent, {
      data: {data: data, view: 'employee'}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if(result === 'yes'){
        console.log(result);
      }
    });
  }

  openAttendance(data: any){
    this.router.navigate([this.role_dec_logged + '/attendance', data.id]);
  }

  handlePageEvent(e: any){  
    console.log(this.employeeArray);
    
    if(e.previousPageIndex > e.pageIndex){
      //prev
        this.firstInResponse();
    } else {
      //next
      this.employeeArr = []; 
      this.employeeArr.push(this.employeePrevArr[0])    
      this.lastInResponse();
    }
  }

}
