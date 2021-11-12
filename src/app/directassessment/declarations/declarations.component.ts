import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import Swal from "sweetalert2";
import { Title } from "@angular/platform-browser";
import { SessionService } from "../../session.service";
import { environment } from "../../../environments/environment";
import { UtilityService } from "src/app/utility.service";

@Component({
  selector: "app-declarations",
  templateUrl: "./declarations.component.html",
  styleUrls: ["./declarations.component.scss"],
})
export class DeclarationsComponent implements OnInit {
  submitted: boolean;
  incomeView: boolean = true;
  reliefView: boolean;
  generateAssessmentView: boolean;
  deductionView: boolean;
  deductionForm: FormGroup;
  declarationForm: FormGroup;
  reliefForm: FormGroup;
  assessmentForm: FormGroup;
  userId: string;
  incomeDetails: any;
  reliefDetails: any;
  deductionDetails: any;
  incomeInfo: any;
  deductionInfo: any;
  reliefInfo: any;
  apiUrl: string;
  declarationData: any;
  modalOptions: NgbModalOptions;
  closeResult: string;
  dtOptions: any = {};
  roleID: any;
  scheduleForm: FormGroup;
  showEditor: boolean;
  taxpayerId: any;
  assessmentTypes: any;
  title = "Declarations";
  individualId: any;
  taxpayerName: any;
  disable: boolean;
  config: any;
  currentPageLength: any = 10;
  grossIncomeIncorrect: boolean;
  grossIncome: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private sess: SessionService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private httpClient: HttpClient,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.roleID = localStorage.getItem("admin_role_id");
    if (this.roleID === "3") {
      this.showEditor = true;
    } else {
      this.showEditor = false;
    }

    //this.getDeclarations();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getDeclarations(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );

    this.getAssessmentTypes();
    console.log(this.roleID);

