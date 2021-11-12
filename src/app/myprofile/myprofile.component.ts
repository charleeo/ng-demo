import { HeaderComponent } from "../__inc/header/header.component";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../session.service";
import { environment } from "../../environments/environment";
import { FlashMessagesService } from "angular2-flash-messages";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import Swal from "sweetalert2";
import { Title } from "@angular/platform-browser";
// import { HeaderComponent } from 'src/app/__inc/header/header.component';

@Component({
  providers: [HeaderComponent],
  selector: "app-myprofile",
  templateUrl: "./myprofile.component.html",
  styleUrls: ["./myprofile.component.scss"],
})
export class MyprofileComponent implements OnInit {
  userProfileForm: FormGroup;
  submitted = false;
  apiUrl: any;
  userID: any;
  corporateID: any;
  apidata: any;
  roles: any;
  myroles: any;
  roleID: any;
  employeesCount: number;
  applications: any;
  myapplications: any;
  files: any;
  file: any;
  imageSrc: string;
  profileImage: string;
  rolesData: any;
  applicationId: number;
  applicationRolesData: any;
  filePath: any;
  title = "Paye - My Profile";
  taxTaxOffices: any;
  showTaxOffice: boolean = false;

  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private titleService: Title,
    private component: HeaderComponent,
    private route: ActivatedRoute,
    private flashMessage: FlashMessagesService,
    private httpClient: HttpClient,
    private sess: SessionService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    // Check User Login
    this.sess.checkLogin();
    this.roleID = localStorage.getItem("admin_role_id");
    this.userID = localStorage.getItem("admin_id");
    this.corporateID = localStorage.getItem("admin_corporate_id");
    this.initialiseForms();

    if (this.roleID == 2 || this.roleID == 3) {
      this.userProfileForm
        .get("taxOfficeId")
        .setValidators(Validators.required);
      this.userProfileForm.get("taxOfficeId").updateValueAndValidity();
      this.showTaxOffice = true;
    }

    //  if (this.roleID != 1) {
    //   this.router.navigate(['/logout']);
    //  }

    this.getTaxOffices();
    this.getApplicationRoles();
    this.getUserData();
  }

  initialiseForms() {
    this.userProfileForm = this.formBuilder.group({
      name: [
        "",
        [
          Validators.required,
          Validators.maxLength(45),
          Validators.pattern("[a-zA-Z ]*"),
        ],
      ],
      phone: [
        "",
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/),
        ],
      ],
      email: ["", [Validators.required, Validators.email]],
      role: ["", [Validators.required]],
      myfile: [""],
      taxOfficeId: [""],
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

  getRoles() {
    this.apiUrl = environment.AUTHAPIURL + "roles";

    this.httpClient.get<any>(this.apiUrl).subscribe((res) => {
      console.log("rolesApiData: ", res.response);
      this.rolesData = res.response;
    });
  }

  getApplicationRoles() {
    //var superAdminId = 1;
    this.applicationId = environment.APPLICATION_ID;
    this.apiUrl =
      environment.AUTHAPIURL + "applications/" + this.applicationId + "/roles";

    this.httpClient.get<any>(this.apiUrl).subscribe((res) => {
      console.log("applicationRolesApiData: ", res.response);
      this.applicationRolesData = res.response;
    });
  }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + "tax-offices";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("taxTaxOffices: ", data);
      this.taxTaxOffices = data.response;
    });
  }

  getUserData() {
    console.log("this.userID: ", this.userID);
    this.apiUrl = environment.AUTHAPIURL + "users/" + this.userID;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("userApiData", data);
        this.apidata = data.response;
        this.profileImage = data.response.profile_image;
        this.spinnerService.hide();
      });
  }

  onUpdate(formAllData: any) {
    this.submitted = true;
    // stop the process here if form is invalid
    if (this.userProfileForm.invalid) {
      return;
    }
    console.log(formAllData);
    if (formAllData.myfile === "") {
      const user = {
        name: formAllData.name,
        phone: formAllData.phone,
        id: this.userID,
      };

      this.postData(user);
    } else {
      this.apiUrl = environment.AUTHAPIURL + "file/upload";

      const formData = new FormData();
      formData.append("file", this.userProfileForm.get("myfile").value);

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
            Object.keys(this.userProfileForm.controls).forEach((key) => {
              this.userProfileForm.get(key).setErrors(null);
            });

            const user = {
              profile_image: data.response.url,
              name: formAllData.name,
              phone: formAllData.phone,
              id: this.userID,
            };
            this.imageSrc = user.profile_image;
            console.log("Image Url = " + this.imageSrc);
            this.postData(user);
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
  }

  postData(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + "users/update";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log(data);

        if (data.status === true) {
          Object.keys(this.userProfileForm.controls).forEach((key) => {
            this.userProfileForm.get(key).setErrors(null);
          });

          this.getUserData();
          this.component.ngOnInit();
          // this.router.navigate(['/myprofile/' + this.userID]);
          this.spinnerService.hide();
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Your profile is updated successfully",
            // text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
          this.component.ngOnInit();
          this.reload();
        } else {
          this.spinnerService.hide();

          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "An error occured while updating your profile",
            // text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.file = event.target.files[0];
      this.filePath = event.target.files[0].name;
      this.userProfileForm.get("myfile").setValue(file);
    }
  }

  reload() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigate(["/myprofile", this.userID], {
      relativeTo: this.route,
    });
  }
}
