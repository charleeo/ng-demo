import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import Swal from "sweetalert2";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-addbusiness',
  templateUrl: './addbusiness.component.html',
  styleUrls: ['./addbusiness.component.css']
})
export class AddbusinessComponent implements OnInit {
  @Input() modalRef;
  @Input() corporateId;
  @Input() individualId;
  @Input() businessId;
  @Input() showSaveButton: boolean;
  @Input() showHeader: boolean;
  @Output() reloadAssetList = new EventEmitter();
  
  businessForm: FormGroup;
  submitted: boolean = false;
  apiUrl: string;
  industrySectors: any;
  taxpayerRoles: any;
  businessStatuses: any;
  businessTypes: any;
  businessMobilities: any;
  assetTypes: any;
  industrySubSectors: any;
  localGovts: any;
  towns: any;
  landWards: any;
  unfilteredTowns: any;
  unfilteredIndustrySubSectors: any;
  assetTypeId: number = 1;
  selectedBusiness: any;
  disableControls: boolean;
  businessSizes: any;
  modalTitle: string;
  unfilteredBusinessMobilities: any;
  businessOperations: any;
  unfilteredLandWards: any;
  unfilteredIndustrySectors: any;
  

  constructor(
    private httpClient: HttpClient,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getBusinessItems();
    this.getTaxpayerRoles();
    this.initialiseForms();

    if (this.businessId !== null) {
      this.getSingleBusiness(this.businessId);
    }

    if (!this.showSaveButton) {
      this.disableControls = true;
      this.modalTitle = "View Business Details";
    }
    else {
      this.disableControls = null;
      this.modalTitle = "Add New Business";
    }

    // console.log("assetTypeId: ", this.assetTypeId);
  }

  reloadAssets(reloadAssets: boolean) {
    this.reloadAssetList.emit(reloadAssets);
  }

