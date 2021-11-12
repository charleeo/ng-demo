import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
// import { Router } from '@angular/router';
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

@Component({
  selector: "app-addemployee",
  templateUrl: "./addemployee.component.html",
  styleUrls: ["./addemployee.component.css"],
})
export class AddemployeeComponent implements OnInit {
  addEmployeeForm: FormGroup;
  corporateForm: FormGroup;
  submitted: boolean;
  apiUrl: string;
  employeesData: any;
  showAddNewEmployee: boolean = false;
  modalOptions: NgbModalOptions;
  closeResult: string;
  dtOptions: any = {};
  dtOptionsPopUp: any = {};
  showListOfEmployees: boolean = true;
  corporateName: string;
  roleID: any;
  businessesData: any;
  selectedCorporateId: any;
  selectedCorporate: any;
  taxTaxOffices: any;
  industrySectors: any;
  showEditEmployee: boolean = true;
  showDeleteEmployee: boolean = true;
  showSaveEmployee: boolean = false;
  selectedEmployee: any;
  businessId: any;
  addEmployeeTitle: string = "Add New Employee And Monthly Income";
  selectedEmployeeId: any;
  showTaxOffice: boolean = false;
  showViewEmployee: boolean = true;
  sample_file: string;
  myForm: FormGroup;
  error: string;
  columnError: string[] = [];
  filePath: any;
  file: any;
  companyName: string;
  uploadBulkModalRef: any;
  addEmployeeModalRef: any;
  title = "Paye - Add-employee";
  editEmployeeModalRef: any;
  zipCodes: any;

