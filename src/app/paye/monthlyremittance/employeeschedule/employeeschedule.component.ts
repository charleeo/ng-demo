import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SessionService } from "src/app/session.service";
import { UtilityService } from "src/app/utility.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-employeeschedule",
  templateUrl: "./employeeschedule.component.html",
  styleUrls: ["./employeeschedule.component.css"],
})
export class EmployeescheduleComponent implements OnInit {
  addEmployeeForm: FormGroup;
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
  selectedEmployee: any;
  forwardScheduleForm: FormGroup;
  showCreateSchedule: boolean = false;
  showEditEmployee: boolean = false;
  showDeleteEmployee: boolean = false;
  showSaveEmployee: boolean = false;
  businessesData: any;
  selectedBusinessId: any;
  selectedBusiness: any;
  corporateForm: FormGroup;
  taxTaxOffices: any;
  industrySectors: any;
  selectedCorporateId: any;
  selectedEmployeeId: any;
  showTaxOffice: boolean = false;
  showViewEmployee: boolean = true;
  scheduleButton: string = "View Schedule";
  employeeCount: boolean;
  title = "Paye - Employees Schedule";

  config: any;
  currentPageLength: any = 10;
  zipCodes: any;
  viewerRole: boolean;
  grossIncomeIncorrect: boolean = false;
  stateLocalGovts: any;
  validateCacTin: boolean;
  isScheduleYearValid: boolean;
  businessId: any;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private sess: SessionService,
    private utilityService: UtilityService,
    private titleService: Title,
    private modalService: NgbModal,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.initialiseForms();
    //this.getBusinesses();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getBusinesses(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );

    this.getIndustrySectors();
    this.getTaxOffices();
    this.getZipcodes();
    this.getStateLocalGovts();
    var userRole = localStorage.getItem("admin_role_id");
    //console.log("userRole: ", userRole);

    if (userRole == "3") {
      this.showCreateSchedule = true;
      this.showEditEmployee = true;
      this.showDeleteEmployee = true;
      this.showSaveEmployee = true;
      this.showViewEmployee = false;
      this.scheduleButton = "Forward Schedule";
    }

    if (userRole == "4") {
      this.viewerRole = true;
    }

    if (userRole == "1") {
      this.showTaxOffice = true;
    }

