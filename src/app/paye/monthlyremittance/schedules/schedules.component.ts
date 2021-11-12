import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { Title } from "@angular/platform-browser";
import { UtilityService } from "src/app/utility.service";
// import { truncate } from 'fs';

@Component({
  selector: "app-schedules",
  templateUrl: "./schedules.component.html",
  styleUrls: ["./schedules.component.css"],
})
export class SchedulesComponent implements OnInit {
  dtOptions: any = {};
  dtOptionsPopUp: any = {};
  modalOptions: NgbModalOptions;
  apiUrl: string;
  schedulesData: any;
  forwardScheduleForm: FormGroup;
  scheduleForm: FormGroup;
  assessmentForm: FormGroup;
  closeResult: string;
  submitted: boolean;
  scheduleEmployeesData: any;
  selectedSchedule: any;
  showGenerateAssessment: boolean = false;
  showForwardSchedule: boolean = false;
  managerRole: boolean = false;
  editorRole: boolean = false;
  industrySectors: any;
  taxTaxOffices: any;
  selectedCorporate: any;
  selectedCorporateId: any;
  corporatesData: any;
  employeesData: any;
  corporateForm: FormGroup;
  showTaxOffice: boolean;
  scheduleCommentsData: any;
  approvalClosed: boolean = false;
  assessmentID: any;
  title = "Paye - Schedules";
  scheduleStatus: any;
  selectedEmployeeId: any;
  corporateId: any;
  addEmployeeTitle: string;
  showSaveEmployee: boolean;
  selectedEmployee: any;
  addEmployeeForm: FormGroup;

  editEmployeeModalRef: any;
  selectedScheduleId: any;
  showEditEmployee: boolean = false;
  assessmentGenerated: boolean;
  selectedScheduleRecordId: any;
  zipCodes: any;
  searchForm: FormGroup;

  config: any;
  currentPageLength: any = 10;
  searchObject: any = {};
  grossIncomeIncorrect: boolean;
  stateLocalGovts: any;
  validateCacTin: boolean;
  selectedBusinessId: any;
  businessId: any;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private sess: SessionService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private titleService: Title,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.initialiseForms();
    this.getZipcodes();
    this.getStateLocalGovts();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getSchedules(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );

    this.intialiseTableProperties();
    console.log("token: ", localStorage.getItem("admin_access_token"));
    var userRole = localStorage.getItem("admin_role_id");

    if (userRole == "1") {
      this.showTaxOffice = true;
    }

    if (userRole == "2") {
      this.showGenerateAssessment = true;
      this.managerRole = true;
    }

