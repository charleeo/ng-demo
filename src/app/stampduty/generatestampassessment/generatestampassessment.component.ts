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
  selector: 'app-generatestampassessment',
  templateUrl: './generatestampassessment.component.html',
  styleUrls: ['./generatestampassessment.component.css']
})
export class GeneratestampassessmentComponent implements OnInit {
  title = "Stamp Duty - Generate Assessment";
  computeAssesmentForm: FormGroup;
  generateAssesmentForm: FormGroup;
  roleID: string;
  managerRole: boolean;
  editorRole: boolean;
  submitted: boolean;
  apiUrl: string;
  instrumentTypesData: any;
  taxpayerTypesData: any;
  dtOptions: any = {};
  isChecked = false;
  isRateFixed: boolean;
  taxpayerId: any;
  taxpayerType: any;
  taxpayerData: any;
  isInstrumentTypeSelected: boolean;
  taxpayerMismatch: boolean;
  numberOfChecked: number = 0;
  sumOfAmountAssessed: number = 0;

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

    if (this.roleID === "2") {
      this.managerRole = true;
    }

    if (this.roleID === "3") {
      this.editorRole = true;
    }

    this.initialiseForms();
    this.initialiseTableProperties();
    this.getInstrumentTypes();
  }

  initialiseForms() {
    this.spinnerService.show();

    this.computeAssesmentForm = this.formBuilder.group({
      taxpayerId: ["", [
        Validators.required,
        Validators.pattern(/^[a-zA-Z]{3}[0-9]{8}/)
      ]],
      taxpayerType: ["",
        Validators.required,
      ],
    });

    this.generateAssesmentForm = this.formBuilder.group({
      instrumentTypes: this.formBuilder.array([]),
      // total: ["", [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      totalAmountAssessed: ["0"],
    });

    this.spinnerService.hide();
  }

  initialiseTableProperties() {
    this.dtOptions = {
      paging: true,
      pagingType: 'full_numbers',
      responsive: true,
      pageLength: 5,
      lengthChange: false,
      processing: false,
      ordering: false,
      info: false,
      columnDefs: [
        {
          //targets: [ 10 ],
          visible: false,
          // searchable: false
          defaultContent: '',
          // className: 'select-checkbox'
        },
      ],
   
    };
  }

  addInstrumentTypeFormGroup(instrumentTypeId, instrumentType): FormGroup {
    let instrumentTypeFormGroup = this.formBuilder.group({      
      instrumentType: [instrumentType.instrument_type],
      rateType: [instrumentType.rate_type],
      rate: [instrumentType.rate],
      taxBaseAmount: [""],
      extraStampingCopies: ["", [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      amountAssessed: [0, [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      // amountAssessed: [instrumentType.rate_type == 'Fixed' ? instrumentType.rate : 0, [Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],

      instrumentTypeId: [instrumentTypeId],
      instrumentTypeDbId: [instrumentType.id],
      extraCopyRate: [instrumentType.extra_copy_rate],
    });

    if (instrumentType.rate_type !== "Fixed") {
      instrumentTypeFormGroup.controls["taxBaseAmount"].setValidators([Validators.required, Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]);
      instrumentTypeFormGroup.controls["taxBaseAmount"].updateValueAndValidity();
    }

    return instrumentTypeFormGroup;
  }

  arrayTest: any[] = [];

  onSelectedInstrumentType(selectedInstrumentType) {    
    let selectedInstrumentTypeId = 'instrumentTypeCheck' + selectedInstrumentType.id;
    let isChecked = (<HTMLInputElement>document.getElementById(selectedInstrumentTypeId)).checked;

    let instrumentTypesFormArray = (<FormArray>this.generateAssesmentForm.get('instrumentTypes')).value;
    let index = instrumentTypesFormArray.findIndex(O => O.instrumentTypeId == selectedInstrumentTypeId);

    if (isChecked) {
      (<FormArray>this.generateAssesmentForm.get('instrumentTypes')).push(this.addInstrumentTypeFormGroup(selectedInstrumentTypeId, selectedInstrumentType));
      let formIndex = (<FormArray>this.generateAssesmentForm.get('instrumentTypes')).length - 1;
      this.numberOfChecked++;
      this.sumOfAmountAssessed += Number(selectedInstrumentType.rate);
    }
    else {
      console.log("selectedInstrumentType: ", selectedInstrumentType);
      (<FormArray>this.generateAssesmentForm.get('instrumentTypes')).removeAt(index);

      // remove object from amount assessed array and recalculate
      let existingIndex = this.monthAssessedArray.findIndex(O => O.index == index);
      if (existingIndex > -1) { this.monthAssessedArray.splice(existingIndex, 1); }
      let totalAmountAssessed = this.sumAmountAssessed(this.monthAssessedArray);
      this.setTotalAmountAssessed(totalAmountAssessed);
      this.numberOfChecked--;
      this.sumOfAmountAssessed -= Number(selectedInstrumentType.rate);
    }   
    
    this.checkNumberOfSelectedCheckboxes();
  }

  checkNumberOfSelectedCheckboxes() {
    if (this.numberOfChecked > 0) {
      this.isInstrumentTypeSelected = true;
    }
    else {
      this.isInstrumentTypeSelected = false;
    }
  }

  taxpayerTypeChanged(taxpayer) {
    let formAllData = this.computeAssesmentForm.value;
    let taxpayerId = formAllData.taxpayerId;
    let taxpayerType = formAllData.taxpayerType;

    if ((taxpayerId.includes("CMP") && taxpayerType == "INDIVIDUAL") || (taxpayerId.includes("IND") && taxpayerType == "CORPORATE")) {
      this.taxpayerMismatch = true;
      return;
    }
    else {
      this.taxpayerMismatch = false;
    }
  }

  unCheckAllCheckboxes() {
    $('input:checkbox').removeAttr('checked');
  }

  monthAssessedArray: any[] = [];

  calculateAmountAssessed(index, instrumentTypeDbId) {
    let rateId = 'rate' + index;
    let rateTypeId = 'rateType' + index;
    let extraStampingCopiesId = 'extraStampingCopies' + index;
    let amountAssessedId = 'amountAssessed' + index;
    let taxBaseAmountId = 'taxBaseAmount' + index;
    let extraCopyRateId = 'extraCopyRate' + index;

    let rate = Number((<HTMLInputElement>document.getElementById(rateId)).value);
    let rateType = (<HTMLInputElement>document.getElementById(rateTypeId)).value;
    let extraStampingCopies = Number((<HTMLInputElement>document.getElementById(extraStampingCopiesId)).value);
    let taxBaseAmount = Number((<HTMLInputElement>document.getElementById(taxBaseAmountId))?.value);
    let extraCopyRate = Number((<HTMLInputElement>document.getElementById(extraCopyRateId)).value);

    let amountAssessed = 0;
    if (taxBaseAmount == 0 || isNaN(taxBaseAmount)) { taxBaseAmount = 1; }

    if (rateType.toLowerCase() == 'fixed') {
      amountAssessed =  (extraStampingCopies * extraCopyRate) + (taxBaseAmount * rate);
    }
    else {
      amountAssessed =  (extraStampingCopies * extraCopyRate) + (taxBaseAmount * (rate / 100));
    }

    amountAssessed = Math.round((amountAssessed + Number.EPSILON) * 100) / 100;
    (<HTMLInputElement>document.getElementById(amountAssessedId)).value = amountAssessed.toString();

    // add or remove object from amount assessed array
    this.updateAmountAssessedArray(index, instrumentTypeDbId, amountAssessed);

    // loop through amount assessed array and sum 
    let totalAmountAssessed = this.sumAmountAssessed(this.monthAssessedArray);
    this.setTotalAmountAssessed(totalAmountAssessed);
  }

  updateAmountAssessedArray(index, instrumentTypeDbId, amountAssessed) {
    let existingIndex = this.monthAssessedArray.findIndex(O => O.index == index);

    if (existingIndex == -1) {
      this.monthAssessedArray.push({index: index, instrumentTypeDbId: instrumentTypeDbId, amount: amountAssessed});
    }
    else {
      this.monthAssessedArray.splice(existingIndex, 1);
      this.monthAssessedArray.push({index: index, instrumentTypeDbId: instrumentTypeDbId, amount: amountAssessed});
    }
  }

  sumAmountAssessed(amountAssessedArray: any[]) {
    let sum = 0;

    amountAssessedArray.forEach((amountAssessed) => { 
      sum = sum + amountAssessed.amount;
    });

    sum = Math.round((sum + Number.EPSILON) * 100) / 100;
    return sum;
  }

  setTotalAmountAssessed(amountAssessed) {
    this.generateAssesmentForm.controls['totalAmountAssessed'].setValue(amountAssessed);
  }

  onSubmitComputeAssessment(modal) {
    let formAllData = this.computeAssesmentForm.value;
    console.log("computeAssessmentForm: ", formAllData);

    this.submitted = true;

    if (this.computeAssesmentForm.invalid) {
      return;
    }

    if (this.taxpayerMismatch) {
      return;
    }

    const obj = {
      taxpayer_id: formAllData.taxpayerId,
      taxpayer_type: formAllData.taxpayerType,
    };

    this.taxpayerId = formAllData.taxpayerId;
    this.taxpayerType = formAllData.taxpayerType;

    // re calculate amount assessed
    // if (this.monthAssessedArray.length > 0) {
    //   let totalAmountAssessed = this.sumAmountAssessed(this.monthAssessedArray);
    //   this.setTotalAmountAssessed(totalAmountAssessed);
    // }
    // else {
    //   // just coming up
    //   this.setTotalAmountAssessed(this.sumOfAmountAssessed);
    // }
       
    this.submitted = false;
    this.getTaxPayerDetails(obj);
    this.utilityService.showModal(modal);
  }

  getTaxPayerDetails(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}stamp-duty/get_taxpayer_for_admin_portal`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
      console.log("taxpayerData: ", data);
      this.taxpayerData = data.response == null ? {} : data.response;
      this.spinnerService.hide();
    });
  }

  onSubmitGenerateAssessment(formAllData: any) {
    console.log("generateAssesmentForm: ", formAllData);
    this.submitted = true;

    if (this.generateAssesmentForm.invalid) {
      return;
    }

    let assessmentArray: any[] = [];

    formAllData.instrumentTypes.forEach((obj) => { 
      console.log("instrumentType: ", obj);
      console.log("monthAssessedArray: ", this.monthAssessedArray);
      let item = this.monthAssessedArray.find(O => O.instrumentTypeDbId == obj.instrumentTypeDbId);
      console.log("item: ", item);

      let testObj = {
        instrument_id: obj.instrumentTypeDbId,
        extra_copies: obj.extraStampingCopies,
        amount: item.amount,
        tax_base_amount: obj.taxBaseAmount,
      };

      assessmentArray.push(testObj);
    });

    let postObj = {
      taxpayer_type: this.taxpayerType,
      taxpayer_id: this.taxpayerId,
      assessment_array: assessmentArray,
    };

    console.log("postObj: ", postObj);
    this.postCreateAssessment(postObj);
    this.submitted = false;
  }

  postCreateAssessment(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}stamp-duty/generate_assessment`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        // console.log("employeeResponseData: ", data);

        if (data.status === true) {
          // Rest form fithout errors
          this.generateAssesmentForm.reset();
          Object.keys(this.generateAssesmentForm.controls).forEach((key) => {
            this.generateAssesmentForm.get(key).setErrors(null);
          });

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Assessment has been created successfully!",
            showConfirmButton: true,
            timer: 5000,
          });

          this.initialiseForms();
          this.getInstrumentTypes();
          this.isInstrumentTypeSelected = false;
          // this.unCheckAllCheckboxes();
          this.sumOfAmountAssessed = 0;
          this.monthAssessedArray = [];
          this.utilityService.closeAllModals();
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
  
  getInstrumentTypes() {
    this.spinnerService.show();
    this.instrumentTypesData = '';
    this.apiUrl = `${environment.AUTHAPIURL}stamp-duty/get_dependencies`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
        console.log("instrumentTypesData: ", data);
        this.taxpayerTypesData = data.response == null ? [] : data.response.taxpayer_type;
        this.instrumentTypesData = data.response == null ? [] : data.response.instrument_types;
        this.spinnerService.hide();
    });
  }

}
