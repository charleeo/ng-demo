import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../../session.service";
import { environment } from "../../../environments/environment";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import * as $ from "jquery";
import Swal from "sweetalert2";
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { DatePipe } from "@angular/common";
import { UtilityService } from "src/app/utility.service";

@Component({
  selector: "app-individualappeals",
  templateUrl: "./individualappeals.component.html",
  styleUrls: ["./individualappeals.component.css"],
})
export class IndividualappealsComponent implements OnInit {
  apiUrl: string;
  appealsData: any;
  taxpayerId: any;
  title = "Direct Assessment - Individual Objection";
  roleID: string;
  closeResult: string;
  modalOptions: NgbModalOptions;
  dtOptions: any = {};
  selectedAppeal: any;
  appealForm: FormGroup;
  approveAppealForm: FormGroup;
  date: Date;
  approvalStatus: any;
  appealSubmitted: any;
  submitted: boolean = false;
  showApproveAppeal: boolean = false;
  appealApprovalStatus: any;
  appealModalTitle: string;
  selectedAppealId: any;
  editorRole: boolean;
  selectedAssessment: any;
  declarationForm: FormGroup;
  reliefForm: FormGroup;
  deductionForm: FormGroup;
  deductionView: boolean;
  reliefView: boolean;
  incomeView: boolean = true;
  deductionFormData: any;
  declarationFormData: any;
  assessmentType: any;
  assessmentDueDate: any;
  config: any;
  fileData: any;
  currentPageLength: any = 10;
  searchObject: any = {};
  searchForm: FormGroup;
  inviteForm: FormGroup;
  individualId: any;
  managerRole: boolean = false;
  invites: any;
  showInvite: boolean;
  showIncome: boolean;
  incomeChecked: boolean;
  disableInviteForm: any;
  amountDue: any;

