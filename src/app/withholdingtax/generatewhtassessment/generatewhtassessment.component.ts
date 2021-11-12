import { Position } from './../../../assets/plugins/filterizr/types/interfaces/Position.d';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { UtilityService } from "src/app/utility.service";
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-generatewhtassessment',
  templateUrl: './generatewhtassessment.component.html',
  styleUrls: ['./generatewhtassessment.component.css']
})
export class GeneratewhtassessmentComponent implements OnInit {
  title = "WHT - Generate Assessment";
  roleID: string;
  managerRole: boolean;
  editorRole: boolean;
  file: any;
  filePath: any;
  myForm: FormGroup;
  addTransactionForm: FormGroup;
  computeAssesmentForm: FormGroup;
  submitted: boolean;
  apiUrl: string;
  showTaxDue: boolean = true;
  sample_file: string;
  error: string;
  columnError: string[] = [];
  slectedDefault: string = "disclosed";
  totalTaxDue: number = 0;
  paymentTypesData: any;
  businessesData: any;
  collectorBusinessData: any;
  collectorBusinessData1: any;
  contributorBusinessData: any;
  selectedPaymentTypeId: any;
  submitted1: boolean;

  get f() {
    return this.myForm.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute,
    private sess: SessionService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private spinnerService: Ng4LoadingSpinnerService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.roleID = localStorage.getItem("admin_role_id");

    // if (this.roleID === "1") {
    //   this.superAdminRole = true;
    // }

    if (this.roleID === "2") {
      this.managerRole = true;
    }

    if (this.roleID === "3") {
      this.editorRole = true;
    }

    this.initialiseForms();
    this.getPaymentTypes();
    this.initialiseUploadForm();
    this.sample_file = environment.SAMPLE_FILE_URL + "wht-bulk-upload.xlsx";
  }

