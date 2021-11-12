import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-uploadprojection",
  templateUrl: "./uploadprojection.component.html",
  styleUrls: ["./uploadprojection.component.scss"],
})
export class UploadprojectionComponent implements OnInit {
  myForm: FormGroup;
  corporateForm: FormGroup;
  submitted: boolean;
  files: any;
  file: any;
  apidata: any;
  apiUrl: string;
  isResponse = 0;
  isError = 0;
  roleID: any;
  isMessage = "";
  corporateId = localStorage.getItem("admin_corporate_id");
  sample_file: any;
  industrySectors: any;
  taxTaxOffices: any;
  selectedCorporate: any;
  selectedBusinessId: any;
  businessesData: any;
  modalOptions: NgbModalOptions;
  closeResult: string;
  dtOptions: any = {};
  showTaxOffice: boolean;
  title = "Paye - Upload Projections";
  filePath: any;
  rows: string[] = [];
  error: any;
  errorRow: string;
  config: any;
  currentPageLength : any = 10;
  selectedCorporateId: any;
  invalidFileType: boolean;

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private formBuilder: FormBuilder,
    private sess: SessionService,
    private modalService: NgbModal,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  get f() {
    return this.myForm.controls;
  }

  ngOnInit() {
    this.sess.checkLogin();
    this.titleService.setTitle(this.title);
    this.roleID = localStorage.getItem("admin_role_id");

    if (this.roleID == "1") {
      this.showTaxOffice = true;
    }

    this.initialiseForms();
    this.intialiseTableProperties();

     /* Pagination Start */
     this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getBusinesses(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      params => this.config.currentPage= params['page']?params['page']:1 
    );

    // this.getIndustrySectors();
    // this.getTaxOffices();
    this.sample_file = environment.SAMPLE_FILE_URL + "FileProjection-NEW.xlsx";
  }

  initialiseForms() {
    this.initialiseUploadForms();

    this.corporateForm = this.formBuilder.group({
      companyName: [
        ""
      ],
      companyID: [""],
      businessName: [""],
      businessID: [""],
    });
  }

