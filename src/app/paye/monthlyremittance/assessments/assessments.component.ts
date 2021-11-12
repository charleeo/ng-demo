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
import { DatePipe } from "@angular/common";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-assessments",
  templateUrl: "./assessments.component.html",
  styleUrls: ["./assessments.component.css"],
})
export class AssessmentsComponent implements OnInit {
  apiUrl: string;
  assessmentsData: any;
  dtOptions: any = {};
  dtOptionsPopUp: any = {};
  modalOptions: NgbModalOptions;
  closeResult: string;
  assessmentEmployeesData: any;
  assessmentForm: FormGroup;
  totalGrossIncome: any;
  totalMonthlyTaxDue: any;
  submitted: boolean = false;
  selectedAssessment: any;
  corporateLogo: any;
  assessmentYear: string;
  assessmentMonth: any;
  showPrintInvoice: boolean = false;
  corporateForm: FormGroup;
  industrySectors: any;
  taxTaxOffices: any;
  selectedCorporate: any;
  selectedCorporateId: any;
  corporatesData: any;
  roleID: string;
  showTaxOffice: boolean = false;
  managerRole: boolean = false;
  processInvoiceBtn: boolean;
  previewInvoice: boolean;
  paymentUrl: boolean;
  apiInvoiceUrl: any;
  apiPaymentUrl: any;
  selectedAssessmentId: any;
  searchForm: FormGroup;
  title = "Paye - Monthly Assessment";

  config: any;
  currentPageLength : any = 10;
  searchObject: any = {};
  selectedBusinessId: any;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private sess: SessionService,
    private modalService: NgbModal,
    public datepipe: DatePipe,
    public titleService: Title,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.sess.checkLogin();
    this.titleService.setTitle(this.title);

    this.initialiseForms();
    //this.getAssessments();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getAssessments(this.config.itemsPerPage, this.config.currentPage);
    this.route.queryParams.subscribe(
      params => this.config.currentPage= params['page']?params['page']:1 
    );

    this.intialiseTableProperties();
    console.log("token: ", localStorage.getItem("admin_access_token"));
    this.roleID = localStorage.getItem("admin_role_id");

    if (this.roleID === "1") {
      this.showTaxOffice = true;
    }

