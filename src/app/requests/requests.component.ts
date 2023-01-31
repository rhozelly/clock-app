import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AttendanceService } from '../core/services/attendance.service';
import { RequestDialogComponent } from '../dialogs/request-dialog/request-dialog.component';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  pendings: any;
  requests: any;
  constructor(private att: AttendanceService,
              private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.getPendingRequests();
    this.getAllRequests();
  }

  getPendingRequests(){
    this.att.getPendingRequests().subscribe((result: any) =>{
        if(result.length > 0){
          let arr: any = [];
          result.forEach((el: any) =>{
            const data = {
              date: el.payload.doc.data().date,
              date_added: el.payload.doc.data().date_added,
              hours:  el.payload.doc.data().hours,
              id:  el.payload.doc.data().id,
              name:  el.payload.doc.data().name,
              reason:  el.payload.doc.data().reason,
              request_for: el.payload.doc.data().request_for,
              status: el.payload.doc.data().status,
              status_updated: el.payload.doc.data().status_updated,
              doc_id: el.payload.doc.id
            }
            arr.push(data);
          })
          this.pendings = arr;
        }      
    })
  }

  getAllRequests(){
    this.att.getAllRequests().subscribe((result: any) =>{
      if(result.length > 0){
        let arr: any = [];
        result.forEach((el: any) =>{
          const data = {
            date: el.payload.doc.data().date,
            date_added: el.payload.doc.data().date_added,
            hours:  el.payload.doc.data().hours,
            id:  el.payload.doc.data().id,
            name:  el.payload.doc.data().name,
            reason:  el.payload.doc.data().reason,
            request_for: el.payload.doc.data().request_for,
            status: el.payload.doc.data().status,
            status_updated: el.payload.doc.data().status_updated,
            doc_id: el.payload.doc.id
          }
          arr.push(data);
        })
        this.requests = arr;
      }      
    })
  }

  openRequest(x: any){
    const dialogRef = this.dialog.open(RequestDialogComponent, {
      data: x,
      width: '460px'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if(result === 'yes'){
        
      }
    });
  }

}
