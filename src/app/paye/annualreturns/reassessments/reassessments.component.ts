import { FlashMessagesService } from "angular2-flash-messages";
import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
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
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-reassessments",
  templateUrl: "./reassessments.component.html",
  styleUrls: ["./reassessments.component.css"],
})
export class ReassessmentsComponent implements OnInit {
  apiUrl: string;
  reassessmentsData: any;
  dtOptions: any = {};
  modalOptions: NgbModalOptions;
  closeResult: string;
  reassessmentAppealsData: [];
  appealForm: FormGroup;
  reassessmentForm: FormGroup;
  reassessmentId: any;
  selectedReassessment: any;
  submitted: boolean;
  selectedCorporateId: any;
  selectedCorporate: any;
  taxTaxOffices: any;
  industrySectors: any;
  corporateForm: FormGroup;
  corporatesData: any;
  approveReassessmentForm: FormGroup;
  showApproveReassessment: boolean = false;
  showGenerateAppeal: boolean = false;
  showTaxOffice: boolean;
  reassessmentItems: any;
  processInvoiceBtn: boolean;
  previewInvoice: boolean;
  paymentUrl: boolean;
  apiInvoiceUrl: any;
  apiPaymentUrl: any;
  managerRole: boolean;
  reassessmentApprovalStatus: any;
  isReassessmentApproved: boolean;
  title = "Paye - Reassesements";
  today: Date;
  invoiceNumber: any;
  searchForm: FormGroup;

  isPaid: boolean;
  isAppealed: boolean;
  files: {
    filename: any;
    file: any;
  }[] = [];
  filePath: string[] = [];
  uploadAppealFileModalRef: any;
  myForm: FormGroup;
  error: string;
  columnError: string[] = [];
  uploadedFileUrl: any;
  disableGenerateAppeal: boolean;

  searchObject: any = {};
  config: any;
  currentPageLength: any = 10;
  selectedBusinessId: any;
  editorRole: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private sess: SessionService,
    private titleService: Title,
    private modalService: NgbModal,
    public datepipe: DatePipe,
    private route: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  get f() {
    return this.appealForm.controls;
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.initialiseForms();
    this.intialiseTableProperties();
    //this.getReassessments();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getReassessments(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );

    this.today = new Date();

    console.log("token: ", localStorage.getItem("admin_access_token"));
    var userRole = localStorage.getItem("admin_role_id");

    if (userRole == "1") {
      this.showTaxOffice = true;
    }

    if (userRole == "2") {
      this.showApproveReassessment = true;
      this.managerRole = true;
      // this.showGenerateAppeal = true;
    }

    if (userRole == "3") {
      this.editorRole = true;
      this.showGenerateAppeal = true;
    }
  }

  initialiseForms() {
    this.reassessmentForm = this.formBuilder.group({
      dateGenerated: [""],
      status: [""],
      comment: [""],
      approvalStatus: [""],
    });

    this.appealForm = this.formBuilder.group({
      message: ["", [Validators.required]],
      messageTitle: ["", [Validators.required]],
      invoiceNumber: [""],
      date: [""],
      myfile: ["", Validators.required],
    });

    this.approveReassessmentForm = this.formBuilder.group({
      comment: [""],
    });

    this.corporateForm = this.formBuilder.group({
      companyName: [""],
      companyTIN: [""],
      taxPayerID: [""],
    });

    this.searchForm = this.formBuilder.group({
      taxYear: [""],
      companyName: [""],
      paymentStatusId: [""],
    });
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
  }

  getReassessments(perpage, pageno) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "reassessments/list?page=" + pageno;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;

