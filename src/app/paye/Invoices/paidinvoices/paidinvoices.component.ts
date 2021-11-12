import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { SessionService } from 'src/app/session.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-paidinvoices',
  templateUrl: './paidinvoices.component.html',
  styleUrls: ['./paidinvoices.component.css']
})
export class PaidinvoicesComponent implements OnInit {

  apiUrl: string;
  apidata: any;
  dtOptions: any = {};
  roleID: any;
  title = 'PAYE - Paid Invoices'

  config: any;
  currentPageLength: any = 10;

  // tslint:disable-next-line: max-line-length
  constructor(private httpClient: HttpClient,
    private titleService: Title,
    private route: ActivatedRoute, private router: Router, private sess: SessionService, private spinnerService: Ng4LoadingSpinnerService) { }

    ngOnInit(): void {
    this.titleService.setTitle(this.title)
    this.sess.checkLogin();

    //this.getPaidInvoices();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getPaidInvoices(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );

    this.dtOptions = {
      paging: false,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: false,
      processing: false,
      ordering: false,
      info: false,
     // dom: "<'row'<'col-sm-3'l><'col-sm-6 text-center'B><'col-sm-3'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
                // { extend: 'copy',  className: 'btn btn-outline-dark', text: '<i class="far fa-copy"> Copy</i>' },
                { extend: 'csv',   className: 'btn btn-outline-dark export-btn', text: '<i class="fas fa-file-csv"> CSV</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8]} },
                { extend: 'excel', className: 'btn btn-outline-dark export-btn', text: '<i class="fas fa-file-excel"> Excel</i>', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8]} },
                { extend: 'pdf',   className: 'btn btn-outline-dark export-btn', text: '<i class="fas fa-file-pdf"> PDF</i>', orientation: 'landscape', pageSize: 'LEGAL', exportOptions: {columns: [0, 1, 2, 3, 4, 5, 6, 7, 8]}},
              ]
    };
  }

  getPaidInvoices(perpage, pageno) {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('admin_access_token'),
    });

    const obj = {
      payment_status: true,
      per_page: perpage, 
      page_no: pageno
    }
    //this.apiUrl = environment.AUTHAPIURL + 'invoices-paid-unpaid';
    this.apiUrl = environment.AUTHAPIURL + "invoices-paid-unpaid?page=" + pageno;

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader} ).subscribe(data => {

      //this.apidata = data.response.data.filter(x => x.payment_status == 1);
      this.apidata = data.response.data;
      this.config.totalItems = data.response.total;
      console.log("paidInvoicesData", this.apidata);
      this.spinnerService.hide();
    });
  }

  pageChange(newPage: number) {
    this.apidata = "";
    this.router.navigate(["/paidinvoices"], { queryParams: { page: newPage } });
    this.getPaidInvoices(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event;
    this.currentPageLength = this.config.itemsPerPage;
    this.apidata = "";
    this.router.navigate(["/paidinvoices"]);
    this.getPaidInvoices(this.config.itemsPerPage, 1);
  }


}
