import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { SessionService } from "../../session.service";
import { environment } from "../../../environments/environment";
import { FlashMessagesService } from "angular2-flash-messages";
import Swal from "sweetalert2";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-forgotpassword",
  templateUrl: "./forgotpassword.component.html",
  styleUrls: ["./forgotpassword.component.css"],
})
export class ForgotpasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  requestOtpForm: FormGroup;
  submitted = false;
  iserror: any = false;
  errormsg: any;
  apiUrl: any;
  showForgotPasswordForm: boolean = false;
  showRequestOtpForm: boolean = true;
  emailAddress: any;
  fieldTextType: boolean;
  fieldTextType2: boolean;
  title = "Paye - Forgot Password";
  googleRecaptch: any;


  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private sess: SessionService,
    private titleService: Title,
    private flashMessage: FlashMessagesService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.sess.islogin();

    this.googleRecaptch = environment.GOOGLE_RECAPTCHA;

    this.requestOtpForm = this.formBuilder.group({
      emailAddress: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
        ],
      ],
    });

    this.forgotPasswordForm = this.formBuilder.group({
      newPassword: ["", [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]],
      confirmPassword: ["", [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]],
      requestOtp: ["", Validators.required],
    });
  }

  onSubmit(formAllData: any) {
    this.submitted = true;
    // const response = grecaptcha.getResponse();
    // if (response.length == 0) {
    //   document.getElementById("captchaError").innerHTML =
    //     "Captcha field is required";
    //   return false;
    // }

    if(this.googleRecaptch === true){
      var response = grecaptcha.getResponse();
      if (response.length == 0) {
        document.getElementById("captchaError").innerHTML = "Captcha field is required";
        return false;
      }
    }

    if (this.requestOtpForm.invalid) {
      return;
    }

    this.emailAddress = formAllData.emailAddress;

    const obj = {
      email: formAllData.emailAddress,
      //application_id: environment.APPLICATION_ID
    };

    console.log("forgotPasswordData: ", obj);
    this.requestNewOtp(obj);
  }

  requestNewOtp(otpObjData) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "otp/registered-send";

    this.http.post<any>(this.apiUrl, otpObjData).subscribe((data) => {
      console.log("otpApiResponse: ", data);
      this.spinnerService.hide();

      if (data.status == true) {
        this.submitted = false;
        this.showRequestOtpForm = false;
        this.showForgotPasswordForm = true;

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "The OTP has been sent to mail successfully!",
          showConfirmButton: true,
          timer: 5000,
        });
      } else {
        this.showRequestOtpForm = true;
        this.showForgotPasswordForm = false;

        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Invalid email address",
          showConfirmButton: true,
          timer: 5000,
        });
      }
    });
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldTextType2() {
    this.fieldTextType2 = !this.fieldTextType2;
  }

  onSubmitForgotPassword(formAllData) {
    this.submitted = true;
    if (this.requestOtpForm.invalid) {
      return;
    }

    const obj = {
      email: this.emailAddress,
      new_password: formAllData.newPassword,
      confirm_password: formAllData.confirmPassword,
      otp: formAllData.requestOtp,
    };

    console.log("forgotPasswordData: ", obj);
    this.postForgotPassword(obj);
  }

  postForgotPassword(otpObjData) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "users/forgot-password";

    this.http.post<any>(this.apiUrl, otpObjData).subscribe((data) => {
      console.log("forgotPasswordApiResponse: ", data);
      this.spinnerService.hide();

      if (data.status == true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Your password has been changed successfully!",
          showConfirmButton: true,
          timer: 5000,
        });

        this.router.navigate(["/login"]);
      } else {
        Swal.fire({
          icon: "error",
          title: data.message,
          text: data.response != null ? data.response[0].message : data.message,
          showConfirmButton: true,
          timer: 5000,
        });
      }
    });
  }

  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }
}
