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
import { pipe } from "rxjs";
import { DatePipe } from "@angular/common";
import { ThrowStmt } from "@angular/compiler";
import { UtilityService } from "src/app/utility.service";

@Component({
  selector: "app-individualschedules",
  templateUrl: "./individualschedules.component.html",
  styleUrls: ["./individualschedules.component.css"],
})
export class IndividualschedulesComponent implements OnInit {
  apiUrl: string;
  schedulesData: any;
  dtOptions: any = {};
  modalOptions: NgbModalOptions;
  closeResult: string;
  scheduleEmployeesData: string;
  scheduleCommentsData: string;
  selectedSchedule: any;
  forwardScheduleForm: FormGroup;
  scheduleForm: FormGroup;
  assessmentForm: FormGroup;
  corporateForm: FormGroup;
  addEmployeeForm: FormGroup;
  approvalClosed: boolean;
  submitted: boolean;
  showEditEmployee: boolean = false;
  assessmentGenerated: boolean;
  editEmployeeModalRef: any;
  selectedEmployee: any;
  managerRole: boolean = false;
  editorRole: boolean = false;
  scheduleStatus: any;
  showGenerateAssessment: boolean = false;
  addEmployeeTitle: string;
  showForwardSchedule: boolean;
  taxpayerId: any;
  selectedScheduleId: any;
  assessmentType: any;
  title = "Direct Assessment - Individual Schedule";
  taxpayerName: any;
  ViewerRole: boolean;
  ViewerAndSuper: boolean;
  grossIncome: any;
  config: any;
  currentPageLength: any = 10;
  declarationForm: any;
  incomeView: boolean = true;
  deductionView: boolean;
  reliefForm: FormGroup;
  reliefDetails: any;
  reliefView: boolean;
  incomeDetails: any;
  deductionForm: any;
  deductionDetails: any;
  incomeInfo: any;
  deductionInfo: any;
  reliefInfo: any;
  individualId: any;
  searchForm: FormGroup;

  searchObject: any = {};
  grossIncomeIncorrect: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private sess: SessionService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private titleService: Title,
    private datepipe: DatePipe,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.sess.checkLogin();
    this.titleService.setTitle(this.title);

    this.initialiseForms();
    this.intialiseTableProperties();

    //this.getSchedules();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getSchedules(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );

    var userRole = localStorage.getItem("admin_role_id");

    // if (userRole == "1") {
    //   this.showTaxOffice = true;
    // }

    if (userRole == "2") {
      this.showGenerateAssessment = true;
      this.managerRole = true;
    }

    if (userRole == "3") {
      this.editorRole = true;
      this.showEditEmployee = true;
    }
    if (userRole == "4" || userRole == "1") {
      this.ViewerAndSuper = true;
      this.showGenerateAssessment = true;
    }

    this.initialiseIncomeForms();
    this.initialiseDeductionForm();
    this.initialiseReliefForm();
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
          //targets: [10],
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

