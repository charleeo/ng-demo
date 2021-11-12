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
  selector: 'app-bulkcorporateupload',
  templateUrl: './bulkcorporateupload.component.html',
  styleUrls: ['./bulkcorporateupload.component.css']
})
export class BulkcorporateuploadComponent implements OnInit {
  myForm: FormGroup;
  submitted: boolean = false;
  files: any;
  file: any;
  apiUrl: string;
  isResponse = 0;
  isError = 0;
  isMessage = '';
  roleID: any;
  sample_file: any;
  filePath: any;
  title = 'Paye - Bulk Corporate upload'

  get f() {
    return this.myForm.controls;
  }

  constructor(private formBuilder: FormBuilder,
              private http: HttpClient,
              private router: Router,
              private titleService: Title,
              private sess: SessionService,
              private flashMessage: FlashMessagesService,
              private spinnerService: Ng4LoadingSpinnerService) { }

              ngOnInit(): void {
    this.titleService.setTitle(this.title)
    this.spinnerService.show();
    this.sess.checkLogin();
    this.roleID = localStorage.getItem('admin_role_id');

    // if (this.roleID != 6) {
    //   this.router.navigate(['/dashboard']);
    // }

    this.myForm = this.formBuilder.group({
      myfile: ['', Validators.required]
    });

    this.sample_file = environment.SAMPLE_FILE_URL + 'corporate-template.xlsx';
    this.spinnerService.hide();
  }

  submit() {
    this.submitted = true;
    if (this.myForm.invalid) {
      return;
    }
    // tslint:disable-next-line: max-line-length
    // In Angular 2+, it is very important to leave the Content-Type empty. If you set the 'Content-Type' to 'multipart/form-data' the upload will not work !
    const config = {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
      }
    };

    const formData = new FormData();
    formData.append('corporates', this.myForm.get('myfile').value);
    this.apiUrl = `${environment.AUTHAPIURL}corporates/import`;
    this.spinnerService.show();

    this.http.post<any>(this.apiUrl, formData, config)
      .subscribe(res => {
        console.log(res);

        // Clear form Value Without any Error
        this.myForm.reset();
        Object.keys(this.myForm.controls).forEach(key => {
          this.myForm.get(key).setErrors(null);
        });

        if (res.status == true) {
          this.spinnerService.hide();

          this.myForm.reset();
          Object.keys(this.myForm.controls).forEach(key => {
            this.myForm.get(key).setErrors(null);
          });
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: res.message,
            showConfirmButton: true,
            timer: 5000,
          });
        } else {
          this.spinnerService.hide();
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: res.message + '! Missing column or invalid input, do well to follow the template provided',
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
      this.myForm.get('myfile').setValue(file);
    }
  }

}
