import {Component, OnInit} from '@angular/core';
import {AddEmployeeDialogComponent} from "./add-employee-dialog/add-employee-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProfileService} from "../core/services/profile.service";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";
import {MainService} from "../core/services/main.service";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
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
    private snackBar: MatSnackBar,) {
  }

  ngOnInit(): void {
    this.getEmployees();
    this.breakpointObserver.observe(['(max-width: 768px)'])
      .subscribe((state: BreakpointState) => {
        this.addEmployeeText = state.matches ? '' : 'Add Employee';
      });
  }

  getEmployees() {
    this.profileService.getAllProfiles().subscribe((result: any) => {
      this.employees = [];
      if (result.length > 0) {
        result.forEach((value: any) => {
            this.employees.push({data: value.payload.doc.data(), id: value.payload.doc.id});
        });
      }
    });
  }

  openEmployeeDialog(view: any, data: any) {
    const dialogRef = this.dialog.open(AddEmployeeDialogComponent, {
      width: '50%',
      height: '640px',
      disableClose: true,
      data: {action: view, data: data}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      this.getEmployees();
    });
  }

  searchEmployee() {
    if (this.searchfield.length) {
      this.profileService.searchProfiles(this.searchfield).subscribe(result => {
        this.employees = [];
        if (result.length > 0) {
          result.forEach((value: any) => {
            this.employees.push({data: value.payload.doc.data(), id: value.payload.doc.id});
          });
        }
      })
    } else {
      this.getEmployees();
    }
  }


}
