import {Component, OnInit} from '@angular/core';
import {AddEmployeeDialogComponent} from "./add-employee-dialog/add-employee-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProfileService} from "../core/services/profile.service";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: any = [];
  searchfield: any = [];
  defaultProfileImage: string = 'assets/app-images/profile-default.jpg';

  constructor(
    private dialog: MatDialog,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,) {
  }

  ngOnInit(): void {
    this.getEmployees();
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
    if(this.searchfield.length) {
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
