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


// export interface PeriodicElement {
//   name: string;
//   position: number;
//   weight: number;
//   symbol: string;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
//   {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
//   {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
//   {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
//   {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
//   {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
//   {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
//   {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
//   {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
//   {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
//   {position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na'},
//   {position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg'},
//   {position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al'},
//   {position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si'},
//   {position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P'},
//   {position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S'},
//   {position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl'},
//   {position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar'},
//   {position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K'},
//   {position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca'},
// ];

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: any;
  
  displayedColumns = [
    'avatar',
    'id',
    'full_name',
    'email_add',
    'action',
  ];

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  // }

  displayButton: boolean = true;
  employees: any = [];
  employees_sub_array: any = [];
  searchfield: any = [];
  isOnline: boolean = false;
  defaultProfileImage: string = 'assets/app-images/profile-default.jpg';
  addEmployeeText: any = 'Add Emnployee';
  searchEmployeeField: any = 'space-between center"';

  constructor(
    private dialog: MatDialog,
    private profileService: ProfileService,
    private main: MainService,
    public breakpointObserver: BreakpointObserver,
    private snackBar: MatSnackBar,)
  {
      this.dataSource = [];
  }

  ngOnInit(): void {
    this.getEmployees();
    this.breakpointObserver.observe(['(max-width: 768px)'])
      .subscribe((state: BreakpointState) => {
        this.addEmployeeText = state.matches ? '' : 'Add Employee';
      });
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
    });
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


}
