import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { Title } from "@angular/platform-browser";
import { DatePipe } from "@angular/common";
import { UtilityService } from 'src/app/utility.service';

@Component({
  selector: "app-reassessmentappeals",
  templateUrl: "./reassessmentappeals.component.html",
  styleUrls: ["./reassessmentappeals.component.css"],
})
export class ReassessmentappealsComponent implements OnInit {
  apiUrl: string;
  assessmentsData: [];
  dtOptions: any = {};
  modalOptions: NgbModalOptions;
  closeResult: string;
  reassessmentAppealsData: any;
  appealForm: FormGroup;
  selectedAppeal: any;

  submitted: boolean = false;
  corporatesData: any;
  selectedCorporateId: any;
  selectedCorporate: any;
  taxTaxOffices: any;
  industrySectors: any;
  corporateForm: FormGroup;
  approveAppealForm: FormGroup;
  reassessmentId: any;
  appealId: any;
  forwardAppealForm: FormGroup;
  subbmitErrorMessage: any;
  submitResponse: boolean = false;
  editorRole: boolean = false;
  showApproveAppeal: boolean = false;
  managerRole: boolean = false;
  showTaxOffice: boolean;
  isAppealSubmitted: boolean;
  appealApprovalStatus: any;
  appealModalTitle: string;
  approvalStatus: number;
  searchForm: FormGroup;
  title = "Paye - Reassessment Objection";
  today: Date;

  searchObject: any = {};
  config: any;
  currentPageLength: any = 10;
  inviteForm: FormGroup;
  files: any;
  corporateId: any;
  invites: any;
  showInvite: boolean;
  disableInviteForm: boolean;
  showIncome: boolean;
  incomeChecked: boolean;
  amountDue: any;

