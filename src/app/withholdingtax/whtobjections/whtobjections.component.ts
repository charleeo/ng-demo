import { Component, OnInit } from '@angular/core';
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
  selector: 'app-whtobjections',
  templateUrl: './whtobjections.component.html',
  styleUrls: ['./whtobjections.component.css']
})
export class WhtobjectionsComponent implements OnInit {
  roleID: string;
  title = "WHT - Objections";
  config: any;
  modalOptions: NgbModalOptions;
  dtOptions: any = {};
  apiUrl: string;
  currentPageLength: any = 10;
  searchObject: any = {};
  appealsData: any;
  taxpayerId: any;
  managerRole: boolean;
  editorRole: boolean;
  selectedAppealId: any;
  amountDue: any;
  selectedAppeal: any;
  individualId: any;
  fileData: any;
  invites: any;
  approvalStatus: any;
  appealApprovalStatus: boolean;
  appealValidityStatus: boolean;
  appealSubmitted: any;
  date: Date;
  closeResult: string;
  appealForm: FormGroup;
  showRejectAppeal: boolean;
  showInvite: boolean;
  todayDate: string;
  inviteForm: FormGroup;
  submitted: boolean;
  inviteDateHigh: boolean;
  inviteDateLow: boolean;
  disableInviteForm: boolean;
  appealModalTitle: string;
  approveAppealForm: FormGroup;
  showApproveAppeal: boolean;
  selectedAssessment: any;
  assessmentDueDate: any;
  assessmentType: any;
  showIncome: boolean;
  incomeChecked: boolean;
  selectedTaxpayerId: any;
  today: Date;

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
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.roleID = localStorage.getItem("admin_role_id");

    if (this.roleID == "2") {
      this.disableInviteForm = null;
      this.managerRole = true;
      this.showApproveAppeal = true;
    }
    else {
      this.managerRole = false;
      this.disableInviteForm = true;
    }

    if (this.roleID == "3") {
      this.editorRole = true;
    }

    this.initialiseForms();
    this.intialiseTableProperties();

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

    this.today = new Date();
    this.todayDate = this.formatDate(this.today);
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

      ],
    };
  }

  initialiseForms() {
    this.initialiseInviteForm();
    this.initialiseApproveAppealForm();

    this.appealForm = this.formBuilder.group({
      dateAppealed: [""],
      reason: [""],
      description: [""],
      approvalStatus: [""],
      comment: ["No decision yet"],
      assessmentId: [""],
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

  formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  getAppeals(perpage, pageno) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}wht/assessment-appeals/list?page=${pageno}`;

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, this.searchObject, { headers: reqHeader }).subscribe((data) => {
        console.log("appealsData: ", data);
        this.appealsData = data.response == null ? [] : data.response.data;
        this.config.totalItems = data.response.total;
        // this.taxpayerId = data.response.data[0]?.taxpayer_id;
        this.spinnerService.hide();
      });
  }

  getTaxYear(taxDueDate: string): string {
    var taxYear = taxDueDate.split("-", 3)[0];
    return taxYear;
  }

  viewAppeal(modal, selectedAppeal) {
    console.log("selectedAppeal: ", selectedAppeal);
    this.selectedAppealId = selectedAppeal.id;
    this.amountDue = selectedAppeal.amount_due;
    this.selectedTaxpayerId = selectedAppeal.collector_taxpayer_id;

    // console.log(this.appealValidityStatus);this.selectedTaxpayerId
    this.getSingleAppeal(selectedAppeal.id);
    this.showModal(modal);
  }

  getSingleAppeal(appealId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}wht/assessment-appeals/${appealId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      console.log("selectedAppealData: ", data);
      this.selectedAppeal = data.response;
      this.fileData = data.response?.files;
      this.invites = data.response?.invites;
      // this.individualId = data.response?.individual_id;
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
      reason: [selectedAppeal.message_title],
      description: [selectedAppeal.message],
      approvalStatus: [approvalStatus],
      comment: [selectedAppeal.admin_message],
      assessmentId: [selectedAppeal.wht_assessment_id],
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

  onSubmitInvite(formAllData) {
    this.submitted = true;
    this.caculateInviteDays();

    // stop the process here if form is invalid
    if (this.inviteForm.invalid || this.inviteDateHigh || this.inviteDateLow) {
      return;
    }

    this.apiUrl = `${environment.AUTHAPIURL}wht/invite-for-meeting`;

    const config = {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
      },
    };

    const obj = {
      id: this.selectedAppealId,
      invite_date: formAllData.inviteDate,
      invite_time: formAllData.inviteTime,
      comment: formAllData.inviteMessage,
      // individual_id: this.individualId,
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

  caculateInviteDays() {
    let currentDate = Date.parse(this.todayDate);
    let inviteDate = Date.parse(this.inviteForm.get('inviteDate').value);

    if (isNaN(inviteDate)) {
      return;
    }

    let numOfDays = Math.round((inviteDate - currentDate) / (1000 * 60 * 60 * 24));

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

  onSubmitRejectAppeal() {
    const approveObj = {
      id: this.selectedAppealId,
      admin_message: "Rejected",
      input_new_tax_amount: false,
      collector_taxpayer_id: this.selectedTaxpayerId,
      approved: this.approvalStatus,
    };

    this.postApproveAppeal(approveObj);
  }

  postApproveAppeal(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}wht/assessment-appeals/approve`;

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
        input_new_tax_amount: true,
        collector_taxpayer_id: this.selectedTaxpayerId,
        tax_amount_due: formAllData.income,
        approved: this.approvalStatus,
      };

      console.log("approveAppealData: ", approveObj);
      this.postApproveAppeal(approveObj);
    } 
    else {
      const approveObj = {
        id: this.selectedAppealId,
        admin_message: formAllData.message,
        input_new_tax_amount: false,
        collector_taxpayer_id: this.selectedTaxpayerId,
        approved: this.approvalStatus,
      };
      console.log("approveAppealData: ", approveObj);
      this.postApproveAppeal(approveObj);
    }
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

  calculateTaxdue() {
    let totalIncome = Number(this.approveAppealForm.get("income").value);
    let taxDue = this.utilityService.calculateAmountTaxDue(totalIncome);
    this.approveAppealForm.controls["taxDue"].setValue(taxDue);
  }


  pageChange(newPage: number) {
    this.appealsData = "";
    this.router.navigate(["/whtobjections"], {
      queryParams: { page: newPage },
    });
    this.getAppeals(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.appealsData = "";
    this.router.navigate(["/whtobjections"]);
    this.getAppeals(this.config.itemsPerPage, 1);
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
