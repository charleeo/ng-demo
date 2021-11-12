import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { Title } from "@angular/platform-browser";
import Swal from "sweetalert2";

@Component({
  selector: "app-deletedemployees",
  templateUrl: "./deletedemployees.component.html",
  styleUrls: ["./deletedemployees.component.scss"],
})
export class DeletedemployeesComponent implements OnInit {
  apiUrl: string;
  apidata: any;
  dtOptions: any = {};
  roleID: any;
  managerRole: boolean = false;
  userID: any;
  corporateId: any;
  selectedCorporateId: any;
  corporatesData: any;
  selectedCorporate: any;
  corporateUsersData: any;
  corporateForm: FormGroup;
  corporateEmployeesData: any;
  employeesData: any;
  modalOptions: NgbModalOptions;
  closeResult: string;
  submitted: boolean = false;
  selectedCorporateName: any;
  showTaxOffice: boolean;
  title = "Paye - Deleted Employees";
  isEditor: boolean;

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
    private sess: SessionService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    this.userID = this.route.snapshot.params.id;
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.initialiseForms();
    this.initialiseTableProperties();
    this.roleID = localStorage.getItem("admin_role_id");

    // if (this.roleID != 1) {
    //   this.router.navigate(['/logout']);
    //  }

    if (this.roleID == "1") {
      this.showTaxOffice = true;
    }

    if (this.roleID === "2") {
      this.managerRole = true;
    }
    if (this.roleID === "3") {
      this.isEditor = true;
    }

    this.corporateId = localStorage.getItem("admin_corporate_id");
    this.getCorporates();
    //this.getDeletedEmployees();
  }

  initialiseForms() {
    this.corporateForm = this.formBuilder.group({
      companyName: [""],
      contactAddress: [""],
      taxPayerID: [""],
      email: [""],
      phoneNumber: [""],
      dateCreated: [""],
    });
  }

  initialiseTableProperties() {
    this.modalOptions = {
      backdrop: "static",
      backdropClass: "customBackdrop",
      size: "xl",
    };

    this.dtOptions = {
      paging: true,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
        {
          extend: "csv",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-csv"> CSV</i>',
        },
        {
          extend: "excel",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-excel"> Excel</i>',
        },
        {
          extend: "pdf",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-pdf"> PDF</i>',
          orientation: "landscape",
          pageSize: "LEGAL",
        },
      ],
    };
  }

  getCorporates() {
    this.apiUrl = environment.AUTHAPIURL + "corporates-list";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {};

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("corporatesApiData", data);
        this.corporatesData = data.response.data;
        this.spinnerService.hide();
      });
  }

  viewCorporate(modal, selectedCorporate) {
    console.log("selectedCorporate: ", selectedCorporate);
    this.selectedCorporateId = selectedCorporate.id;
    this.selectedCorporateName = selectedCorporate.company_name;
    this.showModal(modal);

    this.getSingleCorporate(selectedCorporate.id);
  }

  getSingleCorporate(corporateId) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "corporates/" + corporateId;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleCorporateData: ", data);
        this.selectedCorporate = data.response;
        this.getDeletedEmployees(corporateId);
        // this.corporateEmployeesData = this.getCorporatEmployees(corporateId);
        this.loadSelectedCorporateData(this.selectedCorporate);
        this.spinnerService.hide();
      });
  }

  loadSelectedCorporateData(selectedCorporate) {
    this.corporateForm = this.formBuilder.group({
      companyName: [selectedCorporate.company_name],
      contactAddress: [selectedCorporate.contact_address],
      taxPayerID: [selectedCorporate.taxpayer_id],
      email: [selectedCorporate.email],
      phoneNumber: [selectedCorporate.phone],
      dateCreated: [selectedCorporate.created_at],
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

  getDeletedEmployees(corporateId) {
    this.apiUrl = environment.AUTHAPIURL + "employees-deleted";

    const obj = {
      corporate_id: corporateId,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("deletedEmployeesApiData", data);
        this.corporateEmployeesData = data.response;
        this.spinnerService.hide();
      });
  }

  restoreEmployee(id: number) {
    // let corporateId = localStorage.getItem("corporate_id");

    const obj = {
      corporate_id: this.selectedCorporateId,
      id: id,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("access_token"),
    });

    this.apiUrl = environment.AUTHAPIURL + "employees/restore";

    Swal.fire({
      title: "Are you sure?",
      text:
        "This action will restore this deleted employee back to the corporate",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, restore it!",
    }).then((result) => {
      if (result.value) {
        this.spinnerService.show();
        this.httpClient
          .post<any>(this.apiUrl, obj, { headers: reqHeader })
          .subscribe((data) => {
            if (data.status == true) {
              this.spinnerService.hide();
              Swal.fire({
                icon: "success",
                title: "Restored",
                text: "Employee was restored successfully",
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
              });
              this.getDeletedEmployees(this.selectedCorporateId);
              this.spinnerService.hide();
            } else {
              this.spinnerService.hide();
              Swal.fire({
                icon: "error",
                title: "An error occurred",
                text: data.message,
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
              });
              // this.router.navigate(["/deletedemployees"]);
            }
          });
      }
    });
  }
}
