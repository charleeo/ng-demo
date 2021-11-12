import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import { FlashMessagesService } from 'angular2-flash-messages';
import Swal from 'sweetalert2';
import { Md5 } from 'ts-md5/dist/md5';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  otpForm: FormGroup;
  submitted = false;
  iserror: any = false;
  errormsg: any;
  apiUrl: any;
  md5: any;
  appKey: any;
  taxPayerTypes: any;
  showLoginForm: boolean = true;
  showOtpForm: boolean = false;
  requestObj: any;
  status: any;
  emailAddress: any;
  password: any;
  fieldTextType: boolean;
  fieldTextType2: boolean;
  applicationId: number;
  title = 'Paye - Login'
  googleRecaptch: any;

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder,
    private http: HttpClient,
    private titleService: Title,
    private router: Router,
    private sess: SessionService,
    private flashMessage: FlashMessagesService,
    private spinnerService: Ng4LoadingSpinnerService) { }

    ngOnInit(): void {
    this.titleService.setTitle(this.title)
    this.sess.islogin();

    this.googleRecaptch = environment.GOOGLE_RECAPTCHA;

    this.getTaxPayers();
    localStorage.removeItem('admin_otp_username');

    this.loginForm = this.formBuilder.group({
      emailAddress: ['', [Validators.required, Validators.maxLength(45)]],
      password: ['', Validators.required],
      // taxTypeId: ['', Validators.required]
      // captcha: ['', Validators.required],
    });

    this.otpForm = this.formBuilder.group({
      enterOtp: ['', [Validators.required,  Validators.maxLength(4)]],
    });

  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldTextType2() {
    this.fieldTextType2 = !this.fieldTextType2;
  }

  taxTypeChanged(taxtypeId) {

  }

  getTaxPayers() {
    this.apiUrl = environment.AUTHAPIURL + 'taxpayer-types';
    this.spinnerService.show();

    this.http.get<any>(this.apiUrl).subscribe(data => {
      console.log("taxPayerTypes: ", data);
      this.taxPayerTypes = data.response;
      this.spinnerService.hide();
    });
  }

  onSubmit(formAllData: any) {
    this.submitted = true;
    // var response = grecaptcha.getResponse();
    // if (response.length == 0) {
    //   document.getElementById('captchaError').innerHTML = 'Captcha field is required';
    //   return false;
    // }

    if(this.googleRecaptch === true){
      var response = grecaptcha.getResponse();
      if (response.length == 0) {
        document.getElementById("captchaError").innerHTML = "Captcha field is required";
        return false;
      }
    }

    if (this.loginForm.invalid) {
      return;
    }

    this.emailAddress = formAllData.emailAddress;
    this.password = formAllData.password;
    this.applicationId = environment.APPLICATION_ID;

    let verifyRequestObj = {
      email: this.emailAddress,
      password: this.password,
      application_id: this.applicationId
    };

    this.requestObj = {
      email: formAllData.emailAddress,
      password: formAllData.password,
      // taxTypeId: formAllData.taxTypeId,
      // otp: ''
    };

    if (this.loginForm.valid) {
      this.submitted = false;
      this.apiUrl = environment.AUTHAPIURL + 'auth/credentials-verify';

      this.http.post<any>(this.apiUrl, verifyRequestObj).subscribe(data => {
        console.log("verifyRequestApi", data)

        if (data.status == true) {
          if (data.response.changed_default_password == 0) {
            this.router.navigate(['/resetpassword']);
          }
          else {
            this.requestNewOtp();
          }
        }
        else {
          this.showLoginForm = true;
          this.showOtpForm = false;

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: data.response != null ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000
        });
        }
      })
    }
    else {
      return;
    }

  }

  onOtpSubmit(otpFormData) {
    this.submitted = true;
    this.requestObj.otp = otpFormData.enterOtp;
    console.log("loginRequest: ", this.requestObj);

    if (this.otpForm.valid) {
      this.userLogin(this.requestObj);
    }
    else {
      return;
    }
  }

  requestNewOtp() {
    this.spinnerService.show();

    var otpObjData = {
      email: this.emailAddress,
      password: this.password
    }

    this.apiUrl = environment.AUTHAPIURL + 'otp/registered-send';

    this.http.post<any>(this.apiUrl, otpObjData).subscribe(data => {
      console.log("otpApiResponse: ", data);
      this.spinnerService.hide();

      if (data.status == true) {
        this.showLoginForm = false;
        this.showOtpForm = true;

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'The OTP has been sent to mail successfully!',
          showConfirmButton: true,
          timer: 5000
        });

      } else {
        this.showLoginForm = true;
        this.showOtpForm = false;

        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.message,
          // text: data.response != null ? data.response[0].message : data.message,
          showConfirmButton: true,
          timer: 5000
        });
      }

    });

  }

  backToLogin() {
    this.showLoginForm = true;
    this.showOtpForm = false;
  }

  userLogin(jsonData: any) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + 'auth/login';
    this.appKey = environment.APPLICATION_KEY;
    this.md5 = Md5.hashStr(this.appKey + JSON.stringify(jsonData) + this.appKey);

    const myheaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': this.md5
    });

    const options = { headers: myheaders };

    this.http.post<any>(this.apiUrl, jsonData, options).subscribe(data => {

      console.log("loginApiResponse: ", data);
      this.status = data.status;
      let defaultPwd = -1;

      if (data.response != null) {
        defaultPwd = data.response.changed_default_password;
      }

      if (defaultPwd == 0 ) {
        this.spinnerService.hide();
        localStorage.setItem('admin_username', data.response.email);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.message,
          showConfirmButton: true,
          timer: 5000,
          timerProgressBar: true
        });
        this.router.navigate(['/resetpassword']);


      }
      else {
        // this.spinnerService.hide();
        if (this.status == true) {
          // if (data.response.user.role_id == 5 || data.response.user.role_id == 6 || data.response.user.role_id == 7) {
          //   this.sess.logOut();
          // }

          localStorage.setItem('admin_email', data.response.user.email);
          localStorage.setItem('admin_id', data.response.user.id);
          localStorage.setItem('admin_access_token', data.response.access_token);

          localStorage.setItem('admin_role_id', data.response.user.role_id);
          localStorage.setItem('admin_phone', data.response.user.phone);
          localStorage.setItem('admin_email_verified_at', data.response.user.email_verified_at);
          localStorage.setItem('admin_taxpayer_type_id', data.response.user.taxpayer_type_id);
          localStorage.setItem('admin_tax_office_id', data.response.user.tax_office_id);
          localStorage.setItem('admin_active', data.response.user.active);
          localStorage.setItem('admin_changed_default_password', data.response.user.changed_default_password);
          localStorage.setItem('admin_corporate_id', data.response.user.corporate_id);
          localStorage.setItem('admin_created_at', data.response.user.created_at);
          localStorage.setItem('admin_updated_at', data.response.user.updated_at);

          this.spinnerService.hide();
          this.router.navigate(['/dashboard']);
        }
        else {
          this.spinnerService.hide();

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000
          });

        }

      }
    });
  }

  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }

}
