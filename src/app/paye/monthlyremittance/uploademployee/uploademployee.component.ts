import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Router } from '@angular/router';
import { SessionService } from '../../../session.service';
import { environment } from '../../../../environments/environment';
import { FlashMessagesService } from 'angular2-flash-messages';
import Swal from 'sweetalert2';
import { Md5 } from 'ts-md5/dist/md5';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-uploademployee',
  templateUrl: './uploademployee.component.html',
  styleUrls: ['./uploademployee.component.css']
})
export class UploademployeeComponent implements OnInit {
  myForm: FormGroup;
  submitted: boolean = false;
  files: any;
  file: any;
  apiUrl: string;
  isResponse = 0;
  isError = 0;
  isMessage = '';
  roleID: any;
  sample_file: any;
  corporateForm: FormGroup;
  industrySectors: any;
  taxTaxOffices: any;
  modalOptions: NgbModalOptions;
  closeResult: string;
  selectedCorporateId: any;
  employeesData: any;
  dtOptions: any = {};
  corporatesData: any;
  selectedCorporate: any;
  showTaxOffice: boolean = false;
  filePath: any;
  error: string;
  columnError: string[] = [];
  title = 'Paye - Upload Employees'

  constructor(private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private sess: SessionService,
    private titleService: Title,
    private flashMessage: FlashMessagesService,
    private modalService: NgbModal,
    private spinnerService: Ng4LoadingSpinnerService) { }


    get f() {
      return this.myForm.controls;
    }

    ngOnInit(): void {
    this.titleService.setTitle(this.title)
    this.sess.checkLogin();
    this.roleID = localStorage.getItem('admin_role_id');

    // if (this.roleID != 6) {
    //   this.router.navigate(['/dashboard']);
    // }

    this.initialiseForms();
    this.getCorporates();
    this.getTaxOffices();
    this.getIndustrySectors();
    console.log("Just here!");

    if (this.roleID === '1') {
      this.showTaxOffice = true;
    }

    this.myForm = this.formBuilder.group({
      myfile: ['', Validators.required]
    });

    this.sample_file = environment.SAMPLE_FILE_URL + 'employee-schedule-template.xlsx';

    this.modalOptions = {
      backdrop: 'static',
      backdropClass: 'customBackdrop',
      size: 'xl',
    };
  }

  initialiseForms() {
    this.corporateForm = this.formBuilder.group({
      companyName: [''],
      companyTIN: [''],
      taxPayerID: [''],
    });
  }

  getCorporates() {
    this.apiUrl = environment.AUTHAPIURL + 'corporates-list';

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    const obj = {
    };

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      console.log("corporatesApiData", data);
      this.corporatesData = data.response.data;
      this.spinnerService.hide();
      });
  }

  viewCorporate(modal, selectedCorporate) {
    console.log("selectedCorporate: ", selectedCorporate);
    // this.showUpdateCorporate = false;
    this.selectedCorporateId = selectedCorporate.id;
    console.log("selectedCorporateId: ", this.selectedCorporateId);
    this.showModal(modal);

    this.getSingleCorporate(selectedCorporate.id);
    this.getEmployees();

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

      this.loadSelectedCorporateData(this.selectedCorporate);
      this.spinnerService.hide();
    });
  }

  loadSelectedCorporateData(selectedCorporate) {
    this.corporateForm = this.formBuilder.group({
      companyName: [selectedCorporate.company_name],
      companyTIN: [selectedCorporate.tin],
      taxPayerID: [selectedCorporate.taxpayer_id],
    });
  }


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

  uploadBulkEmployees(modal) {
    this.showModal(modal);
  }

  getEmployees() {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + 'employees-list';
    console.log("selectedCorporateId1: ", this.selectedCorporateId);

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
    });

    const obj = {
      corporate_id: this.selectedCorporateId,
    };

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe(data => {
      console.log("employeesData: ", data);
      this.employeesData = data.response.data == null ? [] : data.response.data;
      this.spinnerService.hide();
    });
  }

  submit() {
    this.submitted = true;

    if (this.myForm.invalid) {
      return;
    }

    // tslint:disable-next-line: max-line-length
    // In Angular 2+, it is very important to leave the Content-Type empty. If you set the 'Content-Type' to 'multipart/form-data' the upload will not work !
    const config = {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
      }
    };

    const formData = new FormData();
    // formData.append('employees', this.myForm.get('fileSource').value);
    formData.append('employees', this.myForm.get('myfile').value);
    formData.append('corporate_id', this.selectedCorporateId);
    this.apiUrl = environment.AUTHAPIURL;
    this.spinnerService.show();

    this.httpClient.post<any>(this.apiUrl + 'employees/import', formData, config)
      .subscribe(res => {
        console.log(res);

        // Clear form Value Without any Error
        this.myForm.reset();
        Object.keys(this.myForm.controls).forEach(key => {
          this.myForm.get(key).setErrors(null);
        });

        if (res.status == true) {
          this.spinnerService.hide();

          this.myForm.reset();
          Object.keys(this.myForm.controls).forEach(key => {
            this.myForm.get(key).setErrors(null);
          });

          if (res.message === '0 Employees created; 0 updated.'){
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Confirm the file content and try again',
              showConfirmButton: true,
              timer: 5000,
            });
          }
          else {
            Swal.fire({
              icon: 'info',
              title: 'Success',
              text: res.message,
              showConfirmButton: true,
              timer: 5000,
            });

            this.getEmployees();
            this.modalService.dismissAll();
          }

        }
        else {
          // this.spinnerService.hide();
          // this.isError = 1;
          // this.isMessage = this.constructErrorMessage(res.response);
          // this.isMessage = res.message;

          this.spinnerService.hide();
          this.myForm.reset();

          Object.keys(this.myForm.controls).forEach(key => {
            this.myForm.get(key).setErrors(null);
          });

          const regex = /_/g;

          for (const key of Object.keys(res.response)) {
            const row = res.response[key];
            console.log("row: ", row);

            for (const error of row) {
              console.log(key.replace(regex, ' ') + ':', error);
              let err = key.replace(regex, ' ' + ':')
              this.error = err.toUpperCase() + ' ' +  (key.replace(regex, ' ') + ':', error) ;
              this.columnError.push(this.error);
              console.log(this.error);
            }
          }

        }

        console.log('columnError;' + this.columnError )

        this.reload();
        Swal.fire({
          icon: 'error',
          title: res.message,
          html: '<div class="text-left ml-3">' + this.columnError.join('<br />') + '</div>' ,
          showConfirmButton: true,
          timer: 25000,
        });

      });
  }

  reload() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['./'], { relativeTo: this.route });
  }

  constructErrorMessage(errors) {
    let message = "";

    for (const t in errors) {
      console.log(`${t}: ${errors[t]}`);
      message += `${t}: ${errors[t]} ${"\n"}`;
      //document.write("\n");
    }

    return message;
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.file = event.target.files[0];
      this.filePath = event.target.files[0].name;
      this.myForm.get('myfile').setValue(file);
    }
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
