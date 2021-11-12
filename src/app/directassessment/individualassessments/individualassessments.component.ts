import { UtilityService } from 'src/app/utility.service';
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
import { Title } from "@angular/platform-browser";
import { pipe } from "rxjs";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-individualassessments",
  templateUrl: "./individualassessments.component.html",
  styleUrls: ["./individualassessments.component.css"],
})
export class IndividualassessmentsComponent implements OnInit {
  title = "Direct Assessment - Individual Assessment";
  roleID: string;
  dtOptions: any = {};
  modalOptions: NgbModalOptions;
  showTaxOffice: boolean;
  managerRole: boolean = false;
  selectedAssessmentId: any;
  assessmentYear: string;
  totalMonthlyTaxDue: any;
  closeResult: string;
  apiUrl: string;
  selectedAssessment: any;
  processInvoiceBtn: boolean;
  previewInvoice: boolean;
  paymentUrl: boolean;
  apiInvoiceUrl: any;
  apiPaymentUrl: any;
  assessmentEmployeesData: any;
  assessmentForm: FormGroup;
  appealForm: FormGroup;
  assessmentsData: any;
  submitted: boolean = false;
  individualId: any;
  paymentStatus: boolean;
  files: {
    filename: any;
    file: any;
  }[] = [];
  filePath: string[] = [];
  today: Date;
  invoiceNumber: any;
  editorRole: boolean = false;
  assessmentStatus: any;
  fileExceededSize: boolean = false;
  searchForm: FormGroup;
  reassessmentForm: FormGroup;

  searchObject: any = {};

  config: any;
  currentPageLength: any = 10;
  isAssessmentApproved: boolean;
  showAssessmentApproval: boolean;
  reassessmentModalRef: any;
  assessmentUpdatesData: any;
  invoiceData: any;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private sess: SessionService,
    private modalService: NgbModal,
    private titleService: Title,
    private utilityService: UtilityService,
    private datepipe: DatePipe,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  get f() {
    return this.appealForm.controls;
  }