    this.httpClient
      .post<any>(this.apiUrl, this.searchObject, { headers: reqHeader })
      .subscribe((data) => {
        console.log("reassessmentsData: ", data);
        this.reassessmentsData =
          data.response?.data == null ? [] : data.response?.data;
        this.config.totalItems = data.response.total;
        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.reassessmentsData = "";
    this.router.navigate(["/reassessments"], {
      queryParams: { page: newPage },
    });
    this.getReassessments(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.reassessmentsData = "";
    this.router.navigate(["/reassessments"]);
    this.getReassessments(this.config.itemsPerPage, 1);
  }

  viewReassessment(modal, selectedReassessment) {
    console.log("selectedReassessment: ", selectedReassessment);
    this.selectedCorporateId = selectedReassessment.corporate_id;
    this.selectedBusinessId = selectedReassessment.business_primary_id;
    this.reassessmentId = selectedReassessment.id;
    this.reassessmentApprovalStatus = selectedReassessment.approved;
    this.isReassessmentApproved =
      selectedReassessment.approved == 0 ? false : true;

    this.showModal(modal);
    this.getSingleReassessment(this.reassessmentId);
  }

  loadSelectedAssessmentData(selectedReassessment) {
    // let reassessmentStatus =
    //   selectedReassessment.status == 0 ? "In Active" : "Active";

    let paymentStatus =
      selectedReassessment.payment_status === 0
        ? "Pending"
        : selectedReassessment.payment_status === 1
        ? "Paid"
        : "Objected";
    let approvalStatus =
      selectedReassessment.status == 0 ? "In Progress" : "Approved";

    this.reassessmentForm = this.formBuilder.group({
      dateGenerated: [
        this.datepipe.transform(selectedReassessment.created_at, "dd MMM yyyy"),
      ],
      status: [paymentStatus],
      // assessmentId: [selectedReassessment.annual_return_assessment_id],
      comment: [selectedReassessment.message],
      // corporateId: [selectedReassessment.corporate_id],
      approvalStatus: [approvalStatus],
    });

    this.isAppealed = selectedReassessment.payment_status === 0 ? false : true;
    this.reassessmentAppealsData = selectedReassessment.reassessment_appeals;
  }

  getSingleReassessment(reassessmentId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}reassessments/${reassessmentId}?corporate_id=${this.selectedCorporateId}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleReassessmentData: ", data);
        this.selectedReassessment = data.response;
        this.reassessmentItems = data.response.reassessed_items;
        this.loadSelectedAssessmentData(this.selectedReassessment);

        if (data.response.invoice == null) {
          this.processInvoiceBtn = true;
          this.previewInvoice = false;
          this.paymentUrl = false;
          this.isPaid = false;
          this.apiInvoiceUrl = null;
          this.apiPaymentUrl = null;
        } else if (data.response.invoice.payment_status == 0) {
          this.processInvoiceBtn = false;
          this.previewInvoice = true;
          this.paymentUrl = true;
          this.isPaid = false;
          this.isAppealed = false;
          this.invoiceNumber = data.response.invoice?.invoice_number;
          this.apiInvoiceUrl = data.response.invoice.invoice_preview_url;
          this.apiPaymentUrl = data.response.invoice.payment_url;
        } else if (data.response.payment_status == 1) {
          this.processInvoiceBtn = false;
          this.isAppealed = true;
          this.isPaid = true;
          this.previewInvoice = true;
          this.paymentUrl = false;
          this.apiInvoiceUrl = data.response.invoice.invoice_preview_url;
        }
        if (data.response.payment_status == 2) {
          this.isAppealed = true;
        }

        // this.getReassessments(
        //   this.config.itemsPerPage,
        //   this.config.currentPage
        // );

        this.appealForm = this.formBuilder.group({
          message: ["", [Validators.required]],
          messageTitle: ["", [Validators.required]],
          invoiceNumber: [this.invoiceNumber],
          date: [this.datepipe.transform(this.today, "dd MMM yyyy")],
          myfile: ["", Validators.required],
        });

        console.log("apiPaymentUrl: ", this.apiPaymentUrl);
        console.log("apiInvoiceUrl: ", this.apiInvoiceUrl);
        console.log("isPaid: ", this.isPaid);
        this.spinnerService.hide();
      });
  }

  processInvoice() {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "invoices";

    const obj = {
      corporate_id: this.selectedCorporateId,
      reassessment_id: this.reassessmentId,
      business_id: this.selectedBusinessId,
    };

    console.log("invoiceObj: ", obj);

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("invoice: ", data);

        if (data.status == true) {
          this.processInvoiceBtn = false;
          this.previewInvoice = true;
          this.paymentUrl = true;
          this.apiInvoiceUrl = data.response.invoice?.invoice_preview_url;
          this.apiPaymentUrl = data.response.invoice?.payment_url;
          console.log("apiPaymentUrl: ", this.apiPaymentUrl);
          console.log("isPaid: ", this.isPaid);
          // this.apiPaymentUrl = data.response.invoice.payment_url;
          this.spinnerService.hide();
          Swal.fire({
            icon: "success",
            title: "Success",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });
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

  generateAppeal(modal) {
    this.submitted = false;
    this.showModal(modal);
  }

  uploadAppealFile(modal) {
    // this.showModal(modal);
    this.uploadAppealFileModalRef = this.modalService.open(
      modal,
      this.modalOptions
    );
    this.manageModal(this.uploadAppealFileModalRef);
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

  approveReassessment(modal) {
    this.showModal(modal);
  }


  onSubmitAppeal(formAllData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.appealForm.invalid) {
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
            reassessment_id: this.reassessmentId,
            corporate_id: this.selectedCorporateId,
            business_id: this.selectedBusinessId,
            comment: formAllData.message,
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
  }

  postGenerateAppeal(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "reassessment-appeals";

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
          // this.appealForm.reset();
          // Object.keys(this.appealForm.controls).forEach((key) => {
          //   this.appealForm.get(key).setErrors(null);
          // });

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

          this.getReassessments(
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

  onSubmitReassessment(formAllData) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.appealForm.invalid) {
      return;
    }

    const obj = {
      message: formAllData.comment,
      reassessment_id: this.reassessmentId,
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
    };

    console.log("approveReassessmentData: ", obj);
    this.postApproveReassessment(obj);
  }

  postApproveReassessment(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}reassessments-approve`;

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

          this.getReassessments(
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
    // formData.append('employees', this.myForm.get('fileSource').value);
    formData.append("file", this.myForm.get("myfile").value);
    formData.append('business_id', this.selectedBusinessId);
    // formData.append('corporate_id', this.selectedCorporateId);
    this.apiUrl = `${environment.AUTHAPIURL}file/upload`;
    this.spinnerService.show();

    this.httpClient
      .post<any>(this.apiUrl, formData, config)
      .subscribe((res) => {
        console.log("uploadApiResponse: ", res);

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

          this.files = null;
          this.filePath = null;
          this.uploadedFileUrl = res.response.url;

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

            // this.getEmployees();
            this.uploadAppealFileModalRef.close();
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

          this.files = null;
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

  reload() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigate(["./"], { relativeTo: this.route });
  }

  onFileChange(event) {
    // if (event.target.files.length > 0) {
    //   const file = event.target.files[0];
    //   this.file = event.target.files[0];
    //   this.filePath = event.target.files[0].name;
    //   this.appealForm.get("myfile").setValue(file);
    // }
    for (var i = 0; i < event.target.files.length; i++) {
      this.filePath.push(event.target.files[i].name);

      const fileObj = {
        filename: event.target.files[i].name,
        file: event.target.files[i],
      };
      this.files.push(fileObj);
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

  onSubmitSearch(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.searchForm.invalid) {
      return;
    }

    this.searchObject = {
      tax_year: formAllData.taxYear,
      payment_status: formAllData.paymentStatusId,
      company_name: formAllData.companyName,
    };

    console.log("searchFormData: ", this.searchObject);
    this.getReassessments(this.config.itemsPerPage, this.config.currentPage);
  }

  clearSearch() {
    this.reassessmentsData = "";
    this.searchObject = {};
    this.initialiseForms();
    this.getReassessments(this.config.itemsPerPage, this.config.currentPage);
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