  initialiseForms() {
    this.businessForm = this.formBuilder.group({ 
      taxPayerRoleId: ["", Validators.required],
      businessName: [
        "",
        [
          Validators.required,
          // Validators.maxLength(60),
        ],
      ],
      businessTypeId: ["", Validators.required],
      businessLocalGovtId: ["", Validators.required],
      businessMobilityId: ["", Validators.required],
      businessTownId: ["", Validators.required],
      industrySectorId: ["", Validators.required],
      wardId: ["", Validators.required],
      industrySubSectorId: ["", Validators.required],
      businessSizeId: [""],
      phoneNumber: [
        "",
        [
          Validators.required,
          Validators.maxLength(11),
          Validators.minLength(11),
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
        ],
      ],
      businessStatusId: ["", Validators.required],
      contactName: ["", Validators.required],
      businessOperationId: [""],
      contactAddress: [
        "",
        [
          Validators.required,
          Validators.maxLength(200),
          Validators.minLength(6),
          Validators.pattern(/[A-Za-z0-9'\.\-\s\,]/),
        ],
      ],
    });
  }

  getTaxpayerRoles() {
    this.apiUrl = `${environment.AUTHAPIURL}asset-taxpayer/relations`;
    console.log("corporateId: ", this.corporateId);
    console.log("individualId: ", this.individualId);

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      taxpayer_type: (this.corporateId == undefined && this.individualId == undefined) ? null : (this.corporateId !== null && this.corporateId !== undefined) ? "Corporate" : "Individual",
      asset_type_id: this.assetTypeId
    }

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      this.taxpayerRoles = data.response;

      if (this.individualId !== undefined) {
        this.taxpayerRoles = this.taxpayerRoles.filter(O => !O.name.includes("Time"));
      }

      console.log("taxpayerRoles: ", this.taxpayerRoles);
    });
  }

  getBusinessItems() {
    this.apiUrl = `${environment.AUTHAPIURL}business/dependencies`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      console.log("businessItems: ", data);
      let businessItems = data.response;
      this.businessStatuses = businessItems.business_statuses;
      this.businessTypes = businessItems.business_types;
      this.assetTypes = businessItems.asset_types;
      this.businessSizes = businessItems.business_sizes;
      this.businessOperations = businessItems.business_operations;

      this.unfilteredIndustrySubSectors = businessItems.industry_subsectors;
      this.localGovts = businessItems.lgas;
      this.unfilteredTowns = businessItems.towns;

      this.unfilteredLandWards = businessItems.wards;
      this.unfilteredIndustrySectors = businessItems.industry_sectors;
      this.unfilteredBusinessMobilities = businessItems.business_mobilities;

      if (this.businessId !== null) {
        // console.log("businessId", this.businessId);
        this.towns = this.unfilteredTowns;
        this.industrySubSectors = this.unfilteredIndustrySubSectors;
        this.taxpayerRoles = businessItems.taxpayer_roles;

        this.landWards = this.unfilteredLandWards;
        this.industrySectors = this.unfilteredIndustrySectors;
        this.businessMobilities = this.unfilteredBusinessMobilities;
      }

    });
  }

  onLocalGovtSelect(value) {
    this.towns = this.unfilteredTowns?.filter(O => O.lga_id == value);
  }

  onIndustrySectorSelect(value) {
    this.industrySubSectors = this.unfilteredIndustrySubSectors?.filter(O => O.industry_sector_id == value);
    console.log("value: ", value);
    console.log("industrySubSectors: ", this.industrySubSectors);
  }

  onBusinessTypeSelect(value) {
    this.businessMobilities = this.unfilteredBusinessMobilities?.filter(O => O.business_type_id == value);
  }

  onBusinessTownSelect(value) {
    this.landWards = this.unfilteredLandWards?.filter(O => O.town_id == value);
  }

  onBusinessMobilitySelect(value) {
    this.industrySectors = this.unfilteredIndustrySectors?.filter(O => O.business_mobility_id == value);
  }

  onSubmitBusiness(formData: any) {
    this.submitted = true;
    this.assetTypeId = 1; // businessId - 1

    // stop the process here if form is invalid
    if (this.businessForm.invalid) {
      return;
    }

    var requestObj = {
      asset_type_id: this.assetTypeId,
      business_size: formData.businessSizeId,
      business_operation: formData.businessOperationId,
      business_name: formData.businessName,
      ward_id: formData.wardId,
      town_id: formData.businessTownId,
      lga_id: formData.businessLocalGovtId,
      
      contact_name: formData.contactName,
      phone_number: formData.phoneNumber,
      business_address: formData.contactAddress,
      business_status: formData.businessStatusId,
      business_type: formData.businessTypeId,
      business_mobility: formData.businessMobilityId,
      taxpayer_role_id: formData.taxPayerRoleId,
      industry_sector_id: formData.industrySectorId,
      industry_subsector_id: formData.industrySubSectorId,
      // location_id: formData.businessTownId,

      corporate_id: this.corporateId,
      individual_id: this.individualId,
    };

    console.log("businessPostObjData: ", requestObj);
    this.postAddBusinessData(requestObj);
  }


  postAddBusinessData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}businesses`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        // console.log(data);

        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.businessForm.controls).forEach((key) => {
            this.businessForm.get(key).setErrors(null);
          });

          if ((this.corporateId !== null && this.corporateId !== undefined) || (this.individualId !== null && this.individualId !== undefined)) {
            // console.log("corporateId: ", this.corporateId);
            // console.log("individualId: ", this.individualId);
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Asset has been created and linked successfully!",
              showConfirmButton: true,
              timer: 5000,
            });
          }
          else {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Asset has been created successfully!",
              showConfirmButton: true,
              timer: 5000,
            });
          }
          this.reloadAssets(true);
          this.modalRef.close();
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

  getSingleBusiness(businessId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}businesses/${businessId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
        console.log("selectedBusinessData: ", data);
        this.selectedBusiness = data.response;
        this.loadselectedBusinessData(this.selectedBusiness);
        this.spinnerService.hide();
    });
  }

  loadselectedBusinessData(selectedBusiness) {   
    this.businessForm = this.formBuilder.group({
      taxPayerRoleId: [selectedBusiness.taxpayer_role[0]?.id, Validators.required],
      businessName: [
        selectedBusiness.business_name,
        [
          Validators.required,
        ],
      ],
      businessTypeId: [selectedBusiness.business_type?.id, Validators.required],
      businessLocalGovtId: [selectedBusiness.lga_id, Validators.required],
      businessMobilityId: [selectedBusiness.business_mobility?.id, Validators.required],
      businessTownId: [selectedBusiness.town_id, Validators.required],
      industrySectorId: [selectedBusiness.industry_sector_id, Validators.required],
      wardId: [selectedBusiness.ward_id, Validators.required],
      industrySubSectorId: [selectedBusiness.industry_subsector?.id, Validators.required],
      businessSizeId: [selectedBusiness.business_size],
      phoneNumber: [
        selectedBusiness.phone_number,
        [
          Validators.required,
          Validators.maxLength(11),
          Validators.minLength(11),
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
        ],
      ],
      businessStatusId: [selectedBusiness.business_status, Validators.required],
      contactName: [selectedBusiness.contact_name, Validators.required],
      businessOperationId: [selectedBusiness.business_operation],
      contactAddress: [
        selectedBusiness.business_address,
        [
          Validators.required,
          Validators.maxLength(200),
          Validators.minLength(6),
          Validators.pattern(/[A-Za-z0-9'\.\-\s\,]/),
        ],
      ],
    });
  }

}
