import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit {
  editForm: FormGroup;
  submitted = false;
  apiUrl: any;
  userId: any;
  roles: any;
  myroles: any;
  userRecord: any;
  roleID: any;
  applications: any;
  myapplications: any;
  rolesData: any;
  applicationId: number;
  applicationRolesData: any;
  taxTaxOffices: any;
  showTaxOffice: boolean = false;
  title = 'Paye - Edit user'

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private sess: SessionService,
    private flashMessage: FlashMessagesService,
    private spinnerService: Ng4LoadingSpinnerService
    ) {
      this.userId = this.route.snapshot.params.id;
    }

    ngOnInit(): void {
    this.titleService.setTitle(this.title)
    // Check User Login
    this.sess.checkLogin();
    this.roleID = localStorage.getItem('admin_role_id');

    // if (this.roleID != 5) {
    //   this.router.navigate(['/dashboard']);
    // }

    this.getUserById();
    this.getApplicationRoles();
    this.getTaxOffices();

    this.editForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z.+'-]+(?:\s[a-zA-Z.+'-]+)*\s?$/), Validators.maxLength(45)]],
      phone: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
      role: ['', [Validators.required]],
      taxOfficeId: ['', Validators.required],
    });

    if (this.roleID == 1) {
      this.showTaxOffice = true;
    }
    else {
      this.editForm.get('taxOfficeId').clearValidators();
      this.editForm.get('taxOfficeId').updateValueAndValidity();
    }
  }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + 'tax-offices';

    this.httpClient.get<any>(this.apiUrl).subscribe(data => {
      console.log('taxTaxOffices: ', data);
      this.taxTaxOffices = data.response;
    });
  }

  getRoles() {
    this.apiUrl = environment.AUTHAPIURL + 'roles';

    this.httpClient.get<any>(this.apiUrl).subscribe(res => {
      console.log("rolesApiData: ", res.response);
      this.rolesData = res.response;
    });
  }

  getApplicationRoles() {
    var superAdminId = 1;
    var revenueManagerId = 2;
    this.applicationId = environment.APPLICATION_ID;
    this.apiUrl = environment.AUTHAPIURL + 'applications/' + this.applicationId + '/roles';

    this.httpClient.get<any>(this.apiUrl).subscribe(res => {
      console.log("applicationRolesApiData: ", res.response);
      //this.applicationRolesData = res.response.filter(r => r.id != superAdminId);
      if (this.roleID == superAdminId) {
        this.applicationRolesData = res.response.filter(r => r.id == revenueManagerId);
        // console.log("Super Admin");
      }
      else {
        this.applicationRolesData = res.response.filter(r => r.id != superAdminId && r.id != revenueManagerId);
        // console.log("Manager");
      }
    });
  }

  onSubmit(formAllData: any) {
    this.submitted = true;
    // stop the process here if form is invalid
    if (this.editForm.invalid) {
      return;
    }
    console.log(formAllData);

    const obj = {
      id: this.userId,
      name: formAllData.name,
      role_id: formAllData.role,
      phone: formAllData.phone,
      tax_office_id: formAllData.taxOfficeId
    };
    this.postData(obj);
  }

  postData(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + 'users/update';

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log(data);

        // this.router.navigate(['/display']);
        if (data.status == true) {
          // Rest form fithout errors
          Object.keys(this.editForm.controls).forEach((key) => {
            this.editForm.get(key).setErrors(null);
          });
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: "User updated successfully",
            // text:  data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
          this.spinnerService.hide();
          this.router.navigate(['/adminusers']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text:  data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
  }

  getUserById() {
    this.apiUrl = environment.AUTHAPIURL + 'users/' + this.userId;

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    this.spinnerService.show();
    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
        console.log(data);
        this.userRecord = data.response;
        this.spinnerService.hide();
      });

  }
}
