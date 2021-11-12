import Swal from "sweetalert2";
import { environment } from "../../../environments/environment";
import { SessionService } from "../../session.service";

import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { UtilityService } from "src/app/utility.service";

@Component({
  selector: "app-filedeclaration",
  templateUrl: "./filedeclaration.component.html",
  styleUrls: ["./filedeclaration.component.scss"],
})
export class FiledeclarationComponent implements OnInit {
  declarationForm: FormGroup;
  submitted: boolean;
  apiUrl: string;
  employeesData: any;
  showAddNewEmployee: boolean = false;
  modalOptions: NgbModalOptions;
  closeResult: string;
  dtOptions: any = {};
  showListOfEmployees: boolean = true;
  corporateName: string;
  roleID: any;
  incomeView: boolean = true;
  reliefView: boolean;
  generateAssessmentView: boolean;
  deductionView: boolean;
  deductionForm: FormGroup;
  reliefForm: FormGroup;
  assessmentForm: FormGroup;
  userId: string;
  incomeDetails: any;
  reliefDetails: any;
  deductionDetails: any;
  taxpayerName: any;
  taxpayerId: any;
  grossIncomeIncorrect: boolean;
  payeTaxPaid: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private sess: SessionService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private httpClient: HttpClient,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit() {
    this.spinnerService.show();
    this.sess.checkLogin();

    // Check Navbar link click opens File declaration or File Updation
    this.userId = localStorage.getItem("id");

    this.initialiseForms();
    this.initialiseDeductionForm();
    this.initialiseReliefForm();
    this.spinnerService.hide();
  }

  initialiseForms() {
    this.declarationForm = this.formBuilder.group({
      otherIncome: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      taxpayerId: [
        "",
        [Validators.required, Validators.pattern(/^[a-zA-Z]{3}[0-9]{8}/)],
      ],
      benefit: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      rent: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      interest: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      professionalFee: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      commission: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      businessIncome: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/),
        ],
      ],
      terminalBonus: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      profitSharing: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      totalIncome: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      payeTaxPaid: [this.payeTaxPaid, [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      balancingCharge: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      royalty: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      employmentIncome: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      directorFees: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      allowance: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      contract: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
    });
  }

  initialiseDeductionForm() {
    this.deductionForm = this.formBuilder.group({
      gratuities: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      otherDeduction: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      balancingAllowance: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      losses: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      capitalAllowance: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      bonus: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
    });
  }

  initialiseReliefForm() {
    this.reliefForm = this.formBuilder.group({
      consolidateRelief: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      nhis: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      nhf: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      lifeAssurance: [
        "0",
        [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)],
      ],
      nps: ["0", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      grossIncome: [
        "0",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
    });
  }

  callRelief(formAllData) {
    this.submitted = true;

    if (this.declarationForm.invalid) {
      return;
    }
    // this.taxpayerName = formAllData.taxpayerName;
    this.taxpayerId = formAllData.taxpayerId;
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
    this.deductionView = false;
    this.reliefView = true;
  }

  backToDeclarationForm() {
    this.submitted = false;

    this.deductionView = false;
    this.reliefView = false;
    this.incomeView = true;
  }

  backToDeductionForm() {
    this.submitted = false;

    if (this.declarationForm.invalid) {
      this.submitted = true;

      return;
    }

    this.incomeView = false;
    this.reliefView = false;
    this.deductionView = true;
  }

  backToReliefForm() {
    this.submitted = false;

    if (this.declarationForm.invalid) {
      this.submitted = true;

      return;
    }

    this.incomeView = false;
    this.reliefView = true;
    this.deductionView = false;
  }

  callDeduction(formAllData) {
    this.submitted = true;

    if (this.deductionForm.invalid) {
      return;
    }

    this.reliefDetails = {
      life_assurance: formAllData.lifeAssurance,
      nhis: formAllData.nhis,
      nhf: formAllData.nhf,
      nps: formAllData.nps,
  
      cra: formAllData.consolidateRelief,
      // gross_income: this.reliefForm.value.grossIncome,
    };

    this.incomeDetails.gross_income = formAllData.grossIncome;

    this.submitted = false;
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
      taxpayer_id: this.taxpayerId,
      incomes: this.incomeDetails,
      deductions: {
        other_deductions: formAllData.otherDeduction,
        gratuities: formAllData.gratuities,
        balancing_allowance: formAllData.balancingAllowance,
        losses: formAllData.losses,
        capital_allowance: formAllData.capitalAllowance,
        bonus: formAllData.bonus,
      },
      reliefs: this.reliefDetails,
    };

    console.log("req-DAta: ", obj);
    this.postdeclarationForm(obj);
  }

  postdeclarationForm(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + "create-declaration";
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
          this.router.navigate(["/dashboard"]);
        } else {
          this.spinnerService.hide();
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.message,
            // text:  data.response[0].message == '' || data.response[0].message == null ? 'Something went wrong, Please try again with correct employee details' : data.response[0].message,
            showConfirmButton: true,
            timer: 7000,
            timerProgressBar: true,
          });
        }
      });
  }

  omit_special_char(event) {
    var k;
    k = event.charCode; //         k = event.keyCode;  (Both can be used)
    return (
      (k > 64 && k < 91) ||
      (k > 96 && k < 123) ||
      k == 8 ||
      k == 32 ||
      (k >= 48 && k <= 57)
    );
  }

  onSubmitAssessment(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.assessmentForm.invalid) {
      return;
    }

    const obj = {
      taxYear: formAllData.taxYear,
    };

    console.log("tax Year: ", obj);
    this.postAssessmentForm(obj);
  }

  postAssessmentForm(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + "employees";
    this.spinnerService.show();

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("Data: ", data);

        if (data.status === true) {
          this.spinnerService.hide();
          // Rest form fithout errors
          this.assessmentForm.reset();
          Object.keys(this.assessmentForm.controls).forEach((key) => {
            this.assessmentForm.get(key).setErrors(null);
          });

          Swal.fire({
            icon: "success",
            title: "Success",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
            timerProgressBar: true,
          });
          // this.router.navigate(["/employeeschedule"]);
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

  getPayeTaxPaid(taxpayerId) {
    this.apiUrl = `${environment.AUTHAPIURL}individual/paye-amount`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      taxpayer_id: taxpayerId
    };

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      console.log("payeTaxPaidApiData", data);
      if (data.status) {
        this.payeTaxPaid = data.response;
        this.declarationForm.controls['payeTaxPaid'].setValue(this.payeTaxPaid);
      }

      this.spinnerService.hide();
    });
  }

  fetchPayeTaxPaid() {
    console.log("Here: ");
    let taxpayerId = this.declarationForm.get('taxpayerId').value;
    // console.log("Here1: ", cm.length);

    if (taxpayerId.length == 11) {
      this.getPayeTaxPaid(taxpayerId);
    }
    // reliefForm.controls['consolidateRelief'].setValue(approxCra);
  }

  calculateTotalIncome() {
   this.utilityService.calculateTotalIncomeDA(this.declarationForm);
  }

  calculateGrossIncome() {
    this.grossIncomeIncorrect = this.utilityService.calculateGrossIncomeDA(this.reliefForm, this.declarationForm);
  }

}
