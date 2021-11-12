import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { SessionService } from '../../session.service';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})
export class ContactusComponent implements OnInit {

  contactUsForm: FormGroup;
  submitted = false;
  apiUrl: any;

  roles: any;
  myroles: any;
  applications: any;
  myapplications: any;
  title = 'Paye - Contact-Us'

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder,
              private httpClient: HttpClient,
              private titleService: Title,
              private router: Router,
              private sess: SessionService)
              { }

              ngOnInit(): void {
    this.titleService.setTitle(this.title)

    this.contactUsForm = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.maxLength(45)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]],
    });
  }


  onSubmit(formAllData: any) {
    this.submitted = true;
    let response = grecaptcha.getResponse();
    if (response.length == 0) {
      document.getElementById('captchaError').innerHTML = 'Captcha field is required';
      return false;
    }

    // stop the process here if form is invalid
    if (this.contactUsForm.invalid) {
      return;
    }

    const obj = {
      company_name: formAllData.companyName,
      email: formAllData.email,
      message: formAllData.message
    };

    console.log('contactUsFormData: ', obj);
    this.postContactUs(obj);
  }

  postContactUs(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + 'contact';


    this.httpClient.post<any>(this.apiUrl, jsonData).subscribe(data => {
      console.log('contactResponseData: ', data);

      if (data.status === true) {

        // Rest form fithout errors
        this.contactUsForm.reset();
        Object.keys(this.contactUsForm.controls).forEach(key => {
          this.contactUsForm.get(key).setErrors(null);
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

  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }

}