  config: any;
  currentPageLength: any = 10;
  grossIncomeIncorrect: boolean;
  stateLocalGovts: any;
  validateCacTin: boolean;
  selectedBusinessId: any;
  selectedBusiness: any;
  navigatedCorporateId: any;
  navigatedBusinessId: any;

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
  ) {}

  get f() {
    return this.myForm.controls;
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.roleID = localStorage.getItem("admin_role_id");
    this.navigatedCorporateId = history.state.navigatedCorporateId;
    this.navigatedBusinessId = history.state.navigatedBusinessId;
    // console.log("navigatedCorporateId: ", this.navigatedCorporateId);
    // console.log("navigatedBusinessId: ", this.navigatedBusinessId);

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    // if (this.navigatedCorporateId !== undefined) {
    //   this.getBusinesses(this.config.itemsPerPage, this.config.currentPage);
    // }

    this.getBusinesses(this.config.itemsPerPage, this.config.currentPage);
    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );

    this.initialiseForms();
    this.initialiseCorporateForm();
    //this.getBusinesses();
    this.getTaxOffices();
    this.getIndustrySectors();
    this.getZipcodes();
    this.getStateLocalGovts();

    this.intialiseTableProperties();

    if (this.roleID === "1") {
      this.showTaxOffice = true;
    }

    if (this.roleID === "3") {
      this.showViewEmployee = false;
    }

    this.myForm = this.formBuilder.group({
      myfile: ["", Validators.required],
    });

    this.sample_file =
      environment.SAMPLE_FILE_URL + "employee-schedule-template.xlsx";

    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      size: "xl",
    };

    console.log("dtOptions:----- ", this.dtOptions);
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
    };

    this.dtOptionsPopUp = {
      paging: true,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
    }
  }

  initialiseForms() {
    this.spinnerService.show();
    this.addEmployeeForm = this.formBuilder.group({
      emailAddress: [
        "",
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      zipCode: ["", [Validators.required]],
      nationality: ["Nigerian", Validators.required],
      startMonthId: ["", Validators.required],

      NHF: ["0", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      NHIS: ["0", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      CRA: ["0", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,3})$/)]],
      pension: ["0", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],

      grossIncome: [
        "",
        [Validators.required, Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      lifeAssurance: [
        "0",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      totalIncome: [
        "",
        [Validators.required, Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],

      bvn: [
        "",
        [
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      nin: [
        "",
        [
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      employeeTIN: [
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
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      homeAddress: ["", [Validators.required, Validators.minLength(10)]],
      firstName: [
        "",
        [
          Validators.required,
          Validators.pattern("[a-zA-Z ]*"),
          Validators.maxLength(30),
        ],
      ],
      surname: [
        "",
        [
          Validators.required,
          Validators.pattern("[a-zA-Z ]*"),
          Validators.maxLength(30),
        ],
      ],
      titleId: ["", Validators.required],
      designation: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z]([\w -]*[a-zA-Z])?$/),
        ],
      ],
      existingTaxId: ["", [Validators.minLength(11), Validators.maxLength(11)]],
      localGovernmentId: ["", Validators.required],
    });

    this.spinnerService.hide();
  }

  initialiseCorporateForm() {
    this.corporateForm = this.formBuilder.group({
      companyName: [
        ""
      ],
      companyID: [""],
      businessName: [""],
      businessID: [""],
    });
  }

  onSubmit(formAllData: any, detailsModal) {
    this.submitted = true;

    // stop the process here if form is invalid
    this.validateTinPhoneNinBvn(this.addEmployeeForm);

    if (this.addEmployeeForm.invalid || this.validateCacTin) {
      return;
    }

    const obj = {
      tin: formAllData.employeeTIN,
      bvn: formAllData.bvn,
      nhis:
        formAllData.NHIS == "" || formAllData.NHIS == null
          ? 0
          : formAllData.NHIS,
      nhf:
        formAllData.NHF == "" || formAllData.NHF == null ? 0 : formAllData.NHF,
      designation: formAllData.designation,
      title: formAllData.titleId,
      first_name: formAllData.firstName,
      last_name: formAllData.surname,
      email: formAllData.emailAddress,
      nationality: formAllData.nationality,
      zip_code: formAllData.zipCode,
      cra: formAllData.CRA,
      pension: formAllData.pension,
      gross_income: formAllData.grossIncome,

      phone: formAllData.phoneNumber,
      start_month: formAllData.startMonthId,
      taxpayer_id: formAllData.existingTaxId,
      home_address: formAllData.homeAddress,

      life_assurance: formAllData.lifeAssurance,
      total_income: formAllData.totalIncome,
      id: this.selectedEmployeeId,
      lga_code: formAllData.localGovernmentId,
      nin: formAllData.nin,

      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId
    };

    console.log("employeeFormData: ", obj);

    if (this.addEmployeeTitle.includes("Add")) {
      this.postCreateEmployee(obj, detailsModal);
    } else {
      this.postUpdateEmployee(obj, detailsModal);
    }
  }

  postCreateEmployee(jsonData: any, detailsModal) {
    this.apiUrl = environment.AUTHAPIURL + "employees";
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
          this.addEmployeeForm.reset();
          this.addEmployeeForm.get("nationality").setValue("Nigerian");
          Object.keys(this.addEmployeeForm.controls).forEach((key) => {
            this.addEmployeeForm.get(key).setErrors(null);
          });

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Employee has been saved successfully!",
            // text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.getEmployees();
          this.getBusinesses(this.config.itemsPerPage, this.config.currentPage);
          this.addEmployeeModalRef.close();
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

  postUpdateEmployee(jsonData: any, detailsModal) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "employees/update";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("employeeResponseData: ", data);
        this.submitted = false;
        if (data.status === true) {
          // Rest form without errors
          // this.addEmployeeForm.reset();

          // Object.keys(this.addEmployeeForm.controls).forEach(key => {
          //   this.addEmployeeForm.get(key).setErrors(null);
          // });

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Employee has been updated successfully!",
            // text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.getEmployees();
          this.editEmployeeModalRef.close();
          this.spinnerService.hide();
        } else {
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

  getBusinesses(perpage, pageno) {
    this.apiUrl = `${environment.AUTHAPIURL}corporates/businesses?page=${pageno}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = { per_page: perpage, page_no: pageno };

    if (this.navigatedCorporateId !== undefined) {
      obj["corporate_id"] = this.navigatedCorporateId;
    }

    if (this.navigatedBusinessId !== undefined) {
      obj["business_id"] = this.navigatedBusinessId;
    }

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      console.log("businessesData", data);
      this.businessesData = data.response.data;
      this.config.totalItems = data.response.total;
      this.spinnerService.hide();
    });
  }

  pageChange(newPage: number) {
    this.businessesData = "";
    this.router.navigate(["/addemployee"], { queryParams: { page: newPage } });
    this.getBusinesses(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.businessesData = "";
    this.router.navigate(["/addemployee"]);
    this.getBusinesses(this.config.itemsPerPage, 1);
  }

  viewBusiness(modal, selectedBusiness) {
    console.log("selectedBusiness: ", selectedBusiness);
    // this.showUpdateCorporate = false;
    this.companyName = selectedBusiness.company_name;
    this.selectedBusinessId = selectedBusiness.id;
    this.selectedCorporateId = selectedBusiness.corporate_id;
    console.log("selectedBusinessId: ", this.selectedBusinessId);
    this.showModal(modal);

    // this.getSingleBusiness(selectedBusiness.id);
    this.loadSelectedBusinessData(selectedBusiness);
    this.getEmployees();
  }

  getSingleBusiness(businessId) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "businesses/" + businessId;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
        console.log("singleBusinessData: ", data);
        this.selectedBusiness = data.response;

        this.loadSelectedBusinessData(this.selectedBusiness);
        this.spinnerService.hide();
      });
  }

  loadSelectedBusinessData(selectedBusiness) {
    this.corporateForm = this.formBuilder.group({
      companyName: [
        selectedBusiness?.company_name
      ],
      companyID: [
        selectedBusiness?.taxpayer_id
      ],
      businessName: [selectedBusiness?.business_name],
      businessID: [selectedBusiness?.business_id],
    });
  }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + "tax-offices";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("taxTaxOffices: ", data);
      this.taxTaxOffices = data.response;
    });
  }

  getIndustrySectors() {
    this.apiUrl = environment.AUTHAPIURL + "industry-sectors";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("industrySectors: ", data);
      this.industrySectors = data.response;
    });
  }

  getZipcodes() {
    this.apiUrl = environment.AUTHAPIURL + "postalcodes";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("zipcodes: ", data);
      this.zipCodes = data.response;
    });
  }

  getStateLocalGovts() {
    this.apiUrl = `${environment.AUTHAPIURL}local-governments`;

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      this.stateLocalGovts = data.response;
      console.log("stateLocalGovts: ", data);
    });
  }

  addEmployee(modal) {
    this.submitted = false;
    this.addEmployeeTitle = "Add New Employee";
    this.initialiseForms();
    this.showSaveEmployee = true;

    this.addEmployeeModalRef = this.utilityService.openModal(modal);
  }

  uploadBulkEmployees(modal) {
    this.uploadBulkModalRef = this.utilityService.openModal(modal);
  }

  viewEmployee(modal, selectedEmployee) {
    console.log("selectedEmployee: ", selectedEmployee);
    this.submitted = false;
    this.businessId = selectedEmployee.business_id;
    // this.selectedCorporateId = selectedEmployee.corporate_id;
    this.addEmployeeTitle = "Employee Details";
    this.showSaveEmployee = false;
    this.showModal(modal);
    this.getSingleEmployee(selectedEmployee.id, this.businessId);
  }

  editEmployee(modal, selectedEmployee) {
    // console.log("selectedEmployee: ", selectedEmployee);
    this.submitted = false;
    this.selectedEmployeeId = selectedEmployee.id;
    this.businessId = selectedEmployee.business_id;
    // this.selectedCorporateId = selectedEmployee.corporate_id;
    this.addEmployeeTitle = "Edit Employee And Monthly Income";
    this.showSaveEmployee = true;
    this.getSingleEmployee(selectedEmployee.id, this.businessId);

    this.editEmployeeModalRef = this.utilityService.openModal(modal);
  }

  deleteEmployee(id: number) {
    const obj = {
      business_id: this.selectedBusinessId,
      corporate_id: this.selectedCorporateId,
      id: id,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.apiUrl = environment.AUTHAPIURL + "employees/delete";

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      this.spinnerService.show();
      if (result.value) {
        this.spinnerService.show();
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

              this.getEmployees();
              this.spinnerService.hide();
              this.modalService.dismissAll();
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
      this.spinnerService.hide();
    });
  }

  getSingleEmployee(employeeId, businessId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}employees/${employeeId}?corporate_id=${this.selectedCorporateId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleEmployeeData: ", data);
        this.loadSelectedEmployeeData(data.response);
        this.selectedEmployee = data.response;
        this.spinnerService.hide();
      });
  }

  loadSelectedEmployeeData(selectedEmployee) {
    this.addEmployeeForm = this.formBuilder.group({
      emailAddress: [
        selectedEmployee.email,
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      NSIRSTaxPayerID: [selectedEmployee.taxpayer_id],
      zipCode: [
        selectedEmployee.zip_code == null ? "" : selectedEmployee.zip_code,
        [Validators.required],
      ],
      nationality: [selectedEmployee.nationality, Validators.required],
      startMonthId: [selectedEmployee.start_month == null ? '' : selectedEmployee.start_month, Validators.required],

      NHF: [
        selectedEmployee.nhf == null ? 0 : selectedEmployee.nhf,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      NHIS: [selectedEmployee.nhis, [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      CRA: [selectedEmployee.cra, [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,3})$/)]],
      pension: [selectedEmployee.pension, [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      grossIncome: [
        selectedEmployee.gross_income,
        [Validators.required, Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      lifeAssurance: [
        selectedEmployee.life_assurance == null ? 0 : selectedEmployee.life_assurance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      totalIncome: [
        selectedEmployee.total_income,
        [Validators.required, Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      bvn: [
        selectedEmployee.bvn,
        [
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      nin: [
        selectedEmployee.nin,
        [
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      employeeTIN: [
        selectedEmployee.tin,
        [
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      phoneNumber: [
        selectedEmployee.phone,
        [
          Validators.required,
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      firstName: [
        selectedEmployee.first_name,
        [
          Validators.required,
          Validators.pattern("[a-zA-Z ]*"),
          Validators.maxLength(30),
        ],
      ],
      surname: [
        selectedEmployee.last_name,
        [
          Validators.required,
          Validators.pattern("[a-zA-Z ]*"),
          Validators.maxLength(30),
        ],
      ],
      titleId: [
        selectedEmployee.title == null ? "" : selectedEmployee.title,
        Validators.required,
      ],
      designation: [
        selectedEmployee.designation,
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z]([\w -]*[a-zA-Z])?$/),
        ],
      ],
      existingTaxId: [
        selectedEmployee.taxpayer_id,
        [Validators.minLength(11), Validators.maxLength(11)],
      ],
      localGovernmentId: [
        selectedEmployee.lga_code == null
          ? ""
          : selectedEmployee.lga_code,
        Validators.required,
      ],
      homeAddress: [
        selectedEmployee.home_address,
        [Validators.required, Validators.minLength(10)],
      ],
    });
  }

  getEmployees() {
    this.employeesData = "";
    this.apiUrl = environment.AUTHAPIURL + "employees-list";
    console.log("selectedBusinessId: ", this.selectedBusinessId);

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {
      business_id: this.selectedBusinessId,
      corporate_id: this.selectedCorporateId,
    };

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
        console.log("employeesData: ", data);
        this.employeesData =
          data.response == null || data.response.data == null
            ? []
            : data.response.data;
        this.spinnerService.hide();
      });
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
    formData.append("employees", this.myForm.get("myfile").value);
    formData.append("business_id", this.selectedBusinessId);
    formData.append("corporate_id", this.selectedCorporateId);
    this.apiUrl = environment.AUTHAPIURL;
    this.spinnerService.show();

    this.httpClient
      .post<any>(this.apiUrl + "employees/import", formData, config)
      .subscribe((res) => {
        console.log(res);

        // Clear form Value Without any Error
        this.myForm.reset();
        Object.keys(this.myForm.controls).forEach((key) => {
          this.myForm.get(key).setErrors(null);
        });

        if (res.status == true) {
          this.spinnerService.hide();

          this.myForm.reset();
          Object.keys(this.myForm.controls).forEach((key) => {
            this.myForm.get(key).setErrors(null);
          });

          this.file = null;
          this.filePath = null;

          if (res.message === "0 Employees created; 0 updated.") {
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

            this.getEmployees();
            this.uploadBulkModalRef.close();
            // this.modalService.dismissAll();
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
              console.log("row: ", row);

              for (const error of row) {
                console.log(key.replace(regex, " ") + ":", error);
                let err = key.replace(regex, " " + ":");
                this.error =
                  err.toUpperCase() +
                  " " +
                  (key.replace(regex, " ") + ":", error);
                this.columnError.push(this.error);
                console.log(this.error);
              }
            }
          }

          this.file = null;
          this.filePath = null;
          this.reload();

          Swal.fire({
            icon: "error",
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

        console.log("columnError;" + this.columnError);
      });
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.file = event.target.files[0];
      this.filePath = event.target.files[0].name;
      this.myForm.get("myfile").setValue(file);
    }
  }

  reload() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigate(["./"], { relativeTo: this.route });
  }

  calculateGrossIncome(event) {
    this.grossIncomeIncorrect = this.utilityService.calculateGrossIncome(this.addEmployeeForm);
  }

  validateTinPhoneNinBvn(selectedForm) {
    let tin = selectedForm.get('employeeTIN').value;
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

  showModal(modal) {
    // reset form errors when close popup form
    this.submitted = false;
    this.filePath = null;
    //End reset form errors when close popup form

    this.utilityService.showModal(modal);
  }

}
