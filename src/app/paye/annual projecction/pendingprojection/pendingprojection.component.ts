import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-pendingprojection",
  templateUrl: "./pendingprojection.component.html",
  styleUrls: ["./pendingprojection.component.scss"],
})
export class PendingprojectionComponent implements OnInit {
  forwardProjectionForm: FormGroup;
  selectedProjection: any;
  updateProjectionForm: FormGroup;
  dtOptions: any = {};
  dtOptionsPopUp: any = {};
  roleID: any;
  projectionData: any;
  myForm: FormGroup;
  submitted: boolean;
  managerRole = false;
  files: any;
  file: any;
  apidata: any = [];
  singleCorporate = [] as any;
  apiUrl: string;
  corporateId = localStorage.getItem("admin_corporate_id");
  modalOptions: NgbModalOptions;
  closeResult: string;
  editorRole: boolean = false;
  corporatesData: any;
  selectedBusinessId: any;
  selectedCorporate: any;
  taxTaxOffices: any;
  industrySectors: any;
  corporateForm: FormGroup;
  showApproveProjection: boolean = false;
  showTaxOffice: boolean;
  annualProjectionId: any;
  projectionCommentsData: any = [];
  applicationId: number;
  selectedApplicationId: number;
  title = "Paye - Pending Projections";
  apisingledata: any;
  forwardedTo: string;
  comments: any;
  isForwardedToManager: boolean;
  config: any;
  currentPageLength: any = 10;
  selectedCorporateId: any;
  selectedProjectionId: any;

