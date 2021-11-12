import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-approvedprojection",
  templateUrl: "./approvedprojection.component.html",
  styleUrls: ["./approvedprojection.component.css"],
})
export class ApprovedprojectionComponent implements OnInit {
  dtOptions: any = {};
  dtOptionsPopUp: any = {};
  roleID: any;
  submitted: boolean;
  apidata: any;
  singleCorporate = [] as any;
  apiUrl: string;
  corporateId = localStorage.getItem("admin_corporate_id");
  selectedProjection: any;
  modalOptions: NgbModalOptions;
  closeResult: string;
  projectionData: any;
  industrySectors: any;
  taxTaxOffices: any;
  selectedCorporate: any;
  selectedCorporateId: any;
  corporatesData: any;
  corporateForm: FormGroup;
  showTaxOffice: boolean;
  title = "Paye - Filed-Projection";
  apisingledata: any = [];
  projectionYear: any;
  companyName: any;
  config: any;
  currentPageLength : any = 10;
  selectedBusinessId: any;
  selectedProjectionId: any;

  // tslint:disable-next-line: max-line-length
  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private titleService: Title,
    private sess: SessionService,
    private formBuilder: FormBuilder,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit() {
    this.sess.checkLogin();
    this.titleService.setTitle(this.title);
    this.roleID = localStorage.getItem("admin_role_id");

    if (this.roleID == "1") {
      this.showTaxOffice = true;
    }

    this.initialiseForms();
    this.intialiseTableProperties();

     /* Pagination Start */
     this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };

    this.getApprovedProjectionRecord(this.config.itemsPerPage, this.config.currentPage);

    this.route.queryParams.subscribe(
      params => this.config.currentPage= params['page']?params['page']:1 
    );
  }

  initialiseForms() {
    this.corporateForm = this.formBuilder.group({
      companyName: [""],
      companyTIN: [""],
      taxPayerID: [""],
    });
  }

  intialiseTableProperties() {
    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      size: "xl",
    };

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
       
      ],
    };

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

  getApprovedProjectionRecord(perpage, pageno) {
    this.apidata = "";
    this.apiUrl = environment.AUTHAPIURL + 'projections/approvedRecord?page='+pageno;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {"per_page":perpage, "page_no": pageno};

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("approvedProjections: ", data);
        this.spinnerService.hide();
        this.apidata = data.status == false ? [] : data.response.data;
        this.config.totalItems = data.response.total;
      });
  }

  getApprovedProjectionList(year) {
    this.apisingledata = '';
    this.apiUrl = environment.AUTHAPIURL + "projections/approvedList";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      projection_year: year,
      business_id: this.selectedBusinessId,
      corporate_id: this.selectedCorporateId,
      annual_projection_id: this.selectedProjectionId,
    };

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
        console.log("approvedProjections: ", data);

        if (data.status == true) {
          this.apisingledata = data.response;
          // this.companyName = data.response[0].company_name;
          // this.projectionYear = data.response[0].projection_year;
        }      
      });

      this.spinnerService.hide();
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }

  showModal(modal) {
    this.modalService.open(modal, this.modalOptions).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  viewProjection(modal, selectedProjection) {
    console.log("selectedEmployee: ", selectedProjection);
    this.showModal(modal);
    this.getSingleProjection(selectedProjection.projection_id);
  }

  viewApprovedProjection(modal, selectedProjection) {
    console.log("selectedEmployee: ", selectedProjection);
    this.companyName = selectedProjection.business_name;
    this.projectionYear = selectedProjection.projection_year;
    this.selectedProjection = selectedProjection;
    this.selectedBusinessId = selectedProjection.business_primary_id;
    this.selectedProjectionId = selectedProjection.annual_projection_id;
    this.showModal(modal);
    this.getApprovedProjectionList(this.selectedProjection.projection_year);
  }

  getSingleProjection(projectionId) {
    this.spinnerService.show();
    this.apiUrl =
      environment.AUTHAPIURL + "projections/approved/" + projectionId;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("singleProjectionData: ", data);
        this.projectionData = data.response;
        console.log(this.projectionData);
        this.selectedProjection = data.response;
        this.spinnerService.hide();
      });
  }

  pageChange(newPage: number) {
    this.apidata = '';
    this.router.navigate(['/approvedprojection'], { queryParams: { page: newPage } });
    this.getApprovedProjectionRecord(this.config.itemsPerPage, newPage);
  }

  public setItemsPerPage(event) {
    this.config.itemsPerPage = event
    this.currentPageLength = this.config.itemsPerPage;
    this.apidata = '';
    this.router.navigate(['/approvedprojection']);
    this.getApprovedProjectionRecord(this.config.itemsPerPage, 1);
  }

}
