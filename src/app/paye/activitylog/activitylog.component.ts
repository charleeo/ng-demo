import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { SessionService } from "../../session.service";

@Component({
  selector: "app-activitylog",
  templateUrl: "./activitylog.component.html",
  styleUrls: ["./activitylog.component.scss"],
})
export class ActivitylogComponent implements OnInit {
  apiUrl: string;
  apidata: any;
  dtOptions: any = {};
  roleID: any;
  title = "PAYE - Activity Logs";
  taxTaxOffices: any;
  showTaxOffice: boolean = false;

  config: any;
  currentPageLength : any = 10;
  searchObject: any = {};

  // tslint:disable-next-line: max-line-length
  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
    private sess: SessionService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.sess.checkLogin();
    this.titleService.setTitle(this.title);

    this.getTaxOffices();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getUserData(this.config.itemsPerPage, this.config.currentPage);
    this.route.queryParams.subscribe(
      params => this.config.currentPage= params['page']?params['page']:1 
    );

    // this.getUserData();
    this.roleID = localStorage.getItem("admin_role_id");

    if (this.roleID == 1) {
      this.showTaxOffice = true;
    }

    this.dtOptions = {
      paging: false,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: false,
      processing: false,
      ordering: false,
      info: false,
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
        {
          extend: "csv",
          className: "btn btn-outline-dark export-btn",
          text: '<i class="fas fa-file-csv"> CSV</i>',
        },
        {
          extend: "excel",
          className: "btn btn-outline-dark export-btn",
          text: '<i class="fas fa-file-excel"> Excel</i>',
        },
        {
          extend: "pdf",
          className: "btn btn-outline-dark export-btn",
          text: '<i class="fas fa-file-pdf"> PDF</i>',
        },
      ],
    };
  }

  getUserData(perpage, pageno) {
    this.apiUrl = environment.AUTHAPIURL + "timelines?page="+pageno;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.searchObject["page_no"] = pageno;
    this.searchObject["per_page"] = perpage;

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, this.searchObject, { headers: reqHeader }).subscribe((data) => {
        console.log(data);
        if ((data.status = true)) {
          this.apidata = data.response.data;
          this.config.totalItems = data.response.total;
          this.spinnerService.hide();
        } else {
          Swal.fire({
            icon: "error",
            title: "An error occurred",
            text: data.message,
            showConfirmButton: true,
            timer: 5000,
            timerProgressBar: true,
          });
          this.spinnerService.hide();
        }
      });

  }

  getTaxOfficeById(taxOfficeId) {
    if (taxOfficeId == null) {
      return "NOT UNDER ANY TAX OFFICE";
    }
    var taxOffice = this.taxTaxOffices.filter((x) => x.id == taxOfficeId)[0]
      ?.name;
    return taxOffice;
  }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + "tax-offices";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("taxTaxOffices: ", data);
      this.taxTaxOffices = data.response;
    });
  }

  pageChange(newPage: number) {
    console.log('searchFormData: ', this.searchObject);
    this.apidata = '';
    this.router.navigate(['/activitylog'], { queryParams: { page: newPage } });
    this.getUserData(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event
    this.currentPageLength = this.config.itemsPerPage;
    this.apidata = '';
    this.router.navigate(['/activitylog']);
    this.getUserData(this.config.itemsPerPage, 1);
  }

}
