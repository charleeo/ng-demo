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
  selector: 'app-addcorporate',
  templateUrl: './addcorporate.component.html',
  styleUrls: ['./addcorporate.component.css']
})
export class AddcorporateComponent implements OnInit {
  @Input() modalRef;
  @Input() corporateId;
  @Input() taxPayerRoleId;
  @Input() businessId;
  @Input() buildingId;
  @Input() landId;
  @Input() showSaveButton: boolean;
  @Output() reloadLinkedTaxpayers = new EventEmitter(); //

  addCorporateForm: FormGroup;
  submitted: boolean = false;
  apiUrl: string;
  taxTaxOffices: any;
  industrySectors: any;
  taxPayerTypeId: string;
  taxPayerType: any;
  selfPortalApplicationId: number;
  title = 'Add Corporate'
  validateCacTin: boolean;
  stateLocalGovts: any;
  companyTypes: any;
  selectedCorporate: any;
  disableControls: boolean;
  modalTitle: string;
  linkTaxpayerRequestObj: any = {};

  constructor(private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private titleService: Title,
    private sess: SessionService,
    private flashMessage: FlashMessagesService,
    private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.title)
    this.initialiseForms();
    this.getTaxOffices();
    this.getIndustrySectors();
    this.getStateLocalGovts();
    this.getCompanyTypes();

    if (this.corporateId !== null) {
      this.getSingleCorporate(this.corporateId, false);
    }

    if (!this.showSaveButton) {
      // console.log("Here!");
      this.disableControls = true;
      this.modalTitle = "View Corporate Details";
    }
    else {
      // console.log("Her1!");
      this.disableControls = null;
      this.modalTitle = "Add New Corporate";
    }

