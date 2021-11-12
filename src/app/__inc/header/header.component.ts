import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  roleID: any;
  apiUrl: any;
  apidata: any;
  userID: any;
  roleName: any;
  corporateLogo: any;
  userProfilePicture: any;

  constructor(
    private httpClient: HttpClient,
    private sess: SessionService,
    private route: ActivatedRoute,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    this.userID = localStorage.getItem("admin_id");
  }

  public ngOnInit(): void {
    this.sess.checkLogin();
    this.roleID = localStorage.getItem("admin_role_id");

    this.getUserData();

    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // if (this.roleID === "5"){
    //   this.roleName = "Manager"
    // } else if (this.roleID === "6"){
    //   this.roleName = "Editor"
    // } else if (this.roleID === "7"){
    //   this.roleName = "Viewer"
    // }
  }

  getUserRole(roleId): string {
    var roleName =
      roleId == 1
        ? "Revenue Super Admin"
        : roleId == 2
        ? "Head of Station"
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

  getUserData() {
    this.apiUrl = environment.AUTHAPIURL + "users/" + this.userID;
    console.log("this.userID: ", this.userID);

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    let corporateId = localStorage.getItem("admin_corporate_id");

    const objData = {
      corporate_id: [corporateId],
    };

    this.spinnerService.show();
    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        this.apidata = data.response;
        this.userProfilePicture = data.response.profile_image;
        console.log("userApiData: ", this.apidata);
        this.spinnerService.hide();
      });
  }
}
