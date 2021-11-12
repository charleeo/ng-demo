import { Component, OnInit } from '@angular/core';
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
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-whtassessments',
  templateUrl: './whtassessments.component.html',
  styleUrls: ['./whtassessments.component.css']
})
export class WhtassessmentsComponent implements OnInit {
  apiUrl: string;
  assessmentsData: any;
  searchObject: any = {};
  title = "WHT - Assessments";
  dtOptions: any = {};
  dtOptionsPopUp: any = {};
  modalOptions: NgbModalOptions;
  paymentUrl: boolean;
  apiInvoiceUrl: any;
  apiPaymentUrl: any;
  processInvoiceBtn: boolean;
  assessmentForm: FormGroup;
  objectionForm: FormGroup;
  
  config: any;
  currentPageLength : any = 10;
  roleID: string;
  showPayButton: boolean;
  submitted: boolean = false;
  selectedAssessmentId: any;
  assessmentDate: any;
  totalTaxDue: any;
  closeResult: string;
  previewInvoice: boolean;
  selectedAssessment: any;
  assessmentTaxpayersData: any = [];
  corporateLogo: any;
  assessmentUpdatesData: any = [];
  editorRole: boolean;
  paymentStatus: boolean;
  assessmentStatus: any;
  fileExceededSize: boolean = false;
  files: { filename: any; file: any; } [] = [];
  filePath: string[] = [];
  collectorTaxpayerId: any;
  selectedCollectorId: any;
  selectedTaxpayerId: any;
  // selectedFileInput: HTMLInputElement;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private sess: SessionService,
    private modalService: NgbModal,
    public datepipe: DatePipe,
    public titleService: Title,
    private spinnerService: Ng4LoadingSpinnerService) { }

  get f() {
    return this.objectionForm.controls;
  }

  ngOnInit(): void {
    this.sess.checkLogin();
    this.titleService.setTitle(this.title);

    this.initialiseForms();
    this.intialiseTableProperties();
    this.roleID = localStorage.getItem("admin_role_id");

    if (this.roleID === "2" || this.roleID === "3") {
      this.showPayButton = true;
    }

    if (this.roleID === "3") {
      this.editorRole = true;
    }
    
    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getAssessments(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      params => this.config.currentPage= params['page']?params['page']:1 
    );
  }

  initialiseForms() {
    this.assessmentForm = this.formBuilder.group({
      dateGenerated: [""],
      taxPayerName: [""],
      taxPayerID: [""],
      phoneNumber: [""],
      amountToPay: [""],
      address: [""],     
     
      invoiceID: [""],
    });

    this.objectionForm = this.formBuilder.group({
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

  getAssessments(perpage, pageno) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}wht/assessments/list?page=${pageno}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;
    // this.searchObject["collector_id"] = null;

    this.httpClient.post<any>(this.apiUrl, this.searchObject, { headers: reqHeader }).subscribe((data) => {
        console.log("assessmentsData: ", data);
        this.assessmentsData = data.response == null ? [] : data.response.data;
        this.config.totalItems = data.response?.total;
        this.spinnerService.hide();
    });
  }

  viewAssessment(modal, selectedAssessment) {
    console.log("selectedAssessment: ", selectedAssessment);
    this.selectedAssessmentId = selectedAssessment.id;
    this.collectorTaxpayerId = selectedAssessment.collector_taxpayer_id;
    // this.selectedCorporateId = selectedAssessment.corporate_id;
    // this.selectedBusinessId = selectedAssessment.business_primary_id;
    this.paymentStatus = selectedAssessment.payment_status == 1 ? false : true;
    this.assessmentStatus = selectedAssessment.status;

    this.assessmentDate = selectedAssessment.date_generated;
    this.totalTaxDue = selectedAssessment.tax_due;
    this.showModal(modal);

    this.getSingleAssessment(selectedAssessment.id);
    this.getAssessmentUpdates(selectedAssessment.assessment_id);
  }

  getAssessmentUpdates(assessmentIdStr) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}wht/assessment-update`;

    const obj = {
      wht_assessment_id: assessmentIdStr,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      console.log("assessmentUpdatesData: ", data);
      this.assessmentUpdatesData = data.response == null || data.response.data == undefined ? [] : data.response.data;
      this.spinnerService.hide();
    });
  }
  
  getSingleAssessment(assessmentId) {
    this.assessmentTaxpayersData = '';
    this.apiUrl = `${environment.AUTHAPIURL}wht/assessments/${assessmentId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
        console.log("singleAssessmentData: ", data);
        this.selectedAssessment = data.response;
        this.assessmentTaxpayersData = data.response?.assessment_records == null ? [] : data.response?.assessment_records;
        this.assessmentUpdatesData = data.response.updates == null ? [] : data.response.updates;
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

  loadSelectedAssessmentData(selectedAssessment) {
    let paymentStatus = selectedAssessment.payment_status == 0 ? "Unsettled" : "Settled";
    let amountToPay = selectedAssessment.amount_to_pay;
    this.selectedCollectorId = selectedAssessment.collector_id;
    this.collectorTaxpayerId = selectedAssessment.collector_taxpayer_id;

    if (selectedAssessment.corporate == null) {
      this.assessmentForm = this.formBuilder.group({
        dateGenerated: [
          this.datepipe.transform(selectedAssessment.date_generated, "yyyy-MM-dd"),
        ],
       
        taxPayerName: [selectedAssessment.individual.taxpayer_first_name + " " + selectedAssessment.individual.taxpayer_surname],
        taxPayerID: [selectedAssessment.individual.taxpayer_id],
        phoneNumber: [selectedAssessment.individual.phone],
        amountToPay: [ amountToPay ],
        address: [selectedAssessment.individual.home_address],
  
        invoiceID: [selectedAssessment.invoice_id],
      });
    }

    if (selectedAssessment.individual == null) {
      this.assessmentForm = this.formBuilder.group({
        dateGenerated: [
          this.datepipe.transform(selectedAssessment.date_generated, "yyyy-MM-dd"),
        ],
       
        taxPayerName: [selectedAssessment.corporate.taxpayer_name],
        taxPayerID: [selectedAssessment.corporate.taxpayer_id],
        phoneNumber: [selectedAssessment.corporate.phone],
        amountToPay: [ amountToPay ],
        address: [selectedAssessment.corporate.contact_address],
  
        invoiceID: [selectedAssessment.invoice_id],
      });
    }
    
    this.corporateLogo = selectedAssessment.corporate?.corporate_logo;
  }

  processInvoice() {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "invoices";

    const obj = {
      collector_id: this.selectedCollectorId,
      collector_taxpayer_id: this.collectorTaxpayerId,
      wht_assessment_id: this.selectedAssessmentId,
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

  ///////////////////////////////////////////// Objection Begins ///////////////////////////////////////////
  showObjectionModal(modal) {
    this.showModal(modal);
  }

  onSubmitObjection(formAllData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.objectionForm.invalid || this.fileExceededSize) {
      return;
    }

    this.apiUrl = environment.AUTHAPIURL + "file/uploadMultiple";

    const formData = new FormData();
    for (var i = 0; i < this.files.length; i++) {
      formData.append("file[]", this.files[i].file);
    }
    // formData.append("file", this.objectionForm.get("myfile").value);

    const config = {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
      },
    };

    this.spinnerService.show();

    this.httpClient.post<any>(this.apiUrl, formData, config).subscribe((data) => {
        // console.log(data);

        if (data.status === true) {
          Object.keys(this.objectionForm.controls).forEach((key) => {
            this.objectionForm.get(key).setErrors(null);
          });

          this.files = [];
          this.filePath = [];

          const obj = {
            message: formAllData.message,
            message_title: formAllData.messageTitle,
            wht_assessment_id: this.selectedAssessmentId,
            collector_taxpayer_id: this.collectorTaxpayerId,
            submitted: true,
            file_url: data.response.url,
          };

          console.log("objectionFormFormData: ", obj);
          this.postGenerateObjection(obj);
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

  postGenerateObjection(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}wht/assessment-appeals/add`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe((data) => {
        console.log("appealApiResponseData: ", data);
        if (data.status === true) {
          // Rest form fithout errors
          this.objectionForm.reset();
          Object.keys(this.objectionForm.controls).forEach((key) => {
            this.objectionForm.get(key).setErrors(null);
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
        // console.log("file: ", event.target.files[i]);
        let filename = event.target.files[i].name.toLowerCase();

        if (filename.includes("jpeg") || filename.includes("jpg") || filename.includes("png")) {
          const fileObj = {
            filename: event.target.files[i].name,
            file: event.target.files[i],
          };

          this.files.push(fileObj);
          this.filePath.push(event.target.files[i].name);
        }
        else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "The file format you selected is incorrect!",
            showConfirmButton: true,
            timer: 5000,
          });
        }
      }
    }

    if (this.files?.length > 0) { this.fileExceededSize = false; }
  }

  deleteFile(file) {
    const index = this.filePath.indexOf(file);

    if (index > -1) {
      this.filePath.splice(index, 1);
    }

    this.files = this.files.filter(function (obj) {
      return obj.filename !== file;
    });

    if (this.files?.length == 0) { this.fileExceededSize = true; }
  }

  onClickFileInput() {
    this.objectionForm.controls['myfile'].setValue(null);
  } 

////////////////////////////////////////////////// Objection Ends ///////////////////////////////////////////

  pageChange(newPage: number) {
    // console.log('searchFormData: ', this.searchObject);
    this.assessmentsData = '';
    this.router.navigate(['/whtassessments'], { queryParams: { page: newPage } });
    this.getAssessments(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event
    this.currentPageLength = this.config.itemsPerPage;
    this.assessmentsData = '';
    this.router.navigate(['/whtassessments']);
    this.getAssessments(this.config.itemsPerPage, 1);
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
