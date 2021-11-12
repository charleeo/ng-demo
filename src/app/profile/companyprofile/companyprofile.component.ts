import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { SessionService } from 'src/app/session.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-companyprofile',
  templateUrl: './companyprofile.component.html',
  styleUrls: ['./companyprofile.component.scss'],
})
export class CompanyprofileComponent implements OnInit {
  companyProfileForm: FormGroup;
  submitted = false;
  userID: any;
  apiUrl: any;
  corporateID: any;
  apidata: any;
  corporate_id: any;
  roles: any;
  employeesCount: number;
  myroles: any;
  industrySectors: any;
  taxTaxOffices: any;
  roleID: any;
  file: any;
  imageSrc: string;
  corporateLogo: string;
  title = 'Paye - Company Profile'
  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: FormBuilder,
    private titleService: Title,
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private sess: SessionService,
    private flashMessage: FlashMessagesService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    this.corporate_id = this.route.snapshot.params.id;
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title)
    // Check User Login
    this.sess.checkLogin();
    this.roleID = localStorage.getItem('admin_role_id');
    this.userID = localStorage.getItem('admin_id');
    this.corporateID = localStorage.getItem('admin_corporate_id');

    // if (this.roleID!= 5) {
    //   this.router.navigate(['/dashboard']);
    //  }

    //  this.roleID = localStorage.getItem('admin_role_id');
    //  if (this.roleID != 1) {
    //   this.router.navigate(['/logout']);
    //  }

    this.getTaxOffices();
    this.getIndustrySectors();
    this.getEmployees();
    this.getCompanyData();

    this.companyProfileForm = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.maxLength(45)]],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      taxOffice: ['', [Validators.required]],
      rcNumber: ['', [Validators.required]],
      myfile: [''],
      industry: ['', [Validators.required]],
      tin: ['', [Validators.required]],
      contactAddress: ['', [Validators.required]],
      preferredNotification: ['', [Validators.required]],
    });
  }

  getIndustrySectors() {
    this.apiUrl = environment.AUTHAPIURL + 'industry-sectors';

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log('industrySectors: ', data);
      this.industrySectors = data.response;
    });
  }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + 'tax-offices';

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log('taxTaxOffices: ', data);
      this.taxTaxOffices = data.response;
    });
  }

  getCompanyData() {
    this.apiUrl = environment.AUTHAPIURL + 'corporates/' + this.corporateID;

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    this.spinnerService.show();
    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
        console.log("corporateApiData: ", data);
        this.apidata = data.response;
        this.corporateLogo = data.response.corporate_logo;
        this.spinnerService.hide();
    });

  }

  onUpdate(formAllData: any) {
    this.submitted = true;
    // stop the process here if form is invalid
    // if (this.companyProfileForm.invalid) {
    //   return;
    // }
    console.log(formAllData);

    if(formAllData.myfile === ''){
      const user = {
        id: this.corporateID,
        industry_sector_id: formAllData.industry,
        tax_office_id: formAllData.taxOffice,
        contact_address: formAllData.contactAddress
      };

      this.postData(user);
    } else {

    this.apiUrl = environment.AUTHAPIURL + 'file/upload';

    const formData = new FormData();
    formData.append('file', this.companyProfileForm.get('myfile').value);

    const config = {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
      }
    };

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, formData, config)
      .subscribe((data) => {
        console.log(data);

        if (data.status === true) {
          Object.keys(this.companyProfileForm.controls).forEach((key) => {
            this.companyProfileForm.get(key).setErrors(null);
          });

          const company = {
            corporate_logo: data.response.url,
            id: this.corporateID,
            industry_sector_id: formAllData.industry,
            tax_office_id: formAllData.taxOffice,
            contact_address: formAllData.contactAddress,
          };
          this.corporateLogo = company.corporate_logo;
          console.log('Image Url = ' + this.imageSrc);
          this.postData(company);
        } else {
          this.spinnerService.hide();

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
          });
        }
      });
    }
  }

  postData(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + 'corporates/update';

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    this.spinnerService.show();

    this.httpClient
      .post<any>(this.apiUrl, jsonData, { headers: reqHeader })
      .subscribe((data) => {
        console.log(data);
        // Rest form fithout errors

        // this.router.navigate(['/display']);
        if (data.status === true) {
          Object.keys(this.companyProfileForm.controls).forEach((key) => {
            this.companyProfileForm.get(key).setErrors(null);
          });
          this.getCompanyData();
          this.spinnerService.hide();
          // this.flashMessage.show(data.response, { cssClass: 'alert-success', timeout: 5000 });
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text:  data.response != null && data.response[0] != undefined ? data.response[0].message : data.message,
            showConfirmButton: true,
            timer: 5000,
          });
          this.reload();
        } else {
          this.spinnerService.hide();

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

  getEmployees() {
    this.apiUrl = environment.AUTHAPIURL + 'employees-list';

    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('admin_access_token')
    });

    let corporateId = localStorage.getItem('admin_corporate_id');
    console.log("corporateId: ", corporateId);

    const obj = {
      corporate_id: [corporateId],
    };

    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe(data => {
      console.log('employeesData: ', data);
      this.employeesCount = data.response.data.length;

    });
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.file = event.target.files[0];
      this.companyProfileForm.get('myfile').setValue(file);
    }
  }
  reload() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['./'], { relativeTo: this.route });
  }

}
