import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../../session.service";
import { environment } from "../../../environments/environment";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import * as $ from "jquery";
import Swal from "sweetalert2";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-adminusers",
  templateUrl: "./adminusers.component.html",
  styleUrls: ["./adminusers.component.css"],
})
export class AdminusersComponent implements OnInit {
  apiUrl: string;
  apidata: any;
  dtOptions: any = {};
  roleID: number;
  managerRole: boolean = false;
  userID: any;
  corporateId: any;
  usersData: any;
  applicationId: number;
  taxPayerId: string;
  taxOfficeId: string;
  roleId: string;
  email: string;
  phone: string;
  userEmail: string;
  superAdminRole: boolean = false;
  title = "Paye - Admin-Users";

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private sess: SessionService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.sess.checkLogin();
    this.titleService.setTitle(this.title);

    this.roleID = parseInt(localStorage.getItem("admin_role_id"));
    this.userEmail = localStorage.getItem("admin_email");
    this.corporateId = localStorage.getItem("admin_corporate_id");

    if (this.roleID === 1) {
      this.superAdminRole = true;
    }

    if (this.roleID === 2) {
      this.managerRole = true;
    }

    this.getUsers();
    this.intialiseTableProperties();
  }

  intialiseTableProperties() {
    this.dtOptions = {
      paging: true,
      scrollX: true,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
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
        {
          extend: "csv",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-csv"> CSV</i>',
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6] },
        },
        {
          extend: "excel",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-excel"> Excel</i>',
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6] },
        },
        {
          extend: "pdf",
          className: "btn btn-outline-dark",
          text: '<i class="fas fa-file-pdf"> PDF</i>',
          orientation: "landscape",
          pageSize: "LEGAL",
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6] },
        },
      ],
    };
  }

  getUsers() {
    this.apiUrl = environment.AUTHAPIURL + "users-list";
    this.applicationId = environment.APPLICATION_ID;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      application_id: this.applicationId,
    };

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("usersData", data);

        // if (this.roleID == 1) {
        //   this.usersData = data.response.data.filter(x => x.);
        // }
        // else {
        this.usersData = data.response.data;
        // }

        this.spinnerService.hide();
      });
  }

  getUserRole(roleId): string {
    var roleName =
      roleId == 1
        ? "Revenue Super Admin"
        : roleId == 2
        ? "Head Of Station"
        : roleId == 3
        ? "Tax Officer"
        : roleId == 4
        ? "Revenue Viewer"
        : roleId == 5
        ? "Corporate Manager"
        : roleId == 6
        ? "Corporate Editor"
        : "Corporate Viewer";
    return roleName;
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
        this.getUsers();
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

    if (this.roleID == 1) {
      this.apiUrl = `${environment.AUTHAPIURL}users/delete/${id}`;
    } else {
      this.apiUrl = `${environment.AUTHAPIURL}users/${id}`;
    }

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
          .subscribe((data) => {
            console.log(data);

            if (data.status == true) {
              Swal.fire({
                icon: "success",
                title: "User Successfully Deleted",
                showConfirmButton: false,
                timer: 1500,
              });
              this.getUsers();
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
}
