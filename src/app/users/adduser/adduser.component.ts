import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css']
})
export class AdduserComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  apiUrl: any;
  rolesData: any = [];
  myroles: any;
  applications: any;
  applicationRolesData: any = [];
  roleID: any;
  applicationId: number;
  taxTaxOffices: any;
  showTaxOffice: boolean = false;
  title = 'Paye - Add user'


  constructor(private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private titleService: Title,
    private router: Router,
    private sess: SessionService,
    private flashMessage: FlashMessagesService,
    private spinnerService: Ng4LoadingSpinnerService) { }

    ngOnInit(): void {
    this.titleService.setTitle(this.title)
    // Check User Login
    this.sess.checkLogin();
    this.roleID = localStorage.getItem('admin_role_id');

    //  if (this.roleID != 5) {
    //   this.router.navigate(['/dashboard']);
    //  }

    //  this.roleID = localStorage.getItem('admin_role_id');

    //  if (this.roleID != 5) {
    //   this.router.navigate(['/logout']);
    //  }

    //this.getRoles();
    this.getApplicationRoles();
    this.getTaxOffices();

    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(45), Validators.pattern(/^[a-zA-Z.+'-]+(?:\s[a-zA-Z.+'-]+)*\s?$/)]],
      phone: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/)]],
      // phone: ['', [Validators.required, Validators.pattern(/^[0][1-9]\d{9}$|^[1-9]\d{9}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
      role: ['', [Validators.required]],
      taxOfficeId: ['', Validators.required],
    });

    if (this.roleID == 1) {
      this.showTaxOffice = true;
    }
    else {
      this.registerForm.get('taxOfficeId').clearValidators();
      this.registerForm.get('taxOfficeId').updateValueAndValidity();
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
      // console.log("this.roleID: ", this.roleID);
      // console.log("superAdminId: ", superAdminId);

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
    if (this.registerForm.invalid) {
      return;
    }

    console.log(formAllData);

    const obj = {
      name: formAllData.name,
      email: formAllData.email,
      phone: formAllData.phone,
      role_id: formAllData.role,
      taxpayer_type_id: localStorage.getItem('admin_taxpayer_type_id'),
      tax_office_id: formAllData.taxOfficeId
    };

    this.postData(obj);
  }

  postData(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + 'users';

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
    });

    this.spinnerService.show();

    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe(data => {
      console.log("userApiData: ", data);
      // Rest form fithout errors

      // this.router.navigate(['/display']);
      if (data.status === true) {
        this.registerForm.reset();
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key).setErrors(null);
      });

        this.spinnerService.hide();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'User created successfully',
          // text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
          showConfirmButton: true,
          timer: 5000
        });
        this.router.navigate(['/adminusers'])

      } else {
        this.spinnerService.hide();
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
          showConfirmButton: true,
          timer: 5000
        });
      }
    });
  }

}