  todayDate : any;
  showRejectAppeal: boolean = false;
  myDate = new Date();
  inviteDateHigh: boolean;
  inviteDateLow: boolean;
  appealValidityStatus: boolean;

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
    private utilityService: UtilityService,
    private sess: SessionService,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalService: NgbModal,
    private datepipe: DatePipe,
    private formBuilder: FormBuilder
  ) 
  {
    this.todayDate = this.datepipe.transform(this.myDate, 'yyyy-MM-dd');
  }

  ngOnInit(searchObj = null): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.roleID = localStorage.getItem("admin_role_id");

    if (this.roleID == "2") {
      this.disableInviteForm = null;
      this.managerRole = true;
    } else {
      this.managerRole = false;
      this.disableInviteForm = true;
    }

    if (searchObj == null || searchObj == "") {
      this.appealsData = "";
      this.initialiseForms();
      this.intialiseTableProperties();
      //this.getAppeals();

      /* Pagination Start */
      this.config = {
        currentPage: 1,
        itemsPerPage: 10,
      };

      this.getAppeals(this.config.itemsPerPage, this.config.currentPage);

      this.route.queryParams.subscribe(
        (params) =>
          (this.config.currentPage = params["page"] ? params["page"] : 1)
      );
    } else {
      this.appealsData = "";

      /* Pagination Start */
      this.config = {
        currentPage: 1,
        itemsPerPage: 10,
      };
      this.getAppeals(this.config.itemsPerPage, this.config.currentPage);

      this.route.queryParams.subscribe(
        (params) =>
          (this.config.currentPage = params["page"] ? params["page"] : 1)
      );
      console.log("searchObj is not null");
    }

    if (this.roleID == "2") {
      this.showApproveAppeal = true;
      // this.managerRole = true;
    }

    if (this.roleID == "3") {
      this.editorRole = true;
    }
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

    this.initialiseInviteForm();

    this.initialiseApproveAppealForm();

    this.initialiseSearch();
    this.initialiseDeclarationForm();
    this.initialiseDeductionForm();
    this.initialiseReliefForm();
  }

  initialiseSearch() {
    this.searchForm = this.formBuilder.group({
      approvalStatusId: [""],
      taxYear: [
        "",
        [
          Validators.pattern(/^(19|20)\d{2}$/),
          Validators.minLength(4),
          Validators.maxLength(4),
        ],
      ],
      objectionFromId: [""],
      daterangeInput: [""],
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

  caculateInviteDays() {
    let currentDate = Date.parse(this.todayDate);
    let inviteDate = Date.parse(this.inviteForm.get('inviteDate').value);

    if (isNaN(inviteDate)) {
      return;
    }

    let numOfDays = Math.round((inviteDate - currentDate) / (1000*60*60*24));
    // console.log("d1: ", currentDate);
    // console.log("d2: ", inviteDate);
    // console.log("d: ", numOfDays);

    if (numOfDays > 91) {
      this.inviteDateHigh = true;
    }
    else {
      this.inviteDateHigh = false;
    }

    if (numOfDays < 1) {
      this.inviteDateLow = true;
    }
    else {
      this.inviteDateLow = false;
    }
  }

  onSubmitInvite(formAllData) {
    this.submitted = true;
    this.caculateInviteDays();

    // stop the process here if form is invalid
    if (this.inviteForm.invalid || this.inviteDateHigh || this.inviteDateLow) {
      return;
    }

    this.apiUrl = environment.AUTHAPIURL + "direct-assessment-invite";

    const config = {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
      },
    };

    const obj = {
      da_appeals_id: this.selectedAppealId,
      invite_date: formAllData.inviteDate,
      invite_time: formAllData.inviteTime,
      comments: formAllData.inviteMessage,
      individual_id: this.individualId,
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
        this.getAppeals(this.config.itemsPerPage, this.config.currentPage);
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

  initialiseDeclarationForm() {
    this.declarationForm = this.formBuilder.group({
      otherIncome: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      benefit: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      rent: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      interest: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],

      professionalFee: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      commission: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      dividend: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      businessIncome: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(\d{1,2}|\d{0,2}\.\d{1,2})$/),
        ],
      ],
      terminalBonus: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      profitSharing: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      balancingCharge: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      royalty: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      employmentIncome: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      directorFees: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      allowance: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      contract: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
    });
  }

  initialiseDeductionForm() {
    this.deductionForm = this.formBuilder.group({
      gratuities: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      otherDeduction: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      balancingAllowance: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      losses: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      capitalAllowance: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      bonus: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
    });
  }

  initialiseReliefForm() {
    this.reliefForm = this.formBuilder.group({
      consolidateRelief: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      personalRelief: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      nhis: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      nhf: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      lifeAssurance: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      nps: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      personalAllowance: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      ordinaryShareHolding: [
        "",
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
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
        // {
        //   extend: "csv",
        //   className: "btn btn-outline-dark export-btn",
        //   text: '<i class="fas fa-file-csv"> CSV</i>',
        //   exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
        // },
        // {
        //   extend: "excel",
        //   className: "btn btn-outline-dark export-btn",
        //   text: '<i class="fas fa-file-excel"> Excel</i>',
        //   exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
        // },
        // {
        //   extend: "pdf",
        //   className: "btn btn-outline-dark export-btn",
        //   text: '<i class="fas fa-file-pdf"> PDF</i>',
        //   orientation: "landscape",
        //   pageSize: "LEGAL",
        //   exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
        // },
      ],
    };
  }

  getAppeals(perpage, pageno) {
    this.spinnerService.show();
    //this.apiUrl = environment.AUTHAPIURL + "direct-assessment-appeals/list";
    this.apiUrl =
      environment.AUTHAPIURL + "direct-assessment-appeals/list?page=" + pageno;
    console.log("qwerty ", pageno);
    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    // let corporateId = localStorage.getItem("corporate_id");

    // const obj = {
    //   // corporate_id: [corporateId],
    //   per_page: perpage,
    //   page_no: pageno,
    // };

    this.httpClient
      .post<any>(this.apiUrl, this.searchObject, { headers: reqHeader })
      .subscribe((data) => {
        console.log("appealsData: ", data);
        this.appealsData = data.response == null ? [] : data.response.data;
        this.config.totalItems = data.response.total;
        this.taxpayerId = data.response.data[0]?.taxpayer_id;
        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.appealsData = "";
    this.router.navigate(["/individualappeals"], {
      queryParams: { page: newPage },
    });
    this.getAppeals(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.appealsData = "";
    this.router.navigate(["/individualappeals"]);
    this.getAppeals(this.config.itemsPerPage, 1);
  }

  viewAppeal(modal, selectedAppeal) {
    console.log("selectedAppeal: ", selectedAppeal);
    this.selectedAppealId = selectedAppeal.id;
    this.amountDue = selectedAppeal.amount_due;

    console.log(this.appealValidityStatus);

    this.getSingleAppeal(selectedAppeal.id);
    this.showModal(modal);
  }

  getSingleAppeal(appealId) {
    // this.invites = '';
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}direct-assessment-appeals/${appealId}/show`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    // const obj = {
    //   id: appealId,
    // };

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("selectedAppealData: ", data);
        this.selectedAppeal = data.response;
        this.fileData = data.response.files;
        this.invites = data.response.invites;
        this.individualId = data.response.individual_id;
        this.loadSelectedAppealData(this.selectedAppeal);
        this.spinnerService.hide();
      });
  }

  loadSelectedAppealData(selectedAppeal) {
    this.approvalStatus = selectedAppeal.status;
    this.appealApprovalStatus = selectedAppeal.status == 1 || selectedAppeal.status == 2 ? true : null;
    this.appealValidityStatus = selectedAppeal.invite_validity == 0 ? true : null;
    this.appealSubmitted = selectedAppeal.submitted;
    let approvalStatus =
      selectedAppeal.status == 0
        ? "In Progress"
        : selectedAppeal.status == 1
        ? "Approved"
        : "Rejected";

    this.date = new Date(selectedAppeal.created_at);
    let appealedDate = this.datepipe.transform(this.date, "dd MMM yyyy");

    this.appealForm = this.formBuilder.group({
      dateAppealed: [appealedDate],
      // documentUrl: [selectedAppeal.file_url],
      reason: [selectedAppeal.message_title],
      description: [selectedAppeal.message],
      approvalStatus: [approvalStatus],
      comment: [selectedAppeal.admin_message],
      assessmentId: [selectedAppeal.direct_assessment_id],
    });

    if (this.invites?.length > 0) {
      var d1 = Date.parse(this.todayDate);
      var d2 = Date.parse(this.invites[0].invite_date);

      if (d1 >= d2) {
        this.showRejectAppeal = true;
        // console.log("Here!");
      }

      this.showInvite = true;
      console.log("invite: ", this.invites);
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

  onSubmitApproveAppeal(formAllData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.approveAppealForm.invalid) {
      return;
    }

    if (this.incomeChecked == true) {
      const approveObj = {
        id: this.selectedAppealId,
        admin_message: formAllData.message,
        input_new_income: true,
        estimated_total_income: formAllData.income,
        approved: this.approvalStatus,
      };

      console.log("approveAppealData: ", approveObj);
      this.postApproveAppeal(approveObj);
    } else {
      const approveObj = {
        id: this.selectedAppealId,
        admin_message: formAllData.message,
        input_new_income: false,
        approved: this.approvalStatus,
      };
      console.log("approveAppealData: ", approveObj);
      this.postApproveAppeal(approveObj);
    }
  }

  onSubmitRejectAppeal() {
    const approveObj = {
      id: this.selectedAppealId,
      admin_message: "Rejected",
      input_new_income: false,
      approved: this.approvalStatus,
    };

    this.postApproveAppeal(approveObj);
  }

  calculateTaxdue() {
    let totalIncome = Number(this.approveAppealForm.get("income").value);
    let taxDue = this.utilityService.calculateAmountTaxDue(totalIncome);
    this.approveAppealForm.controls["taxDue"].setValue(taxDue);
  }

  postApproveAppeal(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}direct-assessment-appeals/verdict`;

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

          this.getAppeals(this.config.itemsPerPage, this.config.currentPage);
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
    this.getAppeals(this.config.itemsPerPage, this.config.currentPage);
  }

  editAppeal(modal, selectedAppeal) {
    console.log("selectedAppeal: ", selectedAppeal);
    // this.appealApprovalStatus = selectedAppeal.status;
    // this.selectedAppealId = selectedAppeal.id;

    this.getSingleAssessment(selectedAppeal.direct_assessment_id);
    this.showModal(modal);
  }

  getSingleAssessment(assessmentId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}direct-assessments/${assessmentId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleAssessmentData: ", data);
        this.selectedAssessment = data.response;
        // this.assessmentEmployeesData = data.response.calculated_values;
        this.assessmentDueDate = this.selectedAssessment.due_date;
        this.taxpayerId = this.selectedAssessment.taxpayer_id;
        this.assessmentType = this.selectedAssessment.assessment_type;
        this.loadSelectedAssessmentData(this.selectedAssessment.d_a_records);
        this.spinnerService.hide();
      });
  }

  changed(event) {
    if (event.target.checked) {
      this.showIncome = true;
      this.incomeChecked = true;

      this.approveAppealForm.get("income").setValidators(Validators.required);
      this.approveAppealForm.get("income").updateValueAndValidity();
    }
  }

  previous(event) {
    if (event.target.checked) {
      this.showIncome = false;
      this.incomeChecked = false;

      this.approveAppealForm.get('income').clearValidators();
      this.approveAppealForm.get('income').updateValueAndValidity();
    }
  }

  loadSelectedAssessmentData(selectedAssessment) {
    this.loadDeclarationForm(selectedAssessment);
    this.loadDeductionForm(selectedAssessment);
    this.loadReliefForm(selectedAssessment);
  }

  loadDeclarationForm(selectedAssessment) {
    this.declarationForm = this.formBuilder.group({
      otherIncome: [
        selectedAssessment.other_income,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      benefit: [
        selectedAssessment.benefit_of_kind,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      rent: [
        selectedAssessment.rent,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      interest: [
        selectedAssessment.interest,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],

      professionalFee: [
        selectedAssessment.consultancy_fee,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      commission: [
        selectedAssessment.commission,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      dividend: [
        selectedAssessment.dividend,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      businessIncome: [
        selectedAssessment.trade_business_income,
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      terminalBonus: [
        selectedAssessment.terminal_bonus,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      profitSharing: [
        selectedAssessment.profit_sharing,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      balancingCharge: [
        selectedAssessment.balancing_charge,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      royalty: [
        selectedAssessment.royalty,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      employmentIncome: [
        selectedAssessment.employment,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      directorFees: [
        selectedAssessment.director_fees,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      allowance: [
        selectedAssessment.allowance,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      contract: [
        selectedAssessment.contract,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
    });
  }

  loadDeductionForm(selectedAssessment) {
    this.deductionForm = this.formBuilder.group({
      gratuities: [
        selectedAssessment.gratuities,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      otherDeduction: [
        selectedAssessment.other_deductions,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      balancingAllowance: [
        selectedAssessment.balancing_allowance,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      losses: [
        selectedAssessment.losses,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      capitalAllowance: [
        selectedAssessment.capital_allowance,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      bonus: [
        selectedAssessment.bonus,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
    });
  }

  loadReliefForm(selectedAssessment) {
    this.reliefForm = this.formBuilder.group({
      consolidateRelief: [
        selectedAssessment.cra,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      personalRelief: [
        selectedAssessment.pra,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      nhis: [
        selectedAssessment.nhis,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      nhf: [
        selectedAssessment.nhf,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      lifeAssurance: [
        selectedAssessment.life_assurance,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      nps: [
        selectedAssessment.nps,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      personalAllowance: [
        selectedAssessment.personal_allowance,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      ordinaryShareHolding: [
        selectedAssessment.ordinary_share,
        [
          // Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
    });
  }

  backToDeclarationForm() {
    this.submitted = false;

    if (this.deductionForm.invalid) {
      Swal.fire({
        icon: "info",
        title: "Information",
        text: "Please complete all input fields",
        showConfirmButton: true,
        timer: 7000,
        timerProgressBar: true,
      });
      return;
    }

    if (this.reliefForm.invalid) {
      Swal.fire({
        icon: "info",
        title: "Information",
        text: "Please complete all input fields",
        showConfirmButton: true,
        timer: 7000,
        timerProgressBar: true,
      });
      return;
    }

    // this.loadIncome(this.incomeInfo);

    this.deductionView = false;
    this.reliefView = false;
    this.incomeView = true;
  }

  backToDeductionForm() {
    this.submitted = false;

    if (this.declarationForm.invalid) {
      Swal.fire({
        icon: "info",
        title: "Information",
        text: "Please complete all input fields",
        showConfirmButton: true,
        timer: 7000,
        timerProgressBar: true,
      });
      return;
    }

    if (this.reliefForm.invalid) {
      Swal.fire({
        icon: "info",
        title: "Information",
        text: "Please complete all input fields",
        showConfirmButton: true,
        timer: 7000,
        timerProgressBar: true,
      });
      return;
    }

    // this.createIncomeDetailObj(this.incomeInfo);
    // this.loadDeduction(this.deductionInfo);

    this.incomeView = false;
    this.reliefView = false;
    this.deductionView = true;
  }

  backToReliefForm() {
    this.submitted = false;

    if (this.declarationForm.invalid) {
      Swal.fire({
        icon: "info",
        title: "Information",
        text: "Please complete all input fields",
        showConfirmButton: true,
        timer: 7000,
        timerProgressBar: true,
      });
      return;
    }

    if (this.deductionForm.invalid) {
      Swal.fire({
        icon: "info",
        title: "Information",
        text: "Please complete all input fields",
        showConfirmButton: true,
        timer: 7000,
        timerProgressBar: true,
      });
      return;
    }

    // this.createIncomeDetailObj(this.incomeInfo);
    // this.createDeductionDetailObj(this.deductionInfo);
    // this.loadRelief(this.reliefInfo);

    this.incomeView = false;
    this.deductionView = false;
    this.reliefView = true;
  }

  onSubmitDeduction(formAllData) {
    this.submitted = true;

    if (this.deductionForm.invalid) {
      return;
    }

    console.log("deductionFormData: ", formAllData);
    this.deductionFormData = formAllData;

    this.submitted = false;
    this.deductionView = false;
    this.reliefView = true;
  }

  onSubmitDeclaration(formAllData) {
    this.submitted = true;

    if (this.declarationForm.invalid) {
      return;
    }

    console.log("declarationFormData: ", formAllData);
    this.declarationFormData = formAllData;

    this.submitted = false;
    this.incomeView = false;
    this.deductionView = true;
  }

  onSubmitRelief(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.reliefForm.invalid) {
      return;
    }

    const obj = {
      taxpayer_id: this.taxpayerId,
      due_date: this.getTaxYear(this.assessmentDueDate),
      assessment_type: this.assessmentType,

      trade_business_income: this.declarationFormData.businessIncome,
      other_income: this.declarationFormData.otherIncome,
      terminal_bonus: this.declarationFormData.terminalBonus,
      profit_sharing: this.declarationFormData.profitSharing,
      employment: this.declarationFormData.employmentIncome,
      director_fees: this.declarationFormData.directorFees,
      contract: this.declarationFormData.contract,
      commission: this.declarationFormData.commission,
      consultancy_fee: this.declarationFormData.professionalFee,
      benefit_of_kind: this.declarationFormData.benefit,
      income_allowance: this.declarationFormData.allowance,
      dividend: this.declarationFormData.dividend,
      rent: this.declarationFormData.rent,
      interest: this.declarationFormData.interest,
      balancing_charge: this.declarationFormData.balancingCharge,
      royalty: this.declarationFormData.royalty,

      gratuities: this.deductionFormData.gratuities,
      other_deductions: this.deductionFormData.otherDeduction,
      bonus: this.deductionFormData.bonus,
      losses: this.deductionFormData.losses,
      capital_allowance: this.deductionFormData.capitalAllowance,
      balancing_allowance: this.deductionFormData.balancingAllowance,

      cra: formAllData.consolidateRelief,
      nhis: formAllData.nhis,
      life_assurance: formAllData.lifeAssurance,
      personal_allowance: formAllData.personalAllowance,
      pra: formAllData.personalRelief,
      nhf: formAllData.nhf,
      nps: formAllData.nps,
      ordinary_share: formAllData.ordinaryShareHolding,
    };

    console.log("req-DAta: ", obj);
    this.postUpdateAssessmentData(obj);
  }

  postUpdateAssessmentData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}direct-assessment-update`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log(data);

        if (data.status == true) {
          // Rest form fithout errors
          this.submitted = false;
          this.reliefForm.reset();
          this.deductionForm.reset();
          this.declarationForm.reset();

          Object.keys(this.reliefForm.controls).forEach((key) => {
            this.reliefForm.get(key).setErrors(null);
          });

          Object.keys(this.deductionForm.controls).forEach((key) => {
            this.deductionForm.get(key).setErrors(null);
          });

          Object.keys(this.declarationForm.controls).forEach((key) => {
            this.declarationForm.get(key).setErrors(null);
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
          this.getAppeals(this.config.itemsPerPage, this.config.currentPage);
          // this.initialiseForms();
          this.spinnerService.hide();
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

  clearSearch() {
    this.appealsData = "";
    this.searchObject = {};
    this.initialiseSearch();
    this.getAppeals(this.config.itemsPerPage, this.config.currentPage);
  }

  getTaxYear(taxDueDate: string): string {
    var taxYear = taxDueDate.split("-", 3)[0];
    return taxYear;
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
