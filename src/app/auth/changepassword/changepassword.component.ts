import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import { FlashMessagesService } from 'angular2-flash-messages';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';



@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {

  changePasswordForm: FormGroup;
  submitted = false;
  apiUrl: any;

  roles: any;
  myroles: any;
  applications: any;
  myapplications: any;
  fieldTextType: boolean;
  fieldTextType1: boolean;
  fieldTextType2: boolean;
  title = 'Paye - Change Password'

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder,
    private titleService: Title,
    private httpClient: HttpClient, private router: Router, private sess: SessionService, private flashMessage: FlashMessagesService) { }

    ngOnInit(): void {
    this.titleService.setTitle(this.title)
    // Check User Login
    this.sess.checkLogin();

    this.changePasswordForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]]
    }, {
      validator: MustMatch('newPassword', 'confirmPassword')
    });
  }


  onSubmit(formAllData: any) {
    this.submitted = true;
    // stop the process here if form is invalid
    if (this.changePasswordForm.invalid) {
      return;
    }

    let emailAddress = localStorage.getItem('admin_email');

    const obj = {
      current_password: formAllData.oldPassword,
      new_password: formAllData.newPassword,
      confirm_password: formAllData.confirmPassword,
      email: emailAddress
    };

    console.log("changePasswordFormData: ", obj);
    this.postChangePassword(obj);
  }

  postChangePassword(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + 'users/change-password';

    const reqHeader = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
     });


    this.httpClient.post<any>(this.apiUrl, jsonData, { headers: reqHeader }).subscribe(data => {
      console.log("changeResponseData: ", data);

      if (data.status === true) {

        // Rest form fithout errors
        this.changePasswordForm.reset();
        Object.keys(this.changePasswordForm.controls).forEach(key => {
          this.changePasswordForm.get(key).setErrors(null);
        });

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: data.message,
          showConfirmButton: true,
          timer: 5000
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text:  data.message,
          showConfirmButton: true,
          timer: 5000
        });
      }
    });
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldTextType1() {
    this.fieldTextType1 = !this.fieldTextType1;
  }

  toggleFieldTextType2() {
    this.fieldTextType2 = !this.fieldTextType2;
  }

}

export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
          // return if another validator has already found an error on the matchingControl
          return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
          matchingControl.setErrors({ mustMatch: true });
      } else {
          matchingControl.setErrors(null);
      }
  }
}
