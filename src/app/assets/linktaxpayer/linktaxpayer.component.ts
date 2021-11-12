import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  selector: 'app-linktaxpayer',
  templateUrl: './linktaxpayer.component.html',
  styleUrls: ['./linktaxpayer.component.css']
})
export class LinktaxpayerComponent implements OnInit {
  @Input() modalRef;
  @Input() corporateId;
  @Input() individualId;
  @Input() landId;
  @Input() businessId;
  @Input() buildingId;
  @Input() assetTypeId;
  @Output() reloadLinkedTaxpayers = new EventEmitter();
  
  dtOptions: any = {};
  modalOptions: NgbModalOptions;
  linkTaxpayerForm: FormGroup; //
  searchTaxpayerForm: FormGroup;
  taxpayerTypeForm: FormGroup;
  apiUrl: string;
  submitted: boolean;
  selectedTaxpayerTypeId: any;
  showSearchTaxpayerButton: boolean;
  taxpayerRoles: any;
  taxpayerTypes: any;
  searchTaxpayerModalRef: any;
  showCreateTaxpayerButton: boolean;
  createTaxpayerModalRef: any;
  individualTaxpayer: boolean;
  corporateTaxpayer: boolean;
  corporatesData: any = [];
  individualsData: any = [];
  // assetTypeId: any = 1; //business - 1, land - 2, building - 3
  selectedTaxpayerRoleId: any;
  disableTaxpayerFormControl: boolean;
  showFooterNote: boolean;

  constructor(private httpClient: HttpClient,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
    private datepipe: DatePipe,
    private utilityService: UtilityService,
    private sess: SessionService,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    console.log("assetTypeId: ", this.assetTypeId);
    this.getTaxpayerTypes();
    this.initialiseForms();
    this.intialiseTableProperties();

  }

  getUpdatedLinkedTaxpayers($event) {
    if ($event) {
      this.reloadLinkedTaxpayers.emit($event);
      this.modalRef.close();
    }
  }

  initialiseForms() {
    this.disableTaxpayerFormControl = null;

    this.linkTaxpayerForm = this.formBuilder.group({
      taxpayerName: [
        "",
        [
          Validators.required,
        ],
      ],
      taxpayerTypeId: ["", Validators.required],
      taxpayerRoleId: ["", Validators.required],
    });

    this.taxpayerTypeForm = this.formBuilder.group({
      taxpayerTypeId: ["", Validators.required],
    });

    this.initialiseSearchTaxpayerForm();
  }

