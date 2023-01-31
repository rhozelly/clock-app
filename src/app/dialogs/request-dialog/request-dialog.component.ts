import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttendanceService } from 'src/app/core/services/attendance.service';

@Component({
  selector: 'app-request-dialog',
  templateUrl: './request-dialog.component.html',
  styleUrls: ['./request-dialog.component.css']
})
export class RequestDialogComponent implements OnInit {
  status: any;
  icons: any =  {check: 'check_circle',denied: 'cancel',pending: 'hourglass_empty'};
  
  constructor(public dialogRef: MatDialogRef<RequestDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private att: AttendanceService) { }

  ngOnInit(): void {
    this.status = this.data.status;    
  }
  getColor(){
    return this.status === 'approved' ? '#3c8348' :  this.status === 'denied' ? '#da6965' : this.status === 'pending' ? 'grey' : 'grey';
  }

  updateRequest(){
      this.att.requestUpdate('approved', this.data.doc_id, new Date()).then(doc =>{
        // this.openSnackBar(msg,'✅');            
      })
      .catch(error =>{
          // this.openSnackBar('Something went wrong.','❌');            
      })
  }

}
