import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-annualreturns",
  templateUrl: "./annualreturns.component.html",
  styleUrls: ["./annualreturns.component.css"],
})
export class AnnualreturnsComponent implements OnInit {
  modalOptions: NgbModalOptions;
  closeResult: string;
  dtOptions: any = {};
  dtOptionsPopUp: any = {};
  annualReturnForm: FormGroup;
  forwardScheduleForm: FormGroup;
  submitted: boolean;
  apiUrl: string;
  annualReturnsData: any;
  showCreateSchedule: boolean = false;
  months: { monthId: string; monthName: string }[] = [];
  industrySectors: any;
  taxTaxOffices: any;
  selectedBusiness: any;
  selectedCorporateId: any;
  businessesData: any;
  corporateForm: FormGroup;
  showTaxOffice: boolean;
  title = "Paye - Annual Returns";
  selectedScheduleRecordId: any;
  editEmployeeModalRef: any;
  config: any;
  currentPageLength: any = 10;
  viewerRole: boolean;
  selectedBusinessId: any;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private sess: SessionService,
    private modalService: NgbModal,
    private titleService: Title,
    private route: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.initialiseForms();
    this.intialiseTableProperties();
    //this.getCorporates();

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

    this.getTaxOffices();
    this.getIndustrySectors();
    var userRole = localStorage.getItem("admin_role_id");

    if (userRole == "1") {
      this.showTaxOffice = true;
    }

    if (userRole == "3") {
      this.showCreateSchedule = true;
    }

    if (userRole == "4") {
      this.viewerRole = true;
    }

    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      // size: 'lg'
      size: "xl",
    };
  }

  initialiseForms() {
    this.annualReturnForm = this.formBuilder.group({
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
      // scheduleMonthId: ['', Validators.required],
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

  getBusinesses(perpage, pageno) {
    this.apiUrl = `${environment.AUTHAPIURL}corporates/businesses?annual_return=${1}&page=${pageno}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = { per_page: perpage, page_no: pageno };

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
        console.log("corporatesApiData", data);
        this.businessesData = data.response.data;
        this.config.totalItems = data.response.total;
        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.businessesData = "";
    this.router.navigate(["/annualreturns"], {
      queryParams: { page: newPage },
    });
    this.getBusinesses(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.businessesData = "";
    this.router.navigate(["/annualreturns"]);
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
    this.getAnnualReturns();
  }

  getSingleBusiness(businessId) {
    this.spinnerService.show();
    this.apiUrl = `${environment.AUTHAPIURL}businesses/${businessId}`;

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

  getMonthName(monthId: string): string {
    this.sess.getAllMonths();
    var monthName = this.sess.getMonthName(monthId);
    return monthName;
  }

  onSubmitAnnualReturn(formAllData: any) {
    this.submitted = true;

    if (this.annualReturnForm.invalid) {
      return;
    }

    const obj = {
      annual_return_upload_taxpayer_id: formAllData.taxPayerID,
      corporate_id: this.selectedCorporateId,
      monthly_income: formAllData.monthlyIncome,
      annual_gross_income: formAllData.annualGrossIncome,
      annual_tax_paid: formAllData.annualTaxPaid,
      months: formAllData.months,
      // schedule_record_id: this.selectedScheduleRecordId,

      first_name: formAllData.firstName,
      middle_name: formAllData.middleName,
      surname: formAllData.surname,
      nationality: formAllData.nationality,
      designation: formAllData.designation,

      business_id: this.selectedBusinessId,
    };

    console.log("annualReturnFormData: ", obj);
    this.postUpdateAnnualReturn(obj);
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

          this.getAnnualReturns();
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

  onSubmitSchedule(formAllData: any) {
    this.submitted = true;

    // stop the process here if form is invalid
    if (this.forwardScheduleForm.invalid) {
      return;
    }

    const obj = {
      // comment: formAllData.comment,
      due_date: formAllData.scheduleYear,
      businesses: [ { business_id: this.selectedBusinessId, corporate_id: this.selectedCorporateId } ]
      // corporate_ids: [this.selectedCorporateId],
      // business_ids: [this.selectedBusinessId],
    };

    console.log("scheduleFormData: ", obj);
    this.postForwardSchedule(obj);
  }

  uploadAnnualReturn(modal) {
    this.showModal(modal);
  }

  getAnnualReturns() {
    this.annualReturnsData = '';
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "annual-return-uploads";

    const objData = {
      corporate_id: this.selectedCorporateId,
      business_id: this.selectedBusinessId,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, objData, { headers: reqHeader })
      .subscribe((data) => {
        console.log("annualReturnsData: ", data);
        this.annualReturnsData = data.response == null ? [] : data.response;
        this.spinnerService.hide();
      });
  }

  editAnnualReturn(modal, selectedAnnualReturn) {
    console.log("selectedAnnualReturn: ", selectedAnnualReturn);
    this.selectedScheduleRecordId = selectedAnnualReturn.id;
    // this.showModal(modal);

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
    });

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
          // Rest form fithout errors
          // this.forwardScheduleForm.reset();
          // Object.keys(this.forwardScheduleForm.controls).forEach(key => {
          //   this.forwardScheduleForm.get(key).setErrors(null);
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

          this.spinnerService.hide();
          this.modalService.dismissAll();
          this.getAnnualReturns();
          this.forwardScheduleForm.reset();
          this.submitted = false;
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

              this.getAnnualReturns();
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
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }
}