    this.loadLinkTaxpayerObj();

  }

  reloadTaxpayers(reloadTaxpayers: boolean) {
    this.reloadLinkedTaxpayers.emit(reloadTaxpayers);
  }

  initialiseForms() {
    this.addCorporateForm = this.formBuilder.group({
      emailAddress: [
        "",
        [
          Validators.maxLength(60),
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      emailAddress2: [
        "",
        [
          Validators.maxLength(60),
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      companyName: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(?:[A-Za-z]+)(?:[A-Za-z0-9 _]*)$/),
          Validators.maxLength(60),
        ],
      ],
      companyTIN: [
        "",
        [
          Validators.maxLength(10),
          Validators.minLength(10),
          Validators.pattern(/^[0-9\s]*$/),
        ],
      ],
      phone: [
        "",
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
        ],
      ],
      phone2: [
        "",
        [
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
        ],
      ],
      taxOfficeId: ["", Validators.required],
      industrySectorId: ["", Validators.required],
      companyTypeId: ["", Validators.required],
      localGovernmentId: ["", Validators.required],
      contactAddress: [
        "",
        [
          Validators.required,
          Validators.maxLength(200),
          Validators.minLength(6),
          Validators.pattern(/[A-Za-z0-9'\.\-\s\,]/),
        ],
      ],
      cacRegNumber: [
        "",
        [
          Validators.maxLength(8),
          Validators.pattern("^[A-Za-z]{2}[0-9]{6}"),
        ],
      ],

      parentCompanyTaxPayerId: [
        "",
        [
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern("^[A-Za-z]{3}[0-9]{8}"),
        ],
      ],
    });
  }

  onSubmitAddCorporate(formData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    this.validateCacTinPhone(this.addCorporateForm)

    if (this.addCorporateForm.invalid || this.validateCacTin) {
      return;
    }

    this.taxPayerTypeId = localStorage.getItem("admin_taxpayer_type_id");
    this.selfPortalApplicationId = environment.SELFPORTAL_APPLICATION_ID;

    var requestObj = {
      cac_number: formData.cacRegNumber,
      taxpayer_type_id: this.taxPayerTypeId,

      tin: formData.companyTIN,
      phone: formData.phone,
      phone_2: formData.phone2,
      email: formData.emailAddress,
      email_2: formData.emailAddress2,
      industry_sector_id: formData.industrySectorId,
      tax_office_id: formData.taxOfficeId,
      contact_address: formData.contactAddress,
      company_name: formData.companyName,
      economic_activity_id: 1,
      application_id: this.selfPortalApplicationId,

      parent_taxpayer_id: formData.parentCompanyTaxPayerId,
      company_type_id: formData.companyTypeId,
      lga_code: formData.localGovernmentId,

      // taxpayer_role_id: this.taxPayerRoleId,
      // business_id: this.businessId,
    };

    console.log("corporatePostObjData: ", requestObj);
    this.postAddCorporateData(requestObj);
  }

  postAddCorporateData(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + "corporates";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        console.log("addCorporateResponseObj: ", data);
        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.addCorporateForm.controls).forEach((key) => {
            this.addCorporateForm.get(key).setErrors(null);
          });
         
          this.linkTaxpayerRequestObj["taxpayer_role_id"] = this.taxPayerRoleId;
          this.linkTaxpayerRequestObj["corporate_id"] = data.response.corporate.id;
          this.postLinkTaxpayerData(this.linkTaxpayerRequestObj);

          this.reloadTaxpayers(true);
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
            text: "Corporate has been created and linked successfully!",
            showConfirmButton: true,
            timer: 5000,
          });
          // this.getUpdatedLinkedTaxpayers(true);
          this.spinnerService.hide();
        } 
        else {
          this.spinnerService.hide();
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "An error occurred while linking the corporate. Please try again later!",
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  getSingleCorporate(corporateId, isUpdateEmail: boolean) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "corporates/" + corporateId;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
        // console.log("singleCorporateData: ", data);
        this.selectedCorporate = data.response;
        this.loadSelectedCorporateData(this.selectedCorporate, isUpdateEmail);
        this.spinnerService.hide();
      });
  }

  loadSelectedCorporateData(selectedCorporate, isUpdateEmail: boolean) {
    // console.log("th: ", this.disableCorporateFormControl);
    this.addCorporateForm = this.formBuilder.group({
      emailAddress: [
        selectedCorporate.email,
        [
          Validators.maxLength(60),
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      emailAddress2: [
        selectedCorporate.email_2,
        [
          Validators.maxLength(60),
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      companyName: [
        selectedCorporate.company_name,
        [
          Validators.required,
          Validators.pattern(/^(?:[A-Za-z]+)(?:[A-Za-z0-9 _]*)$/),
          Validators.maxLength(60),
        ],
      ],
      companyTIN: [
        selectedCorporate.tin,
        [
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(/^[0-9\s]*$/),
        ],
      ],
      phone: [
        selectedCorporate.phone,
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
        ],
      ],
      phone2: [
        selectedCorporate.phone_2,
        [
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
        ],
      ],
      taxOfficeId: [selectedCorporate.tax_office_id, Validators.required],
      industrySectorId: [
        selectedCorporate.industry_sector_id,
        Validators.required,
      ],
      companyTypeId: [
        selectedCorporate.company_type_id == null
          ? ""
          : selectedCorporate.company_type_id,
        Validators.required,
      ],
      localGovernmentId: [
        selectedCorporate.lga_code == null
          ? ""
          : selectedCorporate.lga_code,
        Validators.required,
      ],
      contactAddress: [
        selectedCorporate.contact_address,
        [
          Validators.required,
          Validators.maxLength(200),
          Validators.minLength(6),
          Validators.pattern(/[A-Za-z0-9'\.\-\s\,]/),
        ],
      ],
      cacRegNumber: [
        selectedCorporate.cac_number,
        [
          Validators.maxLength(8),
          Validators.pattern("^[A-Za-z]{2}[0-9]{6}"),
        ],
      ],

      parentCompanyTaxPayerId: [
        selectedCorporate.taxpayer_id,
        [
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern("^[A-Za-z]{3}[0-9]{8}"),
        ],
      ],
    });

  }

  validateCacTinPhone(selectedForm) {
    let tin = selectedForm.get('companyTIN').value;
    let cac = selectedForm.get('cacRegNumber').value;

    if ((tin == "" || tin == null) && (cac == "" || cac == null)) {
      this.validateCacTin = true;
    }
    else {
      this.validateCacTin = false;
    }
  }
  
  changeCacTinPhoneStatus() {
    this.validateCacTin = false;
  }

  getTaxOffices() {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + 'tax-offices';

    this.httpClient.get<any>(this.apiUrl).subscribe(data => {
      // console.log('taxTaxOffices: ', data);
      this.taxTaxOffices = data.response;
    });
    this.spinnerService.hide();
  }

  getIndustrySectors() {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + 'industry-sectors';

    this.httpClient.get<any>(this.apiUrl).subscribe(data => {
      // console.log('industrySectors: ', data);
      this.industrySectors = data.response;
    });
    this.spinnerService.hide();
  }

  getStateLocalGovts() {
    this.apiUrl = `${environment.AUTHAPIURL}local-governments`;

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      this.stateLocalGovts = data.response;
      // console.log("stateLocalGovts: ", data);
    });
  }

  getCompanyTypes() {
    this.apiUrl = environment.AUTHAPIURL + "company-types";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      // console.log("companyTypes: ", data);
      this.companyTypes = data.response;
    });
  }

}