  // tslint:disable-next-line: max-line-length
  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private sess: SessionService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit() {
    this.sess.checkLogin();
    this.titleService.setTitle(this.title);
    this.roleID = localStorage.getItem("admin_role_id");
    this.applicationId = environment.APPLICATION_ID;

    if (this.roleID == "1") {
      this.showTaxOffice = true;
    }

    if (this.roleID === "2") {
      this.managerRole = true;
      this.showApproveProjection = true;
    }

    if (this.roleID === "3") {
      this.editorRole = true;
    }

    this.initialiseForms();
    this.intialiseTableProperties();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getUnapprovedProjectionRecord(
      this.config.itemsPerPage,
      this.config.currentPage
    );

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );
  }

  initialiseForms() {
    this.corporateForm = this.formBuilder.group({
      companyName: [""],
      companyTIN: [""],
      taxPayerID: [""],
    });

    this.updateProjectionForm = this.formBuilder.group({
      date_forwarded: ["", Validators.required],
      email: ["", Validators.required],
      name: ["", Validators.required],
      tin: ["", Validators.required],
      bvn: ["", Validators.required],
      designation: ["", Validators.required],
      projection_id: ["", Validators.required],
      projection_year: [
        "",
        [
          Validators.required,
          Validators.maxLength(4),
          Validators.minLength(4),
          Validators.pattern(/^[0-9\s]*$/),
        ],
      ],
    });

    this.forwardProjectionForm = this.formBuilder.group({
      year: [""],
      comment: ["", Validators.required],
    });
  }

  intialiseTableProperties() {
    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      // size: 'md',
      size: "xl",
    };

    this.dtOptions = {
      paging: false,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: false,
      processing: false,
      ordering: false,
      info: false,
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
        
      ],
    };

    this.dtOptionsPopUp = {
      paging: true,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
    }
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

  forwardProjection(modal) {
    this.modalService.open(modal, this.modalOptions).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  onSubmitProjection(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.forwardProjectionForm.invalid) {
      return;
    }

    const obj = {
      comment: formAllData.comment,
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
      annual_projection_id: this.annualProjectionId,
      projection_year: this.selectedProjection.projection_year,
    };

    console.log("FormData: ", obj);
    this.postForwardProjection(obj);
    // this.spinnerService.hide();
  }

  postForwardProjection(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + "projections/forward";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("ApiResponseData: ", data);

        if (data.status === true) {
          // Rest form fithout errors
          this.forwardProjectionForm.reset();
          Object.keys(this.forwardProjectionForm.controls).forEach((key) => {
            this.forwardProjectionForm.get(key).setErrors(null);
          });

          Swal.fire({
            icon: "success",
            title: "Success",
            text:
              data.response != null && data.response[0] != undefined
                ? data.response[0].message
                : data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.modalService.dismissAll();
          this.getUnapprovedProjectionRecord(
            this.config.itemsPerPage,
            this.config.currentPage
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: data.message,
            // text:  data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }

        this.spinnerService.hide();
      });
  }

  getUnapprovedProjectionRecord(perpage, pageno) {
    this.apisingledata = "";
    // this.apiUrl = environment.AUTHAPIURL + "projections/unApprovedRecord";
    this.apiUrl =
      environment.AUTHAPIURL + "projections/unApprovedRecord?page=" + pageno;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = { per_page: perpage, page_no: pageno };

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("pendingProjectionData: ", data);
        if (data.status == true) {
          this.spinnerService.hide();
          if (this.roleID === "2") {
            this.apisingledata = data.response.data.filter(
              (x) => x.forwarded_to != 0
            );
            //this.apisingledata = data.response.data;
          } else {
            this.apisingledata = data.response.data;
          }

          this.config.totalItems = data.response.total;

          this.forwardedTo =
            this.apisingledata[0].forwarded_to == 1
              ? "Projection Forwarded to Tax Officer"
              : this.apisingledata[0].forwarded_to == 2
              ? "Projection Forwarded to Head of Station"
              : "Not Forwarded";
        } else {
          this.apisingledata = [];
        }

        this.spinnerService.hide();
      });
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

  viewProjection(modal, selectedProjection) {
    console.log("selectedProjection: ", selectedProjection);
    this.selectedProjection = selectedProjection;
    this.selectedProjectionId = selectedProjection.annual_projection_id;
    this.selectedCorporateId = selectedProjection.corporate_id;
    this.selectedBusinessId = selectedProjection.business_primary_id;
    this.selectedApplicationId = selectedProjection.app_id;
    this.isForwardedToManager =
      selectedProjection.forwarded_to == 2 ? true : false;

    this.showModal(modal);
    this.getUnapprovedProjectionList(this.selectedProjection.projection_year);

    console.log("applicationId: ", this.applicationId);
    console.log("selectedApplicationId: ", this.selectedApplicationId);
  }

  getUnapprovedProjectionList(year) {
    this.apidata = '';
    this.forwardProjectionForm = this.formBuilder.group({
      year: [this.selectedProjection.projection_year],
      comment: ["", Validators.required],
    });

    this.projectionCommentsData = "";
    this.apiUrl = environment.AUTHAPIURL + "projections/unApprovedList";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      projection_year: year,
      business_id: this.selectedBusinessId,
      annual_projection_id: this.selectedProjectionId,
      corporate_id: this.selectedCorporateId,
    };

    this.comments = [];
    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("pendingProjectionListData: ", data);

        if (data.status == true) {
          this.apidata = data.response.data.data == null ? [] : data.response.data.data;
          this.projectionCommentsData = data.response.comments;
          this.comments = this.projectionCommentsData.filter(
            (x) =>
              x.annual_projection_id ==
              this.projectionCommentsData[0].annual_projection_id
          );
          
          this.annualProjectionId = this.apidata[0]?.annual_projection_id;
        }
       
        this.spinnerService.hide();
      });
  }


  getSingleProjection(obj: any) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}projections?business_id=${this.selectedBusinessId}&corporate_id=${this.selectedCorporateId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleProjectionData: ", data);
        this.projectionData = data.response.data;
        console.log(this.projectionData);
        this.selectedProjection = data.response.data;
        this.spinnerService.hide();
      });
  }

  approveProjection(modal) {
    this.modalService.open(modal, this.modalOptions).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  postApproveProjection() {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}projections/approve`;

    const obj = {
      projection_year: this.selectedProjection.projection_year,
      business_id: this.selectedBusinessId,
      corporate_id: this.selectedCorporateId,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("ApiResponseData: ", data);

        if (data.status === true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.modalService.dismissAll();
          this.getUnapprovedProjectionRecord(
            this.config.itemsPerPage,
            this.config.currentPage
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });

    this.spinnerService.hide();
  }

  onRevertProjection() {
    this.submitted = true;

    // stop the process here if form is invalid
    // if (this.forwardProjectionForm.invalid) {
    //   return;
    // }

    const obj = {
      business_id: this.selectedBusinessId,
      corporate_id: this.selectedCorporateId,
      annual_projection_id: this.selectedProjection.annual_projection_id,
    };

    console.log("FormData: ", obj);
    this.postRevertProjection(obj);
  }

  postRevertProjection(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "projections/forward";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("ApiResponseData: ", data);

        if (data.status === true) {
          // Rest form fithout errors
          this.forwardProjectionForm.reset();
          Object.keys(this.forwardProjectionForm.controls).forEach((key) => {
            this.forwardProjectionForm.get(key).setErrors(null);
          });

          Swal.fire({
            icon: "success",
            title: "Success",
            text:
              data.response != null && data.response[0] != undefined
                ? data.response[0].message
                : data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.modalService.dismissAll();
          this.getUnapprovedProjectionRecord(
            this.config.itemsPerPage,
            this.config.currentPage
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });

    this.spinnerService.hide();
  }

  pageChange(newPage: number) {
    this.apisingledata = "";
    this.router.navigate(["/pendingprojection"], {
      queryParams: { page: newPage },
    });
    this.getUnapprovedProjectionRecord(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.apisingledata = "";
    this.router.navigate(["/pendingprojection"]);
    this.getUnapprovedProjectionRecord(this.config.itemsPerPage, 1);
  }
}