    if (this.roleID === "2" || this.roleID === "3") {
      this.managerRole = true;
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
      pagingType: 'full_numbers',
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
    this.assessmentForm = this.formBuilder.group({
      dateGenerated: [""],
      companyName: [""],
      taxPayerID: [""],
      phoneNumber: [""],
      balance: [""],
      address: [""],
      dueDate: [""],
      totalMonthlyTax: [""],
      paymentStatus: [""],
      cacNumber: [""],
      businessName: [""],
      businessID: [""],
      invoiceID: [""],
    });

    this.corporateForm = this.formBuilder.group({
      companyName: [""],
      companyTIN: [""],
      taxPayerID: [""],
    });

    this.searchForm = this.formBuilder.group({
      statusId: [''],
      companyName: [''],
      invoiceID: [''],
      // generatedFromId: [''],
      taxYear: ['', [Validators.pattern(/^(19|20)\d{2}$/), Validators.minLength(4), Validators.maxLength(4)]],
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

  getAssessments(perpage, pageno) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + 'assessments/list?page='+pageno;

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
    console.log('searchFormData: ', this.searchObject);
    this.assessmentsData = '';
    this.router.navigate(['/assessments'], { queryParams: { page: newPage } });
    this.getAssessments(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event
    this.currentPageLength = this.config.itemsPerPage;
    this.assessmentsData = '';
    this.router.navigate(['/assessments']);
    this.getAssessments(this.config.itemsPerPage, 1);
  }

  viewAssessment(modal, selectedAssessment) {
    console.log("selectedAssessment: ", selectedAssessment);
    this.selectedAssessmentId = selectedAssessment.id;
    this.selectedCorporateId = selectedAssessment.corporate_id;
    this.selectedBusinessId = selectedAssessment.business_primary_id;
    this.assessmentYear = this.getTaxYear(selectedAssessment.due_date);
    this.assessmentMonth = this.getTaxMonth(selectedAssessment.due_date);
    this.totalMonthlyTaxDue = selectedAssessment.monthly_tax_due;
    this.showModal(modal);

    this.getSingleAssessment(selectedAssessment.id);
    // this.totalGrossIncome = this.assessmentEmployeesData.sum(x => x.gross_income);
    // this.totalMonthlyTaxDue = this.assessmentEmployeesData.sum(x => x.monthly_tax_due);
  }

  loadSelectedAssessmentData(selectedAssessment) {
    let paymentStatus = selectedAssessment.payment_status == 0 ? "Unsettled" : "Settled";

    let balance =
      selectedAssessment.invoice?.amount_due -
      selectedAssessment.invoice?.amount_paid;

    if (selectedAssessment.invoice === null) {
      balance = selectedAssessment.monthly_tax_due;
    }

    this.assessmentForm = this.formBuilder.group({
      dateGenerated: [
        this.datepipe.transform(selectedAssessment.created_at, "yyyy-MM-dd"),
      ],
      dueDate: [selectedAssessment.due_date],
      totalMonthlyTax: [selectedAssessment.monthly_tax_due],
      paymentStatus: [paymentStatus],
      companyName: [selectedAssessment.corporate.company_name],
      cacNumber: [selectedAssessment.corporate.cac_number],
      taxPayerID: [selectedAssessment.corporate.taxpayer_id],
      phoneNumber: [selectedAssessment.corporate.phone],
      balance: [ balance ],
      // balance: [selectedAssessment.monthly_tax_due],
      address: [selectedAssessment.corporate.contact_address],

      businessName: [selectedAssessment.business?.business_name],
      businessID: [selectedAssessment.business_id],
      invoiceID: [selectedAssessment.invoice?.id],
    });

    this.corporateLogo = selectedAssessment.corporate.corporate_logo;
    //this.assessmentEmployeesData = selectedAssessment.assessment_records;
  }

  getSingleAssessment(assessmentId) {
    this.assessmentEmployeesData = '';
    this.apiUrl = `${environment.AUTHAPIURL}assessments/${assessmentId}?corporate_id=${this.selectedCorporateId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      business_id: this.selectedBusinessId,
    }

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
        console.log("singleAssessmentData: ", data);
        this.selectedAssessment = data.response;
        this.assessmentEmployeesData = data.response.schedule.schedule_records;
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
        } else if (data.response.invoice.payment_status == 1) {
          this.processInvoiceBtn = false;
          this.previewInvoice = true;
          this.paymentUrl = false;
          this.apiInvoiceUrl = data.response.invoice.invoice_preview_url;
        }

        this.spinnerService.hide();
      });
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

  getEmployeesCount(employees: []): Number {
    var employeesCount = employees.length;
    return employeesCount;
  }

  payForAssessment() {}

  processInvoice() {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "invoices";

    const obj = {
      business_id: this.selectedBusinessId,
      corporate_id: this.selectedCorporateId,
      assessment_id: this.selectedAssessmentId,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
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
          // this.apiInvoiceUrl = data.response.invoice?.invoice_preview_url;
          // this.apiPaymentUrl = data.response.invoice?.payment_url;
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

  onSubmitSearch(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.searchForm.invalid) {
      return;
    }

    this.searchObject = {
      tax_year: formAllData.taxYear,
      payment_status: formAllData.statusId,
      company_name: formAllData.companyName,
      invoice_number: formAllData.invoiceID,
      // created_by_app_id: formAllData.generatedFromId,
    };

    console.log('searchFormData: ', this.searchObject);
    this.getAssessments(this.config.itemsPerPage, this.config.currentPage);
  }

  clearSearch() {
    this.assessmentsData = '';
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
