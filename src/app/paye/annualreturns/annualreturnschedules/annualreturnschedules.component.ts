import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
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
import { DatePipe } from "@angular/common";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-annualreturnschedules",
  templateUrl: "./annualreturnschedules.component.html",
  styleUrls: ["./annualreturnschedules.component.css"],
})
export class AnnualreturnschedulesComponent implements OnInit {
  dtOptions: any = {};
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
  months: { monthId: string; monthName: string }[] = [];
  managerRole: boolean = false;
  editorRole: boolean = false;
  industrySectors: any;
  taxTaxOffices: any;
  selectedCorporate: any;
  selectedCorporateId: any;
  corporatesData: any;
  corporateForm: FormGroup;
  showTaxOffice: boolean;
  approvalClosed: boolean = false;
  scheduleStatus: any;
  title = "Annual-Return-Schedules";
  assessmentGenerated: any;
  selectedScheduleId: any;
  selectedEmployeeId: any;
  selectedScheduleRecordId: any;
  addEmployeeTitle: string;
  showSaveEmployee: boolean;
  editEmployeeModalRef: any;
  selectedEmployee: any;
  annualReturnForm: FormGroup;
  showEditEmployee: boolean;

  config: any;
  currentPageLength: any = 10;
  selectedBusinessId: any;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private sess: SessionService,
    private modalService: NgbModal,
    private titleService: Title,
    public datepipe: DatePipe,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.getAllMonths();
    this.initialiseForms();
    this.intialiseTableProperties();
    //this.getSchedules();

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

    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      // size: 'lg'
      size: "xl",
    };
  }

  intialiseTableProperties() {
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
      oLanguage: {
        sEmptyTable: " ",
      },
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [],
    };
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
      // scheduleMonthId: ['', Validators.required],
      // comment: ['', Validators.required],
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
      // assessmentMonthId: ['', Validators.required],
    });

    this.scheduleForm = this.formBuilder.group({
      forwardedTo: [""],
      annualReturnStatus: [""],
      dateForwarded: [""],
      status: [""],
      dueDate: [""],
      corporateId: [""],
      createdAt: [""],
    });

    this.corporateForm = this.formBuilder.group({
      companyName: [""],
      companyTIN: [""],
      taxPayerID: [""],
    });

    this.annualReturnForm = this.formBuilder.group({
      // dateCreated: [''],
      taxPayerID: [""],
      monthlyIncome: [
        "",
        [Validators.required, Validators.pattern(/^[0-9\s]*$/)],
      ],
      annualGrossIncome: [
        "",
        [Validators.required, Validators.pattern(/^[0-9\s]*$/)],
      ],
      annualTaxPaid: [
        "",
        [Validators.required, Validators.pattern(/^[0-9\s]*$/)],
      ],
      months: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[0-9\s]*$/),
          Validators.maxLength(2),
        ],
      ],
      firstName: [
        "",
        [
          Validators.required,
          Validators.pattern("[a-zA-Z ]*"),
          Validators.maxLength(30),
        ],
      ],
      middleName: [
        "",
        [
          //Validators.required,
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
      nationality: ["Nigerian", Validators.required],
      designation: ["", Validators.required],
      // corporateID: [''],
    });
  }

  getAllMonths() {
    this.months = [
      { monthId: "01", monthName: "January" },
      { monthId: "02", monthName: "February" },
      { monthId: "03", monthName: "March" },
      { monthId: "04", monthName: "April" },
      { monthId: "05", monthName: "May" },
      { monthId: "06", monthName: "June" },
      { monthId: "07", monthName: "July" },
      { monthId: "08", monthName: "August" },
      { monthId: "09", monthName: "September" },
      { monthId: "10", monthName: "October" },
      { monthId: "11", monthName: "November" },
      { monthId: "12", monthName: "December" },
    ];
  }

  getMonthName(monthId: string): string {
    var monthName = this.months.filter((m) => m.monthId == monthId)[0]
      .monthName;
    return monthName;
  }

  viewSchedule(modal, selectedSchedule) {
    console.log("selectedSchedule: ", selectedSchedule);
    this.selectedScheduleId = selectedSchedule.id;
    this.selectedCorporateId = selectedSchedule.corporate_id;
    this.selectedBusinessId = selectedSchedule.business_primary_id;
    this.scheduleStatus = selectedSchedule.forwarded_to;
    this.assessmentGenerated = selectedSchedule.annual_return_assessment_status;
    this.scheduleEmployeesData = "";
    this.showModal(modal);

    this.getSingleSchedule(selectedSchedule.id);
    var array = selectedSchedule.due_date.split("-", 3);
    var dueDateYear = array[0];
    // var dueDateMonth = array[1];

    this.assessmentForm = this.formBuilder.group({
      assessmentYear: [dueDateYear],
      // assessmentMonthId: [dueDateMonth],
    });

    this.forwardScheduleForm = this.formBuilder.group({
      scheduleYear: [dueDateYear],
      // scheduleMonthId: [dueDateMonth],
      // comment: ['', Validators.required],
    });

    if (selectedSchedule.annual_return_assessment_status == 1) {
      this.approvalClosed = true;
    } else {
      this.approvalClosed = false;
    }
  }

  loadSelectedScheduleData(selectedSchedule) {
    let status = selectedSchedule.status == 0 ? "In Active" : "Active";
    let annualReturnStatus =
      selectedSchedule.annual_return_assessment_status == 0
        ? "Still Open"
        : "Case Closed";
    let forwardedTo =
      selectedSchedule.forwarded_to == 0
        ? "Not forwaded"
        : selectedSchedule.forwarded_to == 1
        ? "Forwarded to Tax Officer"
        : "Forwarded to Head of Station";

    this.scheduleForm = this.formBuilder.group({
      forwardedTo: [forwardedTo],
      annualReturnStatus: [annualReturnStatus],
      dateForwarded: [selectedSchedule.date_forwarded],
      status: [status],
      dueDate: [selectedSchedule.due_date],
      corporateId: [selectedSchedule.corporate_id],
      createdAt: [
        this.datepipe.transform(selectedSchedule.created_at, "yyyy-MM-dd"),
      ],
    });

    this.scheduleEmployeesData =
      selectedSchedule.annual_return_schedule_records;
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
    this.apiUrl = `${environment.AUTHAPIURL}annual-return-schedules/list?page=${pageno}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {
      // corporate_id: this.selectedCorporateId,
      per_page: perpage,
      page_no: pageno,
    };

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      console.log("schedulesData: ", data);
      this.schedulesData = data.response == null ? [] : data.response.data;
      this.config.totalItems = data.response.total;
      this.spinnerService.hide();
    });
  }

  pageChange(newPage: number) {
    this.schedulesData = "";
    this.router.navigate(["/annualreturnschedules"], {
      queryParams: { page: newPage },
    });
    this.getSchedules(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.schedulesData = "";
    this.router.navigate(["/annualreturnschedules"]);
    this.getSchedules(this.config.itemsPerPage, 1);
  }

  getSingleSchedule(scheduleId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}annual-return-schedules/${scheduleId}?corporate_id=${this.selectedCorporateId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
        console.log("singleScheduleData: ", data);
        this.selectedSchedule = data.response;

        this.loadSelectedScheduleData(this.selectedSchedule);
        this.spinnerService.hide();
      });
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
      // comment: formAllData.comment,
      due_date: formAllData.scheduleYear,
      businesses: [ { business_id: this.selectedBusinessId, corporate_id: this.selectedCorporateId } ],
      // corporate_ids: [this.selectedCorporateId],
    };

    console.log("scheduleFormData: ", obj);
    this.postForwardSchedule(obj);
  }

  postForwardSchedule(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "annual-return-schedules/forward";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("scheduleApiResponseData: ", data);

        if (data.status === true) {
          this.scheduleStatus = 1;
          // Rest form fithout errors
          this.forwardScheduleForm.reset();
          Object.keys(this.forwardScheduleForm.controls).forEach((key) => {
            this.forwardScheduleForm.get(key).setErrors(null);
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
      due_date: formAllData.assessmentYear,
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
    };

    console.log("assessmentFormData: ", obj);
    this.postGenerateAssessment(obj);
  }

  postGenerateAssessment(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "annual-return-assessments";

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

  editAnnualReturn(modal, selectedAnnualReturn) {
    console.log("selectedAnnualReturn: ", selectedAnnualReturn);
    this.selectedEmployeeId = selectedAnnualReturn.employee_id;
    this.selectedScheduleRecordId = selectedAnnualReturn.id;

    this.annualReturnForm = this.formBuilder.group({
      taxPayerID: [selectedAnnualReturn.taxpayer_id],

      monthlyIncome: [
        selectedAnnualReturn.monthly_income,
        [Validators.required, Validators.pattern(/^[0-9\s]*$/)],
      ],
      annualGrossIncome: [
        selectedAnnualReturn.annual_gross_income,
        [Validators.required, Validators.pattern(/^[0-9\s]*$/)],
      ],
      annualTaxPaid: [
        selectedAnnualReturn.annual_tax_paid,
        [Validators.required, Validators.pattern(/^[0-9\s]*$/)],
      ],
      months: [
        selectedAnnualReturn.months,
        [
          Validators.required,
          Validators.pattern(/^[0-9\s]*$/),
          Validators.maxLength(2),
        ],
      ],
      firstName: [
        selectedAnnualReturn.first_name,
        [
          Validators.required,
          Validators.pattern("[a-zA-Z ]*"),
          Validators.maxLength(30),
        ],
      ],
      middleName: [
        selectedAnnualReturn.middle_name,
        [
          //Validators.required,
          Validators.pattern("[a-zA-Z ]*"),
          Validators.maxLength(30),
        ],
      ],
      surname: [
        selectedAnnualReturn.surname,
        [
          Validators.required,
          Validators.pattern("[a-zA-Z ]*"),
          Validators.maxLength(30),
        ],
      ],
      nationality: [selectedAnnualReturn.nationality, Validators.required],
      designation: [selectedAnnualReturn.designation, Validators.required],
    });

    this.editEmployeeModalRef = this.modalService.open(
      modal,
      this.modalOptions
    );
  }

  onSubmitAnnualReturn(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.annualReturnForm.invalid) {
      return;
    }

    const obj = {
      annual_return_upload_taxpayer_id: formAllData.taxPayerID,
      monthly_income: formAllData.monthlyIncome,
      annual_gross_income: formAllData.annualGrossIncome,
      annual_tax_paid: formAllData.annualTaxPaid,
      months: formAllData.months,
      schedule_record_id: this.selectedScheduleRecordId,

      first_name: formAllData.firstName,
      middle_name: formAllData.middleName,
      surname: formAllData.surname,
      nationality: formAllData.nationality,
      designation: formAllData.designation,

      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
    };

    console.log("annualReturnFormData: ", obj);
    this.postUpdateAnnualReturn(obj);
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

  postUpdateAnnualReturn(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}annual-return-records/update`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("annualReturnResponseData: ", data);
        this.submitted = false;

        if (data.status === true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Annual Return has been updated successfully!",
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

  deleteAnnualReturn(annualReturnId: number) {
    const obj = {
      id: annualReturnId,
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.apiUrl = `${environment.AUTHAPIURL}annual-return-records/delete`;

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
        this.httpClient
          .post<any>(this.apiUrl, obj, { headers: reqHeader })
          .subscribe((data) => {
            console.log(data);

            if (data.status == true) {
              Swal.fire({
                icon: "success",
                title: "Success",
                text: "Annual Return Successfully Deleted",
                showConfirmButton: false,
                timer: 1500,
              });

              this.getSingleSchedule(this.selectedScheduleId);
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: data.message,
                showConfirmButton: true,
                timer: 5000,
              });
            }
          });
      }
    });
  }

  private getDismissReason(reason: any): string {
    this.modalService.dismissAll();
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }
}
