import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
// import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { Title } from "@angular/platform-browser";
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  @Input() corporateId;
  @Input() individualId;

  apiUrl: string;
  walletLogData: any = [];
  config: any;
  dtOptionsPopUp: any = {};
  walletDetailData: any;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private sess: SessionService,
    private modalService: NgbModal,
    private titleService: Title,
    private route: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService
  ) { }

  ngOnInit(): void {
    this.intialiseTableProperties();

    /* Pagination Start */
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getWallDetails();
    this.getWalletLogs();

    this.route.queryParams.subscribe(
      (params) =>
        (this.config.currentPage = params["page"] ? params["page"] : 1)
    );
  }

  intialiseTableProperties() {
    this.dtOptionsPopUp = {
      paging: true,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
    }

  }

  getWallDetails() {
    if (this.corporateId !== null && this.corporateId !== undefined) {
      this.apiUrl = `${environment.AUTHAPIURL}wallet?corporate_id=${this.corporateId}`;
    }
    else{
      this.apiUrl = `${environment.AUTHAPIURL}wallet?individual_id=${this.individualId}`;
    }

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient.get<any>(this.apiUrl, { headers: reqHeader }).subscribe((data) => {
      console.log("walletDetailApiData", data);
      this.walletDetailData = data.response;
      this.spinnerService.hide();
    });
  }


  getWalletLogs() {
    this.apiUrl = `${environment.AUTHAPIURL}wallet/logs`;
    // this.apiUrl = `${environment.AUTHAPIURL}wallet/logs?page=${pageno}`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {};
    // const obj = { per_page: perpage, page_no: pageno };

    if (this.corporateId !== null && this.corporateId !== undefined) {
      obj["corporate_id"] = this.corporateId;
    }
    else {
      obj["individual_id"] = this.individualId;
    }

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
        console.log("walletLogApiData", data);
        this.walletLogData = data.response.data;
        // this.config.totalItems = data.response.total;
        this.spinnerService.hide();
      });
  }

  // pageChange(newPage: number) {
  //   this.walletLogData = "";
  //   this.router.navigate(["/annualreturns"], {
  //     queryParams: { page: newPage },
  //   });
  //   this.getWalletLogs(this.config.itemsPerPage, newPage);
  // }

  // public setItemsPerPage(event) {
  //   this.config.itemsPerPage = event;
  //   this.currentPageLength = this.config.itemsPerPage;
  //   this.walletLogData = "";
  //   this.router.navigate(["/annualreturns"]);
  //   this.getWalletLogs(this.config.itemsPerPage, 1);
  // }

}
