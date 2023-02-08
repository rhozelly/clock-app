import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { AttendanceService } from 'src/app/core/services/attendance.service';
import { SettingsService } from 'src/app/core/services/settings.service';

@Component({
  selector: 'app-attendance-dialog',
  templateUrl: './attendance-dialog.component.html',
  styleUrls: ['./attendance-dialog.component.css']
})
export class AttendanceDialogComponent implements OnInit {
  date: any;
  today = new Date();
  disabledButton: boolean = true;
  time: any;
    // myHolidayDates = [
    //   new Date("2/6/2023"),
    //   new Date("2/3/2023"),
    // ];
    // myHolidayFilter = 
    // (date: Date | null) => {
    //   if (!date) {
    //     return false;
    //   }
    //   const time=date.getTime();
    //   return !this.myHolidayDates.find(x=>x.getTime()==time);
    // };
  constructor(public dialogRef: MatDialogRef<AttendanceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private sett: SettingsService,
              private att: AttendanceService) { }

  ngOnInit(): void {
    

  }


  snack(m: any, a: any, c: any) {
    this.sett.snackbar(m, a, 2000, c);
  }

  revoke(){
    const today = new Date();
    const selected = this.date;
    let selectedNumeral = selected.setHours(0,0,0,0);
    let todayNumeral = today.setHours(0,0,0,0);

    if(selectedNumeral < todayNumeral){
        if(this.data.data.id){
            this.att.findAttendance(this.data.data.id, this.date).subscribe((res: any) =>{
                if(res.length > 0){
                    let dateFromFirebase = res[0].payload.doc.data().date.toDate();
                    let dffFormat = moment(dateFromFirebase).format('YYYY-MM-DD');
                    let selectedFormat = moment(selected).format('YYYY-MM-DD');
                    if(dffFormat.toString() === selectedFormat.toString()){
                          let collection = res[0].payload.doc.id;
                          this.att.revokeAttendance(this.data.data.id, collection);
                          this.snack('Attendance was revoked successfully.', 'X', 'green-snackbar');
                          this.addLogs("Attendance Revoked");
                          this.dialogRef.close()
                          return;
                    } else {
                          this.snack('Date is invalid', 'X', 'red-snackbar');
                          return;
                    }
                }
            })
        }
    } 
  }

  add(){
    let checkin = new Date(this.date).setHours(8, 0, 0);
    let checkout =  this.time === 'half' ? new Date(this.date).setHours(12, 0, 0) : new Date(this.date).setHours(16, 0, 0);
    
    const arr = {
      date: this.date,
      time_in: new Date(checkin),
      time_out: new Date(checkout)
    }
    
    this.att.addAttendance(this.data.data.id, arr).then(result =>{
      if(result){
        this.snack('Attendance was added successfully.', 'X', 'green-snackbar');
        this.addLogs("Added Attendance")
        this.dialogRef.close()
      }
    }).catch(error =>{
        this.snack(error, 'X', 'red-snackbar');
    });
  }


  dateOnChange(){
    this.disabledButton = this.date ? false : true;
  }

  // Add to Logs
  addLogs(msg: any){
    this.att.addLogsHistory(msg, this.data.data.id).then(result =>{
      console.log(result);
    }).catch(error =>{
      console.log(error);      
    });
  }

}
