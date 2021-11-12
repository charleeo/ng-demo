import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../../session.service";
import { environment } from "../../../environments/environment";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import * as $ from "jquery";
import Swal from "sweetalert2";
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-displayuser",
  templateUrl: "./displayuser.component.html",
  styleUrls: ["./displayuser.component.css"],
})
export class DisplayuserComponent implements OnInit {
  apiUrl: string;
  apidata: any;
  dtOptions: any = {};
  roleID: any;
  managerRole: boolean = false;
  userID: any;
  corporateId: any;
  selectedCorporateId: any;
  modalOptions: NgbModalOptions;
  closeResult: string;
  selectedCorporate: any;
  corporateUsersData: any;
  corporateForm: FormGroup;
  submitted: boolean = false;
  corporatesData: any;
  usersData: any;
  showTaxOffice: boolean;
  title = "Paye - Users";

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
    private sess: SessionService,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {
    this.userID = this.route.snapshot.params.id;
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.checkLogin();
    this.initialiseForms();
    this.intialiseTableProperties();
    this.getUsers();

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

    this.corporateId = localStorage.getItem("admin_corporate_id");
    this.getCorporates();
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

  intialiseTableProperties() {
    this.modalOptions = {
      backdrop: true,
      centered: true,
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
      // dom: "<'row'<'col-sm-3'l><'col-sm-6 text-center'B><'col-sm-3'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
        // { extend: 'copy',  className: 'btn btn-outline-dark', text: '<i class="far fa-copy"> Copy</i>' },
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
        // tslint:disable-next-line: max-line-length
        {
          extend: "pdf",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-pdf"> PDF</i>',
          orientation: "landscape",
          pageSize: "LEGAL",
        },
        // { extend: 'print', className: 'btn btn-outline-dark', text: '<i class="far fas fa-print"> Print</i>' }
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
    // this.assessmentYear = this.getTaxYear(selectedAssessment.due_date);
    // this.assessmentMonth = this.getTaxMonth(selectedAssessment.due_date);
    this.selectedCorporateId = selectedCorporate.id;
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
        this.corporateUsersData = this.getCorporateUsers(corporateId);
        // this.corporateUsersData = data.response.assessment_records;

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

    // this.corporateLogo = selectedAssessment.corporate.corporate_logo;
  }

  getUserRole(roleId): string {
    var roleName =
      roleId == 1
        ? "Revenue Super Admin"
        : roleId == 2
        ? "Head of Station"
        : roleId == 3
        ? "Tax Officer "
        : roleId == 4
        ? "Revenue Viewer"
        : roleId == 5
        ? "Corporate Manager"
        : roleId == 6
        ? "Corporate Editor"
        : "Corporate Viewer";
    return roleName;
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

  getCorporateUsers(corporateId) {
    var corporateUsersData = this.usersData.filter(
      (u) => u.corporate_id == corporateId
    );
    return corporateUsersData;
  }

  getUsers() {
    this.apiUrl = environment.AUTHAPIURL + "users-list";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {};

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("corporateUsersData", data);
        this.usersData = data.response.data;
        this.spinnerService.hide();
      });
  }

  changeStatus(user_Id: any, status: number) {
    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    // alert(id);
    let newstatus = "";
    if (status === 1) {
      newstatus = "0";
    } else {
      newstatus = "1";
    }

    const obj = {
      id: user_Id,
      active: newstatus,
    };

    this.apiUrl = environment.AUTHAPIURL + "users/update";
    this.spinnerService.show(); // show the spinner
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log(data);
        this.apidata = data.response;
        //this.getUserData();
        this.spinnerService.hide(); // hide the spinner if success
      });
  }

  deleteUser(id: number) {
    const obj = {
      user_id: this.userID,
    };

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.apiUrl = environment.AUTHAPIURL + "users/" + id;

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
          .delete<any>(this.apiUrl, { headers: reqHeader })
          .subscribe(() => {
            console.log();
            // Swal.fire('Oops...', 'Something went wrong!', 'error');
            Swal.fire({
              icon: "success",
              title: "User Successfully Deleted",
              showConfirmButton: false,
              timer: 1500,
            });
            this.router.navigate(["/displayuser"]);
            //this.getUserData();
          });
      }
    });
  }
}
