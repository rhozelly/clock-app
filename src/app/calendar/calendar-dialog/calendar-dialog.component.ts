import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import { ProfileService} from "../../core/services/profile.service";
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.css']
})
export class CalendarDialogComponent implements OnInit {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  summary: any;
  attendies: any = [];
  attendiesFruits: any = [];
  attend: any;
  
  attendy: string[];
  
  attendiesCtrl = new FormControl();
  filteredAttendies: Observable<string[]>;
  
  @ViewChild('attendiesInput') attendiesInput: ElementRef<HTMLInputElement>;
  constructor(public dialogRef: MatDialogRef<CalendarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public cal: any,
    private profile: ProfileService) { 
      this.filteredAttendies = this.attendiesCtrl.valueChanges.pipe(
        startWith(null),
        map((x: string | null) => (x ? this._filter(x) : this.attendies.slice())),
      );
    }

  ngOnInit(): void { 
    this.getAllProfile();
   }

   add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.attendies.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.attendiesCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.attendies.indexOf(fruit);

    if (index >= 0) {
      this.attendies.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.attendies.push(event.option.viewValue);
    this.attendiesInput.nativeElement.value = '';
    this.attendiesCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.attendies.filter((x: any) => x.toLowerCase().includes(filterValue));
  }
   
   getAllProfile(){
     this.profile.getAllProfiles().subscribe((result: any) =>{
        result.forEach((x: any) =>{         
            console.log();          
            const data = {
               name: x.payload.doc.data().last_name + ', ' + x.payload.doc.data().first_name,
               id: x.payload.doc.id,
            };
           this.attendies.push(data.name)
        })
     })
   }

   addEvent(){
    console.log(this.attend);
    console.log(this.summary);
   }

}