    console.log("token: ", localStorage.getItem("admin_access_token"));
    //this.spinnerService.hide();

    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      // size: 'lg'
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
      nationality: ["", Validators.required],
      startMonthId: ["", Validators.required],
      NHF: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      NHIS: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      CRA: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,3})$/),
        ],
      ],
      pension: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      grossIncome: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      lifeAssurance: [
        "0",
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      totalIncome: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
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
      homeAddress: ["", Validators.required],

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
      existingTaxId: ["", [Validators.minLength(10), Validators.maxLength(10)]],
      localGovernmentId: ["", Validators.required],
    });

    this.forwardScheduleForm = this.formBuilder.group({
      scheduleYear: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(4),
          Validators.maxLength(4),
        ],
      ],
      scheduleMonthId: ["", Validators.required],
      comment: [""],
    });

    this.corporateForm = this.formBuilder.group({
      companyName: [
        ""
      ],
      companyID: [""],
      businessName: [""],
      businessID: [""],
    });
  }

  getBusinesses(perpage, pageno) {
    this.apiUrl = `${environment.AUTHAPIURL}corporates/businesses?page=${pageno}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = { per_page: perpage, page_no: pageno, has_employees: true };

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
        console.log("businessesData", data);
        if (data.status == true) {
          this.businessesData = data.response.data;
          this.config.totalItems = data.response.total;
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.businessesData = [];
        }

        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.businessesData = "";
    this.router.navigate(["/employeeschedule"], {
      queryParams: { page: newPage },
    });
    this.getBusinesses(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.businessesData = "";
    this.router.navigate(["/employeeschedule"]);
    this.getBusinesses(this.config.itemsPerPage, 1);
  }

  viewBusiness(modal, selectedBusiness) {
    console.log("selectedBusiness: ", selectedBusiness);
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

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("selectedBusiness: ", data);
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

  getStateLocalGovts() {
    this.apiUrl = `${environment.AUTHAPIURL}local-governments`;

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      this.stateLocalGovts = data.response;
      console.log("stateLocalGovts: ", data);
    });
  }

  onSubmit(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    this.validateTinPhoneNinBvn(this.addEmployeeForm);

    if (this.addEmployeeForm.invalid || this.validateCacTin) {
      return;
    }

    const obj = {
      id: this.selectedEmployee.id,
      tin: formAllData.employeeTIN,
      bvn: formAllData.bvn,
      nhis: formAllData.NHIS,
      nhf: formAllData.NHF,
      designation: formAllData.designation,
      title: formAllData.titleId,
      first_name: formAllData.firstName,
      last_name: formAllData.surname,
      email: formAllData.emailAddress,
      nationality: formAllData.nationality,
      tax_year: formAllData.taxYear,
      tax_month: formAllData.taxMonthId,
      zip_code: formAllData.zipCode,
      cra: formAllData.CRA,
      pension: formAllData.pension,
      gross_income: formAllData.grossIncome,
      phone: formAllData.phoneNumber,
      start_month: formAllData.startMonthId,

      life_assurance: formAllData.lifeAssurance,
      total_income: formAllData.totalIncome,
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
      taxpayer_id: formAllData.existingTaxId,
      lga_code: formAllData.localGovernmentId,
      nin: formAllData.nin,
    };

    console.log("employeeFormData: ", obj);
    this.postUpdateEmployee(obj);
    this.submitted = false;
  }

  addEmployee(content) {
    this.modalService.open(content, this.modalOptions).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  getZipcodes() {
    this.apiUrl = environment.AUTHAPIURL + "postalcodes";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("zipcodes: ", data);
      this.zipCodes = data.response;
    });
  }

  viewEmployee(modal, selectedEmployee) {
    // console.log("selectedEmployee: ", selectedEmployee);
    this.submitted = false;
    this.businessId = selectedEmployee.business_id;
    // this.corporateId = selectedEmployee.corporate_id;
    this.showSaveEmployee = false;
    this.showModal(modal);
    this.getSingleEmployee(selectedEmployee.id, this.businessId);
  }

  editEmployee(modal, selectedEmployee) {
    // console.log("selectedEmployee: ", selectedEmployee);
    this.submitted = false;
    this.selectedEmployeeId = selectedEmployee.id;
    // this.corporateId = selectedEmployee.corporate_id;
    this.businessId = selectedEmployee.business_id;
    this.showSaveEmployee = true;
    this.showModal(modal);
    this.getSingleEmployee(selectedEmployee.id, this.businessId);
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
      zipCode: [selectedEmployee?.zip_code, [Validators.required]],
      nationality: [selectedEmployee.nationality, Validators.required],
      startMonthId: [selectedEmployee.start_month, Validators.required],
     
      NHF: [selectedEmployee.nhf, [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      NHIS: [selectedEmployee.nhis, [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      CRA: [
        selectedEmployee.cra,
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,3})$/),
        ],
      ],
      pension: [
        selectedEmployee.pension,
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      grossIncome: [
        selectedEmployee.gross_income,
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      lifeAssurance: [
        selectedEmployee.life_assurance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      totalIncome: [
        selectedEmployee.total_income,
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],

      titleId: [selectedEmployee.title, Validators.required],
      designation: [
        selectedEmployee.designation,
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z]([\w -]*[a-zA-Z])?$/),
        ],
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
      homeAddress: [selectedEmployee.home_address, Validators.required],
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
    });
  }

  showModal(modal) {
    this.modalService.open(modal, this.modalOptions).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  postUpdateEmployee(jsonData: any) {
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

        if (data.status === true) {
          // Rest form fithout errors
          this.addEmployeeForm.reset();

          Object.keys(this.addEmployeeForm.controls).forEach((key) => {
            this.addEmployeeForm.get(key).setErrors(null);
          });

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Employee has been updated successfully!",
            // text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.spinnerService.hide();
          this.modalService.dismissAll();
          this.getEmployees();
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

  getEmployees() {
    this.spinnerService.show();
    this.employeesData = "";
    this.apiUrl = environment.AUTHAPIURL + "employees-list";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    // let corporateId = localStorage.getItem('admin_corporate_id');

    const obj = {
      business_id: this.selectedBusinessId,
      corporate_id: this.selectedCorporateId,
    };

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("employeesData: ", data);

        if (data.response.data?.length == 0) {
          this.showCreateSchedule = true;
        } else {
          this.showCreateSchedule = false;
        }

        this.employeesData =
          data.response == null || data.response.data == null
            ? []
            : data.response.data;
        console.log("showCreateSchedule: ", this.showCreateSchedule);
        this.spinnerService.hide();
      });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }

  forwardSchedule(modal) {
    this.forwardScheduleForm = this.formBuilder.group({
      scheduleYear: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(4),
          Validators.maxLength(4),
        ],
      ],
      scheduleMonthId: ["", Validators.required],
      comment: [""],
    });

    this.modalService.open(modal, this.modalOptions).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  onSubmitSchedule(formAllData: any) {
    this.submitted = true;

    this.validateScheduleYear(this.forwardScheduleForm);

    // stop the process here if form is invalid
    if (this.forwardScheduleForm.invalid || !this.isScheduleYearValid) {
      return;
    }

    console.log("selectedBusinessId: ", this.selectedBusinessId);
    // let corporateId = localStorage.getItem('admin_corporate_id');

    const obj = {
      comment: formAllData.comment,
      due_date: formAllData.scheduleYear + "-" + formAllData.scheduleMonthId,
      business_id: this.selectedBusinessId,
      corporate_ids: [this.selectedCorporateId],
    };

    console.log("scheduleFormData: ", obj);
    this.postForwardSchedule(obj);
  }

  postForwardSchedule(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "schedules/forward";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("scheduleApiResponseData: ", data);

        if (data.status === true) {
          // Rest form fithout errors
          this.forwardScheduleForm.reset();
          Object.keys(this.forwardScheduleForm.controls).forEach((key) => {
            this.forwardScheduleForm.get(key).setErrors(null);
          });

          this.submitted = true;

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

          this.spinnerService.hide();
          this.modalService.dismissAll();
          this.getEmployees();
        } else {
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

  deleteEmployee(id: number) {
    let corporateId = localStorage.getItem("admin_corporate_id");

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
              //this.modalService.dismissAll();
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
    });
  }

  calculateGrossIncome(event) {
    // console.log("grossIncomeIncorrect: ", this.grossIncomeIncorrect);
    this.grossIncomeIncorrect = this.utilityService.calculateGrossIncome(
      this.addEmployeeForm
    );
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

  validateScheduleYear(selectedForm) {
    let year = Number(selectedForm.get('scheduleYear').value);
    this.toggleScheduleYear(year);
  }

  changeTinPhoneNinBvnStatus() {
    this.validateCacTin = false;
  }

  changeScheduleYearStatus() {
    let year = Number(this.forwardScheduleForm.get('scheduleYear').value);
    this.toggleScheduleYear(year);
  }

  toggleScheduleYear(year) {
    if (year < 2010) {
      this.isScheduleYearValid = false;
    }
    else {
      this.isScheduleYearValid = true;
    }
  }

}