  todayDate : any;
  showRejectAppeal: boolean = false;
  myDate = new Date();
  selectedBusinessId: any;
  appealValidityStatus: boolean;
  userRole: string;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private sess: SessionService,
    private titleService: Title,
    private modalService: NgbModal,
    public datepipe: DatePipe,
    private utilityService: UtilityService,
    private spinnerService: Ng4LoadingSpinnerService
  ) 
  {
    this.todayDate = this.datepipe.transform(this.myDate, 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.initialiseForms();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getReassessmentAppeals(
      this.config.itemsPerPage,
      this.config.currentPage
    );

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );

    this.today = new Date();

    console.log("token: ", localStorage.getItem("admin_access_token"));
    this.userRole = localStorage.getItem("admin_role_id");

    if (this.userRole == "1") {
      this.showTaxOffice = true;
    }

    if (this.userRole == "2") {
      this.showApproveAppeal = true;
      this.managerRole = true;
      this.disableInviteForm = null;
    }

    if (this.userRole == "3") {
      this.editorRole = true;
      this.disableInviteForm = true;
    }

    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      // size: 'lg'
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
        // { extend: 'csv',   className: 'btn btn-outline-dark', text: '<i class="fas fa-file-csv"> CSV</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}},
        // { extend: 'excel', className: 'btn btn-outline-dark', text: '<i class="fas fa-file-excel"> Excel</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} },
        // { extend: 'pdf',   className: 'btn btn-outline-dark', text: '<i class="fas fa-file-pdf"> PDF</i>' , orientation: 'landscape', pageSize: 'LEGAL', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}},
        // { extend: 'print', className: 'btn btn-outline-dark', text: '<i class="far fas fa-print"> Print</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } }
      ],
    };
  }

  public daterange: any = {};

  // see original project for full list of options
  // can also be setup using the config service to apply to multiple pickers
  public options: any = {
    locale: { format: "YYYY-MM-DD" },
    alwaysShowCalendars: false,
  };

  public selectedDate(value: any, datepicker?: any) {
    // this is the date  selected
    console.log("selectedDate: ", value);

    // any object can be passed to the selected event and it will be passed back here
    // datepicker.start = value.start;
    // datepicker.end = value.end;

    // use passed valuable to update state
    this.daterange.start = value.start.format("YYYY-MM-DD");
    this.daterange.end = value.end.format("YYYY-MM-DD");
    this.daterange.label = value.label;
  }

  initialiseForms() {
    this.appealForm = this.formBuilder.group({
      dateAppealed: [""],
      // documentUrl: [""],
      reason: [""],
      description: [""],
      approvalStatus: [""],
      comment: ["No decision yet"],
      assessmentId: [""],
    });

    this.corporateForm = this.formBuilder.group({
      companyName: [""],
      companyTIN: [""],
      taxPayerID: [""],
    });

    this.initialiseApproveAppealForm();

    this.initialiseInviteForm();

    this.forwardAppealForm = this.formBuilder.group({
      message: ["", Validators.required],
      messageTitle: ["", Validators.required],
    });

    this.searchForm = this.formBuilder.group({
      taxYear: [""],
      daterangeInput: [""],
      objectionFromId: [""],
      approvalStatusId: [""],
    });
  }

  initialiseInviteForm() {
    this.inviteForm = this.formBuilder.group({
      inviteMessage: ["", Validators.required],
      inviteDate: ["", Validators.required],
      inviteTime: ["", [Validators.required, Validators.pattern(/^([0-1]\d|2[0-3])(:([0-5]\d|2[0-9]))$/)]],
    });
  }

  initialiseApproveAppealForm() {
    this.approveAppealForm = this.formBuilder.group({
      income: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/),
        ],
      ],
      taxDue: [""],
      message: [
        "",
        [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)],
      ],
    });
  }

  getReassessmentAppeals(perpage, pageno) {
    this.spinnerService.show();
    this.apiUrl =
      environment.AUTHAPIURL + "reassessment-appeals/list?page=" + pageno;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;

    this.httpClient
      .post<any>(this.apiUrl, this.searchObject, { headers: reqHeader })
      .subscribe((data) => {
        console.log("reassessmentAppealsData: ", data);
        this.reassessmentAppealsData =
          data.response?.data == null ? [] : data.response?.data;
        this.config.totalItems = data.response.total;
        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.reassessmentAppealsData = "";
    this.router.navigate(["/reassessmentappeals"], {
      queryParams: { page: newPage },
    });
    this.getReassessmentAppeals(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.reassessmentAppealsData = "";
    this.router.navigate(["/reassessmentappeals"]);
    this.getReassessmentAppeals(this.config.itemsPerPage, 1);
  }

  viewReassessmentAppeal(modal, selectedAppeal) {
    console.log("selectedAppeal: ", selectedAppeal);
    this.showModal(modal);
    this.showRejectAppeal = false;
    this.appealId = selectedAppeal.id;
    this.amountDue = selectedAppeal.amount;
    this.selectedCorporateId = selectedAppeal.corporate_id;
    this.selectedBusinessId = selectedAppeal.business_primary_id;
    // this.appealApprovalStatus = selectedAppeal.status;
    this.reassessmentId = selectedAppeal.reassessment_id;
    this.isAppealSubmitted = selectedAppeal.submitted == 0 ? false : true;
    this.getSingleReassessmentAppeal(
      selectedAppeal.id,
      selectedAppeal.reassessment_id
    );
  }

  loadSelectedAppealData(selectedAppeal) {
    this.appealApprovalStatus = selectedAppeal.status == 1 || selectedAppeal.status == 2 ? true : null;
    this.appealValidityStatus = selectedAppeal.invite_validity == 0 ? true : null;
    
    let approvalStatus =
      selectedAppeal.status == 0
        ? "In Progress"
        : selectedAppeal.status == 1
        ? "Approved"
        : "Rejected";

    this.appealForm = this.formBuilder.group({
      dateAppealed: [
        this.datepipe.transform(selectedAppeal.created_at, "dd MMM yyyy"),
      ],
     
      approvalStatus: [approvalStatus],
      description: [selectedAppeal.message],
      reason: [selectedAppeal.message_title],

      comment: [selectedAppeal.admin_message],
      assessmentId: [selectedAppeal.reassessment_id],
    });

    if (this.invites.length > 0) {
      var d1 = Date.parse(this.todayDate);
      var d2 = Date.parse(this.invites[0].invite_date);

      if ((d1 >= d2) && (this.userRole == "2")) {
        this.showRejectAppeal = true;
      }
      
      this.showInvite = true;
      console.log("invite ", this.invites);
      this.inviteForm = this.formBuilder.group({
        inviteMessage: [this.invites[0].comments],
        inviteDate: [this.invites[0].invite_date],
        inviteTime: [this.invites[0].invite_time],
      });
    }
    else {
      this.showInvite = null;
      this.initialiseInviteForm();
    }

  }

  getSingleReassessmentAppeal(appealId, reassessmentId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}reassessment-appeals/${appealId}?corporate_id=${this.selectedCorporateId}&reassessment_id=${reassessmentId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("selectedAppealData: ", data);
        this.selectedAppeal = data.response;
        this.files = data.response.files;
        this.corporateId = data.response.corporate_id;
        this.invites = data.response.invites;
        this.loadSelectedAppealData(this.selectedAppeal);
        this.spinnerService.hide();
      });
  }

  approveAppeal(modal, approvalStatus) {
    this.appealModalTitle = "Approve Objection";
    this.approvalStatus = approvalStatus;
    this.initialiseApproveAppealForm();
    this.showModal(modal);
  }

  rejectAppeal(modal, approvalStatus) {
    this.appealModalTitle = "This action cannot be reversed / undone";
    this.approvalStatus = approvalStatus;
    this.showModal(modal);
  }

  onSubmitInvite(formAllData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.inviteForm.invalid) {
      return;
    }
    this.apiUrl = environment.AUTHAPIURL + "reassessment-invite";

    const config = {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
      },
    };

    const obj = {
      reassessment_appeals_id: this.appealId,
      invite_date: formAllData.inviteDate,
      invite_time: formAllData.inviteTime,
      comments: formAllData.inviteMessage,
      corporate_id: this.corporateId,
      business_id: this.selectedBusinessId,
    };

    // console.log("wertyu ", obj);
    this.spinnerService.show();

    this.httpClient.post<any>(this.apiUrl, obj, config).subscribe((data) => {
      console.log(data);

      if (data.status === true) {
        Object.keys(this.appealForm.controls).forEach((key) => {
          this.appealForm.get(key).setErrors(null);
        });

        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message,
          showConfirmButton: true,
          timer: 5000,
        });
        this.modalService.dismissAll();
        this.getReassessmentAppeals(this.config.itemsPerPage, this.config.currentPage);
        this.spinnerService.hide();
      } else {
        this.spinnerService.hide();

        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.message,
          showConfirmButton: true,
          timer: 5000,
        });
      }
    });
  }

  onSubmitApproveAppeal(formAllData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.approveAppealForm.invalid) {
      return;
    }

    const submitObj = {
      comment: "Objection submitted by Manager",
      reassessment_id: this.reassessmentId,
      submitted: true,
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
    };

    const approveObj = {
      reassessment_id: this.reassessmentId,
      reassessment_appeal_id: this.appealId,
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
      admin_message: formAllData.message,
      admin_message_title: formAllData.messageTitle,
      status: this.approvalStatus,

      input_new_income: true,
      estimated_total_income: formAllData.income,
    };

    console.log("approveAppealData: ", approveObj);
    this.postSubmitAppeal(submitObj, approveObj);
  }

  postSubmitAppeal(jsonData: any, approveJsonData) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}reassessment-appeals`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    if (this.isAppealSubmitted) {
      this.postApproveAppeal(approveJsonData);
    } else {
      this.httpClient
        .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
        .subscribe((data) => {
          console.log("submitAppealApiData: ", data);

          if (data.status === true) {
            this.spinnerService.hide();
            this.postApproveAppeal(approveJsonData);
            // this.submitResponse = true;
          } else {
            this.spinnerService.hide();
            this.subbmitErrorMessage =
              data.response != null && data.response[0] != undefined
                ? data.response[0].message
                : data.message;
            // this.submitResponse = false;
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text:
                data.response != null && data.response[0] != undefined
                  ? data.response[0].message
                  : data.message,
              showConfirmButton: true,
              timer: 5000,
            });
          }
        });
    }
  }

  postApproveAppeal(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}reassessment-appeals-approve`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("approveAppealApiData: ", data);

        if (data.status === true) {
          // Rest form fithout errors
          this.approveAppealForm.reset();
          Object.keys(this.approveAppealForm.controls).forEach((key) => {
            this.approveAppealForm.get(key).setErrors(null);
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

          this.getReassessmentAppeals(
            this.config.itemsPerPage,
            this.config.currentPage
          );
          this.spinnerService.hide();
          this.modalService.dismissAll();
        } else {
          this.spinnerService.hide();

          Swal.fire({
            icon: "error",
            title: "Oops...",
            text:
              data.response != null && data.response[0] != undefined
                ? data.response[0].message
                : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  forwardAppeal(modal) {
    this.showModal(modal);
  }

  onSubmitForwardAppeal(formAllData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.forwardAppealForm.invalid) {
      return;
    }

    const obj = {
      message: formAllData.message,
      message_title: formAllData.messageTitle,
      reassessment_id: this.reassessmentId,
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
      submitted: null,
    };

    console.log("forwardAppealFormData: ", obj);
    this.postForwardAppeal(obj);
    this.submitted = false;
    this.initialiseForms();
  }

  postForwardAppeal(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}reassessment-appeals`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("forwardAppealApiData: ", data);

        if (data.status === true) {
          // Rest form fithout errors
          this.forwardAppealForm.reset();
          Object.keys(this.forwardAppealForm.controls).forEach((key) => {
            this.forwardAppealForm.get(key).setErrors(null);
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

          // this.getReassessments();
          this.spinnerService.hide();
          this.modalService.dismissAll();
        } else {
          this.spinnerService.hide();

          Swal.fire({
            icon: "error",
            title: "Oops...",
            text:
              data.response != null && data.response[0] != undefined
                ? data.response[0].message
                : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  changed(event) {
    if (event.target.checked) {
      this.showIncome = true;
      this.incomeChecked = true;

      this.approveAppealForm.get("income").setValidators(Validators.required);
      this.approveAppealForm.get("income").updateValueAndValidity();
      // console.log("I'm here!");
    }
  }

  previous(event) {
    if (event.target.checked) {
      this.showIncome = false;
      this.incomeChecked = false;

      this.approveAppealForm.get('income').clearValidators();
      this.approveAppealForm.get('income').updateValueAndValidity();
      // console.log("I'm not here!");
    }
  }

  calculateTaxdue() {
    let totalIncome = Number(this.approveAppealForm.get("income").value);
    let taxDue = this.utilityService.calculateAmountTaxDue(totalIncome);
    this.approveAppealForm.controls["taxDue"].setValue(taxDue);
  }

  onSubmitRejectAppeal() {
    const submitObj = {
      comment: "Objection submitted by Manager",
      reassessment_id: this.reassessmentId,
      submitted: true,
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
    };

    const approveObj = {
      reassessment_id: this.reassessmentId,
      reassessment_appeal_id: this.appealId,
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
      admin_message: "Objection rejected by Manager",
      admin_message_title: "Rejected",
      status: this.approvalStatus,
    };

    console.log("approveAppealData: ", approveObj);
    this.postSubmitAppeal(submitObj, approveObj);
  }

  onSubmitSearch(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.searchForm.invalid) {
      return;
    }

    this.searchObject = {
      tax_year: formAllData.taxYear,
      status: formAllData.approvalStatusId,
      date_start:
        this.daterange.start !== undefined ? this.daterange.start : null,
      date_end: this.daterange.end !== undefined ? this.daterange.end : null,
      application_id: formAllData.objectionFromId,
    };

    console.log("searchFormData: ", this.searchObject);
    this.getReassessmentAppeals(
      this.config.itemsPerPage,
      this.config.currentPage
    );
  }

  clearSearch() {
    this.reassessmentAppealsData = "";
    this.searchObject = {};
    this.initialiseForms();
    this.getReassessmentAppeals(
      this.config.itemsPerPage,
      this.config.currentPage
    );
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
}