    this.initialisescheduleForms();
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
    };

    this.initialiseForms();
    this.initialiseReliefForm();
    this.initialiseDeductionForm();
  }

  initialisescheduleForms() {
    this.scheduleForm = this.formBuilder.group({
      taxYear: ["", [Validators.pattern(/^[0-9]{4}$/)]],
      assessmentType: ["", [Validators.required]],
    });
  }

  getDeclarations(perpage, pageno) {
    //this.apiUrl = `${environment.AUTHAPIURL}individuals-list`;
    this.apiUrl = environment.AUTHAPIURL + "individuals-list?page=" + pageno;
    const obj = { per_page: perpage, page_no: pageno };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("individualsApiData", data);

        if (data.status == true) {
          this.declarationData = data.response.data;
          this.config.totalItems = data.response.total;

          for (let d of this.declarationData) {
            if (
              d.reliefs_id == null ||
              d.incomes_id == null ||
              d.deductions_id == null
            ) {
              this.disable = true;
            } else {
              this.disable = false;
            }
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.declarationData = [];
        }

        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.declarationData = "";
    this.router.navigate(["/declarations"], { queryParams: { page: newPage } });
    this.getDeclarations(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.declarationData = "";
    this.router.navigate(["/declarations"]);
    this.getDeclarations(this.config.itemsPerPage, 1);
  }

  viewGenerateSchedule(modal, data) {
    this.submitted = false;
    this.taxpayerId = data.taxpayer_id;

    this.showModal(modal);
  }

  viewDeclaration(modal, data) {
    this.individualId = data.id;
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
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("types: ", data);
        this.incomeInfo = data.response.income_info;

        this.deductionInfo = data.response.deduction_info;
        this.reliefInfo = data.response.relief_info;
        this.loadIncome(this.incomeInfo);
        this.loadDeduction(this.deductionInfo);
        this.loadRelief(this.reliefInfo, this.incomeInfo.gross_income);
      });
  }

  initialiseForms() {
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
      totalIncome: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
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
      // dividend: formAllData.dividend,
      total_income: formAllData.totalIncome,
      balancing_charge: formAllData.balancingCharge,
      employment_income: formAllData.employmentIncome,
      contract: formAllData.contract,
    };

    this.submitted = false;
    this.incomeView = false;
    this.deductionView = false;
    this.reliefView = true;
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
      total_income: incomeObj.totalIncome,
      balancing_charge: incomeObj.balancing_charge,
      employment_income: incomeObj.employment_income,
      contract: incomeObj.contract,
    };
  }

  loadIncome(income) {
    console.log("income: ", income);

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
        income.other_income,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      benefit: [
        income.benefit_in_kind,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      rent: [
        income.rent,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      interest: [
        income.interest,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],

      professionalFee: [
        income.consultancy_fee,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      commission: [
        income.commission,
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
        income.trade_business_income,
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      terminalBonus: [
        income.terminal_bonus,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      profitSharing: [
        income.profit_sharing,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      balancingCharge: [
        income.balancing_charge,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      royalty: [
        income.royalty,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      employmentIncome: [
        income.employment_income,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      directorFees: [
        income.director_fee,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      allowance: [
        income.allowance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      contract: [
        income.contract,
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
        deduction.gratuities,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      otherDeduction: [
        deduction.other_deductions,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      balancingAllowance: [
        deduction.balancing_allowance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      losses: [
        deduction.losses,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      capitalAllowance: [
        deduction.capital_allowance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      bonus: [
        deduction.bonus,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
    });
  }

  loadRelief(relief, grossIncome?) {
    this.reliefForm = this.formBuilder.group({
      consolidateRelief: [
        relief.cra,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      nhis: [
        relief.nhis,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      nhf: [relief.nhf, [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      lifeAssurance: [
        relief.life_assurance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      nps: [relief.nps, [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      grossIncome: [
        grossIncome == null ? relief.gross_income : grossIncome,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
    });
  }

  backToDeclarationForm() {
    this.submitted = false;

    this.reliefDetails = this.reliefForm.value;

    this.deductionView = false;
    this.reliefView = false;
    this.incomeView = true;
    this.loadIncome(this.incomeDetails);
  }

  backToReliefForm1() {
    this.submitted = false;

    this.callRelief(this.declarationForm.value);
    this.deductionView = false;

    this.incomeView = false;
    this.reliefView = true;
    this.loadRelief(this.reliefDetails);
  }

  backToDeductionForm() {
    this.submitted = false;

    if (this.declarationForm.invalid) {
      this.submitted = true;

      return;
    }
    this.callDeduction(this.reliefForm.value);
    this.reliefDetails = this.reliefForm.value;

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

    this.callRelief(this.deductionForm.value);
    this.reliefDetails = {
      // osh: this.reliefForm.value.ordinaryShareHolding,
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

  onSubmit(formAllData) {
    this.submitted = true;

    if (this.declarationForm.invalid) {
      return;
    }

    this.deductionDetails = {
      other_deductions: formAllData.otherDeduction,
      gratuities: formAllData.gratuities,
      balancing_allowance: formAllData.balancingAllowance,
      losses: formAllData.losses,
      capital_allowance: formAllData.capitalAllowance,
      bonus: formAllData.bonus,
    };

    const obj = {
      individual_id: this.userId,
      incomes: this.incomeDetails,
      deductions: this.deductionDetails,
      taxpayer_id: this.taxpayerId,
      taxpayer_name: this.taxpayerName,
      reliefs: this.reliefDetails,
    };

    console.log(obj.reliefs);

    console.log("req-DAta: ", obj);
    this.postdeclarationForm(obj);
  }

  callDeduction(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.reliefForm.invalid) {
      return;
    }

    this.reliefDetails = {
      life_assurance: formAllData.lifeAssurance,
      nhis: formAllData.nhis,
      nhf: formAllData.nhf,
      nps: formAllData.nps,

      cra: formAllData.consolidateRelief,
      // gross_income: formAllData.grossIncome,
    };

    this.incomeDetails.gross_income = formAllData.grossIncome;

    this.submitted = false;
    this.deductionView = true;
    this.incomeView = false;
    this.reliefView = false;
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
          this.modalService.dismissAll();
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

  getAssessmentTypes() {
    this.apiUrl = environment.AUTHAPIURL + "direct-assessments-types";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("types: ", data);
        this.assessmentTypes = data.response;
      });
  }

  onSubmitSchedule(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.scheduleForm.invalid) {
      return;
    }

    const obj = {
      assessment_type: formAllData.assessmentType,
      taxpayer_id: this.taxpayerId,
      due_date: formAllData.taxYear,
    };

    // console.log("tax Year: ", obj);
    this.postScheduleForm(obj);
    this.initialisescheduleForms();
    this.submitted = false;
  }

  postScheduleForm(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + "direct-assessment-schedules";
    this.spinnerService.show();

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("Data: ", data);

        if (data.status === true) {
          this.spinnerService.hide();
          // Rest form fithout errors
          this.scheduleForm.reset();
          Object.keys(this.scheduleForm.controls).forEach((key) => {
            this.scheduleForm.get(key).setErrors(null);
          });

          Swal.fire({
            icon: "success",
            title: "Success",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
            timerProgressBar: true,
          });
          this.modalService.dismissAll();
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

  calculateTotalIncome() {
    this.utilityService.calculateTotalIncomeDA(this.declarationForm);
  }

  calculateGrossIncome() {
    this.grossIncomeIncorrect = this.utilityService.calculateGrossIncomeDA(
      this.reliefForm,
      this.declarationForm
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
