import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import { FlashMessagesService } from 'angular2-flash-messages';
import Swal from 'sweetalert2';
import { Md5 } from 'ts-md5/dist/md5';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-addindividual',
  templateUrl: './addindividual.component.html',
  styleUrls: ['./addindividual.component.css']
})
export class AddindividualComponent implements OnInit {
  @Input() modalRef;
  @Input() individualId;
  @Input() isUpdateIndividual: boolean = false;
  @Input() showHeader: boolean = true;
  @Input() showSaveButton: boolean; //
  @Input() taxPayerRoleId;
  @Input() businessId;
  @Input() buildingId;
  @Input() landId;
  @Output() reloadLinkedTaxpayers = new EventEmitter();
  @Output() reloadListOfIndividuals = new EventEmitter();

  addIndividualForm: FormGroup;
  disableControls: boolean;
  modalTitle: string;
  submitted: boolean;
  dateInvalid: boolean;
  apiUrl: string;
  validateCacTin: boolean;
  disableIndividualEmail: boolean;
  roleID: string;
  unfilteredTaxTaxOffices: any;
  taxTaxOffices: any;
  industrySectors: any;
  zipCodes: any;
  stateLocalGovts: any;
  selectedIndividual: any;
  linkTaxpayerRequestObj: any = {};

  constructor(private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private titleService: Title,
    private sess: SessionService,
    private flashMessage: FlashMessagesService,
    private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit(): void {
    this.roleID = localStorage.getItem("admin_role_id");
    this.getTaxOffices();
    this.getIndustrySectors();
    this.getZipcodes();
    this.getStateLocalGovts();
    this.initialiseForms();

    if (this.individualId !== null) {
      this.getSingleIndividual(this.individualId, false);
    }


    if (this.showSaveButton == false) {
      this.disableControls = true;
      this.disableIndividualEmail = true;
      this.modalTitle = "View Individual Details";
      // console.log("Here: ", 1);
    }
    else if (this.showSaveButton){
      this.disableControls = null;
      this.disableIndividualEmail = null;
      this.modalTitle = "Add New Individual";
      // console.log("Here: ", 2);
    }
    else if (this.showSaveButton === null) {
      this.disableControls = null;
      this.disableIndividualEmail = true;
      this.isUpdateIndividual = true;
      // console.log("Here: ", 3);
    }
    else {
      // console.log("Here: ", 4);
      this.disableControls = true;
      this.disableIndividualEmail = null;
      this.isUpdateIndividual = true;
    }

    this.loadLinkTaxpayerObj();
  }

  reloadTaxpayers(reloadTaxpayers: boolean) {
    this.reloadLinkedTaxpayers.emit(reloadTaxpayers);
  }

  reloadIndividuals(reloadIndividuals: boolean) {
    this.reloadListOfIndividuals.emit(reloadIndividuals);
  }

  initialiseForms() {
    this.addIndividualForm = this.formBuilder.group({
      emailAddress: [
        "",
        [
          Validators.maxLength(60),
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      firstName: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z]+$/),
          Validators.maxLength(60),
        ],
      ],
      surname: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z]+$/),
          Validators.maxLength(60),
        ],
      ],
      titleId: ["", Validators.required],

      individualTIN: [
        "",
        [
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      phoneNumber: [
        "",
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
        ],
      ],
      nationality: ["Nigerian", Validators.required],
      genderId: ["", Validators.required],
      dateOfBirth: ["", Validators.required],
      maritalStatus: ["", Validators.required],
      occupation: [
        "",
        [
          Validators.required,
          Validators.pattern("^[A-Za-z 0-9 _-]*[A-Za-z0-9][A-Za-z0-9 _]*$"),
        ],
      ],
      bvn: [
        "",
        [
          Validators.minLength(11),
          Validators.pattern(/^[0-9]*$/),
        ],
      ],
      nin: [
        "",
        [
          Validators.minLength(11),
          Validators.pattern(/^[0-9]*$/),
        ],
      ],
      contactAddress: [
        "",
        [
          Validators.required,
          Validators.maxLength(200),
          Validators.minLength(6),
          Validators.pattern(/[A-Za-z0-9'\.\-\s\,]/),
        ],
      ],
      zipCode: ["", [Validators.required]],
      taxOfficeId: ["", Validators.required],
      localGovernmentId: ["", Validators.required],
    });
  }

