import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import {NgbModal, ModalDismissReasons, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  apiUrl: string;
  apidata: any;
  apiDataById: any;
  dtOptions: any = {};
  userID: any;
  modalOptions: NgbModalOptions;
  closeResult: string;

  // tslint:disable-next-line: max-line-length
  constructor(private httpClient: HttpClient, private route: ActivatedRoute, private router: Router, private sess: SessionService, private modalService: NgbModal,  private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit(): void {
    this.sess.checkLogin();

    this.modalOptions = {
      backdrop: 'static',
      backdropClass: 'customBackdrop',
      // size: 'xl',
      size: 'lg'
    };

    this.getContetUsData();

    this.dtOptions = {
      paging: true,
      scrollX: true,
      pagingType: 'full_numbers',
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
      dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
                /*{ extend: 'copy',  className: 'btn btn-outline-dark', text: '<i class="far fa-copy"> Copy</i>' },*/
                { extend: 'csv',   className: 'btn btn-outline-dark', text: '<i class="fas fa-file-csv"> CSV</i>' },
                { extend: 'excel', className: 'btn btn-outline-dark', text: '<i class="fas fa-file-excel"> Excel</i>' },
                { extend: 'pdf',   className: 'btn btn-outline-dark', text: '<i class="fas fa-file-pdf"> PDF</i>' , pageSize: 'LEGAL'},
                // { extend: 'print', className: 'btn btn-outline-dark', text: '<i class="far fas fa-print"> Print</i>' }
              ]
    };
  }

  getContetUsData() {
    const obj = {
      application_id: ''
      };

    this.apiUrl = environment.AUTHAPIURL + 'farmarapi/farmar/getcontectUsNotification';
    this.spinnerService.show(); // show the spinner
    this.httpClient.post<any>(this.apiUrl, obj).subscribe(data => {
          console.log(data);
          this.apidata = data.response;
          this.spinnerService.hide(); // hide the spinner if success
    });
  }

  getContectDataById(contectid: any) {
    // alert(contectid);
    const obj = {
        id: contectid
      };

    this.apiUrl = environment.AUTHAPIURL + 'farmarapi/farmar/getContectNotificationByID';
    this.httpClient.post<any>(this.apiUrl, obj).subscribe(data => {
          // console.log(data);
          console.log(data.response[0]);
          this.apiDataById = data.response[0];
    });
  }

  open(content, id) {
    // alert(userDataID);
    console.log(id);
    this.userID = id;

    this.getContectDataById(id);

    this.modalService.open(content, this.modalOptions).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }


}