  initialiseUploadForms() {
    this.myForm = this.formBuilder.group({
      myfile: ["", Validators.required],
      year: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(4),
          Validators.maxLength(4),
        ],
      ],
    });
  }

  intialiseTableProperties() {
    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      // size: 'lg'
      size: "xl",
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
          searchable: false,
        },
      ],
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
        // { extend: 'csv', className: 'btn btn-outline-dark', text: '<i class="fas fa-file-csv"> CSV</i>', exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
        // { extend: 'excel', className: 'btn btn-outline-dark', text: '<i class="fas fa-file-excel"> Excel</i>', exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
        // { extend: 'pdf', className: 'btn btn-outline-dark', text: '<i class="fas fa-file-pdf"> PDF</i>', orientation: 'landscape', pageSize: 'LEGAL', exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
        // { extend: 'print', className: 'btn btn-outline-dark', text: '<i class="far fas fa-print"> Print</i>', exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } }
      ],
    };
  }

  getBusinesses(perpage, pageno) {
    this.businessesData = "";
    this.apiUrl = `${environment.AUTHAPIURL}corporates/businesses?page=${pageno}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {"per_page":perpage, "page_no": pageno};

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("businessesData", data);
        this.businessesData = data.response.data;
        this.config.totalItems = data.response.total;
        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.businessesData = '';
    this.router.navigate(['/uploadprojection'], { queryParams: { page: newPage } });
    this.getBusinesses(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event
    this.currentPageLength = this.config.itemsPerPage;
    this.businessesData = '';
    this.router.navigate(['/uploadprojection']);
    this.getBusinesses(this.config.itemsPerPage, 1);
  }

  viewBusiness(modal, selectedBusiness) {
    console.log("selectedBusiness: ", selectedBusiness);
    // this.showUpdateCorporate = false;
    this.selectedBusinessId = selectedBusiness.id;
    this.selectedCorporateId = selectedBusiness.corporate_id;
    console.log("selectedBusinessId: ", this.selectedBusinessId);
    this.showModal(modal);

    // this.getSingleCorporate(selectedCorporate.id);
    this.loadSelectedBusinessData(selectedBusiness);
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
    this.apiUrl = environment.AUTHAPIURL + "tax-offices";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("taxTaxOffices: ", data);
      this.taxTaxOffices = data.response;
    });
  }

  getIndustrySectors() {
    this.apiUrl = environment.AUTHAPIURL + "industry-sectors";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("industrySectors: ", data);
      this.industrySectors = data.response;
    });
  }

  uploadFile(modal) {
    this.initialiseUploadForms();
    this.showModal(modal);
  }

  submit() {
    this.submitted = true;

    if (this.myForm.invalid || this.invalidFileType) {
      return;
    }

    // tslint:disable-next-line: max-line-length
    // In Angular 2+, it is very important to leave the Content-Type empty. If you set the 'Content-Type' to 'multipart/form-data' the upload will not work !
    const config = {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
      },
    };

    const formData = new FormData();
    // console.log("this.selectedBusinessId: ", this.selectedBusinessId);
    // formData.append("projection", this.myForm.get("myfile").value);
    formData.append("projection", this.file);
    formData.append("projection_year", this.myForm.get("year").value);
    formData.append("business_id", this.selectedBusinessId);
    formData.append("corporate_id", this.selectedCorporateId);
    this.apiUrl = environment.AUTHAPIURL;
    this.spinnerService.show();

    this.httpClient
      .post<any>(this.apiUrl + "projections", formData, config)
      .subscribe((res) => {
        console.log(res);

        // Clear form Value Without any Error
        this.myForm.reset();
        Object.keys(this.myForm.controls).forEach((key) => {
          this.myForm.get(key).setErrors(null);
        });

        if (res.status == true) {
          this.spinnerService.hide();

          this.myForm.reset();
          Object.keys(this.myForm.controls).forEach((key) => {
            this.myForm.get(key).setErrors(null);
          });

          this.isResponse = 1;
          this.isMessage = res.message;
          Swal.fire({
            icon: "success",
            title: "Success",
            text: this.isMessage,
            showConfirmButton: true,
            timer: 5000,
          });

          this.modalService.dismissAll();
        } else {
          const regex = /_/g;

          if (res.response != null) {
            for (const key of Object.keys(res.response)) {
              const row = res.response[key];
              console.log("row: ", row);

              for (const error of row) {
                console.log(key.replace(regex, " ") + ":", error);
                let err = key.replace(regex, " " + ":");
                this.errorRow =
                  err.toUpperCase() +
                  " " +
                  (key.replace(regex, " ") + ":", error);
                this.rows.push(this.errorRow);
                console.log(this.errorRow);
              }
            }
          }

          console.log("errors" + this.rows);
          this.reload();
          let apiReponse = res.response;
          if (typeof apiReponse === "object" && apiReponse !== null) {
            if (this.rows.length < 12) {
              console.log("its less than 12");
              Swal.fire({
                icon: "error",
                title: res.message,
                html:
                  '<div class="text-left ml-3 "> ERROR: ' +
                  this.rows.join("<br /> ERROR: ") +
                  "</div>",
                // text: this.rows.join('\n'),
                showConfirmButton: true,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: res.message,
                html:
                  '<div class="text-left ml-3 p-0 my-4 div-scroll-alert"> ERROR: ' +
                  this.rows.join("<br /> ERROR: ") +
                  "</div>",
                // text: this.rows.join('\n'),
                showConfirmButton: true,
              });
            }
          } else {
            if (res.response.includes("failure")) {
              console.log("its includes failure");

              Swal.fire({
                icon: "error",
                title: "Error",
                text: res.message,
                showConfirmButton: true,
                timer: 5000,
                timerProgressBar: true,
              });
            }
          }
          this.modalService.dismissAll();
        }
        this.reload();
      });
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.file = event.target.files[0];
      this.filePath = event.target.files[0].name;

      var fileType = this.file.type;
      this.invalidFileType = !fileType.includes("spreadsheetml") ? true : false;
      // this.myForm.get("myfile").setValue(file);
    }
  }

  showModal(modal) {
    this.modalService.open(modal, this.modalOptions).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }
  reload() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigate(["./"], { relativeTo: this.route });
  }
}
