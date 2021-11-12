import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
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
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";

@Component({
  selector: "app-annualreturnassessments",
  templateUrl: "./annualreturnassessments.component.html",
  styleUrls: ["./annualreturnassessments.component.css"],
})
export class AnnualreturnassessmentsComponent implements OnInit {
  apiUrl: string;
  assessmentsData: any;
  dtOptions: any = {};
  dtOptionsPopUp: any = {};
  modalOptions: NgbModalOptions;
  closeResult: string;
  assessmentEmployeesData: any;
  assessmentForm: FormGroup;
  reassessmentForm: FormGroup;
  totalGrossIncome: any;
  totalMonthlyTaxDue: any;
  submitted: boolean;
  selectedAssessment: any;
  assessmentId: any;
  months: { monthId: string; monthName: string }[] = [];
  corporateForm: FormGroup;
  industrySectors: any;
  taxTaxOffices: any;
  selectedCorporate: any;
  selectedCorporateId: any;
  corporatesData: any;
  showGenerateReassessment: boolean = false;
  showTaxOffice: boolean;
  reassessmentItems: any[] = [];
  assessmentApprovalStatus: any;
  title = "Paye - Annual-Return-Assessments";
  reassessmentItemsTotalForm: FormGroup;
  sumOfReassessmentItems: number = 0;
  config: any;
  currentPageLength : any = 10;
  selectedBusinessId: any;
  reassessmentItemsData: any = [];

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptionsPopUpTest: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private sess: SessionService,
    private titleService: Title,
    private modalService: NgbModal,
    public datepipe: DatePipe,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.sess.checkLogin();
    this.titleService.setTitle(this.title);
    this.getAllMonths();
    this.initialiseForms();
    this.initialiseReassessmentForms();
    // this.reassessmentItemsData = [];
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

    console.log("token: ", localStorage.getItem("admin_access_token"));
    var userRole = localStorage.getItem("admin_role_id");

    if (userRole == "1") {
      this.showTaxOffice = true;
    }

