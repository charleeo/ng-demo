import { SchedulesComponent } from './../monthlyremittance/schedules/schedules.component';
import { Component, OnInit } from "@angular/core";
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
// import { FormBuilder, FormGroup } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { UtilityService } from "src/app/utility.service";

@Component({
  selector: "app-corporates",
  templateUrl: "./corporates.component.html",
  styleUrls: ["./corporates.component.css"],
})
export class CorporatesComponent implements OnInit {
  apiUrl: string;
  // apidata: any;
  dtOptions: any = {};
  dtOptionsPopUp: any = {};
  roleID: any;
  managerRole: boolean = false;
  // userID: any;
  corporateId: any;
  selectedCorporateId: any;
  modalOptions: NgbModalOptions;
  closeResult: string;
  selectedCorporate: any;
  // corporateUsersData: any;
  corporateForm: FormGroup;
  submitted: boolean = false;
  corporatesData: any;
  taxPayerTypeId: string;
  taxTaxOffices: any;
  industrySectors: any;
  showUpdateCorporate: boolean = false;
  showEditCorporate: boolean = false;
  showDeleteCorporate: boolean = true;
  showTaxOffice: boolean = false;
  updateCorporateForm: FormGroup;
  corporateTitle: string;
  myForm: FormGroup;
  sample_file: string;
  file: any;
  filePath: any;
  selfPortalApplicationId: number;
  addCorporateForm: FormGroup;
  editorRole: boolean = false;
  taxOfficeID: string;
  columnError: string[] = [];
  error: string;
  selectedCorporateTaxOfficeId: any;
  unfilteredTaxTaxOffices: any;
  disableCorporateFormControl: boolean;
  isEmailVerified: boolean;
  superAdmin: boolean = false;
  searchForm: FormGroup;
  title = "PAYE - Corporate Report";

  searchObject: any = {};
  config: any;
  currentPageLength: any = 10;

  showOtherTabs: boolean;
  linkedAssetData: any;
  paymentView: boolean;
  assessmentData: any;
  businessView: boolean;
  detailsView: boolean;
  companyTypes: any;
  stateLocalGovts: any;
  validateCacTin: boolean;
  showFootNote: boolean = true; 
  linkAssetForm: FormGroup;
  assetTypeForm: FormGroup;
  businessForm: FormGroup;
  businessAsset: boolean = false;
  buildingAsset: boolean = false;
  landAsset: boolean = false;
  vehicleAsset: boolean = false;
  assessmentModalRef: any;
  showLinkedAssetButton: boolean = false;
  showSearchAssetButton: boolean = false;
  selectedLinkAssetTypeId: any;
  taxpayerRoles: any;
  searchAssetModalRef: any;
  searchAssetForm: FormGroup;
  businessData: any = [];
  selectedBusinessId: any;
  selectedAssetTypeId: any;
  assetTypes: any;
  selectedAssetTypeName: any;
  landData: any = [];
  showCreateAssetButton: boolean = false;
  selectedBusiness: any;
  selectedLandId: any;
  selectedBuildingId: any;
  buildingData: any = [];
  selectedLinkAssetTypeName: any;
  linkAssetModalRef: any;
  linkAssetRequestObj: any = {};
  payeAssessmentData: any;
  selectedTaxpayerRoleId: any;
  disableLinkAssetFormControl: boolean;

  SingleSectorData: any;
  whtAssessmentsData: any;
  selectedTaxpayerId: any;

  get f() {
    return this.myForm.controls;
  }

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
    private sess: SessionService,
    private utilityService: UtilityService,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.roleID = localStorage.getItem("admin_role_id");
    this.taxOfficeID = localStorage.getItem("admin_tax_office_id");
    this.corporateId = localStorage.getItem("admin_corporate_id");
  
    this.getAssetTypes();
    // console.log("this.taxOfficeID: ", this.taxOfficeID);

    if (this.roleID === "1") {
      this.showTaxOffice = true;
    }

    if (this.roleID === "2") {
      this.showTaxOffice = false;
      this.managerRole = true;
    }

    if (this.roleID === "3") {
      this.showTaxOffice = false;
      this.editorRole = true;
      this.showEditCorporate = true;
    }

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getCorporates(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );

    this.intialiseTableProperties();

    this.getStateLocalGovts();
    this.getTaxOffices();
    this.getIndustrySectors();
    this.getCompanyTypes();
    this.initialiseForms();

    this.myForm = this.formBuilder.group({
      myfile: ["", Validators.required],
    });