onSubmitAddIndividual(formData: any) {
    this.submitted = true;
    // console.log("isUpdateIndividual: ", this.isUpdateIndividual);

    let dateLimit = new Date();
    if (Date.parse(formData.dateOfBirth) < dateLimit.setFullYear(1960, 1, 1)) {
      this.dateInvalid = true;
      return;
    } 
    else {
      this.dateInvalid = false;
    }

    // stop the process here if form is invalid
    this.validateTinPhoneNinBvn(this.addIndividualForm);

    if (this.addIndividualForm.invalid || this.validateCacTin) {
      return;
    }

    var requestObj = {
      title: formData.titleId,
      first_name: formData.firstName,

      surname: formData.surname,
      email: formData.emailAddress,
      bvn: formData.bvn,
      tin: formData.individualTIN,
      phone: formData.phoneNumber,
      gender: formData.genderId,
      nationality: formData.nationality,
      date_of_birth: formData.dateOfBirth,
      marital_status: formData.maritalStatus,
      occupation: formData.occupation,
      home_address: formData.contactAddress,
      individual_id: this.individualId,
      zip_code: formData.zipCode,
      lga_code: formData.localGovernmentId,

      nin: formData.nin,
    };

    console.log("individualPostObjData: ", requestObj);

    if (this.isUpdateIndividual) {
      requestObj['tax_office_id'] = formData.taxOfficeId;
      this.postUpdateIndividualData(requestObj);
    } 
    else {
      this.postAddIndividualData(requestObj);
    }
    // }

    this.submitted = false;
  }

  postAddIndividualData(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + "individuals/create";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
      console.log("addIndividualResponseObj: ", data);
        if (data.status == true) {
          // Rest form fithout errors
          this.submitted = false;
          this.addIndividualForm.reset();
          Object.keys(this.addIndividualForm.controls).forEach((key) => {
            this.addIndividualForm.get(key).setErrors(null);
          });

          if (this.taxPayerRoleId !== undefined) {
            this.linkTaxpayerRequestObj["taxpayer_role_id"] = this.taxPayerRoleId;
            this.linkTaxpayerRequestObj["individual_id"] = data.response.individual.id;
            this.postLinkTaxpayerData(this.linkTaxpayerRequestObj);
          }
         
          console.log("taxPayerRoleId: ", this.taxPayerRoleId);
          this.reloadTaxpayers(true);
          this.reloadIndividuals(true);
          this.modalRef?.close();
          this.initialiseForms();
          this.spinnerService.hide();
        } 
        else {
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

  loadLinkTaxpayerObj() {
    if (this.businessId !== null && this.businessId !== undefined) {
      this.linkTaxpayerRequestObj["business_id"] = this.businessId;
     }

     if (this.buildingId !== null && this.buildingId !== undefined) {
      this.linkTaxpayerRequestObj["building_id"] = this.buildingId;
     }

     if (this.landId !== null && this.landId !== undefined) {
      this.linkTaxpayerRequestObj["land_id"] = this.landId;
     }
  }

  postLinkTaxpayerData(jsonData: any) {
    console.log("linkTaxpayerObj: ", jsonData);
    this.apiUrl = `${environment.AUTHAPIURL}asset-taxpayer/link`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        if (data.status == true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Individual has been created and linked successfully!",
            showConfirmButton: true,
            timer: 5000,
          });
          this.spinnerService.hide();
        } 
        else {
          this.spinnerService.hide();
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "An error occurred while linking the individual. Please try again later!",
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  postUpdateIndividualData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}individuals-update`;

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
          this.addIndividualForm.reset();
          // this.addIndividualForm.get('nationality').setValue('Nigerian');
          Object.keys(this.addIndividualForm.controls).forEach((key) => {
            this.addIndividualForm.get(key).setErrors(null);
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
          
          this.reloadIndividuals(true);
          this.modalRef.close();
          this.initialiseForms();
          this.spinnerService.hide();
        } 
        else {
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

  setIndividualEmail() {
    if (this.roleID === "1" || this.individualId == null) {
      this.disableIndividualEmail = null;
    } else {
      this.disableIndividualEmail = true;
    }
  }

  checkDate(event) {
    let dateLimit = new Date();
    console.log("event: ", event);

    if (
      Date.parse(event) < dateLimit.setFullYear(1960, 1, 1) ||
      Date.parse(event) > dateLimit.setFullYear(2021, 1, 1)
    ) {
      this.dateInvalid = true;
    } else {
      this.dateInvalid = false;
    }
  }
  
  validateTinPhoneNinBvn(selectedForm) {
    let tin = selectedForm.get('individualTIN').value;
    let nin = selectedForm.get('nin').value;
    let bvn = selectedForm.get('bvn').value;

    if ((tin == "" || tin == null) && (nin == "" || nin == null) && (bvn == "" || bvn == null)) 
    {
      this.validateCacTin = true;
    }
    else {
      this.validateCacTin = false;
    }
  }

  changeTinPhoneNinBvnStatus() {
    this.validateCacTin = false;
  }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + "tax-offices";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      // console.log("taxTaxOffices: ", data);
      this.unfilteredTaxTaxOffices = data.response;

      if (this.roleID === "1") {
        this.taxTaxOffices = this.unfilteredTaxTaxOffices;
      } else {
        this.taxTaxOffices = this.unfilteredTaxTaxOffices;
      }
    });
  }

  getIndustrySectors() {
    this.apiUrl = environment.AUTHAPIURL + "industry-sectors";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      // console.log("industrySectors: ", data);
      this.industrySectors = data.response;
    });
  }

  getZipcodes() {
    this.apiUrl = environment.AUTHAPIURL + "postalcodes";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      // console.log("zipcodes: ", data);
      this.zipCodes = data.response;
    });
  }

  getStateLocalGovts() {
    // this.stateLocalGovts = this.utilityService.getStateLocalGovts();
    this.apiUrl = `${environment.AUTHAPIURL}local-governments`;

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      this.stateLocalGovts = data.response;
      // console.log("stateLocalGovts: ", data);
    });
  }

  getSingleIndividual(individualId, isUpdateEmail: boolean) {
    // this.detailsView = true;
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}individuals/${individualId}/show`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
        console.log("singleIndividualData: ", data);
        this.selectedIndividual = data.response;

        this.loadSelectedCorporateData(this.selectedIndividual, isUpdateEmail);
        // this.getPayments(this.selectedIndividual.taxpayer_id);
        // this.getDAPayment(this.selectedIndividual.taxpayer_id);
        this.spinnerService.hide();
      });
  }

  loadSelectedCorporateData(selectedIndividual, isUpdateEmail: boolean) {
    // console.log("th: ", this.disableIndividualFormControls);
    if (isUpdateEmail) {

    } else {
      this.addIndividualForm = this.formBuilder.group({
        emailAddress: [
          selectedIndividual.email,
          [
            Validators.maxLength(60),
            Validators.pattern(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ),
          ],
        ],
        firstName: [
          selectedIndividual.first_name,
          [
            Validators.required,
            Validators.pattern(/^[a-zA-Z]+$/),
            Validators.maxLength(60),
          ],
        ],
        surname: [
          selectedIndividual.surname,
          [
            Validators.required,
            Validators.pattern(/^[a-zA-Z]+$/),
            Validators.maxLength(60),
          ],
        ],
        titleId: [selectedIndividual.title, Validators.required],

        individualTIN: [
          selectedIndividual.tin,
          [
            Validators.pattern(/^[0-9\s]*$/),
            Validators.minLength(10),
            Validators.maxLength(10),
          ],
        ],
        phoneNumber: [
          selectedIndividual.phone,
          [
            Validators.required,
            Validators.minLength(11),
            Validators.maxLength(11),
            Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
          ],
        ],
        nationality: [selectedIndividual.nationality, Validators.required],
        genderId: [selectedIndividual.gender, Validators.required],
        dateOfBirth: [selectedIndividual.date_of_birth, Validators.required],
        maritalStatus: [selectedIndividual.marital_status, Validators.required],
        occupation: [
          selectedIndividual.occupation,
          [
            Validators.required,
            Validators.pattern("^[A-Za-z 0-9 _-]*[A-Za-z0-9][A-Za-z0-9 _]*$"),
          ],
        ],
        bvn: [
          selectedIndividual.bvn,
          [
            Validators.minLength(11),
            Validators.pattern(/^[0-9]*$/),
          ],
        ],
        nin: [
          selectedIndividual.nin,
          [
            Validators.minLength(11),
            Validators.pattern(/^[0-9]*$/),
          ],
        ],
        contactAddress: [
          selectedIndividual.home_address,
          [
            Validators.required,
            Validators.maxLength(200),
            Validators.minLength(6),
            Validators.pattern(/[A-Za-z0-9'\.\-\s\,]/),
          ],
        ],
        zipCode: [
          selectedIndividual.zip_code == null
            ? ""
            : selectedIndividual.zip_code,
          [Validators.required],
        ],
        taxOfficeId: [
          selectedIndividual.tax_office_id == null
            ? ""
            : selectedIndividual.tax_office_id,
          [Validators.required],
        ],
        localGovernmentId: [
          selectedIndividual.lga_code == null
            ? ""
            : selectedIndividual.lga_code,
          [Validators.required],
        ],
      });
    }
  }
}