    if (userRole == "2") {
      this.showGenerateReassessment = true;
    }

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
          searchable: false,
        },
      ],
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
        // { extend: 'csv',   className: 'btn btn-outline-dark', text: '<i class="fas fa-file-csv"> CSV</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}},
        // { extend: 'excel', className: 'btn btn-outline-dark', text: '<i class="fas fa-file-excel"> Excel</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} },
        // { extend: 'pdf',   className: 'btn btn-outline-dark', text: '<i class="fas fa-file-pdf"> PDF</i>' , orientation: 'landscape', pageSize: 'LEGAL', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}},
        // { extend: 'print', className: 'btn btn-outline-dark', text: '<i class="far fas fa-print"> Print</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } }
      ],
    };

    this.dtOptionsPopUp = {
      paging: true,
      // scrollX: true,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 5,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
     
    };

    this.dtOptionsPopUpTest = {
      paging: true,
      // scrollX: true,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 5,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
    };

    // $('#DataTables_Table_2').DataTable().destroy();
    // this.rerender();
  }

  // ngAfterViewInit(): void {
  //   this.dtTrigger.next();
  // }

  // ngOnDestroy(): void {
  //   // Do not forget to unsubscribe the event
  //   this.dtTrigger.unsubscribe();
  // }

  initialiseForms() {
    this.assessmentForm = this.formBuilder.group({
      dateGenerated: [""],
      dueDate: [""],
      annualReturnID: [""],
      assessmentStatus: [""],
      approvalStatus: [""],
      corporateId: [""],
      annualTaxDue: [""],
    });

    this.corporateForm = this.formBuilder.group({
      companyName: [""],
      companyTIN: [""],
      taxPayerID: [""],
    });

    this.reassessmentItemsTotalForm = this.formBuilder.group({
      total: [0],
    });
  }

  initialiseReassessmentForms() {
    this.reassessmentForm = this.formBuilder.group({
      // description: [''],
      description: ["", [Validators.required, Validators.maxLength(60)]],
      amount: ["", [Validators.required, Validators.pattern(/^(\d{1,19}|\d{0,19}\.\d{1,2})$/)]],
      // comment: [''],
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

  getAssessments(perpage, pageno) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + 'annual-assessments/list?page='+pageno;

    const objData = {
      // corporate_id: this.selectedCorporateId,
      "per_page":perpage,
      "page_no": pageno
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, objData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("assessmentsData: ", data);
        this.assessmentsData = data.response == null ? [] : data.response.data;
        this.config.totalItems = data.response.total;
        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.assessmentsData = '';
    this.router.navigate(['/annualreturnassessments'], { queryParams: { page: newPage } });
    this.getAssessments(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event
    this.currentPageLength = this.config.itemsPerPage;
    this.assessmentsData = '';
    this.router.navigate(['/annualreturnassessments']);
    this.getAssessments(this.config.itemsPerPage, 1);
  }

  viewAssessment(modal, selectedAssessment) {
    console.log("selectedAssessment: ", selectedAssessment);
    this.selectedCorporateId = selectedAssessment.corporate_id;
    this.selectedBusinessId = selectedAssessment.business_primary_id;

    this.assessmentId = selectedAssessment.id;
    this.assessmentApprovalStatus =
      selectedAssessment.revenue_board_approval_status;
    this.reassessmentItems = [];
    this.sumOfReassessmentItems = 0;

    this.reassessmentItemsTotalForm = this.formBuilder.group({
      total: [this.sumOfReassessmentItems],
    });

    this.showModal(modal);
    this.getSingleAssessment(selectedAssessment);
  }

  loadSelectedAssessmentData(loadedAssessment, selectedAssessment) {
    let assessmentStatus =
      loadedAssessment.status == 0 ? "In Active" : "Active";
    let approvalStatus =
      loadedAssessment.revenue_board_approval_status == 0
        ? "Pending"
        : loadedAssessment.revenue_board_approval_status == 1
        ? "Closed"
        : "Reassessed";

    this.assessmentForm = this.formBuilder.group({
      dateGenerated: [
        this.datepipe.transform(loadedAssessment.created_at, "yyyy-MM-dd"),
      ],
      dueDate: [selectedAssessment.due_date],
      annualReturnID: [loadedAssessment.annual_return_id],
      assessmentStatus: [assessmentStatus],
      approvalStatus: [approvalStatus],
      corporateId: [loadedAssessment.corporate_id],
      annualTaxDue: [loadedAssessment.annual_tax_due],
    });

    // console.log("loadedAssessment: ", loadedAssessment);
    this.assessmentEmployeesData = loadedAssessment.annualReturnRecords;
  }

  getSingleAssessment(assessment) {
    this.spinnerService.show();
    let assessmentId = assessment.id;
    this.apiUrl =
      environment.AUTHAPIURL +
      "annual-return-assessments/" +
      assessmentId +
      "?corporate_id=" +
      this.selectedCorporateId;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleAssessmentData: ", data);
        this.selectedAssessment = data.response;
        this.assessmentId = data.response.id;
        this.loadSelectedAssessmentData(this.selectedAssessment, assessment);
        this.spinnerService.hide();
      });
  }

  approveAssessment() {
    const obj = {
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
      id: this.assessmentId,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.apiUrl = `${environment.AUTHAPIURL}annual-return-assessments-approve`;

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Approve!",
    }).then((result) => {
      if (result.value) {
        this.spinnerService.show();
        this.httpClient
          .post<any>(this.apiUrl, obj, { headers: reqHeader })
          .subscribe((data) => {
            console.log("approveAssessmentApi: ", data);
            this.assessmentApprovalStatus =
              data.response.revenue_board_approval_status;

            if (data.status === true) {
              Swal.fire({
                icon: "success",
                title: "Success",
                text: "Assessment has been successfully Approved!",
                showConfirmButton: true,
                timer: 5000,
              });

              // this.getSingleAssessment(this.assessmentId);
              this.getAssessments(this.config.itemsPerPage, this.config.currentPage);
              this.spinnerService.hide();
              this.modalService.dismissAll();
            } else {
              this.spinnerService.hide();

              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "An error ocurred while trying to approve Assessment!",
                showConfirmButton: true,
                timer: 5000,
              });
            }
          });
      }
    });
  }

  generateReassessment(modal) {
    // this.reassessmentItemsData = '';
    this.showModal(modal);
    // this.sumOfReassessmentItems = 0;
  }

  addToReassessments(formData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.reassessmentForm.invalid) {
      console.log("this.submitted: ", this.submitted);
      return;
    }

    const obj = {
      item_description: formData.description,
      amount: formData.amount,
    };

    this.reassessmentItems.push(obj);
    this.reassessmentItemsData = this.reassessmentItems;
    this.rerenderReassessmentItemsGrid();
    this.initialiseReassessmentForms();
    this.loadSumOfReassessmentItemsForm(true, formData.amount);
    this.submitted = false;
    // this.modalService.dismissAll();
  }

  rerenderReassessmentItemsGrid() {
    $('#DataTables_Table_2').DataTable().destroy();
    this.dtTrigger.next();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  loadSumOfReassessmentItemsForm(isAddition, value: Number) {
    if (isAddition) {
      this.sumOfReassessmentItems =
        Number(this.sumOfReassessmentItems) + Number(value);
    } else {
      this.sumOfReassessmentItems =
        Number(this.sumOfReassessmentItems) - Number(value);
    }

    this.reassessmentItemsTotalForm = this.formBuilder.group({
      total: [this.sumOfReassessmentItems],
    });

    console.log("this.sumOfReassessmentItems: ", this.sumOfReassessmentItems);
  }

  removeFromReassessments(item) {
    const index = this.reassessmentItems.indexOf(item, 0);

    if (index > -1) {
      this.reassessmentItems.splice(index, 1);
      this.reassessmentItemsData = this.reassessmentItems;
      this.rerenderReassessmentItemsGrid();
      this.loadSumOfReassessmentItemsForm(false, item.amount);
    }

    // this.reassessmentItems.pop(item);
  }

  onSubmitReassessment(formAllData) {
    const obj = {
      annual_return_assessment_id: this.assessmentId,
      reassessed_items: this.reassessmentItems,
      comment: "Test!",

      business_id: this.selectedBusinessId,
      // corporate_id: this.selectedCorporateId,
      // approved: true,
    };

    console.log("reassessmentFormData: ", obj);
    this.postGenerateReassessment(obj);
  }

  postGenerateReassessment(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "reassessments";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("reassessmentApiResponseData: ", data);
        this.assessmentApprovalStatus =
          data.response.revenue_board_approval_status;

        if (data.status === true) {
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

          this.reassessmentItems = [];
          this.sumOfReassessmentItems = 0;
          this.getAssessments(this.config.itemsPerPage, this.config.currentPage);
          this.spinnerService.hide();
          this.modalService.dismissAll();
        }
      });
  }

  processInvoice(reassessmentId) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "invoices";

    const obj = {
      business_id: this.selectedBusinessId,
      corporate_id: this.selectedAssessment.corporate_id,
      reassessment_id: reassessmentId,
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
