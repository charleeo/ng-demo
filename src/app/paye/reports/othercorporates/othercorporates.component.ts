import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../session.service';
import { environment } from '../../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import Swal from 'sweetalert2';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-othercorporates',
  templateUrl: './othercorporates.component.html',
  styleUrls: ['./othercorporates.component.css']
})
export class OthercorporatesComponent implements OnInit {
  apiUrl: string;
  dtOptions: any = {};
  roleID: any;
  managerRole: boolean = false;
  corporateId: any;
  selectedCorporateId: any;
  modalOptions: NgbModalOptions;
  closeResult: string;
  selectedCorporate: any;
  corporateForm: FormGroup;
  submitted: boolean = false;
  corporatesData: any;
  taxPayerTypeId: string;
  taxTaxOffices: any;
  industrySectors: any;
  showUpdateCorporate: boolean = false;
  showEditCorporate: boolean = false;
  showDeleteCorporate: boolean = false;
  title = 'Paye - Other Corporates'

  constructor(private route: ActivatedRoute,
    private router: Router,
    private sess: SessionService,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalService: NgbModal,
    private titleService: Title,
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,) { }

    ngOnInit(): void {
    this.titleService.setTitle(this.title)
    this.sess.checkLogin();
    this.initialiseForms();
    this.intialiseTableProperties();

     this.roleID = localStorage.getItem('admin_role_id');

    if (this.roleID === '5') {
      this.managerRole = true;
    }

    if (this.roleID === '3') {
      this.showUpdateCorporate = true;
    }

    this.getTaxOffices();
    this.getIndustrySectors();

    this.corporateId = localStorage.getItem('admin_corporate_id');
    this.getOtherCorporates();
  }

  initialiseForms() {
    this.corporateForm = this.formBuilder.group({
      emailAddress: ['', [Validators.maxLength(60), Validators.email]],
      // emailAddress2: ['', [Validators.maxLength(60), Validators.email]],
      companyName: ['', [Validators.required, Validators.pattern('^[A-Za-z 0-9 _-]*[A-Za-z0-9][A-Za-z0-9 _]*$'), Validators.maxLength(60)]],
      // companyTIN: ['', [Validators.required, Validators.maxLength(14)]],
      phone: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
      // phone2: ['', [Validators.maxLength(10), Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
      taxOfficeId: ['', Validators.required],
      // industrySectorId: ['', Validators.required],
      // contactAddress: ['', Validators.required],
      // cacRegNumber: ['', [Validators.required, Validators.maxLength(8), Validators.pattern('^[A-Za-z]{2}[0-9]{6}')]],
    });
  }

  intialiseTableProperties() {
    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: 'customBackdrop',
      size: 'xl',
    };

    this.dtOptions = {
      paging: true,
      pagingType: 'full_numbers',
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
      dom:
        '<\'row\'<\'col-sm-4\'l><\'col-sm-4 text-center\'B><\'col-sm-4\'f>>' +
        '<\'row\'<\'col-sm-12\'tr>>' +
        '<\'row\'<\'col-sm-5\'i><\'col-sm-7\'p>>',
      buttons: [
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
        {
          extend: 'pdf',
          className: 'btn btn-outline-dark',
          text: '<i class="fas fa-file-pdf"> PDF</i>',
          orientation: 'landscape',
          pageSize: 'LEGAL',
        },
      ],
    };
  }

  getOtherCorporates() {
    this.apiUrl = `${environment.AUTHAPIURL}users/email/unverified`;

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    this.spinnerService.show();
    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      console.log("otherCorporatesApiData", data);
      this.corporatesData = data.response.data;
      this.spinnerService.hide();
      });
  }

  updateCorporateEmail(modal, selectedCorporate) {
    console.log("selectedCorporate: ", selectedCorporate);
    //this.showUpdateCorporate = false;
    this.selectedCorporateId = selectedCorporate.corporate_id;
    this.showModal(modal);

    // this.getSingleCorporate(selectedCorporate.id);
    this.loadSelectedCorporateData(selectedCorporate);
  }

  getSingleCorporate(corporateId) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + 'corporates/' + corporateId;

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe(data => {
      console.log("singleCorporateData: ", data);
      this.selectedCorporate = data.response;
      // this.corporateUsersData = this.getCorporateUsers(corporateId);

      this.loadSelectedCorporateData(this.selectedCorporate);
      this.spinnerService.hide();
    });
  }

  loadSelectedCorporateData(selectedCorporate) {
    this.corporateForm = this.formBuilder.group({
      emailAddress: [selectedCorporate.email, [Validators.maxLength(60), Validators.email]],
      // emailAddress2: [selectedCorporate.email_2, [Validators.maxLength(60), Validators.email]],
      companyName: [selectedCorporate.name, [Validators.required, Validators.pattern('^[A-Za-z 0-9 _-]*[A-Za-z0-9][A-Za-z0-9 _]*$'), Validators.maxLength(60)]],
      // companyTIN: [selectedCorporate.tin, [Validators.required, Validators.maxLength(14)]],
      phone: [selectedCorporate.phone, [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
      // phone2: [selectedCorporate.phone2, [Validators.maxLength(10), Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
      taxOfficeId: [selectedCorporate.tax_office_id, Validators.required],
      // industrySectorId: [selectedCorporate.industry_sector_id, Validators.required],
      // contactAddress: [selectedCorporate.contact_address, Validators.required],
      // cacRegNumber: [selectedCorporate.cac_number, [Validators.required, Validators.maxLength(8), Validators.pattern('^[A-Za-z]{2}[0-9]{6}')]],
    });

  }

  onSubmitCorporate(formData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.corporateForm.invalid) {
      return;
    }

    this.taxPayerTypeId = localStorage.getItem("admin_taxpayer_type_id");
    console.log("corporateFormData: ", formData);

    var requestObj = {
      corporate_id: this.selectedCorporateId,
      email: formData.emailAddress,
    };

    console.log("corporateRequestObj: ", requestObj);
    this.postData(requestObj);
  }

  postData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}users/update-email`;

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log(data);

        // this.router.navigate(['/display']);
        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.corporateForm.controls).forEach((key) => {
            this.corporateForm.get(key).setErrors(null);
          });

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text:  data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.modalService.dismissAll();
          this.getOtherCorporates();
          this.spinnerService.hide();

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text:  data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  // editCorporate(modal, selectedCorporate) {
  //   console.log("selectedCorporate: ", selectedCorporate);
  //   this.showUpdateCorporate = true;
  //   this.selectedCorporateId = selectedCorporate.id;
  //   this.showModal(modal);
  //   this.getSingleCorporate(selectedCorporate.id);
  // }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + 'tax-offices';

    this.httpClient.get<any>(this.apiUrl).subscribe(data => {
      console.log('taxTaxOffices: ', data);
      this.taxTaxOffices = data.response;
    });
  }

  getIndustrySectors() {
    this.apiUrl = environment.AUTHAPIURL + 'industry-sectors';

    this.httpClient.get<any>(this.apiUrl).subscribe(data => {
      console.log('industrySectors: ', data);
      this.industrySectors = data.response;
    });
  }

  showModal(modal) {
    this.modalService.open(modal, this.modalOptions).result.then((result) => {
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
