import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import Swal from "sweetalert2";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-addbuilding',
  templateUrl: './addbuilding.component.html',
  styleUrls: ['./addbuilding.component.css']
})
export class AddbuildingComponent implements OnInit {
  @Input() modalRef;
  @Input() corporateId;
  @Input() individualId;
  @Input() buildingId;
  @Input() showSaveButton;
  @Input() showHeader: boolean;
  @Output() reloadAssetList = new EventEmitter();

  buildingForm: FormGroup;
  apiUrl: string;
  taxpayerRoles: any;
  localGovts: any;
  towns: any;
  buildingWards: any;
  submitted: boolean;
  buildingStatuses: any;
  buildingOccupancies: any;
  buildingOwnerships: any;
  buildingTypes: any;
  buildingPurposes: any;
  buildingCompletions: any;
  disableControls: any;
  selectedBuilding: any;
  unfilteredTowns: any;
  assetTypeId: any = 3;
  modalTitle: string;
  unfilteredBuildingWards: any;

  constructor(
    private httpClient: HttpClient,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getBuildingItems();
    this.getTaxpayerRoles();
    this.initialiseForms();

    if (this.buildingId !== null) {
      this.getSingleBuilding(this.buildingId);
    }

    if (!this.showSaveButton) {
      this.disableControls = true;
      this.modalTitle = "View Building Details";
    }
    else {
      this.disableControls = null;
      this.modalTitle = "Add New Building";
    }
  }

  reloadAssets(reloadAssets: boolean) {
    this.reloadAssetList.emit(reloadAssets);
  }

  initialiseForms() {
    this.buildingForm = this.formBuilder.group({
      taxPayerRoleId: ["", Validators.required],
      buildingCompletionId: ["", Validators.required],
      buildingName: [
        "",
        [
          Validators.required,
          // Validators.maxLength(60),
        ],
      ],
      buildingPurposeId: ["", Validators.required],
      houseNumber: ["", Validators.required],
      // landSizeBreadth: ["", Validators.required],
      buildingTypeId: ["", Validators.required],
      streetName: ["", Validators.required],
      buildingOwnershipId: ["", Validators.required],
      buildingOccupancyId: ["", Validators.required],
      wardId: ["", Validators.required],
      offStreetName: ["", Validators.required],
      buildingTownId: ["", Validators.required],
      buildingStatusId: ["", Validators.required],
      buildingLocalGovtId: ["", Validators.required],
      latitude: ["", Validators.required],
      longitude: ["", Validators.required],
     
    });
  }

  getTaxpayerRoles() {
    this.apiUrl = `${environment.AUTHAPIURL}asset-taxpayer/relations`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      taxpayer_type: (this.corporateId !== undefined && this.individualId == undefined) ? null : (this.corporateId !== null && this.corporateId !== undefined) ? "Corporate" : "Individual",
      asset_type_id: this.assetTypeId
    }

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      this.taxpayerRoles = data.response;
      // console.log("taxpayerRoles: ", data);
    });

    // this.taxpayerRoles = this.utilityService.getTaxpayerRoles(obj);
    // console.log("this.taxpayerRoles :", this.taxpayerRoles);
  }

  getSingleBuilding(buildingId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}building/${buildingId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      console.log("selectedBuildingData: ", data);
      this.selectedBuilding = data.response;
      this.loadselectedBuildingData(this.selectedBuilding);
      this.spinnerService.hide();
    });
  }

  loadselectedBuildingData(selectedBuilding) {
    this.buildingForm = this.formBuilder.group({      
      taxPayerRoleId: [selectedBuilding.taxpayer_role[0]?.id, Validators.required],
      buildingCompletionId: [selectedBuilding.building_completion_id, Validators.required],
      buildingName: [
        selectedBuilding.building_name,
        [
          Validators.required,
          // Validators.maxLength(60),
        ],
      ],
      buildingPurposeId: [selectedBuilding.building_purpose_id, Validators.required],
      houseNumber: [selectedBuilding.house_number, Validators.required],
      buildingTypeId: [selectedBuilding.building_type_id, Validators.required],
      buildingOwnershipId: [selectedBuilding.building_ownership_id, Validators.required],
      streetName: [selectedBuilding.street_name, Validators.required],
      buildingOccupancyId: [selectedBuilding.building_occupancy_id],
      wardId: [selectedBuilding.ward_id, Validators.required],
      offStreetName: [selectedBuilding.off_street_name, Validators.required],
      buildingTownId: [selectedBuilding.town_id, Validators.required],
      buildingStatusId: [selectedBuilding.building_status, Validators.required],
      buildingLocalGovtId: [selectedBuilding.lga_id, Validators.required],
      latitude: [selectedBuilding.latitude, Validators.required],
      longitude: [selectedBuilding.longitude, Validators.required],
    });
  }

  getBuildingItems() {
    this.apiUrl = `${environment.AUTHAPIURL}buildings/all-dependencies`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      console.log("buildingItems: ", data);
      let buildingItems = data.response;
      this.buildingCompletions = buildingItems.building_completion;
      this.buildingPurposes = buildingItems.building_purpose;
    
      this.localGovts = buildingItems.lgas;
      this.unfilteredTowns = buildingItems.towns;
      this.unfilteredBuildingWards = buildingItems.wards;

      this.buildingTypes = buildingItems.building_type;
      this.buildingOwnerships = buildingItems.building_ownership;
      this.buildingOccupancies = buildingItems.building_occupancy;
      this.buildingStatuses = buildingItems.building_status;

      if (this.buildingId !== null) {
        this.taxpayerRoles = buildingItems.taxpayer_roles;
        this.towns = this.unfilteredTowns;
        this.buildingWards = this.unfilteredBuildingWards;
      }
    });
  }


  onLocalGovtSelect(value) {
    this.towns = this.unfilteredTowns.filter(O => O.lga_id == value);
    console.log("towns", this.towns);
  }

  onBuildingTownSelect(value) {
    this.buildingWards = this.unfilteredBuildingWards?.filter(O => O.town_id == value);
  }

  onSubmitBuilding(formData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.buildingForm.invalid) {
      return;
    }

    var requestObj = {
      asset_type_id: this.assetTypeId,
      building_name: formData.buildingName,
      house_number: formData.houseNumber,
      street_name: formData.streetName,
      off_street_name: formData.offStreetName,
      ward_id: formData.wardId,
      lga_id: formData.buildingLocalGovtId,
      town_id: formData.buildingTownId,
      
      building_ownership_id: formData.buildingOwnershipId,
      building_purpose_id: formData.buildingPurposeId,
      building_status: formData.buildingStatusId,
      building_type_id: formData.buildingTypeId,
      building_occupancy_id: formData.buildingOccupancyId,
      building_completion_id: formData.buildingCompletionId,
      latitude: formData.latitude,
      longitude: formData.longitude,
      // location_id: formData.buildingTownId,
      taxpayer_role_id: formData.taxPayerRoleId,

      corporate_id: this.corporateId,
      individual_id: this.individualId,    
    };

    console.log("buildingPostObjData: ", requestObj);
    this.postAddBuildingData(requestObj);
  }

  postAddBuildingData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}building/store`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.buildingForm.controls).forEach((key) => {
            this.buildingForm.get(key).setErrors(null);
          });

          if ((this.corporateId !== null && this.corporateId !== undefined) || (this.individualId !== null && this.individualId !== undefined)) {
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
}