  initialiseSearchTaxpayerForm() {
    this.searchTaxpayerForm = this.formBuilder.group({
      taxpayerName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^(?:[A-Za-z]+)(?:[A-Za-z0-9 _]*)$/),
          Validators.maxLength(40),
        ],
      ],
    });
  }

  intialiseTableProperties() {
    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      size: "xl",
    };

    
    this.dtOptions = {
      paging: true,
      // scrollX: true,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
      
    };
  }

  onSubmitLinkTaxpayer(formData: any) {
    this.submitted = true;
    console.log("corporateId: ", this.corporateId);
    console.log("individualId: ", this.individualId);

    // stop the process here if form is invalid
    if (this.linkTaxpayerForm.invalid) {
      return;
    }

    var requestObj = {};

    if (this.corporateId !== null && this.corporateId !== undefined) {
      requestObj = {
        taxpayer_role_id: formData.taxpayerRoleId,
        corporate_id: this.corporateId,
      };

     if (this.businessId !== null && this.businessId !== undefined) {
      requestObj["business_id"] = this.businessId;
     }

     if (this.buildingId !== null && this.buildingId !== undefined) {
      requestObj["building_id"] = this.buildingId;
     }

     if (this.landId !== null && this.landId !== undefined) {
      requestObj["land_id"] = this.landId;
     }

      this.postLinkTaxpayerData(requestObj);
    }

    if (this.individualId !== null && this.individualId !== undefined) {
      requestObj = {
        taxpayer_role_id: formData.taxpayerRoleId,
        individual_id: this.individualId,
      };

      if (this.businessId !== null && this.businessId !== undefined) {
        requestObj["business_id"] = this.businessId;
       }
  
       if (this.buildingId !== null && this.buildingId !== undefined) {
        requestObj["building_id"] = this.buildingId;
       }
  
       if (this.landId !== null && this.landId !== undefined) {
        requestObj["land_id"] = this.landId;
       }

      this.postLinkTaxpayerData(requestObj);
    }

    // console.log("linkAssetPostObjData: ", requestObj);
  }

  setAssetTypeIdForLinkTaxpayerRequest() {

  }

  postLinkTaxpayerData(jsonData: any) {
    this.corporateId = null;
    this.individualId = null;
    this.apiUrl = `${environment.AUTHAPIURL}asset-taxpayer/link`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.linkTaxpayerForm.controls).forEach((key) => {
            this.linkTaxpayerForm.get(key).setErrors(null);
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
          this.getUpdatedLinkedTaxpayers(true);
          // this.modalRef.close();
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

  showSearchTaxpayerModal(modal) {
    this.corporatesData = ''; this.individualsData = '';
    this.initialiseSearchTaxpayerForm();
    this.showCreateTaxpayerButton = false;
    this.searchTaxpayerModalRef = this.utilityService.openModal(modal);
  }

  onLinkTaxpayerTypeSelect(value) {
    this.selectedTaxpayerTypeId = value;
    this.selectedTaxpayerRoleId = "";

    this.toggleSearchTaxpayerButton();

    if (value == "") {
      this.taxpayerRoles = [];
      this.reInitialiseLinkAssetForm("");
      return;
    }

    this.getTaxpayerRoles();
  }

  onLinkTaxpayerRoleSelect(value) {
    this.selectedTaxpayerRoleId = value;
    this.toggleSearchTaxpayerButton();
  }

  toggleSearchTaxpayerButton() {
    if ((this.selectedTaxpayerTypeId !== "" && this.selectedTaxpayerTypeId !== undefined) && (this.selectedTaxpayerRoleId !== "" && this.selectedTaxpayerRoleId !== undefined)) {
      this.showSearchTaxpayerButton = true;
    }
    else {
      this.showSearchTaxpayerButton = false;
    }
  }

  getTaxpayerRoles() {
    this.apiUrl = `${environment.AUTHAPIURL}asset-taxpayer/relations`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      taxpayer_type: this.selectedTaxpayerTypeId == "Corporate" ? "Corporate" : "Individual",
      asset_type_id: this.assetTypeId,
    }

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      this.taxpayerRoles = data.response;
      console.log("taxpayerRoles: ", data);
    });
  }

  getTaxpayerTypes() {
    this.apiUrl = `${environment.AUTHAPIURL}taxpayer/types`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      // console.log("businessItems: ", data);
      this.taxpayerTypes = data.response;
    });
  }

  showCreateTaxpayerModal(modal) {
    this.resetTaxpayers();
    this.searchTaxpayerModalRef.close();
    this.createTaxpayerModalRef = this.utilityService.openModal(modal);

    if (this.selectedTaxpayerTypeId !== null) {
      console.log("selectedTaxpayerTypeId: ", this.selectedTaxpayerTypeId);

      this.searchTaxpayerForm = this.formBuilder.group({
        assetTypeId: [this.selectedTaxpayerTypeId, Validators.required],
      });

      this.onTaxpayerTypeChange(this.selectedTaxpayerTypeId);
    }
  }

  resetTaxpayers() {
    this.corporateTaxpayer = false;
    this.individualTaxpayer = false;
  }

  onTaxpayerTypeChange(id) {
    this.selectedTaxpayerTypeId = id;

    if (id == "Corporate") {
      this.corporateTaxpayer = true;
      this.individualTaxpayer = false;
      this.showFooterNote = true;
    } 
    else if (id == "Individual") {
      this.corporateTaxpayer = false;
      this.individualTaxpayer = true;
      this.showFooterNote = false;
    }
    
  }

  onSubmitSearchTaxpayer(formData: any) {
    this.submitted = true;
    // console.log("selectedLinkAssetTypeId: ", this.selectedLinkAssetTypeId);

    // stop the process here if form is invalid
    if (this.searchTaxpayerForm.invalid) {
      return;
    }

    if (this.selectedTaxpayerTypeId == "Corporate") {
      var corporateObj = {
        company_name: formData.taxpayerName,
        taxpayer_id: formData.taxpayerName,
      };

      this.postSearchCorporateData(corporateObj);
    }

    if (this.selectedTaxpayerTypeId == "Individual") {
      var individualObj = {
        taxpayer_name: formData.taxpayerName,
        taxpayer_id: formData.taxpayerName,
      };

      this.postSearchIndividualData(individualObj);
    }

    this.submitted = false;
  }

  postSearchCorporateData(requestObj) {
    this.apiUrl = `${environment.AUTHAPIURL}corporates-list`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, requestObj, { headers: reqHeader }).subscribe((data) => {
        console.log("corporatesApiData", data);

        if (data.status == true) {
          this.corporatesData = data.response.data;
          this.showCreateTaxpayerButton = this.corporatesData.length > 0 ? false : true;

          if (this.corporatesData.length == 0) {
            Swal.fire({
              icon: "info",
              title: "Info",
              text: "No corporate found for the search!",
              showConfirmButton: true,
              timer: 5000,
            });
          }
          else {
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
          }

          this.reInitialiseLinkAssetForm("");
          this.spinnerService.hide();
        } 
        else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.corporatesData = [];
        }

        this.spinnerService.hide();
      });
  }

  postSearchIndividualData(requestObj) {
    this.individualsData = "";
    this.apiUrl = `${environment.AUTHAPIURL}individuals-list`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, requestObj, { headers: reqHeader }).subscribe((data) => {
        // console.log("individualsApiData", data);
        if (data.status == true) {
          this.individualsData = data.response.data;
          this.showCreateTaxpayerButton = this.individualsData.length > 0 ? false : true;

          if (this.individualsData.length == 0) {
            Swal.fire({
              icon: "info",
              title: "Info",
              text: "No individual found for the search!",
              showConfirmButton: true,
              timer: 5000,
            });
          }
          else {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Result(s) found",
              showConfirmButton: true,
              timer: 5000,
            });
          }
          
          this.reInitialiseLinkAssetForm("");
          this.spinnerService.hide();
        } 
        else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.individualsData = [];
        }

        this.spinnerService.hide();
      });
  }


  selectCorporate(selectedCorporate) {
    console.log("selectedCorporate: ", selectedCorporate);
    this.corporateId = selectedCorporate.id;
    this.disableTaxpayerFormControl = true;
    this.reInitialiseLinkAssetForm(selectedCorporate.company_name);
    this.searchTaxpayerModalRef.close();
  }

  selectIndividual(selectedIndividual) {
    console.log("selectedIndividual", selectedIndividual);
    this.individualId = selectedIndividual.id;
    this.disableTaxpayerFormControl = true;
    this.reInitialiseLinkAssetForm(selectedIndividual.first_name + " " + selectedIndividual.surname);
    this.searchTaxpayerModalRef.close();
  }

  reInitialiseLinkAssetForm(taxpayerName) {
    this.linkTaxpayerForm = this.formBuilder.group({
      taxpayerName: [
        taxpayerName,
        [
          Validators.required,
        ],
      ],
      taxpayerTypeId: [this.selectedTaxpayerTypeId, Validators.required],
      taxpayerRoleId: [this.selectedTaxpayerRoleId, Validators.required],
    });

  }

}
