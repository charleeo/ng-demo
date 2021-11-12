import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
// import { UserService } from 'services/user.service';
import { SessionService } from "../../session.service";
import { environment } from "../../../environments/environment";
import { FlashMessagesService } from "angular2-flash-messages";
import Swal from "sweetalert2";
import { Md5 } from "ts-md5/dist/md5";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
  showValidateCacForm: boolean = true;
  showRegisterForm: boolean = false;
  showOtpForm: boolean = false;
  apiUrl: string;
  taxPayerTypes: any;
  validateCacForm: FormGroup;
  registerForm: FormGroup;
  otpForm: FormGroup;
  submitted = false;
  industrySectors: any;
  taxTaxOffices: any;
  cacRegNumber: any;
  taxTypeId: any;
  taxTypeName: any;
  title = "Paye - Signup";

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private titleService: Title,
    private router: Router,
    private sess: SessionService,
    private flashMessage: FlashMessagesService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.sess.islogin();
    this.spinnerService.show();
    this.getTaxPayers();
    this.initialiseForms();
    this.getIndustrySectors();
    this.getTaxOffices();
    this.spinnerService.hide();
  }

  initialiseForms() {
    this.validateCacForm = this.formBuilder.group({
      // emailAddress: ['', [Validators.required, Validators.maxLength(45)]],
      cacRegNumber: [
        "",
        [
          Validators.required,
          Validators.maxLength(8),
          Validators.pattern("^[A-Za-z]{2}[0-9]{6}"),
        ],
      ],
      taxTypeId: ["", Validators.required],
    });

    this.otpForm = this.formBuilder.group({
      enterOtp: ["", Validators.required],
    });

    this.registerForm = this.formBuilder.group({
      emailAddress: [
        "",
        [Validators.required, Validators.maxLength(60), Validators.email],
      ],
      emailAddress2: ["", [Validators.maxLength(60), Validators.email]],
      companyName: [
        "",
        [
          Validators.required,
          Validators.pattern("^[A-Za-z 0-9 _-]*[A-Za-z0-9][A-Za-z0-9 _]*$"),
          Validators.maxLength(60),
        ],
      ],
      tin: ["", [Validators.required, Validators.maxLength(14)]],
      phone: [
        "",
        [
          Validators.required,
          Validators.maxLength(11),
          Validators.minLength(11),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      phone2: [
        "",
        [
          Validators.maxLength(11),
          Validators.minLength(11),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      taxOfficeId: ["", Validators.required],
      industrySectorId: ["", Validators.required],
      contactAddress: ["", Validators.required],
    });
  }

  taxTypeChanged(taxtypeId) {
    this.taxTypeName = this.taxPayerTypes.filter(
      (x) => x.id == taxtypeId
    )[0].name;
  }

  onvalidateCacSubmit(formData) {
    this.submitted = true;

    if (this.validateCacForm.invalid) {
      return;
    }

    this.spinnerService.show();
    this.cacRegNumber = formData.cacRegNumber;
    this.taxTypeId = formData.taxTypeId;

    var requestObj = {
      cac_number: formData.cacRegNumber,
      taxpayer_type_id: this.taxTypeId,
    };

    console.log("validateRequest: ", requestObj);
    this.apiUrl = environment.AUTHAPIURL + "auth/signup/step1";

    this.http.post<any>(this.apiUrl, requestObj).subscribe((data) => {
      console.log("validateApiResponse: ", data);
      this.spinnerService.hide();

      if (data.status == true) {
        this.submitted = false;
        this.showRegisterForm = true;
        this.showValidateCacForm = false;
        // this.showOtpForm = false;
      } else {
        this.showRegisterForm = false;
        this.showValidateCacForm = true;

        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.response[0].message
            ? data.response[0].message
            : data.message,
          showConfirmButton: true,
          timer: 5000,
        });
      }
    });
  }

  onRegisterSubmit(formData) {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    var requestObj = {
      cac_number: this.cacRegNumber,
      taxpayer_type: this.taxTypeName,
      taxpayer_type_id: this.taxTypeId,
      tin: formData.tin,
      phone: formData.phone,
      phone2: formData.phone2,
      email: formData.emailAddress,
      email_2: formData.emailAddress2,
      industry_sector_id: formData.industrySectorId,
      tax_office_id: formData.taxOfficeId,
      contact_address: formData.contactAddress,
      company_name: formData.companyName,
      economic_activity_id: 1,
    };

    console.log("registerRequest: ", requestObj);
    this.apiUrl = environment.AUTHAPIURL + "auth/signup";

    this.http.post<any>(this.apiUrl, requestObj).subscribe((data) => {
      console.log("registerApiResponse: ", data);
      this.spinnerService.hide();

      if (data.status == true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text:
            "Account Created Successfully, Please Check Email And Verify Your Account !",
          showConfirmButton: true,
          timer: 5000,
        });

        localStorage.setItem("username", formData.emailAddress);

        this.router.navigate(["/resetpassword"]);
        //this.showRegisterForm = true;
        //this.showOtpForm = true;
        // this.showValidateCacForm = false;
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.response[0].message,
          showConfirmButton: true,
          timer: 5000,
        });

        this.showRegisterForm = true;
        //this.showOtpForm = false;
      }
    });
  }

  onOtpSubmit(formData) {
    var token = formData.enterOtp;
    this.apiUrl =
      environment.AUTHAPIURL + "auth/signup/activate/{" + token + "}";
    this.spinnerService.show();

    this.http.get<any>(this.apiUrl).subscribe((data) => {
      console.log("confirmOtpApiResponse: ", data);
      this.spinnerService.hide();

      if (data.status == true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message,
          showConfirmButton: true,
          timer: 5000,
        });

        this.router.navigate(["/login"]);
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

  getTaxPayers() {
    this.apiUrl = environment.AUTHAPIURL + "taxpayer-types";

    this.http.get<any>(this.apiUrl).subscribe((data) => {
      console.log("taxPayerTypes: ", data);
      this.taxPayerTypes = data.response;
    });
  }

  getIndustrySectors() {
    this.apiUrl = environment.AUTHAPIURL + "industry-sectors";

    this.http.get<any>(this.apiUrl).subscribe((data) => {
      console.log("industrySectors: ", data);
      this.industrySectors = data.response;
    });
  }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + "tax-offices";

    this.http.get<any>(this.apiUrl).subscribe((data) => {
      console.log("taxTaxOffices: ", data);
      this.taxTaxOffices = data.response;
    });
  }
}
