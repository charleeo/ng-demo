import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import {NgbModal, ModalDismissReasons, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';


@Component({
  selector: 'app-allcases',
  templateUrl: './allcases.component.html',
  styleUrls: ['./allcases.component.css']
})
export class AllcasesComponent implements OnInit, OnDestroy {

  apiUrl: string;
  apidata: any;
  apiDataById: any;
  dtOptions: any = {};
  userID: any;
  modalOptions: NgbModalOptions;
  closeResult: string;

  registerForm: FormGroup;
  submitted = false;
  isErrorDisplay: any;
  isArrivaldate: any = false;
  postObj: any = false;
  searchKeyword: any = 'All';
  buttonDisable: any = 1;
  arrivaldateVal: any = '';
  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder, private httpClient: HttpClient, private route: ActivatedRoute, private router: Router, private sess: SessionService, private modalService: NgbModal, private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit(): void {
    this.submitted = false;
    this.sess.checkLogin();
    // alert('innn');
    const retrievedObject = localStorage.getItem('searchObject');

    if (this.isArrivaldate === true) {
      this.registerForm = this.formBuilder.group({
        keyword: [''],
        arrivaldate: ['']
      });
    } else {
      this.registerForm = this.formBuilder.group({
        keyword: [''],
        arrivaldate: ['']
      });
    }


    this.modalOptions = {
      backdrop: 'static',
      backdropClass: 'customBackdrop',
      size: 'xl',
     // size: 'lg'
    };

    if (retrievedObject === '' || retrievedObject === null) {
      // this.arrivaldateVal = '';
      this.postObj = {
        keyword: 'All',
        arrivaldate: ''
      };
    } else {
      this.postObj = JSON.parse(retrievedObject);
      console.log('uuuuuuuuuuuuuuuuuuuuuuuu');
      console.log(this.postObj);
      // this.arrivaldateVal = this.postObj.arrivaldate;
      this.searchKeyword = this.postObj.keyword;
    }

    this.getUserData(this.postObj);
    this.dtOptions = {
      paging: true,
      scrollX: true,
      pagingType: 'full_numbers',
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
      columnDefs: [
        {
            targets: [ 10 ],
            visible: false,
            searchable: false
        }
    ],
      // dom: "<'row'<'col-sm-3'l><'col-sm-6 text-center'B><'col-sm-3'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
                // { extend: 'copy',  className: 'btn btn-outline-dark', text: '<i class="far fa-copy"> Copy</i>' },
                // tslint:disable-next-line: max-line-length
                { extend: 'csv',   className: 'btn btn-outline-dark', text: '<i class="fas fa-file-csv"> CSV</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}},
                // tslint:disable-next-line: max-line-length
                { extend: 'excel', className: 'btn btn-outline-dark', text: '<i class="fas fa-file-excel"> Excel</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} },
                // tslint:disable-next-line: max-line-length
                { extend: 'pdf',   className: 'btn btn-outline-dark', text: '<i class="fas fa-file-pdf"> PDF</i>' , orientation: 'landscape', pageSize: 'LEGAL', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}},
                // tslint:disable-next-line: max-line-length
                { extend: 'print', className: 'btn btn-outline-dark', text: '<i class="far fas fa-print"> Print</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } }
              ]
    };
  }

  getUserData(jsonData: any) {
    this.apiUrl = environment.AUTHAPIURL + 'covidapi/user/displayUserDetail';
    this.spinnerService.show();
    // this.httpClient.get<any>(this.apiUrl)
    this.httpClient.post<any>(this.apiUrl, jsonData)
            .subscribe(res => {
              console.log(res.response);
              this.apidata = res.response;
              this.spinnerService.hide();
              this.isErrorDisplay = true;
            });
  }

  getUserDataById(id: any) {
    const obj = {
      user_id: id
      };

    this.apiUrl = environment.AUTHAPIURL + 'covidapi/user/displayUserById';
    this.httpClient.post<any>(this.apiUrl, obj).subscribe(data => {
          // console.log(data);
          console.log(data.response[0]);
          this.apiDataById = data.response[0];
    });
  }

  open(content, userDataID) {
    // alert(userDataID);
    console.log(userDataID);
    this.userID = userDataID;

    this.getUserDataById(userDataID);

    this.modalService.open(content, this.modalOptions).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

   formattedDate(d = new Date) {
    let month = String(d.getMonth() + 1);
    let day = String(d.getDate());
    const year = String(d.getFullYear());

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    // return `${day}/${month}/${year}`;
    return `${month}/${day}/${year}`;
  }

  onSubmit(formAllData: any) {
    this.apidata = '';
    this.submitted = true;
    this.buttonDisable = 1;
    this.isArrivaldate = false;

    let arrivalDateValue = '';
    if (formAllData.keyword == 'Arrival Date') {
     const mydate = this.formattedDate(formAllData.arrivaldate);
     // alert(mydate);

     arrivalDateValue = mydate;
    }

    // stop the process here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }
    console.log(formAllData);
    const obj = {
        keyword: formAllData.keyword,
        arrivaldate: arrivalDateValue
      };
    localStorage.setItem('searchObject', JSON.stringify(obj));

    this.ngOnInit();
    // this.getUserData(obj);
}

optionChanged(value: any) {
  // alert(value.target.value);
  this.buttonDisable = 0;
  this.isArrivaldate = false;
  if (value.target.value == 'Arrival Date') {
    this.isArrivaldate = true;
  } else {
    this.isArrivaldate = false;
  }
}

ngOnDestroy() {
  // alert('out');
  localStorage.removeItem('searchObject');
}

}