  ngOnInit(): void {
    this.sess.checkLogin();
    this.titleService.setTitle(this.title);

    this.intialiseTableProperties();
    this.initialiseForms();
    //this.getAssessments();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getAssessments(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );
    
    this.today = new Date();
    this.roleID = localStorage.getItem("admin_role_id");

    if (this.roleID === "1") {
      this.showTaxOffice = true;
    }

    if (this.roleID === "2" || this.roleID === "3") {
      this.managerRole = true;
    }

    if (this.roleID === "3") {
      this.editorRole = true;
    }
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
      columnDefs: [
        {
          //targets: [ 10 ],
          visible: false,
          // searchable: false
        },
      ],
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
        
      ],
    };
  }

  initialiseForms() {
    this.assessmentForm = this.formBuilder.group({
      dateGenerated: [""],
      taxPayerName: [""],
      taxPayerID: [""],
      phoneNumber: [""],
      balance: [""],
      assessmentId: [""],
    });

    this.appealForm = this.formBuilder.group({
      message: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/),
        ],
      ],
      messageTitle: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/),
        ],
      ],
      invoiceNumber: [""],
      date: [""],
      myfile: ["", Validators.required],
    });

    this.searchForm = this.formBuilder.group({
      statusId: [""],
      taxPayerName: [""],
      invoiceID: [""],
      generatedFromId: [""],
      taxYear: [
        "",
        [
          Validators.pattern(/^(19|20)\d{2}$/),
          Validators.minLength(4),
          Validators.maxLength(4),
        ],
      ],
    });

    this.initialiseReassessmentForms();
  }

  initialiseReassessmentForms() {
    this.reassessmentForm = this.formBuilder.group({
      estimatedTotalIncome: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(\d{1,17}|\d{0,17}\.\d{1,2})$/),
        ],
      ],
      annualTaxDue: [""],
      comment: ["", Validators.required],
    });
  }

  getTaxYear(taxDueDate: string): string {
    var taxYear = taxDueDate.split("-", 3)[0];
    return taxYear;
  }

  getAssessments(perpage, pageno) {
    this.spinnerService.show();
    this.apiUrl =
      environment.AUTHAPIURL + "direct-assessments/list?page=" + pageno;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;

    this.httpClient.post<any>(this.apiUrl, this.searchObject, { headers: reqHeader }).subscribe((data) => {
        console.log("assessmentsData: ", data);
        this.assessmentsData = data.response == null ? [] : data.response.data;
        this.config.totalItems = data.response.total;
        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.assessmentsData = "";
    this.router.navigate(["/individualassessments"], {
      queryParams: { page: newPage },
    });
    this.getAssessments(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.assessmentsData = "";
    this.router.navigate(["/individualassessments"]);
    this.getAssessments(this.config.itemsPerPage, 1);
  }

  viewAssessment(modal, selectedAssessment) {
    console.log("selectedAssessment: ", selectedAssessment);
    this.selectedAssessmentId = selectedAssessment.id;
    this.assessmentYear = this.getTaxYear(selectedAssessment.due_date);
    this.totalMonthlyTaxDue = selectedAssessment.monthly_tax_due;
    this.individualId = selectedAssessment.individual_id;
    this.paymentStatus = selectedAssessment.payment_status == 1 ? false : true;
    this.assessmentStatus = selectedAssessment.status;
    this.isAssessmentApproved = selectedAssessment.approval_status == 0 ? false : true;
    this.showAssessmentApproval =
      selectedAssessment.approval_status == "0" ? null : true;

    this.showModal(modal);
    this.getSingleAssessment(selectedAssessment.id);
  }

  getSingleAssessment(assessmentId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}direct-assessments/${assessmentId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleAssessmentData: ", data);
        this.selectedAssessment = data.response;
        this.assessmentEmployeesData = data.response.calculated_values;
        this.assessmentUpdatesData = data.response.updates == null ? []: data.response.updates;
        this.showAssessmentApproval = data.response.approval_status == "0" ? null : true;
        this.isAssessmentApproved = data.response.approval_status == 0 ? false : true;
        // console.log("assessmentUpdatesData: ", this.assessmentUpdatesData);
        this.loadSelectedAssessmentData(this.selectedAssessment);

        if (data.response.invoice == null) {
          this.processInvoiceBtn = true;
          this.previewInvoice = false;
          this.paymentUrl = false;
        } else if (data.response.invoice.payment_status == 0) {
          this.processInvoiceBtn = false;
          this.previewInvoice = true;
          this.paymentUrl = true;
          this.apiInvoiceUrl = data.response.invoice.invoice_preview_url;
          this.apiPaymentUrl = data.response.invoice.payment_url;
          this.invoiceNumber = data.response.invoice?.invoice_number;
        } else if (data.response.invoice.payment_status == 1) {
          this.processInvoiceBtn = false;
          this.previewInvoice = true;
          this.paymentUrl = false;
          this.apiInvoiceUrl = data.response.invoice.invoice_preview_url;
        }

        if (this.invoiceNumber == null) {
          this.invoiceNumber = "No Invoice";
        }

        this.appealForm = this.formBuilder.group({
          message: [
            "",
            [
              Validators.required,
              Validators.minLength(5),
              Validators.pattern(/^(?!\s*$)[-a-zA-Z0-9_:,.' ']{1,100}$/),
            ],
          ],
          messageTitle: [
            "",
            [
              Validators.required,
              Validators.minLength(3),
              Validators.pattern(/^(?!\s*$)[-a-zA-Z0-9_:,.' ']{1,100}$/),
            ],
          ],
          invoiceNumber: [this.invoiceNumber],
          date: [this.datepipe.transform(this.today, "dd MMM yyyy")],
          myfile: ["", Validators.required],
        });

        this.spinnerService.hide();
      });
  }

  loadSelectedAssessmentData(selectedAssessment) {
    // let amountPaid = selectedAssessment.invoice?.amount_paid;
    let paymentStatus =
      selectedAssessment.payment_status == 0 ? "Unsettled" : "Settled";
    let balance =
      selectedAssessment.invoice?.amount_due -
      selectedAssessment.invoice?.amount_paid;
    var fullName =
      selectedAssessment.individual.first_name +
      " " +
      selectedAssessment.individual.surname;

    if (selectedAssessment.invoice === null) {
      balance = selectedAssessment.amount_due;
    }

    this.assessmentForm = this.formBuilder.group({
      dateGenerated: [
        this.datepipe.transform(selectedAssessment.created_at, "dd MMM yyyy"),
      ],
      totalMonthlyTax: [selectedAssessment.monthly_tax_due],
      taxPayerName: [fullName],
      taxPayerID: [selectedAssessment.individual.taxpayer_id],
      phoneNumber: [selectedAssessment.individual.phone],
      balance: [balance],
      assessmentId: [selectedAssessment.assessment_id],
    });
  }

  processInvoice() {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "invoices";

    const obj = {
      individual_id: this.individualId,
      direct_assessment_id: this.selectedAssessmentId,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
        console.log("invoice: ", data);

        if (data.status == true) {
          this.spinnerService.hide();
          Swal.fire({
            icon: "success",
            title: "Success",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.processInvoiceBtn = false;
          this.previewInvoice = true;
          this.paymentUrl = true;
          this.apiInvoiceUrl = data.response.invoice_preview_url;
          this.apiPaymentUrl = data.response.payment_url;
        } else {
          this.spinnerService.hide();
          Swal.fire({
            icon: "error",
            title: "Oops..",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  showAppealModal(modal) {
    this.showModal(modal);
  }

  onSubmitAppeal(formAllData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.appealForm.invalid || this.fileExceededSize) {
      return;
    }

    this.apiUrl = environment.AUTHAPIURL + "file/uploadMultiple";

    const formData = new FormData();
    for (var i = 0; i < this.files.length; i++) {
      formData.append("file[]", this.files[i].file);
    }
    // formData.append("file", this.appealForm.get("myfile").value);

    const config = {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
      },
    };

    this.spinnerService.show();

    this.httpClient
      .post<any>(this.apiUrl, formData, config)
      .subscribe((data) => {
        console.log(data);

        if (data.status === true) {
          Object.keys(this.appealForm.controls).forEach((key) => {
            this.appealForm.get(key).setErrors(null);
          });

          this.files = [];
          this.filePath = [];

          const obj = {
            message: formAllData.message,
            message_title: formAllData.messageTitle,
            individual_id: this.individualId,
            direct_assessment_id: this.selectedAssessmentId,
            submitted: true,
            file_url: data.response.url,
          };

          console.log("appealFormFormData: ", obj);
          this.postGenerateAppeal(obj);
        } else {
          this.spinnerService.hide();

          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });

    this.submitted = false;
  }

  postGenerateAppeal(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "direct-assessment-appeals";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("appealApiResponseData: ", data);

        if (data.status === true) {
          // Rest form fithout errors
          this.appealForm.reset();
          Object.keys(this.appealForm.controls).forEach((key) => {
            this.appealForm.get(key).setErrors(null);
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

          this.getAssessments(
            this.config.itemsPerPage,
            this.config.currentPage
          );
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

  onFileChange(event) {
    if (event.target.files.length > 0) {
      for (var i = 0; i < event.target.files.length; i++) {
        this.filePath.push(event.target.files[i].name);
        const fileObj = {
          filename: event.target.files[i].name,
          file: event.target.files[i],
        };
        this.files.push(fileObj);
      }

      // this.appealForm.get("myfile").setValue(file);
    }
  }

  deleteFile(file) {
    const index = this.filePath.indexOf(file);
    if (index > -1) {
      this.filePath.splice(index, 1);
    }

    this.files = this.files.filter(function (obj) {
      return obj.filename !== file;
    });
  }

  approveAssessment() {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}direct-assessments/approval`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      id: this.selectedAssessmentId,
      approval_status: 1,
    };

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("apiResponse: ", data);

        if (data.status === true) {
          this.isAssessmentApproved =
            data.response.approval_status == 1 ? true : false;
          this.showAssessmentApproval =
            data.response.approval_status == 0 ? null : true;

          Swal.fire({
            icon: "success",
            title: "Success",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });

          this.getAssessments(
            this.config.itemsPerPage,
            this.config.currentPage
          );
          this.spinnerService.hide();
        } else {
          this.spinnerService.hide();

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

  issueReassessment(modal) {
    this.reassessmentModalRef = this.utilityService.openModal(modal);
  }

  calculateAmountTaxDue() {
    let totalIncome = Number(this.reassessmentForm.get('estimatedTotalIncome').value);
    let amountTaxDue = this.utilityService.calculateAmountTaxDue(totalIncome);
    this.reassessmentForm.controls['annualTaxDue'].setValue(amountTaxDue);
  }

  onSubmitReassessment(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.reassessmentForm.invalid) {
      return;
    }

    this.postReassessmentObj(formAllData);
    this.submitted = false;
  }

  postReassessmentObj(formData) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}direct-assessment-boj`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      direct_assessment_id: this.selectedAssessmentId,
      reassessment_reason: formData.comment,
      estimated_total_income: formData.estimatedTotalIncome,
    }

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
        console.log("apiResponse: ", data);

        if (data.status === true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });
          this.reassessmentModalRef.close();
          this.initialiseReassessmentForms();
          this.getSingleAssessment(this.selectedAssessmentId);
          this.getAssessments(this.config.itemsPerPage, this.config.currentPage);
          this.spinnerService.hide();
        } 
        else {
          this.spinnerService.hide();

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

  onSubmitSearch(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.searchForm.invalid) {
      return;
    }

    this.searchObject = {
      tax_year: formAllData.taxYear,
      payment_status: formAllData.statusId,
      taxpayer_name: formAllData.taxPayerName,
      invoice_number: formAllData.invoiceID,
      created_by_app_id: formAllData.generatedFromId,
    };

    console.log("searchFormData: ", this.searchObject);
    this.getAssessments(this.config.itemsPerPage, this.config.currentPage);
  }

  getTaxOfficeById(taxOfficeId) {
    console.log("Here: ");
    // let taxOffice = this.utilityService.getTaxOfficeById(taxOfficeId)
    // return taxOffice;
  }

  viewInvoice(selectedInvoice, modal) {
    this.getSingleInvoice(selectedInvoice.old_invoice_id);
    this.showModal(modal);
  }

  getSingleInvoice(invoiceId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}old-invoices/${invoiceId}?individual_id=${this.individualId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      console.log("invoiceData: ", data);
      this.invoiceData = data.response.data;
      this.spinnerService.hide();
    });
  }

  clearSearch() {
    this.assessmentsData = "";
    this.searchObject = {};
    this.initialiseForms();
    this.getAssessments(this.config.itemsPerPage, this.config.currentPage);
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