  initialiseForms() {
    this.forwardScheduleForm = this.formBuilder.group({
      scheduleYear: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(4),
          Validators.maxLength(4),
        ],
      ],
      comment: [""],
    });

    this.assessmentForm = this.formBuilder.group({
      assessmentYear: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(4),
          Validators.maxLength(4),
        ],
      ],
      // assessmentMonthId: ["", Validators.required],
    });

    this.scheduleForm = this.formBuilder.group({
      forwardedTo: [""],
      assessmentStatus: [""],
      dateForwarded: [""],
      // status: [""],
      dueDate: [""],
      // corporateId: [""],
      // createdAt: [""],
    });

    this.corporateForm = this.formBuilder.group({
      companyName: [""],
      companyTIN: [""],
      taxPayerID: [""],
    });

    this.searchForm = this.formBuilder.group({
      statusId: [""],
      taxPayerName: [""],
      invoiceID: [""],
      // generatedFromId: [''],
      taxYear: [
        "",
        [
          Validators.pattern(/^(19|20)\d{2}$/),
          Validators.minLength(4),
          Validators.maxLength(4),
        ],
      ],
    });
  }

  getTaxYear(taxDueDate: string): string {
    var taxYear = taxDueDate.split("-", 3)[0];
    return taxYear;
  }

  getSchedules(perpage, pageno) {
    this.spinnerService.show();
    this.apiUrl =
      environment.AUTHAPIURL +
      "direct-assessment-schedules/list?page=" +
      pageno;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;

    this.httpClient
      .post<any>(this.apiUrl, this.searchObject, { headers: reqHeader })
      .subscribe((data) => {
        console.log("schedulesData: ", data);
        this.schedulesData = data.response == null ? [] : data.response.data;
        this.config.totalItems = data.response.total;
        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.schedulesData = "";
    this.router.navigate(["/individualschedules"], {
      queryParams: { page: newPage },
    });
    this.getSchedules(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.schedulesData = "";
    this.router.navigate(["/individualschedules"]);
    this.getSchedules(this.config.itemsPerPage, 1);
  }

  viewSchedule(modal, selectedSchedule) {
    console.log("selectedSchedule: ", selectedSchedule);
    this.showModal(modal);
    this.individualId = selectedSchedule.individual_id;
    this.taxpayerId = selectedSchedule.taxpayer_id;
    this.selectedScheduleId = selectedSchedule.id;
    this.assessmentType = selectedSchedule.assessment_type;
    // this.selectedCorporateId = selectedSchedule.corporate_id;
    this.scheduleStatus = selectedSchedule.forwarded_to;
    this.assessmentGenerated = selectedSchedule.assessment_status;

    this.getSingleSchedule(selectedSchedule.id);
    var array = selectedSchedule.due_date.split("-", 3);
    var dueDateYear = array[0];
    var dueDateMonth = array[1];

    this.assessmentForm = this.formBuilder.group({
      assessmentYear: [dueDateYear],
      // assessmentMonthId: [dueDateMonth],
    });

    this.forwardScheduleForm = this.formBuilder.group({
      scheduleYear: [dueDateYear],
      comment: [""],
    });
  }

  getSingleSchedule(scheduleId) {
    this.spinnerService.show();
    this.scheduleEmployeesData = "";
    this.scheduleCommentsData = "";
    this.apiUrl = `${environment.AUTHAPIURL}direct-assessment-schedules/${scheduleId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleScheduleData: ", data);
        this.selectedSchedule = data.response;
        // this.assessmentID = data.response.schedule.id;
        this.showForwardSchedule =
          this.selectedSchedule.assessment_status === 0 ? false : true;
        // console.log("showForwardSchedule: ", this.showForwardSchedule);
        this.loadSelectedScheduleData(this.selectedSchedule);
        this.spinnerService.hide();
      });
  }

  loadSelectedScheduleData(selectedSchedule) {
    console.log("selectedSchedule: ", selectedSchedule);

    let assessmentStatus =
      selectedSchedule.assessment_status == 0
        ? "Awaiting Action"
        : "Assessment Generated";
    let forwardedTo =
      selectedSchedule.forwarded_to == 1
        ? "Sent back to Tax Officer"
        : selectedSchedule.forwarded_to == 2
        ? "Forwarded to Head of Station"
        : "Not forwaded";
    this.approvalClosed =
      selectedSchedule.assessment_status == 0 ? false : true;
    let dateForwarded = this.datepipe.transform(
      selectedSchedule.date_forwarded,
      "dd MMM yyyy"
    );

    this.scheduleForm = this.formBuilder.group({
      forwardedTo: [forwardedTo],
      assessmentStatus: [assessmentStatus],
      dateForwarded: [dateForwarded],
      dueDate: [selectedSchedule.due_date],
    });

    this.scheduleCommentsData = selectedSchedule.comments;
    this.scheduleEmployeesData = selectedSchedule.direct_assessment_input_data;
    this.grossIncome = selectedSchedule.tax_calculations?.gross_income;
  }

  manageModal(modalReference) {
    modalReference.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  forwardSchedule(modal) {
    this.showModal(modal);
  }

  onSubmitSchedule(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.forwardScheduleForm.invalid) {
      return;
    }

    const obj = {
      comment: formAllData.comment,
      due_date: formAllData.scheduleYear,
      taxpayer_id: this.taxpayerId,
      assessment_type: this.assessmentType,
    };

    console.log("scheduleFormData: ", obj);
    this.postForwardSchedule(obj);
    this.submitted = false;
  }

  postForwardSchedule(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "direct-assessment-schedules";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("scheduleApiResponseData: ", data);

        if (data.status === true) {
          this.scheduleStatus = 1;
          // Rest form fithout errors
          this.forwardScheduleForm.reset();
          Object.keys(this.forwardScheduleForm.controls).forEach((key) => {
            this.forwardScheduleForm.get(key).setErrors(null);
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

          this.getSchedules(this.config.itemsPerPage, this.config.currentPage);
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

  generateAssessment(modal) {
    this.showModal(modal);
  }

  onSubmitAssessment(formAllData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.assessmentForm.invalid) {
      return;
    }

    const obj = {
      direct_assessment_schedule_id: this.selectedScheduleId,
    };

    console.log("assessmentFormData: ", obj);
    this.postGenerateAssessment(obj);
    this.submitted = false;
  }

  postGenerateAssessment(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}direct-assessments/create`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("assessmentApiResponseData: ", data);

        if (data.status === true) {
          // Rest form fithout errors
          this.assessmentForm.reset();
          Object.keys(this.assessmentForm.controls).forEach((key) => {
            this.assessmentForm.get(key).setErrors(null);
          });
          // this.corporateId = data.response.corporate_id;
          // this.processInvoice(data.response.id);
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

          this.getSchedules(this.config.itemsPerPage, this.config.currentPage);
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

  viewDeclaration(modal, data) {
    this.taxpayerId = data.taxpayer_id;
    this.taxpayerName = data.first_name + " " + data.surname;

    this.getIndividualDeclaration();
    this.showModal(modal);
  }

  getIndividualDeclaration() {
    this.apiUrl = environment.AUTHAPIURL + "get-declaration";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {
      individual_id: this.individualId,
    };

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("types: ", data);
        this.incomeInfo = data.response.income_info;
        // this.deductionInfo = data.response.deduction_info;
        // this.reliefInfo = data.response.relief_info;

        this.loadIncome(data.response.income_info);
        this.loadDeduction(data.response.deduction_info);
        this.loadRelief(data.response.relief_info, this.incomeInfo.gross_income);
      });

    this.spinnerService.hide();
  }

  initialiseIncomeForms() {
    //this.spinnerService.show();
    console.log("income: ", this.incomeInfo);
    this.declarationForm = this.formBuilder.group({
      otherIncome: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      benefit: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      rent: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      interest: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],

      professionalFee: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      commission: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      businessIncome: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(\d{1,2}|\d{0,2}\.\d{1,2})$/),
        ],
      ],
      terminalBonus: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      profitSharing: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      totalIncome: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      balancingCharge: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      royalty: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      employmentIncome: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      directorFees: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      allowance: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      contract: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
    });
  }

  initialiseDeductionForm() {
    this.deductionForm = this.formBuilder.group({
      gratuities: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      otherDeduction: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      balancingAllowance: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      losses: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      capitalAllowance: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      bonus: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
    });
  }

  initialiseReliefForm() {
    this.reliefForm = this.formBuilder.group({
      consolidateRelief: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      nhis: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      nhf: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      lifeAssurance: [
        "",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      nps: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      grossIncome: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
    });
  }

  callRelief(formAllData) {
    this.submitted = true;

    if (this.declarationForm.invalid) {
      return;
    }

    this.incomeDetails = {
      other_income: formAllData.otherIncome,
      rent: formAllData.rent,
      benefit_in_kind: formAllData.benefit,
      royalty: formAllData.royalty,
      commission: formAllData.commission,
      trade_business_income: formAllData.businessIncome,
      terminal_bonus: formAllData.terminalBonus,
      profit_sharing: formAllData.profitSharing,
      consultancy_fee: formAllData.professionalFee,
      allowance: formAllData.allowance,
      director_fee: formAllData.directorFees,
      interest: formAllData.interest,
      balancing_charge: formAllData.balancingCharge,
      employment_income: formAllData.employmentIncome,
      contract: formAllData.contract,
      total_income: formAllData.totalIncome,
    };

    this.submitted = false;
    this.incomeView = false;
    this.reliefView = true;
    this.deductionView = false;
  }

  createIncomeDetailObj(incomeObj) {
    this.incomeDetails = {
      other_income: incomeObj.other_income,
      rent: incomeObj.rent,
      benefit_in_kind: incomeObj.benefit_in_kind,
      royalty: incomeObj.royalty,
      commission: incomeObj.commission,
      trade_business_income: incomeObj.trade_business_income,
      terminal_bonus: incomeObj.terminal_bonus,
      profit_sharing: incomeObj.profit_sharing,
      consultancy_fee: incomeObj.consultancy_fee,
      allowance: incomeObj.allowance,
      director_fee: incomeObj.director_fee,
      interest: incomeObj.interest,
      // dividend: incomeObj.dividend,
      balancing_charge: incomeObj.balancing_charge,
      employment_income: incomeObj.employment_income,
      contract: incomeObj.contract,
    };
  }

  loadIncome(income) {
    let i = income;
    let totalIncome =
      i.other_income +
      i.benefit_in_kind +
      i.rent +
      i.interest +
      i.consultancy_fee +
      i.commission +
      i.trade_business_income +
      i.terminal_bonus +
      i.profit_sharing +
      i.balancing_charge +
      i.royalty +
      i.employment_income +
      i.director_fee +
      i.allowance +
      i.contract;

    this.declarationForm = this.formBuilder.group({
      otherIncome: [
        income?.other_income,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      benefit: [
        income?.benefit_in_kind,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      rent: [
        income?.rent,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      interest: [
        income?.interest,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],

      professionalFee: [
        income?.consultancy_fee,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      commission: [
        income?.commission,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      totalIncome: [
        income.total_income == null ? totalIncome : income.total_income,
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      businessIncome: [
        income?.trade_business_income,
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      terminalBonus: [
        income?.terminal_bonus,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      profitSharing: [
        income?.profit_sharing,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      balancingCharge: [
        income?.balancing_charge,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      royalty: [
        income?.royalty,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      employmentIncome: [
        income?.employment_income,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      directorFees: [
        income?.director_fee,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      allowance: [
        income?.allowance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      contract: [
        income?.contract,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
    });
  }

  createDeductionDetailObj(deductionObj) {
    this.deductionDetails = {
      other_deductions: deductionObj.other_deductions,
      gratuities: deductionObj.gratuities,
      balancing_allowance: deductionObj.balancing_allowance,
      losses: deductionObj.losses,
      capital_allowance: deductionObj.capital_allowance,
      bonus: deductionObj.bonus,
    };
  }

  loadDeduction(deduction) {
    this.deductionForm = this.formBuilder.group({
      gratuities: [
        deduction?.gratuities,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      otherDeduction: [
        deduction?.other_deductions,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      balancingAllowance: [
        deduction?.balancing_allowance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      losses: [
        deduction?.losses,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      capitalAllowance: [
        deduction?.capital_allowance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      bonus: [
        deduction?.bonus,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
    });
  }

  loadRelief(relief, grossIncome?) {
    console.log("grossIncome: ", grossIncome);
    this.reliefForm = this.formBuilder.group({
      consolidateRelief: [
        relief?.cra,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      nhis: [
        relief?.nhis,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      nhf: [
        relief?.nhf,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      lifeAssurance: [
        relief?.life_assurance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      nps: [
        relief?.nps,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      grossIncome: [
        grossIncome == null || undefined ? relief?.gross_income : grossIncome,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
    });
  }

  backToDeclarationForm() {
    this.submitted = false;
    // this.createIncomeDetailObj(this.incomeInfo);

    // this.reliefDetails = this.reliefForm.value;
    this.deductionView = false;

    this.reliefView = false;
    this.loadIncome(this.incomeDetails);
    this.incomeView = true;
  }

  backToDeductionForm() {
    this.submitted = false;

    if (this.declarationForm.invalid) {
      this.submitted = true;

      return;
    }
    this.callDeduction(this.reliefForm.value);
    // this.reliefDetails = this.reliefForm.value;

    this.incomeView = false;
    this.reliefView = false;
    this.loadDeduction(this.deductionDetails);
    this.deductionView = true;
  }

  backToReliefForm() {
    this.submitted = false;

    if (this.declarationForm.invalid) {
      this.submitted = true;

      return;
    }

    this.callRelief(this.declarationForm.value);
    this.reliefDetails = {
      life_assurance: this.reliefForm.value.lifeAssurance,
      nhis: this.reliefForm.value.nhis,
      nhf: this.reliefForm.value.nhf,
      nps: this.reliefForm.value.nps,

      cra: this.reliefForm.value.consolidateRelief,
      gross_income: this.reliefForm.value.grossIncome,
    };

    this.incomeView = false;
    this.deductionView = false;
    this.loadRelief(this.reliefDetails);
    this.reliefView = true;
  }

  callDeduction(formAllData) {
    this.submitted = true;

    if (this.deductionForm.invalid) {
      return;
    }
    this.createDeductionDetailObj(this.deductionForm.value);

    this.reliefDetails = {
      life_assurance: formAllData.lifeAssurance,
      nhis: formAllData.nhis,
      nhf: formAllData.nhf,
      nps: formAllData.nps,
      cra: formAllData.consolidateRelief,
      gross_income: formAllData.grossIncome,
    };

    this.incomeDetails.gross_income = formAllData.grossIncome;

    this.submitted = false;
    this.loadDeduction(this.deductionDetails);
    this.deductionView = true;
    this.incomeView = false;
    this.reliefView = false;
  }

  onSubmit(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.reliefForm.invalid) {
      return;
    }

    const obj = {
      individual_id: this.individualId,
      incomes: this.incomeDetails,
      deductions: {
        other_deductions: formAllData.otherDeduction,
        gratuities: formAllData.gratuities,
        balancing_allowance: formAllData.balancingAllowance,
        losses: formAllData.losses,
        capital_allowance: formAllData.capitalAllowance,
        bonus: formAllData.bonus,
      },
      taxpayer_id: this.taxpayerId,
      taxpayer_name: this.taxpayerName,
      reliefs: this.reliefDetails,
    };

    console.log(obj.reliefs);

    console.log("req-DAta: ", obj);
    this.postdeclarationForm(obj);
  }

  postdeclarationForm(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + "update-declaration";
    this.spinnerService.show();

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("API  Data: ", data);

        if (data.status === true) {
          this.spinnerService.hide();
          // Rest form fithout errors
          Swal.fire({
            icon: "success",
            title: "Success",
            text: data.message,
            // text:  data.response[0].message == '' || data.response[0].message == null ? 'Something went wrong, Please try again with correct employee details' : data.response[0].message,
            showConfirmButton: true,
            timer: 7000,
            timerProgressBar: true,
          });
          this.submitted = false;
          this.getIndividualDeclaration();
          this.incomeView = true;
          this.reliefView = false;
          this.deductionView = false;
        } else {
          this.spinnerService.hide();
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text:
              data.response != null ? data.response[0].message : data.message,
            // text:  data.response[0].message == '' || data.response[0].message == null ? 'Something went wrong, Please try again with correct employee details' : data.response[0].message,
            showConfirmButton: true,
            timer: 7000,
            timerProgressBar: true,
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
      due_date: formAllData.taxYear,
      assessment_status: formAllData.statusId,
      taxpayer_name: formAllData.taxPayerName,
    };

    console.log("searchFormData: ", this.searchObject);
    this.getSchedules(this.config.itemsPerPage, this.config.currentPage);
  }

  calculateTotalIncome() {
    this.utilityService.calculateTotalIncomeDA(this.declarationForm);
  }

  calculateGrossIncome() {
    this.grossIncomeIncorrect = this.utilityService.calculateGrossIncomeDA(
      this.reliefForm,
      this.declarationForm
    );
  }

  clearSearch() {
    this.schedulesData = "";
    this.searchObject = {};
    this.initialiseForms();
    this.getSchedules(this.config.itemsPerPage, this.config.currentPage);
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
