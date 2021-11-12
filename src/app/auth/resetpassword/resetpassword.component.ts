import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import { FlashMessagesService } from 'angular2-flash-messages';
import Swal from 'sweetalert2';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  submitted = false;
  iserror: any = false;
  errormsg: any;
  apiUrl: any;
  username: any =  localStorage.getItem('admin_username');
  fieldTextType1: boolean;
  fieldTextType2: boolean;
  fieldTextType3: boolean;
  title = 'Paye - Resetpassword'


  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder,
    private titleService: Title,
    private http: HttpClient, private router: Router, private sess: SessionService, private flashMessage: FlashMessagesService, private spinnerService: Ng4LoadingSpinnerService) { }

    ngOnInit(): void {
      this.sess.islogin();
      this.titleService.setTitle(this.title)

    this.resetPasswordForm = this.formBuilder.group({
      emailAddress: ['', [Validators.required]],
      defaultPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]]
    });
  }

  toggleFieldTextType1() {
    this.fieldTextType1 = !this.fieldTextType1;
  }

  toggleFieldTextType2() {
    this.fieldTextType2 = !this.fieldTextType2;
  }

  toggleFieldTextType3() {
    this.fieldTextType3 = !this.fieldTextType3;
  }


  onSubmitResetPassword(formAllData: any) {
    this.submitted = true;
    /*const response = grecaptcha.getResponse();

    if (response.length == 0) {
      document.getElementById('captchaError').innerHTML = 'Captcha field is required';
      return false;
    }*/

    if (this.resetPasswordForm.invalid) {
      return;
    }

    const obj = {
      email: formAllData.emailAddress,
      default_password: formAllData.defaultPassword,
      password: formAllData.newPassword,
      password_confirmation: formAllData.confirmPassword,
    };

    console.log("resetPasswordData: ", formAllData);
    this.resetDefaultPassword(obj);
  }

  resetDefaultPassword(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + 'auth/signup/password/reset';
    this.spinnerService.show();
    this.http.post<any>(this.apiUrl, jsonData).subscribe(data => {
      console.log("resetPasswordApiResponse: ", data);

      if (data.status == true) {
        this.spinnerService.hide();

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

        this.router.navigate(['/dashboard']);
      }
      else {
        this.spinnerService.hide();

        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.message,
          showConfirmButton: true,
          timer: 5000
        });
      }
    });
  }

  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }

  ngOnDestroy() {
    localStorage.removeItem('admin_username');
  }


}