    this.sample_file = environment.SAMPLE_FILE_URL + "corporate-template.xlsx";
    // this.getCorporates();
  }

  getUpdatedLinkedAssets($event) {
    // console.log("returnedValue: ", $event);
    // this.Total = $event;
    if ($event) {
      this.getAssetData();
      this.linkAssetModalRef.close();
    }
  }

  getStateLocalGovts() {
    this.apiUrl = `${environment.AUTHAPIURL}local-governments`;

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      this.stateLocalGovts = data.response;
      console.log("stateLocalGovts: ", data);
    });
  }

  getTaxpayerRoles() {
    this.apiUrl = `${environment.AUTHAPIURL}asset-taxpayer/relations`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      taxpayer_type: "Corporate",
      asset_type_id: this.selectedLinkAssetTypeId
    }

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      this.taxpayerRoles = data.response;
      console.log("taxpayerRoles: ", data);
    });

    // this.taxpayerRoles = this.utilityService.getTaxpayerRoles(obj);
    // console.log("this.taxpayerRoles :", this.taxpayerRoles);
  }

  initialiseForms() {
    this.initialiseCorporateForm();   
    this.initialiseLinkAssetForm(); 
    this.initialiseSearchAssetForm();

    this.assetTypeForm = this.formBuilder.group({
      assetTypeId: ["", Validators.required],
    });

    this.updateCorporateForm = this.formBuilder.group({
      emailAddress: [
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
      phone: [
        "",
        [
          Validators.required,
          Validators.maxLength(11),
          Validators.minLength(11),
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
        ],
      ],
      taxOfficeId: ["", Validators.required],
    });

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

    this.searchForm = this.formBuilder.group({
      industrySectorId: [''],
      taxOfficeId: [''],
      companyName: [''],
      registeredFromId: [''],
      emailAddress: [
        '',
        [
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
    });
  }

  initialiseCorporateForm() {
    this.corporateForm = this.formBuilder.group({
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
        ]
      ],
      phone: [
        "",
        [
          Validators.required,
          Validators.maxLength(11),
          Validators.minLength(11),
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
        ],
      ],
      phone2: [
        "",
        [
          Validators.maxLength(11),
          Validators.minLength(11),
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

  initialiseLinkAssetForm() {
    this.disableLinkAssetFormControl = null;

    this.linkAssetForm = this.formBuilder.group({
      assetName: [
        "",
        [
          Validators.required,
        ],
      ],
      assetTypeId: ["", Validators.required],
      taxpayerRoleId: ["", Validators.required],
    });
  }

  initialiseSearchAssetForm() {
    this.searchAssetForm = this.formBuilder.group({
      assetName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[0-9A-Za-z'-]+(?:\s[0-9A-Za-z'-]+)*$/),
          Validators.maxLength(60),
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
      paging: false,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: false,
      processing: false,
      ordering: false,
      info: false,
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
        {
          extend: "csv",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-csv"> CSV</i>',
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
        },
        {
          extend: "excel",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-excel"> Excel</i>',
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
        },

        {
          extend: 'pdfHtml5',
          className: "btn btn-outline-dark export-btn",
          text: '<i class="fas fa-file-pdf"> PDF</i>',
          orientation: "landscape",
          pageSize: "LEGAL",
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5, 6, 7],
          },

          customize: function (doc) {
              doc.content.splice( 1, 0, {
                  margin: [ 0, 0, 0, 10 ],
                  alignment: 'left',
                  image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA68AAAA1CAIAAAAh70oGAAAACXBIWXMAAAsTAAALEwEAmpwYAAA5lmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiCiAgICAgICAgICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnhtcC5kaWQ6MzNCNjUyQkVCMzA2MTFFQjk1MkRFMzY4RUE5RUM4Rjc8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6OTYyYjQxNjktYjc1ZC03MzRkLTllNDgtMTA4MjhjZDVlM2FkPC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RGVyaXZlZEZyb20gcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICA8c3RSZWY6aW5zdGFuY2VJRD54bXAuaWlkOjdBNUZDRjE0QUUzMzExRUI5REM3Q0U5NDU5NTRDN0IwPC9zdFJlZjppbnN0YW5jZUlEPgogICAgICAgICAgICA8c3RSZWY6ZG9jdW1lbnRJRD54bXAuZGlkOjdBNUZDRjE1QUUzMzExRUI5REM3Q0U5NDU5NTRDN0IwPC9zdFJlZjpkb2N1bWVudElEPgogICAgICAgICA8L3htcE1NOkRlcml2ZWRGcm9tPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6MzNCNjUyQkVCMzA2MTFFQjk1MkRFMzY4RUE5RUM4Rjc8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjk2MmI0MTY5LWI3NWQtNzM0ZC05ZTQ4LTEwODI4Y2Q1ZTNhZDwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAyMS0wNS0xMlQxNTo0NyswNTozMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICAgICA8c3RFdnQ6Y2hhbmdlZD4vPC9zdEV2dDpjaGFuZ2VkPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6U2VxPgogICAgICAgICA8L3htcE1NOkhpc3Rvcnk+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDIxLTA1LTEyVDE1OjExOjE4KzA1OjMwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMjEtMDUtMTJUMTU6NDcrMDU6MzA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDIxLTA1LTEyVDE1OjQ3KzA1OjMwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9ybWF0PgogICAgICAgICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT42NTUzNTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+OTQzPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjUzPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz78EqEbAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAADnBSURBVHja7J13WFTX1v/Xmcoww8zQe5eOUhQsgF2wYTf2rlGikYixm6uisaKixhZbYkcxqCi2qGBHeu8IKEgv02Dq+f2xzcm8aPTm995735i7P8+jzz777FNmnzPMd6+99loESZKAwWAwGAwGg8H8V0LDXYDBYDAYDAaDwWoYg8FgMBgMBoPBahiDwWAwGAwGg8FqGIPBYDAYDAaDwWoYg8FgMBgMBoPBahiDwWAwGAwGg8FqGIPBYDAYDAaD+dvA+JecRa2QSGozpPW5CkmNWiEGkiQIOkNHyNKz5Jp25Zn5EjQG7msMBoPBYDAYzF8N4n+ZfaOpJL6l5KZS1sQx6GLnM0Iq1TDYPLbQEEhl25syQi1WtpXUlr3UEdoYuU8QWAfhHsdgMBgMBoPB/B3UcEN+TF3WWQvnIAPXUOC6AUB+fqFtF9emuqri/ILGhuoxk+fqMOBNdY25sZ6sNq2j+kHD6zwL/6+EdoNwv2MwGAwGg8FgPlc1rBBXl9xaambnbej7VUml9NnDOBcXtx69BgS4sTbtOiwSSa6cOaAG+rptx+PORpuZ2361+gAANLeKdVWVNS/3qYFwDN5P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'
              },
              
            );

            // doc.pageMargins = [ 40, 60, 40, 60 ];
          }
        }
      ],
    };

    this.dtOptionsPopUp = {
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

    if (this.roleID === "1") {
      this.dtOptions.buttons = [
        {
          extend: "csv",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-csv"> CSV</i>',
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
        },
        {
          extend: "excel",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-excel"> Excel</i>',
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
        },
        {
          extend: "pdf",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-pdf"> PDF</i>',
          orientation: "landscape",
          pageSize: "LEGAL",
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
        },
      ];
    }
  }

  getTaxYear(taxDueDate: string): string {
    var taxYear = taxDueDate.split("-", 3)[0];
    return taxYear;
  }

  getTaxMonth(taxDueDate: string): string {
    var taxMonth = taxDueDate.split("-", 3)[1];
    this.sess.getAllMonths();
    var monthName = this.sess.getMonthName(taxMonth);
    return monthName;
  }

  getBusiness() {
    this.assessmentData = "";
    this.apiUrl = environment.AUTHAPIURL + "child-corporates";

    const obj = {
      corporate_id: this.selectedCorporate.id,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("businessApiData", data);

        if (data.status == true) {
          this.assessmentData =
            data.response.data !== undefined
              ? data.response.data
              : data.response;
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.assessmentData = [];
        }

        this.spinnerService.hide();
      });
  }

  getCorporates(perpage, pageno) {
    this.apiUrl = environment.AUTHAPIURL + "corporates-list?page=" + pageno;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, this.searchObject, { headers: reqHeader })
      .subscribe((data) => {
        console.log("corporatesApiData", data);

        if (data.status == true) {
          this.corporatesData = data.response.data;
          // this.config.totalItems = data.response.total_record_count;
          this.config.totalItems = data.response.total;
        } else {
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

  pageChange(newPage: number) {
    this.corporatesData = "";
    this.router.navigate(["/corporates"], { queryParams: { page: newPage } });
    this.getCorporates(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.corporatesData = "";
    this.router.navigate(["/corporates"]);
    this.getCorporates(this.config.itemsPerPage, 1);
  }

  viewCorporate(modal, selectedCorporate) {
    // console.log("selectedCorporate: ", selectedCorporate);
    this.submitted = false;
    this.showCreateAssetButton = false;
    this.showUpdateCorporate = false;
    this.showLinkedAssetButton = false;
    this.disableCorporateFormControl = true;
    this.corporateTitle = "View Corporate Details";
    this.selectedCorporateId = selectedCorporate.id;
    this.selectedTaxpayerId = selectedCorporate.taxpayer_id;
    this.selectedCorporateTaxOfficeId = selectedCorporate.tax_office_id;
    this.showOtherTabs = true;
    this.utilityService.showModal(modal);
    this.filterTaxOffices(this.selectedCorporateTaxOfficeId);
    this.getSingleCorporate(selectedCorporate.id, false);
    this.getDirectAssessments(this.selectedCorporateId, this.config.itemsPerPage, 1);
    this.getWhtAssessments(this.selectedTaxpayerId, this.config.itemsPerPage, 1);
    this.getAssetData();
  }

  getSingleCorporate(corporateId, isUpdateEmail: boolean) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "corporates/" + corporateId;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleCorporateData: ", data);
        this.selectedCorporate = data.response;
        // this.corporateUsersData = this.getCorporateUsers(corporateId);

        this.loadSelectedCorporateData(this.selectedCorporate, isUpdateEmail);
        // this.getPayments();
        this.getBusiness();
        this.spinnerService.hide();
      });
  }

  loadSelectedCorporateData(selectedCorporate, isUpdateEmail: boolean) {
    console.log("th: ", this.disableCorporateFormControl);

    if (isUpdateEmail) {
      this.updateCorporateForm = this.formBuilder.group({
        emailAddress: [
          selectedCorporate.email,
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
        phone: [
          selectedCorporate.phone,
          [
            Validators.required,
            Validators.minLength(11),
            Validators.maxLength(11),
            Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
          ],
        ],
        taxOfficeId: [selectedCorporate.tax_office_id, Validators.required],
      });
    } else {
      this.corporateForm = this.formBuilder.group({
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
          selectedCorporate.parent_taxpayer_id,
          [
            Validators.minLength(11),
            Validators.maxLength(11),
            Validators.pattern("^[A-Za-z]{3}[0-9]{8}"),
          ],
        ],
      });
    }
  }

  getDirectAssessments(corporateId, perpage, pageno) {
    this.spinnerService.show();
    this.payeAssessmentData = '';
    this.apiUrl = environment.AUTHAPIURL + 'assessments/list?page='+pageno;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;
    this.searchObject["corporate_id"] = corporateId;

    this.httpClient.post<any>(this.apiUrl, this.searchObject, { headers: reqHeader }).subscribe((data) => {
      console.log("assessmentsData: ", data);
      this.payeAssessmentData = data.response == null ? [] : data.response.data;
      this.config.totalItems = data.response.total;
      this.spinnerService.hide();
    });
  }

  getWhtAssessments(selectedTaxpeyerId, perpage, pageno) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}wht/assessments/list?page=${pageno}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;
    this.searchObject["collector_taxpayer_id"] = selectedTaxpeyerId;

    this.httpClient.post<any>(this.apiUrl, this.searchObject, { headers: reqHeader }).subscribe((data) => {
        console.log("assessmentsData: ", data);
        this.whtAssessmentsData = data.response == null ? [] : data.response.data;
        this.config.totalItems = data.response?.total;
        this.spinnerService.hide();
    });
  }

  updateCorporateEmail(modal, selectedCorporate) {
    console.log("selectedCorporate: ", selectedCorporate);
    this.selectedCorporateId = selectedCorporate.id;
    this.disableCorporateFormControl = false;
    this.utilityService.showModal(modal);
    this.loadSelectedCorporateData(selectedCorporate, true);
  }

  onSubmitCorporate(formData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    this.validateCacTinPhone(this.corporateForm);

    if (this.corporateForm.invalid || this.validateCacTin) {
      return;
    }

    this.taxPayerTypeId = localStorage.getItem("admin_taxpayer_type_id");

    console.log("corporateFormData: ", formData);

    var requestObj = {
      id: this.selectedCorporateId,
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

      parent_taxpayer_id: formData.parentCompanyTaxPayerId,
      company_type_id: formData.companyTypeId,
      lga_code: formData.localGovernmentId,
    };

    this.postData(requestObj);
    this.submitted = false;
  }

  postData(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + "corporates/update";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log(data);

        // this.router.navigate(['/display']);
        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.corporateForm.controls).forEach((key) => {
            this.corporateForm.get(key).setErrors(null);
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
          this.utilityService.closeAllModals();
          this.corporatesData = "";
          this.getCorporates(this.config.itemsPerPage, this.config.currentPage);
          // this.getCorporates();
          this.spinnerService.hide();
        } else {
          data.response[0].message.indexOf("cac") >= 0;

          const regex = /cac/gi;
          const messageLog = data.response[0].message.replace(regex, "CAC");

          Swal.fire({
            icon: "error",
            title: "Oops...",
            text:
              data.response != null && data.response[0] != undefined
                ? messageLog
                : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  onSubmitUpdateCorporate(formData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.updateCorporateForm.invalid) {
      return;
    }

    this.taxPayerTypeId = localStorage.getItem("admin_taxpayer_type_id");
    console.log("corporateFormData: ", formData);

    var requestObj = {
      corporate_id: this.selectedCorporateId,
      email: formData.emailAddress,
    };

    console.log("corporateRequestObj: ", requestObj);
    this.postUpdateData(requestObj);
    this.submitted = false;
  }

  postUpdateData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}users/update-email`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log(data);

        // this.router.navigate(['/display']);
        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.corporateForm.controls).forEach((key) => {
            this.corporateForm.get(key).setErrors(null);
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
          this.utilityService.closeAllModals();
          this.corporatesData = "";
          this.getCorporates(this.config.itemsPerPage, this.config.currentPage);
          // this.getCorporates();
          this.spinnerService.hide();
        } else {
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

  editCorporate(modal, selectedCorporate) {
    // console.log("selectedCorporate: ", selectedCorporate);
    this.submitted = false;
    this.showUpdateCorporate = true;
    this.corporateTitle = "Edit Corporate Details";
    this.selectedCorporateId = selectedCorporate.id;
    this.disableCorporateFormControl = null;
    this.showOtherTabs = false;
    this.isEmailVerified = selectedCorporate.has_valid_email == 0 ? null : true;

    this.getSingleCorporate(selectedCorporate.id, false);
    this.utilityService.showModal(modal);
  }

  deleteCorporate(id: number) {
    let corporateId = localStorage.getItem("admin_corporate_id");
    this.spinnerService.show();

    const obj = {
      corporate_ids: [corporateId],
      id: id,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.apiUrl = environment.AUTHAPIURL + "corporates/delete";

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("deleteApiResponseData: ", data);

        if (data.status === true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Employee has been successfully deleted!",
            showConfirmButton: true,
            timer: 5000,
          });

          this.corporatesData = "";
          this.getCorporates(this.config.itemsPerPage, this.config.currentPage);
          // this.getCorporates();
          this.spinnerService.hide();
          this.utilityService.closeAllModals();
        } else {
          this.spinnerService.hide();

          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "An error ocurred while trying to delete Employee!",
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  getCompanyTypes() {
    this.apiUrl = environment.AUTHAPIURL + "company-types";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("companyTypes: ", data);
      this.companyTypes = data.response;
    });
  }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + "tax-offices";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("taxTaxOffices: ", data);
      this.unfilteredTaxTaxOffices = data.response;

      if (this.roleID === "1") {
        this.taxTaxOffices = this.unfilteredTaxTaxOffices;
      } else {
        // this.filterTaxOffices();
        this.taxTaxOffices = this.unfilteredTaxTaxOffices;
      }
    });
  }

  filterTaxOffices(taxOfficeID = null) {
    if (taxOfficeID !== null) {
      this.taxTaxOffices = this.unfilteredTaxTaxOffices.filter(
        (x) => x.id == taxOfficeID
      );
    } else {
      this.taxTaxOffices = this.unfilteredTaxTaxOffices.filter(
        (x) => x.id == this.taxOfficeID
      );
    }
  }

  getIndustrySectors() {
    this.apiUrl = `${environment.AUTHAPIURL}get_sectors_by_unique_name`;

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("industrySectors: ", data);
      this.industrySectors = data.response;
    });
  }

  getIndustrySectorById(industrySectorId) {
    var sector = this.industrySectors?.filter((x) => x.id == industrySectorId)[0]?.name;

    if (sector == null) {
      return "N/A";
    }

    return sector;
  }

  addCorporate(modal) {
    this.submitted = false;
    this.utilityService.showModal(modal);
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

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log(data);

        // this.router.navigate(['/display']);
        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.addCorporateForm.controls).forEach((key) => {
            this.addCorporateForm.get(key).setErrors(null);
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
          this.utilityService.closeAllModals();
          // this.modalService.dismissAll();
          this.corporatesData = "";
          // this.getCorporates();
          this.getCorporates(this.config.itemsPerPage, this.config.currentPage);
          this.spinnerService.hide();
          // this.router.navigate(['/corporates']);
        } else {
          // this.getCorporates();
          this.getCorporates(this.config.itemsPerPage, this.config.currentPage);
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

  uploadBulkCorporates(modal) {
    this.utilityService.showModal(modal);
  }

  submit() {
    this.submitted = true;
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
    formData.append("corporates", this.myForm.get("myfile").value);
    this.apiUrl = `${environment.AUTHAPIURL}corporates/import`;
    this.spinnerService.show();

    this.httpClient
      .post<any>(this.apiUrl, formData, config)
      .subscribe((res) => {
        console.log(res);

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

          if (res.message === "0 Corporate created; 0 updated.") {
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

            this.corporatesData = "";
            this.getCorporates(
              this.config.itemsPerPage,
              this.config.currentPage
            );
            this.spinnerService.hide();
            this.utilityService.closeAllModals();
          }
        } else {
          this.spinnerService.hide();
          this.myForm.reset();

          Object.keys(this.myForm.controls).forEach((key) => {
            this.myForm.get(key).setErrors(null);
          });

          const regex = /_/g;

          if (res.response != null) {
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
          }

          this.file = null;
          this.filePath = null;
          this.reload();

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

          this.columnError = [];
        }
      });
  }

  showModal(modal) {
    this.utilityService.showModal(modal);
  }

  showLinkAssetModal(modal) {
    this.taxpayerRoles = '';
    this.showSearchAssetButton = false;
    this.initialiseLinkAssetForm();
    this.linkAssetModalRef = this.utilityService.openModal(modal);
  }

  showCreateAssessmentModal(modal) {
    this.resetAssets();
    this.searchAssetModalRef.close();
    this.assessmentModalRef = this.utilityService.openModal(modal);

    if (this.selectedLinkAssetTypeId !== null) {
      console.log("selectedAssetTypeId1: ", this.selectedLinkAssetTypeId);
      this.assetTypeForm = this.formBuilder.group({
        assetTypeId: [this.selectedLinkAssetTypeId, Validators.required],
      });

      this.onAssetTypeChange(this.selectedLinkAssetTypeId);
    }
  }

  showSearchAssetModal(modal) {
    this.businessData = ''; this.landData = ''; this.buildingData = '';
    this.initialiseSearchAssetForm();
    this.showCreateAssetButton = false;
    this.searchAssetModalRef = this.utilityService.openModal(modal);
  }

  getAssetData() {
    this.linkedAssetData = "";
    this.apiUrl = `${environment.AUTHAPIURL}assets/index`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var jsonData = {
      corporate_id: this.selectedCorporateId
    }

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        console.log("linkedAssetData: ", data);

        if (data.status == true) {
          this.linkedAssetData = data.response.data;
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

  onLinkAssetTypeSelect(value) {
    console.log("selectedLinkAssetTypeId: ", value);
    this.selectedTaxpayerRoleId = "";
    this.selectedLinkAssetTypeId = value;
    this.toggleSearchTaxpayerButton();
    this.getTaxpayerRoles();
  }

  onLinkTaxpayerRoleSelect(value) {
    this.selectedTaxpayerRoleId = value;
    this.toggleSearchTaxpayerButton();
  }

  toggleSearchTaxpayerButton() {
    if ((this.selectedLinkAssetTypeId !== "" && this.selectedLinkAssetTypeId !== undefined) && (this.selectedTaxpayerRoleId !== "" && this.selectedTaxpayerRoleId !== undefined)) {
      this.showSearchAssetButton = true;
    }
    else {
      this.showSearchAssetButton = false;
    }
  }

  onSubmitSearchAsset(formData: any) {
    this.submitted = true;
    console.log("selectedLinkAssetTypeId: ", this.selectedLinkAssetTypeId);

    // stop the process here if form is invalid
    if (this.searchAssetForm.invalid) {
      return;
    }

    if (this.selectedLinkAssetTypeId == "1") {
      var businessRequestObj = {
        business_name: formData.assetName,
      };

      this.postSearchBusinessData(businessRequestObj);
    }

    if (this.selectedLinkAssetTypeId == "2") {
      var landRequestObj = {
        land_name: formData.assetName,
      };

      this.postSearchLandData(landRequestObj);
    }

    // if (this.selectedLinkAssetTypeId == "4") {
    //   Swal.fire({
    //     icon: "info",
    //     title: "Info",
    //     text: "Asset type 'Vehicle is not available yet!",
    //     showConfirmButton: true,
    //     timer: 5000,
    //   });

    //   //return; // not available yet
    // }

    if (this.selectedLinkAssetTypeId == "3") {
      var buildingRequestObj = {
        building_name: formData.assetName,
      };

      this.postSearchBuildingData(buildingRequestObj);
    }

    // console.log("searchAssetPostObjData: ", requestObj); postSearchBuildingData
    this.submitted = false;
  }

  postSearchBusinessData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}businesses/index`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        // console.log(data);
        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.searchAssetForm.controls).forEach((key) => {
            this.searchAssetForm.get(key).setErrors(null);
          });

          this.businessData = data.response.data;
          this.showCreateAssetButton = this.businessData.length > 0 ? false : true;

          if (this.businessData.length == 0) {
            Swal.fire({
              icon: "info",
              title: "Info",
              text: "No business found for the search!",
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

          console.log("showCreateAssetButton", this.showCreateAssetButton);
          this.reInitialiseLinkAssetForm("");
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

  postSearchLandData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}lands/index`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        console.log(data);

        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.searchAssetForm.controls).forEach((key) => {
            this.searchAssetForm.get(key).setErrors(null);
          });

          this.landData = data.response.data;
          this.showCreateAssetButton = this.landData.length > 0 ? false : true;

          if (this.landData.length == 0) {
            Swal.fire({
              icon: "info",
              title: "Info",
              text: "No land found for the search!",
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
         
          console.log("showCreateAssetButton", this.showCreateAssetButton);
          this.reInitialiseLinkAssetForm("");
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

  postSearchBuildingData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}buildings`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        // console.log(data);

        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.searchAssetForm.controls).forEach((key) => {
            this.searchAssetForm.get(key).setErrors(null);
          });

          
          this.buildingData = data.response.data;
          this.showCreateAssetButton = this.buildingData.length > 0 ? false : true;

          if (this.buildingData.length == 0) {
            Swal.fire({
              icon: "info",
              title: "Info",
              text: "No building found for the search!",
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
         
          // console.log("showCreateAssetButton", this.showCreateAssetButton);
          this.reInitialiseLinkAssetForm("");
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

  selectBusiness(selectedBusiness) {
    console.log(selectedBusiness);
    this.disableLinkAssetFormControl = true;
    this.selectedBusinessId = selectedBusiness.id;
  
    this.reInitialiseLinkAssetForm(selectedBusiness.business_name);
    this.searchAssetModalRef.close();
  }

  selectLand(selectedLand) {
    console.log(selectedLand);
    this.disableLinkAssetFormControl = true;
    this.selectedLandId = selectedLand.id;

    this.reInitialiseLinkAssetForm(selectedLand.land_name);
    this.searchAssetModalRef.close();
  }

  selectBuilding(selectedBuilding) {
    console.log(selectedBuilding);
    this.disableLinkAssetFormControl = true;
    this.selectedBuildingId = selectedBuilding.id;

    this.reInitialiseLinkAssetForm(selectedBuilding.building_name);
    this.searchAssetModalRef.close();
  }

  reInitialiseLinkAssetForm(assetName) {
    this.linkAssetForm = this.formBuilder.group({
      assetName: [
        assetName,
        [
          Validators.required,
        ],
      ],
      assetTypeId: [this.selectedLinkAssetTypeId, Validators.required],
      taxpayerRoleId: [this.selectedTaxpayerRoleId, Validators.required],
    });

  }

  onSubmitLinkAsset(formData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.linkAssetForm.invalid) {
      return;
    }

    this.linkAssetRequestObj = {
      taxpayer_role_id: formData.taxpayerRoleId,
      corporate_id: this.selectedCorporateId,
    }

    if (this.selectedLinkAssetTypeId == 1) {
      this.linkAssetRequestObj["business_id"] = this.selectedBusinessId;
    }

    if (this.selectedLinkAssetTypeId == 2) {
      this.linkAssetRequestObj["land_id"] = this.selectedLandId;
    }

    if (this.selectedLinkAssetTypeId == 3) {
      this.linkAssetRequestObj["building_id"] = this.selectedBuildingId;
    }

    console.log("linkAssetPostObjData: ", this.linkAssetRequestObj);
    this.postLinkAssetData(this.linkAssetRequestObj);
  }

  postLinkAssetData(jsonData: any) {
    this.apiUrl = `${environment.AUTHAPIURL}asset-taxpayer/link`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        console.log(data);

        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.linkAssetForm.controls).forEach((key) => {
            this.linkAssetForm.get(key).setErrors(null);
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

          this.getAssetData();
          this.linkAssetModalRef.close();
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

  getAssetTypes() {
    this.apiUrl = `${environment.AUTHAPIURL}asset/types`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      // console.log("businessItems: ", data);
      this.assetTypes = data.response;
     
    });
  }

  onAssetTypeChange(id) {
    this.selectedAssetTypeId = id;
    // this.selectedAssetTypeName = value;
    // businessAsset - 1, landAsset - 2, vehicleAsset - 4, buildingAsset - 3

    if (id == "1") {
      this.businessAsset = true;
      this.buildingAsset = false;
      this.landAsset = false;
      this.vehicleAsset = false;
    } 
    else if (id == "2") {
      this.businessAsset = false;
      this.buildingAsset = false;
      this.landAsset = true;
      this.vehicleAsset = false;
    } 
    else if (id == "3") {
      this.businessAsset = false;
      this.buildingAsset = true;
      this.landAsset = false;
      this.vehicleAsset = false;
    }
    // else if (id == "4") {
    //   this.businessAsset = false;
    //   this.buildingAsset = false;
    //   this.landAsset = false;
    //   this.vehicleAsset = true;
    // }
  }

  resetAssets() {
    this.businessAsset = false;
    this.buildingAsset = false;
    this.landAsset = false;
    this.vehicleAsset = false;
  }

  viewAsset(selectedAsset, modal) {
    console.log("selectedAsset: ", selectedAsset);

    // if (selectedAsset.business_id !== null && selectedAsset.business_id !== undefined) {
    //   this.selectedBusinessId = selectedAsset.business_primary_id;
    //   this.onAssetTypeChange(1);
    // }

    if (selectedAsset.asset_type_name == "Business") {
      this.selectedBusinessId = selectedAsset.business_primary_id;
      this.onAssetTypeChange(1);
    }

    if (selectedAsset.asset_type_name == "Land") {
      this.selectedLandId = selectedAsset.land_primary_id;
      this.onAssetTypeChange(2);
    }

    if (selectedAsset.asset_type_name == "Building") {
      this.selectedBuildingId = selectedAsset.building_primary_id;
      this.onAssetTypeChange(4);
    }

    this.showModal(modal);
  }

  unlinkAsset(selectedAsset) {
    var obj = {};

    if (selectedAsset.asset_type_name == "Business") {
      obj = {
        business_id: selectedAsset.business_primary_id,
        corporate_id: this.selectedCorporateId
      }
    }

    if (selectedAsset.asset_type_name == "Land") {
      obj = {
        land_id: selectedAsset.land_primary_id,
        corporate_id: this.selectedCorporateId
      }
    }

    if (selectedAsset.asset_type_name == "Building") {
      obj = {
        building_id: selectedAsset.building_primary_id,
        corporate_id: this.selectedCorporateId
      }
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unlink it!",
    }).then((result) => {
      if (result.value) {
        this.postUnlinkAsset(obj);
      }
    });

  }

  postUnlinkAsset(objData) {
    this.apiUrl = `${environment.AUTHAPIURL}asset-taxpayer/unlink`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, objData, { headers: reqHeader }).subscribe((data) => {
        if (data.status == true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Asset has been unlinked successfully",
            showConfirmButton: true,
            timer: 5000,
          });
          this.getAssetData();
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

  generatePayeAssessment() {
    this.spinnerService.show();
    this.modalService.dismissAll();
    this.router.navigate(['/addemployee'], { state: { navigatedCorporateId: this.selectedCorporateId }});
    this.spinnerService.hide();
  }

  reload() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigate(["./"], { relativeTo: this.route });
  }

  showFooterNote() {
    this.showFootNote = true;
    this.showLinkedAssetButton = false;
  }

  hideFooterNote(showLinkedAssetButton) {
    this.showFootNote = false;

    if (this.roleID === "2" || this.roleID === "3") {
      this.showLinkedAssetButton = showLinkedAssetButton;
    }
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.file = event.target.files[0];
      this.filePath = event.target.files[0].name;
      this.myForm.get("myfile").setValue(file);
    }
  }

  onSubmitSearch(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.searchForm.invalid) {
      return;
    }

    this.searchObject = {
      email: formAllData.emailAddress,
      industry_sector_id: formAllData.industrySectorId,
      company_name: formAllData.companyName,
      created_by_app_id: formAllData.registeredFromId,
      tax_office_id: formAllData.taxOfficeId,
    };

    console.log('searchFormData: ', this.searchObject);
    this.getCorporates(this.config.itemsPerPage, this.config.currentPage);
  }

  clearSearch() {
    this.corporatesData = '';
    this.searchObject = {};
    this.initialiseForms();
    this.getCorporates(this.config.itemsPerPage, this.config.currentPage);
  }

  toggleStatus(selectedCorporate) {
    var obj = {
      corporate_id: selectedCorporate.id
    }

    if (selectedCorporate.active_status == 'active') {
      obj["active_status"] = 'inactive';
    }
    else {
      obj["active_status"] = 'active';
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, perform action!",
    }).then((result) => {
      if (result.value) {
        this.postToggleStatus(obj);
      }
    });
    
  }

  postToggleStatus(requestObj) {
    this.apiUrl = `${environment.AUTHAPIURL}taxpayer/toggle-active`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, requestObj, { headers: reqHeader }).subscribe((data) => {
      if (data.status == true) {
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
        this.getCorporates(this.config.itemsPerPage, this.config.currentPage);
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
