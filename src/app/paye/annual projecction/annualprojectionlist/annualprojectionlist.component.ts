import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { SessionService } from 'src/app/session.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-annualprojectionlist',
  templateUrl: './annualprojectionlist.component.html',
  styleUrls: ['./annualprojectionlist.component.scss'],
})
export class AnnualprojectionlistComponent implements OnInit {
  forwardProjectionForm: FormGroup;
  selectedProjection: any;
  updateProjectionForm: FormGroup;
  dtOptions: any = {};
  roleID: any;
  myForm: FormGroup;
  submitted: boolean;
  managerRole: boolean = false;
  files: any;
  file: any;
  apidata: any;
  singleCorporate = [] as any;
  apiUrl: string;
  corporateId = localStorage.getItem('admin_corporate_id');
  modalOptions: NgbModalOptions;
  closeResult: string;

  // tslint:disable-next-line: max-line-length
  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private sess: SessionService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}


  ngOnInit() {
    this.sess.checkLogin();

    this.modalOptions = {
      backdrop: 'static',
      backdropClass: 'customBackdrop',
      size: 'lg',
     // size: 'lg'
    };

    this.roleID = localStorage.getItem('admin_role_id');

    /*if (this.roleID != 5 && this.roleID != 6) {
      this.router.navigate(['/dashboard']);
     }*/

    if(this.roleID === "5"){
      this.managerRole = true;
    }
    this.forwardProjectionForm = this.formBuilder.group({
      comment: ['', Validators.required],
    });


    this.getProjectionList();
    this.dtOptions = {
      paging: true,
      pagingType: 'full_numbers',
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
      // dom: "<'row'<'col-sm-3'l><'col-sm-6 text-center'B><'col-sm-3'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      dom:
        '<\'row\'<\'col-sm-4\'l><\'col-sm-4 text-center\'B><\'col-sm-4\'f>>' +
        '<\'row\'<\'col-sm-12\'tr>>' +
        '<\'row\'<\'col-sm-5\'i><\'col-sm-7\'p>>',
      buttons: [
        // { extend: 'copy',  className: 'btn btn-outline-dark', text: '<i class="far fa-copy"> Copy</i>' },
        {
          extend: 'csv',
          className: 'btn btn-outline-dark',
          text: '<i class="fas fa-file-csv"> CSV</i>',
        },
        {
          extend: 'excel',
          className: 'btn btn-outline-dark',
          text: '<i class="fas fa-file-excel"> Excel</i>',
        },
        // tslint:disable-next-line: max-line-length
        {
          extend: 'pdf',
          className: 'btn btn-outline-dark',
          text: '<i class="fas fa-file-pdf"> PDF</i>',
          orientation: 'landscape',
          pageSize: 'LEGAL',
        },
        // { extend: 'print', className: 'btn btn-outline-dark', text: '<i class="far fas fa-print"> Print</i>' }
      ],
    };
  }

  getProjectionList() {
    this.apiUrl = environment.AUTHAPIURL + 'projections?corporate_id=' + this.corporateId;

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    this.spinnerService.show();
    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log(data);
        this.apidata = data.response.data;
      
        this.spinnerService.hide();
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

  forwardProjection(modal) {
    this.modalService.open(modal, this.modalOptions).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onSubmitProjection(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.forwardProjectionForm.invalid) {
      return;
    }

    const obj = {
      comment: formAllData.comment,
      corporate_id: this.corporateId,
    };

    console.log('FormData: ', obj);
    this.postForwardProjection(obj);
  }

  postForwardProjection(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + 'projections/forward';

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
      console.log('ApiResponseData: ', data);

      if (data.status === true) {
        // Rest form fithout errors
        this.forwardProjectionForm.reset();
        Object.keys(this.forwardProjectionForm.controls).forEach(key => {
          this.forwardProjectionForm.get(key).setErrors(null);
        });

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
          showConfirmButton: true,
          timer: 5000
        });

        this.modalService.dismissAll();
        this.getProjectionList();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text:  data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
          showConfirmButton: true,
          timer: 5000
        });
      }
    });
  }

  viewProjection(modal, selectedProjection) {
    console.log('selectedProjection: ', selectedProjection);
    this.selectedProjection = selectedProjection;

    this.updateProjectionForm = this.formBuilder.group({
      date_forwarded: [selectedProjection.date_forwarded, Validators.required],
      company_name: [selectedProjection.company_name, Validators.required],
      projection_id: [selectedProjection.projection_id, Validators.required],
      projection_year: [selectedProjection.projection_year, [Validators.required, Validators.maxLength(4), Validators.minLength(4), Validators.pattern(/^[0-9\s]*$/)]],
    });

    this.modalService.open(modal, this.modalOptions).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  approveProjection(modal) {
    this.modalService.open(modal, this.modalOptions).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  postApproveProjection() {
    this.apiUrl = 'http://54.195.241.202/NSIRS/public/api/projections/approve';
    const obj = {
      corporate_id: this.corporateId
    };

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
    });

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe(data => {
      console.log('ApiResponseData: ', data);

      if (data.status === true) {
        Swal.fire({ 
          icon: 'success',
          title: 'Success',
          text: data.message,
          showConfirmButton: true,
          timer: 5000
        });

        this.modalService.dismissAll();
        this.getProjectionList();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text:  data.message,
          showConfirmButton: true,
          timer: 5000
        });
      }
    });
  }

  onRevertProjection() {
    this.submitted = true;

    // stop the process here if form is invalid
    // if (this.forwardProjectionForm.invalid) {
    //   return;
    // }

    const obj = {
      corporate_id: this.corporateId,
    };

    console.log('FormData: ', obj);
    this.postRevertProjection(obj);
  }
  postRevertProjection(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + 'projections/forward';

    const reqHeader = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
     });

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe(data => {
      console.log('ApiResponseData: ', data);

      if (data.status === true) {
        // Rest form fithout errors
        this.forwardProjectionForm.reset();
        Object.keys(this.forwardProjectionForm.controls).forEach(key => {
          this.forwardProjectionForm.get(key).setErrors(null);
        });

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
          showConfirmButton: true,
          timer: 5000
        });

        this.modalService.dismissAll();
        this.getProjectionList();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text:  data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
          showConfirmButton: true,
          timer: 5000
        });
      }
    });
  }

  
  onSubmit(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.updateProjectionForm.invalid) {
      return;
    }

    let corporateId = localStorage.getItem('admin_corporate_id');

    const obj = {
      projection_id: this.selectedProjection.projection_id,
      projection_year: formAllData.projection_year,
      corporate_id: corporateId,
    };

    console.log('FormData: ', obj);
    this.postUpdateProjection(obj);
  }

  postUpdateProjection(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + 'projections/' + this.selectedProjection.projection_id  ;

    const reqHeader = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
     });

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe(data => {
      console.log('ResponseData: ', data);

      if (data.status === true) {
        // Rest form fithout errors
        this.updateProjectionForm.reset();

        Object.keys(this.updateProjectionForm.controls).forEach(key => {
          this.updateProjectionForm.get(key).setErrors(null);
        });

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
          showConfirmButton: true,
          timer: 5000
        });
        this.modalService.dismissAll();
        this.getProjectionList();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text:  data.response != null ? data.response[0].message : data.message,
          showConfirmButton: true,
          timer: 5000
        });
      }
    });
  }
}
