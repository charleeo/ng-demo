import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { SessionService } from 'src/app/session.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-annualreturnemployeesupload',
  templateUrl: './annualreturnemployeesupload.component.html',
  styleUrls: ['./annualreturnemployeesupload.component.css']
})
export class AnnualreturnemployeesuploadComponent implements OnInit {
  submitted: boolean;
  apiUrl: string;
  isResponse: number;
  isMessage: any;
  isError: number;
  file: any;
  roleID: any;
  sample_file: any;
  myForm: FormGroup;
  corporateForm: FormGroup;
  taxTaxOffices: any;
  industrySectors: any;
  selectedBusiness: any;
  selectedBusinessId: any;
  businessesData: any;
  modalOptions: NgbModalOptions;
  closeResult: string;
  dtOptions: any = {};
   showTaxOffice: boolean;
  filePath: any;
  title = 'Paye - Annual Returns employees upload'
  error: string;
  columnError: string[] = [];

  config: any;
  currentPageLength : any = 10;
  selectedCorporateId: any;
  invalidFileType: boolean;
  fileValue: any;

  constructor(private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private sess: SessionService,
    private titleService: Title,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private spinnerService: Ng4LoadingSpinnerService) { }

  get f() {
    return this.myForm.controls;
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title)
    this.sess.checkLogin();
    this.roleID = localStorage.getItem('admin_role_id');

    if (this.roleID == '1') {
      this.showTaxOffice = true;
    }

    this.initialiseForms();
    this.intialiseTableProperties();
    this.sample_file = environment.SAMPLE_FILE_URL + 'new-annual-return-upload.xlsx';

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getBusinesses(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      params => this.config.currentPage= params['page']?params['page']:1 
    );

    this.getTaxOffices();
    this.getIndustrySectors();
  }

  initialiseForms() {
    this.myForm = this.formBuilder.group({
      myfile: ['', Validators.required]
    });

    this.corporateForm = this.formBuilder.group({
      companyName: [
        ""
      ],
      companyID: [""],
      businessName: [""],
      businessID: [""],
    });
  }

  intialiseTableProperties() {
    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: 'customBackdrop',
      // size: 'lg'
      size: 'xl',
    };

    this.dtOptions = {
      paging: false,
      pagingType: 'full_numbers',
      responsive: true,
      pageLength: 10,
      lengthChange: false,
      processing: false,
      ordering: false,
      info: false,
      columnDefs: [
        {
          //targets: [ 10 ],
          visible: false,
          searchable: false
        }
      ],
      dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
         ]
    };
  }


  getBusinesses(perpage, pageno) {
    this.apiUrl = `${environment.AUTHAPIURL}corporates/businesses?page=${pageno}`;

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    const obj = {"per_page":perpage, "page_no": pageno};

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      console.log("businessesData", data);
      this.businessesData = data.response.data;
      this.config.totalItems = data.response.total;
      this.spinnerService.hide();
    });
  }

  pageChange(newPage: number) {
    this.businessesData = '';
    this.router.navigate(['/annualreturnemployeesupload'], { queryParams: { page: newPage } });
    this.getBusinesses(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event
    this.currentPageLength = this.config.itemsPerPage;
    this.businessesData = '';
    this.router.navigate(['/annualreturnemployeesupload']);
    this.getBusinesses(this.config.itemsPerPage, 1);
  }

  viewBusiness(modal, selectedBusiness) {
    console.log("selectedBusiness: ", selectedBusiness);
    this.selectedBusinessId = selectedBusiness.id;
    this.selectedCorporateId = selectedBusiness.corporate_id;
    console.log("selectedBusinessId: ", this.selectedBusinessId);
    this.showModal(modal);

    // this.getSingleBusiness(this.selectedBusinessId);
    this.loadSelectedBusinessData(selectedBusiness);
  }

  getSingleBusiness(businessId) {
    this.apiUrl = `${environment.AUTHAPIURL}businesses/${businessId}`;

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
    });

    this.spinnerService.show();
    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe(data => {
      console.log("singleBusinessData: ", data);
      this.selectedBusiness = data.response;

      this.loadSelectedBusinessData(this.selectedBusiness);
      this.spinnerService.hide();
    });
  }

  loadSelectedBusinessData(selectedBusiness) {
    this.corporateForm = this.formBuilder.group({
      companyName: [
        selectedBusiness?.company_name
      ],
      companyID: [
        selectedBusiness?.taxpayer_id
      ],
      businessName: [selectedBusiness?.business_name],
      businessID: [selectedBusiness?.business_id],
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

  uploadFile(modal) {
    // console.log("Here: ");
    this.file = null;
    this.filePath = null;

    this.showModal(modal);
  }

  submit() {
    this.submitted = true;
    // console.log("file: ", this.file);

    if (this.myForm.invalid || this.invalidFileType) {
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
    // formData.append('annual_returns', this.myForm.get('myfile').value);
    formData.append('annual_returns', this.file);
    formData.append('business_id', this.selectedBusinessId);
    formData.append('corporate_id', this.selectedCorporateId);

    this.apiUrl = environment.AUTHAPIURL;
    this.spinnerService.show();

    this.httpClient.post<any>(this.apiUrl + 'annual-return-schedules/import', formData, config)
      .subscribe(res => {
        console.log(res);
        this.submitted = false;

        // Clear form Value Without any Error
        this.myForm.reset();
        Object.keys(this.myForm.controls).forEach(key => {
          this.myForm.get(key).setErrors(null);
        });

        if (res.status == true) {
          this.spinnerService.hide();
          this.modalService.dismissAll();

          this.myForm.reset();
          Object.keys(this.myForm.controls).forEach(key => {
            this.myForm.get(key).setErrors(null);
          });

          this.filePath = null;
          this.submitted = false;

          if (res.message === '0 Annual return schedule record created; 0 updated.') {
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
              icon: 'success',
              title: 'Success',
              text: "Uploaded form h1 successfully",
              showConfirmButton: true,
              timer: 5000,
            });
          }
        }
        else {
          this.spinnerService.hide();

          this.myForm.reset();
          Object.keys(this.myForm.controls).forEach(key => {
            this.myForm.get(key).setErrors(null);
          });

          const regex = /_/g;

          if (res.response != null) {
            for (const key of Object.keys(res.response)) {
              const row = res.response[key];
              console.log("row: ", row);

              for (const error of row) {
                console.log(key.replace(regex, ' ') + ':', error);
                let err = key.replace(regex, ' ' + ':')
                this.error = err.toUpperCase() + ' ' + (key.replace(regex, ' ') + ':', error);
                this.columnError.push(this.error);
                console.log(this.error);
              }
            }
          }

          this.file = null;
          this.filePath = null;
          this.reload();

          Swal.fire({
            icon: 'warning',
            title: res.message,
            html: '<div class="text-left ml-3">' + this.columnError.join('<br />') + '</div>',
            showConfirmButton: true,
            timer: 25000,
          });

          this.columnError = [];
        }

        console.log('columnError;' + this.columnError);
      });
  }

  reload() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['./'], { relativeTo: this.route });
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.file = event.target.files[0];
      this.filePath = event.target.files[0]?.name;
      
      var fileType = this.file.type;
      this.invalidFileType = !fileType.includes("spreadsheetml") ? true : false;
      // this.myForm.get('myfile').setValue(file);
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
    this.submitted = false;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}
