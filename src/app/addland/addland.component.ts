import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import Swal from "sweetalert2";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-addland',
  templateUrl: './addland.component.html',
  styleUrls: ['./addland.component.css']
})
export class AddlandComponent implements OnInit {
  @Input() modalRef;
  // @Input() assetTypeId; showHeader
  @Input() corporateId;
  @Input() individualId;
  @Input() landId;
  @Input() showHeader;
  @Input() showSaveButton;
  @Output() reloadAssetList = new EventEmitter();

  landForm: FormGroup;
  apiUrl: string;
  taxpayerRoles: any;
  localGovts: any;
  towns: any;
  landOwnerShips: any;
  landPurposes: any;
  landWards: any;
  submitted: boolean;
  unfilteredTowns: any;
  selectedLand: any;
  assetTypeId: number = 2;
  disableControls: boolean;
  modalTitle: string;
  unfilteredLandWards: any;

  constructor(
    private httpClient: HttpClient,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getLandItems();
    this.getTaxpayerRoles();
    this.initialiseForms();

    if (this.landId !== null) {
      this.getSingleLand(this.landId);
    }

    if (!this.showSaveButton) {
      this.disableControls = true;
      this.modalTitle = "View Land Details";
    }
    else {
      this.disableControls = null;
      this.modalTitle = "Add New Land";
    }
  }

  reloadAssets(reloadAssets: boolean) {
    this.reloadAssetList.emit(reloadAssets);
  }

  initialiseForms() {
    this.landForm = this.formBuilder.group({      
      taxPayerRoleId: ["", Validators.required],
      landOwnerShipId: ["", Validators.required],
      landName: [
        "",
        [
          Validators.required,
          // Validators.maxLength(60),
        ],
      ],
      landPurposeId: ["", Validators.required],
      houseNumber: ["", Validators.required],
      landSizeBreadth: ["", Validators.required],
      landSizeLength: ["", Validators.required],
      streetName: ["", Validators.required],
      cOfRefNumber: [""],
      wardId: ["", Validators.required],
      offStreetName: ["", Validators.required],
      landTownId: ["", Validators.required],
      landLocalGovtId: ["", Validators.required],
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
      // console.log("taxpayerRoles: ", data); && this.corporateId !== undefined)
    });
  }

  getLandItems() {
    this.apiUrl = `${environment.AUTHAPIURL}land/dependencies`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      console.log("landItems: ", data);
      let landItems = data.response;
      // this.landWards = landItems.wards;

      this.landOwnerShips = landItems.land_ownerships;
      this.landPurposes = landItems.land_purposes;
      this.localGovts = landItems.lgas;
      this.unfilteredTowns = landItems.towns;
      this.unfilteredLandWards = landItems.wards;

      if (this.landId !== null) {
        this.towns = this.unfilteredTowns;
        this.landWards = this.unfilteredLandWards;
        this.taxpayerRoles = landItems.taxpayer_roles;
      }
    });
  }

  onLocalGovtSelect(value) {
    this.towns = this.unfilteredTowns.filter(O => O.lga_id == value);
    console.log("towns", this.towns);
  }

  onLandTownSelect(value) {
    this.landWards = this.unfilteredLandWards?.filter(O => O.town_id == value);
  }

  onSubmitLand(formData: any) {
    this.submitted = true;
    this.assetTypeId = 2; // land - 2

    // stop the process here if form is invalid
    if (this.landForm.invalid) {
      return;
    }

    var requestObj = {
      asset_type_id: this.assetTypeId,
      land_name: formData.landName,
      house_number: formData.houseNumber,
      street_name: formData.streetName,
      off_street_name: formData.offStreetName,

      ward_id: formData.wardId,
      town_id: formData.landTownId,
      lga_id: formData.landLocalGovtId,
      land_ownership_id: formData.landOwnerShipId,
      land_purpose_id: formData.landPurposeId,

      land_length: formData.landSizeLength,
      land_breadth: formData.landSizeBreadth,
      co_ref_number: formData.cOfRefNumber,
      taxpayer_role_id: formData.taxPayerRoleId,

      latitude: formData.latitude,
      longitude: formData.longitude,
      // location_id: formData.landTownId,

      corporate_id: this.corporateId,
      individual_id: this.individualId,
    };

    console.log("landPostObjData: ", requestObj);
    this.postAddLandData(requestObj);
  }

  postAddLandData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}lands`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        // console.log(data);

        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.landForm.controls).forEach((key) => {
            this.landForm.get(key).setErrors(null);
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
  
  getSingleLand(landId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}lands/${landId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      console.log("selectedLandData: ", data);
      this.selectedLand = data.response;
      this.loadselectedLandData(this.selectedLand);
      this.spinnerService.hide();
    });
  }

  loadselectedLandData(selectedLand) {
    this.landForm = this.formBuilder.group({      
      taxPayerRoleId: [selectedLand.taxpayer_role[0]?.id, Validators.required],
      landOwnerShipId: [selectedLand.land_ownership_id, Validators.required],
      landName: [
        selectedLand.land_name,
        [
          Validators.required,
          // Validators.maxLength(60),
        ],
      ],
      landPurposeId: [selectedLand.land_purpose_id, Validators.required],
      houseNumber: [selectedLand.house_number, Validators.required],
      landSizeBreadth: [selectedLand.land_breadth, Validators.required],
      landSizeLength: [selectedLand.land_length, Validators.required],
      streetName: [selectedLand.street_name, Validators.required],
      cOfRefNumber: [selectedLand.co_ref_number],
      wardId: [selectedLand.ward_id, Validators.required],
      offStreetName: [selectedLand.off_street_name, Validators.required],
      landTownId: [selectedLand.town_id, Validators.required],
      landLocalGovtId: [selectedLand.lga_id],
      latitude: [selectedLand.latitude, Validators.required],
      longitude: [selectedLand.longitude, Validators.required],
     
    });
  }

}
