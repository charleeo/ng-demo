import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import { FlashMessagesService } from 'angular2-flash-messages';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verifyotp',
  templateUrl: './verifyotp.component.html',
  styleUrls: ['./verifyotp.component.css']
})
export class VerifyotpComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  iserror: any = false;
  errormsg: any;
  apiUrl: any;

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router,  private sess: SessionService, private flashMessage: FlashMessagesService) {}

  ngOnInit(): void {

    this.sess.islogin();

    this.loginForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.minLength(4),Validators.maxLength(4), Validators.pattern('^[0-9]*$'), ]]
    });
  }

  onSubmit(formAllData: any) {
    this.submitted = true;

    const response = grecaptcha.getResponse();
    if(response.length == 0) {
        document.getElementById('captchaError').innerHTML = 'Captcha field is required';
        return false;
    }

    if (this.loginForm.invalid) {
        return;
    }

    console.log(formAllData);

    const obj = {
      otp: formAllData.otp,
      username: localStorage.getItem('admin_otp_username'),
      application_id: environment.APPLICATION_ID
    };
    this.postData(obj);
  }

  postData(jsonData: any) {

    this.apiUrl = environment.AUTHAPIURL + 'authapi/auth/verifyOtp';
    this.http.post<any>(this.apiUrl, jsonData).subscribe(data => {
              console.log(data);
              this.iserror = data.status;
              this.errormsg = data.message;

              if (this.iserror == true) {
                  Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: data.response,
                        showConfirmButton: true,
                        timer: 5000
                      // tslint:disable-next-line: only-arrow-functions
                      }).then(function() {
                          // Redirect the userdashboard
                  });
                  this.router.navigate(['/resetpassword']);

              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: data.response,
                  showConfirmButton: true,
                  timer: 5000
                });
              }
    });
  }

resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
}



}