    if (userRole == "3") {
      this.editorRole = true;
      this.showEditEmployee = true;
    }
  }

  intialiseTableProperties() {
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
      columnDefs: [
        {
          //targets: [10],
          visible: false,
          searchable: false,
        },
      ],
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
            ],
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

    this.assessmentForm = this.formBuilder.group({
      assessmentYear: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(4),
          Validators.maxLength(4),
        ],
      ],
      assessmentMonthId: ["", Validators.required],
    });

    this.scheduleForm = this.formBuilder.group({
      forwardedTo: [""],
      assessmentStatus: [""],
      dateForwarded: [""],
      status: [""],
      dueDate: [""],
      // corporateId: [""],
      createdAt: [""],
    });

    this.corporateForm = this.formBuilder.group({
      companyName: [""],
      companyTIN: [""],
      taxPayerID: [""],
    });

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
      // otherIncome: ["", [Validators.pattern(/^[0-9\s]*$/)]],

      NHF: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      NHIS: ["", [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      CRA: ["", [Validators.required, Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,3})$/)]],
      pension: ["", [Validators.required, Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
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
      // surname: ['', Validators.required],
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
      designation: ["", Validators.required],
      existingTaxId: ["", [Validators.minLength(11), Validators.maxLength(11)]],
      localGovernmentId: ["", Validators.required],
    });

    this.searchForm = this.formBuilder.group({
      statusId: [""],
      companyName: [""],
      // invoiceID: [''],
      taxYear: [
        "",
        [
          Validators.pattern(/^(19|20)\d{2}$/),
          Validators.minLength(4),
          Validators.maxLength(4),
        ],
      ],
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

  getEmployees() {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "employees-list";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
    };

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("employeesData: ", data);
        this.employeesData =
          data.response.data == null ? [] : data.response.data;
        this.spinnerService.hide();
      });
  }

  viewSchedule(modal, selectedSchedule) {
    console.log("selectedSchedule: ", selectedSchedule);
    this.showModal(modal);
    this.selectedScheduleId = selectedSchedule.id;
    this.selectedCorporateId = selectedSchedule.corporate_id;
    this.selectedBusinessId = selectedSchedule.business_primary_id;
    this.scheduleStatus = selectedSchedule.forwarded_to;
    this.assessmentGenerated = selectedSchedule.assessment_status;

    this.getSingleSchedule(selectedSchedule.id);
    var array = selectedSchedule.due_date.split("-", 3);
    var dueDateYear = array[0];
    var dueDateMonth = array[1];

    this.assessmentForm = this.formBuilder.group({
      assessmentYear: [dueDateYear],
      assessmentMonthId: [dueDateMonth],
    });

    this.forwardScheduleForm = this.formBuilder.group({
      scheduleYear: [dueDateYear],
      scheduleMonthId: [dueDateMonth],
      comment: [""],
    });

  }

  getSingleSchedule(scheduleId) {
    this.spinnerService.show();
    this.scheduleEmployeesData = "";
    this.scheduleCommentsData = "";

    this.apiUrl = `${environment.AUTHAPIURL}schedules/${scheduleId}?corporate_id=${this.selectedCorporateId}&business_id=${this.selectedBusinessId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleScheduleData: ", data);
        this.selectedSchedule = data.response;
        this.loadSelectedScheduleData(this.selectedSchedule);
        this.spinnerService.hide();
      });
  }

  loadSelectedScheduleData(selectedSchedule) {
    let status = selectedSchedule.schedule.status == 0 ? "In Active" : "Active";
    let assessmentStatus =
      selectedSchedule.schedule.assessment_status == 0
        ? "Awaiting Action"
        : "Assessment Generated";
    let forwardedTo =
      selectedSchedule.schedule.forwarded_to == 1
        ? "Sent back to Tax Officer"
        : selectedSchedule.schedule.forwarded_to == 2
        ? "Forwarded to Head of Station"
        : "Not forwarded";
    this.approvalClosed =
      selectedSchedule.schedule.assessment_status == 0 ? false : true;

    this.scheduleForm = this.formBuilder.group({
      forwardedTo: [forwardedTo],
      assessmentStatus: [assessmentStatus],
      dateForwarded: [selectedSchedule.schedule.date_forwarded],
      status: [status],
      dueDate: [selectedSchedule.schedule.due_date],
      // corporateId: [selectedSchedule.schedule.corporate_id],
      createdAt: [selectedSchedule.schedule.created_at],
    });

    this.scheduleCommentsData = selectedSchedule.comments;
    this.scheduleEmployeesData = selectedSchedule.schedule_records;
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

  getSchedules(perpage, pageno) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "schedules/list?page=" + pageno;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;

    this.httpClient
      .post<any>(this.apiUrl, this.searchObject, { headers: reqHeader })
      .subscribe((data) => {
        console.log("schedulesData: ", data);
        this.schedulesData = data.response == null ? [] : data.response.data;
        this.config.totalItems = data.response.total;
        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.schedulesData = "";
    this.router.navigate(["/schedules"], { queryParams: { page: newPage } });
    this.getSchedules(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.schedulesData = "";
    this.router.navigate(["/schedules"]);
    this.getSchedules(this.config.itemsPerPage, 1);
  }

  

  forwardSchedule(modal) {
    this.showModal(modal);
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

  onSubmitSchedule(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.forwardScheduleForm.invalid) {
      return;
    }

    const obj = {
      comment: formAllData.comment,
      due_date: formAllData.scheduleYear + "-" + formAllData.scheduleMonthId,
      corporate_ids: [this.selectedCorporateId],
      business_id: this.selectedBusinessId,
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

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        console.log("scheduleApiResponseData: ", data);

        if (data.status === true) {
          this.scheduleStatus = 1;
          // Rest form fithout errors
          this.forwardScheduleForm.reset();
          Object.keys(this.forwardScheduleForm.controls).forEach((key) => {
            this.forwardScheduleForm.get(key).setErrors(null);
          });

          if (data.response.forwarded_to == 2) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Schedule forwarded to Head of Station",
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

          this.getSchedules(this.config.itemsPerPage, this.config.currentPage);
          this.spinnerService.hide();
          this.modalService.dismissAll();
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

  generateAssessment(modal) {
    this.showModal(modal);
  }

  onSubmitAssessment(formAllData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.assessmentForm.invalid) {
      return;
    }

    const obj = {
      due_date:
        formAllData.assessmentYear + "-" + formAllData.assessmentMonthId,
        corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
    };

    console.log("assessmentFormData: ", obj);
    this.postGenerateAssessment(obj);
  }

  postGenerateAssessment(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "assessments";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("assessmentApiResponseData: ", data);

        if (data.status === true) {
          // Rest form fithout errors
          this.assessmentForm.reset();
          Object.keys(this.assessmentForm.controls).forEach((key) => {
            this.assessmentForm.get(key).setErrors(null);
          });

          this.businessId = data.response.business_id;

          this.processInvoice(data.response.id);
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

          this.getSchedules(this.config.itemsPerPage, this.config.currentPage);
          this.spinnerService.hide();
          this.modalService.dismissAll();
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

  processInvoice(assessmentId) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "invoices";

    const obj = {
      business_id: this.businessId,
      assessment_id: assessmentId,
    };
    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("invoice: ", data);
      });
  }

  editEmployee(modal, selectedEmployee) {
    // console.log("selectedEmployee: ", selectedEmployee);
    this.submitted = false;
    this.selectedEmployeeId = selectedEmployee.employee_id;
    this.selectedScheduleRecordId = selectedEmployee.id;
    this.addEmployeeTitle = "Edit Employee And Monthly Income";
    this.showSaveEmployee = true;

    this.editEmployeeModalRef = this.modalService.open(
      modal,
      this.modalOptions
    );

    this.manageModal(this.editEmployeeModalRef);
    this.getSingleEmployee(this.selectedEmployeeId, this.selectedBusinessId);
  }

  manageModal(modalReference) {
    modalReference.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
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

        if (data.response !== null) {
          this.loadSelectedEmployeeData(data.response);
          this.selectedEmployee = data.response;
        } else {
          this.editEmployeeModalRef.close();

          Swal.fire({
            icon: "info",
            title: "Info",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }

        this.spinnerService.hide();
      });
  }

  loadSelectedEmployeeData(selectedEmployee) {
    this.addEmployeeForm = this.formBuilder.group({
      emailAddress: [
        selectedEmployee?.email,
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      NSIRSTaxPayerID: [selectedEmployee?.taxpayer_id],
      zipCode: [selectedEmployee?.zip_code, [Validators.required]],
      nationality: [selectedEmployee?.nationality, Validators.required],
      startMonthId: [selectedEmployee?.start_month, Validators.required],
    
      NHF: [selectedEmployee?.nhf, [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      NHIS: [selectedEmployee?.nhis, [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)]],
      CRA: [
        selectedEmployee?.cra,
        [Validators.required, Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,3})$/)],
      ],
      pension: [
        selectedEmployee?.pension,
        [Validators.required, Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      grossIncome: [
        selectedEmployee?.gross_income,
        [Validators.required, Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      lifeAssurance: [
        selectedEmployee.life_assurance,
        [Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      totalIncome: [
        selectedEmployee.total_income,
        [Validators.required, Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/)],
      ],
      bvn: [
        selectedEmployee?.bvn,
        [
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      nin: [
        selectedEmployee?.nin,
        [
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      employeeTIN: [
        selectedEmployee?.tin,
        [
          Validators.pattern(/^[0-9\s]*$/),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      phoneNumber: [
        selectedEmployee?.phone,
        [
          Validators.required,
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      firstName: [
        selectedEmployee?.first_name,
        [
          Validators.required,
          Validators.pattern("[a-zA-Z ]*"),
          Validators.maxLength(30),
        ],
      ],
      surname: [
        selectedEmployee?.last_name,
        [
          Validators.required,
          Validators.pattern("[a-zA-Z ]*"),
          Validators.maxLength(30),
        ],
      ],
      titleId: [selectedEmployee?.title, Validators.required],
      designation: [selectedEmployee?.designation, Validators.required],
      existingTaxId: [
        selectedEmployee?.taxpayer_id,
        [Validators.minLength(11), Validators.maxLength(11)],
      ],
      homeAddress: [
        selectedEmployee?.home_address,
        [Validators.required, Validators.minLength(10)],
      ],
      localGovernmentId: [
        selectedEmployee?.lga_code == null
          ? ""
          : selectedEmployee?.lga_code,
        Validators.required,
      ],
    });
  }

  onSubmitEmployee(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    this.validateTinPhoneNinBvn(this.addEmployeeForm);

    if (this.addEmployeeForm.invalid || this.validateCacTin) {
      return;
    }

    const obj = {
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
      zip_code: formAllData.zipCode,
      cra: formAllData.CRA,
      pension: formAllData.pension,
      gross_income: formAllData.grossIncome,
      phone: formAllData.phoneNumber,
      start_month: formAllData.startMonthId,
      
      taxpayer_id: formAllData.existingTaxId,
      home_address: formAllData.homeAddress,
      id: this.selectedEmployeeId,

      life_assurance: formAllData.lifeAssurance,
      total_income: formAllData.totalIncome,
      schedule_record_id: this.selectedScheduleRecordId,
      lga_code: formAllData.localGovernmentId,
      nin: formAllData.nin,

      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
    };

    console.log("employeeFormData: ", obj);
    this.postUpdateEmployee(obj);
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
        this.submitted = false;
        if (data.status === true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Employee has been updated successfully!",
            // text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.getSingleSchedule(this.selectedScheduleId);
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

  calculateGrossIncome(event) {
    // console.log("test: ", this.addEmployeeForm.get('lifeAssurance').value);
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

  onSubmitSearch(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.searchForm.invalid) {
      return;
    }

    this.searchObject = {
      tax_year: formAllData.taxYear,
      assessment_status: formAllData.statusId,
      company_name: formAllData.companyName,
    };

    console.log("searchFormData: ", this.searchObject);
    this.getSchedules(this.config.itemsPerPage, this.config.currentPage);
  }

  clearSearch() {
    this.schedulesData = "";
    this.searchObject = {};
    this.initialiseForms();
    this.getSchedules(this.config.itemsPerPage, this.config.currentPage);
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
}
