import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-useractivities',
  templateUrl: './useractivities.component.html',
  styleUrls: ['./useractivities.component.css']
})
export class UseractivitiesComponent implements OnInit {

  apiUrl: string;
  apidata: any;
  dtOptions: any = {};
  roleID: any;

  // tslint:disable-next-line: max-line-length
  constructor(private httpClient: HttpClient, private route: ActivatedRoute, private router: Router, private sess: SessionService, private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit(): void {
    this.sess.checkLogin();
    this.roleID = localStorage.getItem('admin_role_id');
    this.intialiseTableProperties();

    // if (this.roleID != 5) {
    //   this.router.navigate(['/logout']);
    //  }

    this.getUserData();
  }

  intialiseTableProperties() {
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
            //targets: [ 10 ],
            visible: false,
            searchable: false
        }
    ],
      dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
                { 
                  extend: 'csv',   
                  className: 'btn btn-outline-dark export-btn', 
                  text: '<i class="fas fa-file-csv"> CSV</i>', 
                  exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}},
                { 
                  extend: 'excel', 
                  className: 'btn btn-outline-dark export-btn', 
                  text: '<i class="fas fa-file-excel"> Excel</i>', 
                  exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} },
                { 
                  extend: 'pdf',   
                  className: 'btn btn-outline-dark export-btn', 
                  text: '<i class="fas fa-file-pdf"> PDF</i>' , 
                  orientation: 'landscape', pageSize: 'LEGAL', 
                  exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], style: "max-width: 98px"}},
                { 
                  extend: 'print', 
                  className: 'btn btn-outline-dark export-btn', 
                  text: '<i class="far fas fa-print"> Print</i>', 
                  exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } }
              ]
    };
  }

  getUserData() {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    this.apiUrl = environment.AUTHAPIURL + 'audit-trail';
    this.spinnerService.show();

    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe(data => {
      console.log("userApiData: ", data);
      this.apidata = data.response.data;
      this.spinnerService.hide();
    });
  }


}