  initialiseForms() {
    this.spinnerService.show();
    this.addTransactionForm = this.formBuilder.group({
      collectorId: ["", [
        Validators.required,
        Validators.pattern(/^[a-zA-Z]{3}[0-9]{8}/)
      ]],
      collectorBusinessId: ["",
        // Validators.required,
      ],
      contributorId: ["", [
        Validators.required,
        Validators.pattern(/^[a-zA-Z]{3}[0-9]{8}/)
      ]],
      contributorBusinessId: ["",
        // Validators.required,
      ],
      paymentTypeId: ["",
        Validators.required,
      ],
      paymentDate: ["",
        Validators.required,
      ],
      computationTypeId: ["",
        Validators.required,
      ],
      transactionAmount: ["", [Validators.required, Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      inputTaxDue: ["", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
    });


    this.computeAssesmentForm = this.formBuilder.group({
      instrumentTypes: this.formBuilder.array([this.addInstrumentTypeFormGroup()]),
      total: ["", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
    });

    this.spinnerService.hide();
  }

  initialiseUploadForm() {
    this.myForm = this.formBuilder.group({
      collectorId: ["", [
        Validators.required,
        Validators.pattern(/^[a-zA-Z]{3}[0-9]{8}/)
      ]],
      collectorBusinessId: ["",
        // Validators.required,
      ],
      myfile: ["", Validators.required],
    });
  }

  addInstrumentTypeFormGroup(): FormGroup {
    return this.formBuilder.group({      
      instrumentType: [""],
      rateType: [""],
      rate: ["", [Validators.required]],
      taxBaseAmount: ["", [Validators.required, Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      extraStampingCopies: ["", Validators.required],
      amountAssessed: ["", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
    });
  }

  onSelectedInstrumentType() {
    (<FormArray>this.computeAssesmentForm.get('instrumentTypes')).push(this.addInstrumentTypeFormGroup());
  }

  onSubmitComputeAssessment(formAllData: any) {
    console.log("computeAssessmentForm: ", formAllData);
  }

  uploadBulkTransactions(modal) {
    this.submitted = false;
    this.utilityService.showModal(modal);
  }

  getPaymentTypes() {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}wht/dependencies`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
        console.log("paymentTypesData: ", data);
        this.paymentTypesData = data.response == null ? [] : data.response;
        // this.config.totalItems = data.response.total;
        this.spinnerService.hide();
    });
  }

  getBusinesses(taxpayerId: string, positionId: number) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}wht/collector-contributor-businesses`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var requestObj = {
      taxpayer_id: taxpayerId,
    }

    this.httpClient.post<any>(this.apiUrl, requestObj, { headers: reqHeader }).subscribe((data) => {
        console.log("businessesData: ", data);
        this.businessesData = data.response == null ? [] : data.response;

        if (positionId == 1) {
          this.collectorBusinessData = this.businessesData;
        }

        if (positionId == 2) {
          this.collectorBusinessData1 = this.businessesData;
        }

        if (positionId == 3) {
          this.contributorBusinessData = this.businessesData;
        }

        this.spinnerService.hide();
    });
  }

  calculateTaxDue() {
    let transAmount = Number(this.addTransactionForm.get('transactionAmount').value);
    let deductionRate = this.paymentTypesData.filter(O => O.id == this.selectedPaymentTypeId)[0]?.rate;

    if (transAmount !== 0 && transAmount !== undefined && transAmount !== NaN && transAmount > 0 && deductionRate !== 0 && deductionRate !== undefined) {
      this.totalTaxDue = transAmount * (deductionRate / 100);
      this.totalTaxDue = Math.round((this.totalTaxDue + Number.EPSILON) * 100) / 100;
    }
    else {
      this.totalTaxDue = 0;
    }

    console.log("transAmount", transAmount);
    console.log("deductionRate", deductionRate);
  }

  paymentTypeSelect(value) {
    this.selectedPaymentTypeId = value;
  }

  computationTypeSelect(value) {
    console.log("selectedComputationTypeId: ", value);

    if (value == "disclosed") {
      this.showTaxDue = true;
      this.addTransactionForm.get('inputTaxDue').clearValidators();
      this.addTransactionForm.get("transactionAmount").setValidators([Validators.required, Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]);
    }
    else {
      this.showTaxDue = false;
      this.addTransactionForm.get('transactionAmount').clearValidators();
      this.addTransactionForm.get("inputTaxDue").setValidators([Validators.required, Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]);
    }

    this.addTransactionForm.get("inputTaxDue").updateValueAndValidity();
    this.addTransactionForm.get("transactionAmount").updateValueAndValidity();
  }

  getBusinessesByTaxpayerId(positionId) {
    let collectorId = this.myForm.get('collectorId').value
    let collectorId1 = this.addTransactionForm.get('collectorId').value
    let contributorId = this.addTransactionForm.get('contributorId').value

    if (collectorId.length === 11 && positionId == 1) {
      this.getBusinesses(collectorId, positionId);
      console.log("Here!");
    }

    if (collectorId1.length == 11 && positionId == 2) {
      this.getBusinesses(collectorId1, positionId);
      console.log("Here Too!");
    }

    if (contributorId.length == 11 && positionId == 3) {
      this.getBusinesses(contributorId, positionId);
      console.log("Here Too Too!");
    }
  }

  onSubmit(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.addTransactionForm.invalid) {
      return;
    }

    const obj = {
      collector_id: formAllData.collectorId,
      contributor_id: formAllData.contributorId,

      contributor_business_id: formAllData.contributorBusinessId,
      collector_business_id: formAllData.collectorBusinessId,
      wht_payment_type_id: formAllData.paymentTypeId,
      payment_date: formAllData.paymentDate,
      computation_type: formAllData.computationTypeId,
      transaction_amount: formAllData.transactionAmount,      
    };

    if (formAllData.computationTypeId == "disclosed") {
      obj["wht_amount_due"] = this.totalTaxDue;
    }
    else {
      obj["wht_amount_due"] = formAllData.inputTaxDue;
    }

    console.log("transactionFormData: ", obj);
    this.postCreateTransaction(obj);
  }

  postCreateTransaction(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + "wht/assessments/add";
    this.spinnerService.show();

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("employeeResponseData: ", data);

        if (data.status === true) {
          // Rest form fithout errors
          this.addTransactionForm.reset();
          Object.keys(this.addTransactionForm.controls).forEach((key) => {
            this.addTransactionForm.get(key).setErrors(null);
          });

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Transaction has been saved successfully!",
            // text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.submitted = false;
          this.totalTaxDue = 0;
          this.initialiseForms();
          this.spinnerService.hide();
        }
        else {
          this.spinnerService.hide();
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text:
              data.response != null ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  submit() {
    this.submitted1 = true;

    if (this.myForm.invalid) {
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
    let collectorBusinessId = this.myForm.get("collectorBusinessId").value;

    if (collectorBusinessId == null) {
      formData.append("collector_business_id", "");
    }
    else {
      formData.append("collector_business_id", collectorBusinessId);
    }

    formData.append("collector_id", this.myForm.get("collectorId").value);
    formData.append("wht_file", this.myForm.get("myfile").value);
    this.apiUrl = `${environment.AUTHAPIURL}wht/uploads`;
    this.spinnerService.show();

    this.httpClient.post<any>(this.apiUrl, formData, config).subscribe((res) => {
        // console.log(res);
        // Clear form Value Without any Error
        this.myForm.reset();
        Object.keys(this.myForm.controls).forEach((key) => {
          this.myForm.get(key).setErrors(null);
        });

        if (res.status == true) {
          this.myForm.reset();

          Object.keys(this.myForm.controls).forEach((key) => {
            this.myForm.get(key).setErrors(null);
          });

          this.file = null;
          this.filePath = null;

          if (res.message === "0 Transaction created; 0 updated.") {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Confirm the file content and try again",
              showConfirmButton: true,
              timer: 5000,
            });
          } else {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: res.message,
              showConfirmButton: true,
              timer: 5000,
            });

            // this.initialiseForms();
          }

          this.spinnerService.hide();
          this.utilityService.closeAllModals();
        } 
        else {
          this.spinnerService.hide();
          this.myForm.reset();

          Object.keys(this.myForm.controls).forEach((key) => {
            this.myForm.get(key).setErrors(null);
          });

          const regex = /_/g;

          if (res.response != null && !res.message.toLowerCase().includes("validation")) {
            for (const key of Object.keys(res.response)) {
              const row = res.response[key];
              // console.log("row: ", row);

              for (const error of row) {
                // console.log(key.replace(regex, ' ') + ':', error);
                let err = key.replace(regex, " " + ":");
                this.error =
                  err.toUpperCase() +
                  " " +
                  (key.replace(regex, " ") + ":", error);
                this.columnError.push(this.error);
                // console.log(this.error);
              }
            }

            Swal.fire({
              icon: "warning",
              title: res.message,
              html:
                '<div class="text-left ml-3">' +
                this.columnError.join("<br />") +
                "</div>",
              showConfirmButton: true,
              timer: 25000,
            });
  
          }
          else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: res.message,
              // text: "File format(s) incorrect. Try again!",
              showConfirmButton: true,
              timer: 25000,
            });
          }

          this.file = null;
          this.filePath = null;
          this.columnError = [];
          this.collectorBusinessData = [];
          this.initialiseUploadForm();
        }
      });

      this.submitted1 = false;
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      let filename = event.target.files[0].name.toLowerCase();

      if (filename.includes("xls") || filename.includes("xlsx")) {
        this.file = event.target.files[0];
        this.filePath = event.target.files[0].name;
        this.myForm.get("myfile").setValue(file);
      }
      else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "The file format you selected is incorrect!",
          showConfirmButton: true,
          timer: 5000,
        });
      }
    }
  }

}
