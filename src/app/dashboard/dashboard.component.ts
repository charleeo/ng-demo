import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../session.service";
import { environment } from "../../environments/environment";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import Swal from "sweetalert2";
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from "@angular/forms";
import { ChangeDetectorRef } from "@angular/core";
import { DatePipe } from "@angular/common";
import * as moment from "moment";
import { FormGroupDirective } from "@angular/forms";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  public show: boolean = false;
  public buttonName: any = "Revenue";

  revenueStreams = ["PAYE", "DA", "Land", "Water"];
  taxOfficeData: any[] = [];
  apiUrl: string;
  apidata: any;
  submitted: any;
  total: number[] = [];
  taxTaxOffices = [];
  dtOptions: any = {};
  //x: any;
  isRun: any;
  paye: any = [];
  nigeria: any;
  all: any;
  totalActive: any = 0;
  totalInctive: any = 0;
  apiChart: number[] = [];
  apiPieValue: any[] = [];
  apiPieLabel: string[] = [];
  revenueStreamsdata: any;
  todosdata = [];
  notDone = [];
  paymentMethodsdata: any;
  year: string;
  currentYear: number;
  currYear: any;
  /********************************** Line Chart ******************/

  chartOptions = {
    responsive: true,
    scales: {
      xAxes: [
        {
          gridLines: {
            display: true,
          },
          scaleLabel: {
            display: true,
            labelString: "Tax Month",
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
          scaleLabel: {
            display: true,
            labelString: "Tax Amount",
          },
        },
      ],
    },
  };

  chartData = [{ data: this.apiChart, label: "Monthly Tax Paid" }];

  individualChartLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  individualChartData: any;
  chartLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  years = [
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
    "2025",
    "2026",
    "2027",
    "2028",
    "2029",
    "2030",
    "2031",
    "2032",
    "2033",
    "2034",
    "2035",
    "2036",
    "2037",
    "2038",
    "2039",
    "2040",
  ];

  myColorsLine = [
    {
      backgroundColor: "#deeeff",
      borderColor: "#12477b",
      pointBackgroundColor: "#12477b",
      pointBorderColor: "#12477b",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(103, 58, 183, .8)",
    },
  ];

  /****************** Bar Chart ************************************/
  barChartOptions = {
    responsive: true,
    scales: {
      xAxes: [
        {
          gridLines: {
            display: true,
          },
          scaleLabel: {
            display: true,
            labelString: "Name of Revenue Streams",
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: true,
          },
          scaleLabel: {
            display: true,
            labelString: "Tax Amount",
          },
        },
      ],
    },
  };
  revenueBars: number[] = [];

  barChartLabels = ["PAYE", "DA", "Land", "Water"];
  barChartLabelTaxOffice = [
    "Obi",
    "Lafia",
    "Akwanga",
    "Eggon",
    "Keffi",
    "NZO",
    "Karu",
  ];
  barChartType = "bar";
  barChartLegend = true;
  barChartPlugins = [];

  //barChartData = [{ data: this.paye, label: "Monthly Revenue" }];
  barChartData = [];

  barChartDataEmpty = [{ data: [], label: "Monthly Revenue" }];

  barChartDataTaxOffice = [
    { data: this.taxOfficeData, label: "Monthly Revenue" },
  ];

  myColorsBar = [
    {
      backgroundColor: "#007bff",
      borderColor: "#007bff",
    },
  ];

  /*************************** Pi-Chart ***********************************/
  pieChartOptions = {
    responsive: true,
    tooltips: {
      enabled: true,
      callbacks: {
        label: function (tooltipItem, data) {
          let label = data.labels[tooltipItem.index];
          let count: any =
            data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          return (
            label + ": " + count
            // new Intl.NumberFormat("pt-BR", {
            //   style: "currency",
            //   currency: "NGN",
            //   minimumFractionDigits: 2,
            // }).format(count)
          );
        },
      },
    },
  };


  // pieChartLabels = [['Test1'], ['Test2'], 'Test3'];
  pieChartLabels = this.apiPieLabel;
  pieChartData = this.apiPieValue;
  pieChartType = "pie";
  pieChartLegend = true;
  pieChartPlugins = [];

  myColorsPi = [
    {
      backgroundColor: ["#fd9e02", "#52b356", "#039bb0"],
      borderColor: ["#fff", "#fff", "#fff"],
    },
  ];
  corporateTaxpayerType: number;
  selfportalTaxpayerType: number;
  adminportalTaxpayerType: number;
  sef: any;
  cor: any;
  adm: any;
  percent: any;
  activeTaxpayers: any;
  companyObj: { companyName: any; taxpayerId: any; cacNumber: any; email: any };
  company: string;
  firstLetter: string;
  modalOptions: NgbModalOptions;
  closeResult: string;
  todoForm: FormGroup;
  revenueForm: FormGroup;
  taxOffice: any;
  activities: any;
  start: any;
  revenueDailyForm: FormGroup;
  dailyRevenuedata: any;
  userAgentdata: any;
  activepayers: any;
  activeTaxpayer: any;
  apiTransactions: any;
  industry: any;
  industrySector: any;
  dailyRev: any;
  yearArr = [];
  roleID: string;
  superAdmin: boolean = false;
  managerAdmin: boolean;
  otherAdmin: boolean;
  editorExists: any;
  today: any;
  newData = [];
  title = "Paye - Dashboard";
  message: string;
  selectedYear: any;
  isCallOnInit: boolean;
  isUserViewer: boolean = false;
  showPaye: boolean;
  showDirectAssessment: boolean;
  individualTaxpayerType: number;
  ind: any;
  totalcor: number;
  taxpayers: any;
  totalTaxPaid: string = "Total Tax Paid from Inception";
  selectedRevenueValue: string;
  month: any;
  currentMonth: string;
  todayDate: string;
  todoDateLimit: string;
  assetBreakDownData: any = [];
  // apiPieLabel1: any;
  // apiPieValue1: any;

  apiPieLabel1: any[] = [];
  apiPieValue1: string[] = [];

  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private cd: ChangeDetectorRef,
    private modalService: NgbModal,
    private datePipe: DatePipe,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private sess: SessionService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.intialiseTodoForm();
    this.revenueDailyForm = this.formBuilder.group({
      taxOffice: [""],
      date: ["", [Validators.required]],
    });
    this.revenueForm = this.formBuilder.group({
      taxOffice: [""],
      date: [""],
    });
    // this.checkIfEditorExist();
    this.sess.checkLogin();
    this.roleID = localStorage.getItem("admin_role_id");
    // this.corporateId = localStorage.getItem('corporate_id');

    console.log("roleID: ", this.roleID);

    if (this.roleID == "4") {
      this.isUserViewer = true;
    }
    this.currYear = moment(new Date()).format("YYYY");

    this.today = new Date();
    this.todayDate = this.formatDate(this.today);
    this.todoDateLimit = this.formatDateLimit(this.today);
    this.currentYear = this.today.getFullYear();

    //this.yearArr  = [] ;
    for (let i of this.years) {
      if (parseInt(i) <= this.currYear) {
        let num = parseInt(i);
        this.yearArr.push(num);
      }
    }
    //let month = this.today.getMonth() + 1;
    this.month = ("0" + (this.today.getMonth() + 1)).slice(-2);
    this.spinnerService.show();
    // this.yearArr.unshift(this.currentYear.toString())
    // alert(this.yearArr[0]);
    this.myFunction(this.currYear);
    this.getDashboardData();
    this.getTaxOffices();
    this.getIndustrySector();
    this.getChartData(this.currYear, "");
    this.getTodos();
    this.getUserData();
    this.getUserAgent();
    this.isCallOnInit = true;
    this.getPaymentMethods(this.currYear, this.month, this.isCallOnInit);
    console.log(this.isCallOnInit);
    const obj = {
      date: this.today,
      taxOffice: 1,
    };
    this.getRevenueDaily(obj, true);
    const date = {
      date: this.currentYear.toString() + "-" + this.month.toString(),
      // tax_office_id: 1
    };
    this.currentMonth = date.date;
    this.getRevenueStreams(date);
    this.getActiveTaxpayers();
    this.getRevenueStreamsByTaxOffice(date);
    this.getAssetBreakDown();

    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      size: "lg",
      //size: 'xl',
    };

    this.initialiseTableProperties();

    this.roleID = localStorage.getItem("admin_role_id");
    console.log(" role id " + this.roleID);
    if (this.roleID === "1") {
      this.superAdmin = true;
    }
    if (this.roleID === "2") {
      this.managerAdmin = true;
    }
    if (this.roleID === "3" || this.roleID === "4") {
      this.otherAdmin = true;
    }

    this.showPaye = true;
    this.showDirectAssessment = false;

    let select = document.getElementById("selectYear");
    let select2 = document.getElementById("selectYear2");
    let options = this.yearArr.reverse();
    // console.log("year, " + options);
    // this.selectedYear = options[0];
    for (let i = 0; i <= options.length; i++) {
      let opt = options[i];
      let el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      console.log(el);
      document.getElementById("selectYear")?.appendChild(el);
      // document.querySelector(".selectYear").appendChild(el);
    }

    for (let i = 0; i < options.length; i++) {
      let opt = options[i];
      let el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      // console.log(el);
      select2?.appendChild(el);
    }

    this.spinnerService.show(); // show the spinner
    this.spinnerService.hide(); // hide the spinner if success

    this.isRun = localStorage.getItem("admin_is_reload");
    // alert(this.isRun);
    if (this.isRun != "true") {
      this.refresh();
    }

    // this.today = new Date().toISOString().split('T')[0];
    // document.getElementsByName("todoDate")[0].setAttribute('min', this.today);

    this.getTodos();
    this.getActiveTaxpayers();
  }

  initialiseTableProperties() {
    this.dtOptions = {
      paging: true,
      pagingType: "full_numbers",
      responsive: true,
      pageLength: 10,
      lengthChange: true,
      processing: true,
      ordering: false,
      info: true,
      dom:
        "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: [
        // { extend: 'copy',  className: 'btn btn-outline-dark', text: '<i class="far fa-copy"> Copy</i>' },
        // tslint:disable-next-line: max-line-length
        // { extend: 'csv', className: 'btn btn-outline-dark export-btn', text: '<i class="fas fa-file-csv"> CSV</i>', exportOptions: { columns: [0, 1, 2, 3] } },
        // tslint:disable-next-line: max-line-length
        // { extend: 'excel', className: 'btn btn-outline-dark export-btn', text: '<i class="fas fa-file-excel"> Excel</i>', exportOptions: { columns: [0, 1, 2, 3] } },
        // tslint:disable-next-line: max-line-length
        // { extend: 'pdf', className: 'btn btn-outline-dark export-btn', text: '<i class="fas fa-file-pdf"> PDF</i>', orientation: 'landscape', pageSize: 'LEGAL', exportOptions: { columns: [0, 1, 2, 3] } },
        // tslint:disable-next-line: max-line-length
        // { extend: 'print', className: 'btn btn-outline-dark export-btn', text: '<i class="far fas fa-print"> Print</i>', exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6] } }
      ],
    };
  }

  checkIfEditorExist() {
    this.apiUrl = `${environment.AUTHAPIURL}editors-check`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("editor " + data.response.has_editors);
        this.editorExists = data.response.has_editors;
        if (this.editorExists == false) {
          this.router.navigate(["/adduser"]);
          Swal.fire({
            icon: "info",
            title: "No Tax Officer",
            text: "Create a Tax Officer to continue",
            showConfirmButton: true,
            timer: 5000,
            timerProgressBar: true,
          });
        }
      });
  }

  intialiseTodoForm() {
    this.todoForm = this.formBuilder.group({
      title: ["", [Validators.required, Validators.maxLength(50)]],
      date: ["", [Validators.required]],
      description: ["", [Validators.required]],
      priority: ["", [Validators.required]],
    });
  }

  myFunction(value: string) {
    this.apiChart = [];
    // alert(value);
    this.year = value;
    this.getChartData(this.year, "paye");
  }

  showDirectAssessmentChart(value: string) {
    if (value === "paye") {
      this.showPaye = true;
      this.getChartData(this.year, "paye");
      this.totalTaxPaid = "Total Tax Paid for PAYE";
      this.showDirectAssessment = false;
    } else if (value === "direct_assessment") {
      this.showPaye = false;
      this.getChartData(this.year, "direct_assessment");
      this.showDirectAssessment = true;
      this.selectedRevenueValue = "direct_assessment";
    } else {
      this.showPaye = true;
      this.getChartData(this.year, "");
      this.totalTaxPaid = "Total Tax Paid from Inception";
      this.showDirectAssessment = false;
    }
  }

  getDashboardData() {
    this.apiUrl = `${environment.AUTHAPIURL}dashboard-admin`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {};

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("dashboard" + data.response);
        this.apidata = data.response;
        this.taxpayers = data.response.recent_taxpayers;
        this.corporateTaxpayerType =
          data.response === null
            ? 0
            : data.response.taxpayer_types.corporate_taxpayers?.count;
        this.adminportalTaxpayerType =
          data.response === null
            ? 0
            : data.response.taxpayer_types.admin_portal?.count;
        this.individualTaxpayerType =
          data.response === null
            ? 0
            : data.response.taxpayer_types.individual_taxpayers?.count;
        this.selfportalTaxpayerType =
          data.response === null
            ? 0
            : data.response.taxpayer_types.self_service_portal?.count;

        this.percent = this.corporateTaxpayerType + this.individualTaxpayerType;
        // let corporate = Math.ceil(
        //   (this.corporateTaxpayerType * 100) / this.percent
        // );
        // let adminPortal = Math.ceil(
        //   (this.adminportalTaxpayerType * 100) / this.percent
        // );
        // let selfPortal = Math.ceil(
        //   (this.selfportalTaxpayerType * 100) / this.percent
        // );
        // let individual = Math.ceil(
        //   (this.individualTaxpayerType * 100) / this.percent
        // );

        let corporate = (
          (this.corporateTaxpayerType * 100) /
          this.percent
        ).toFixed(2);
        let adminPortal = (
          (this.adminportalTaxpayerType * 100) /
          this.percent
        ).toFixed(2);
        let selfPortal = (
          (this.selfportalTaxpayerType * 100) /
          this.percent
        ).toFixed(2);
        let individual = (
          (this.individualTaxpayerType * 100) /
          this.percent
        ).toFixed(2);

        this.ind = this.individualTaxpayerType === 0 ? 0 : individual;
        this.cor = this.corporateTaxpayerType === 0 ? 0 : corporate;
        this.adm = this.adminportalTaxpayerType === 0 ? 0 : adminPortal;
        this.sef = this.selfportalTaxpayerType === 0 ? 0 : selfPortal;
        this.totalcor = this.cor + this.sef;
        this.spinnerService.hide();
      });
  }

  taxOfficeChanged(taxOfficeId) {
    this.taxOffice = this.taxTaxOffices.filter(
      (x) => x.id == taxOfficeId
    )[0]?.name;
  }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + "tax-offices";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("taxTaxOffices: ", data);
      this.taxTaxOffices = data.response;
    });
  }

  industryChanged(industryId) {
    this.industry = this.industrySector.filter(
      (x) => x.id == industryId
    )[0].name;
  }

  getIndustrySector() {
    this.apiUrl = environment.AUTHAPIURL + "industry-sectors";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("industrySector: ", data);
      this.industrySector = data.response;
    });
  }

  formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  formatDateLimit(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 4),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  getRevenueStreams(formData) {
    // console.log('formdata = ' + formData.date);
    if (formData.date == "") {
      return;
    }

    this.apiUrl = `${environment.AUTHAPIURL}revenue-streams`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {
      month: formData.date,
      tax_office_id: formData.taxOffice,
    };
    console.log(this.month + "  " + obj.month + "  " + this.today.getMonth());

    let newMonth = parseInt(obj.month.slice(-2));
    if (parseInt(this.month) < newMonth) {
      Swal.fire({
        icon: "info",
        title: "Invalid input",
        text: "You cannot select upcoming months",
        showConfirmButton: true,
        timer: 5000,
        timerProgressBar: true,
      });
    }

    this.spinnerService.show();
    this.revenueStreamTypeChange(true);

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("revenue " + data.response);
        this.spinnerService.hide();

        if (data.status == true) {
          this.paye.length = 0;
          if (
            data.response.paye == null &&
            data.response.direct_assessment == null
          ) {
            this.paye = [];
            console.log("efsdgf empty");
          } else {
            // this.newData = data.response.paye.filter(i => i.name.includes(formData.taxOffice));
            //this.paye[0] = data.response.paye[0].total;
            //this.paye[1] = data.response.direct_assessment[0].total;

            let pye = data.response.paye[0].total;
            let da = data.response.direct_assessment[0].total;
            this.barChartData = [
              { data: [pye, da, 0, 0], label: "Monthly Revenue" },
            ];
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "An error occurred",
            text: data.response[0].message,
            showConfirmButton: true,
            timer: 5000,
            timerProgressBar: true,
          });
        }
        this.revenueStreamTypeChange(true);
      });
  }

  getRevenueStreamsByTaxOffice(formData) {
    console.log("formdata = " + formData.date);
    // this.paye = []

    // this.submitted =  true;
    // if(this.revenueForm.invalid) {
    //   return
    // }
    // this.apiUrl = `${environment.AUTHAPIURL}revenue-streams`;
    this.apiUrl = `${environment.AUTHAPIURL}revenue-streams-tax-office`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {
      month: formData.date,
      // tax_office_id: formData.taxOffice
    };

    this.spinnerService.show();
    this.revenueStreamTypeChange(true);

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("revenue " + data.response);
        this.spinnerService.hide();

        if (data.status == true) {
          this.paye[0] = 0;
          console.log("Test: ", data.response.data);

          if (data.response.data === null || data.response.data.length === 0) {
            this.taxOfficeData.length = 0;
          } else {
            for (let taxOffice of data.response.data) {
              if (taxOffice.tax_office_id == 1 && taxOffice.total) {
                this.taxOfficeData[0] = taxOffice?.total;
              } else if (taxOffice.tax_office_id == 2 && taxOffice.total) {
                this.taxOfficeData[1] = taxOffice?.total;
              } else if (taxOffice.tax_office_id == 3 && taxOffice.total) {
                this.taxOfficeData[2] = taxOffice?.total;
              } else if (taxOffice.tax_office_id == 4 && taxOffice.total) {
                this.taxOfficeData[3] = taxOffice?.total;
              } else if (taxOffice.tax_office_id == 5 && taxOffice.total) {
                this.taxOfficeData[4] = taxOffice?.total;
              } else if (taxOffice.tax_office_id == 6 && taxOffice.total) {
                this.taxOfficeData[5] = taxOffice?.total;
              } else if (taxOffice.tax_office_id == 7 && taxOffice.total) {
                this.taxOfficeData[6] = taxOffice?.total;
              }
            }
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "An error occurred",
            text:
              data.response[0].message != null
                ? data.response[0].message
                : data.message,
            showConfirmButton: true,
            timer: 5000,
            timerProgressBar: true,
          });
        }

        this.revenueStreamTypeChange(true);
      });
  }

  dailyRevenue(formData) {
    this.submitted = true;
    if (this.revenueDailyForm.invalid) {
      return;
    }
    console.log("formate" + formData.date);
    const obj = {
      date: formData.date,
      taxOffice: formData.taxOffice,
    };
    this.getRevenueDaily(obj, false);
  }

  getRevenueDaily(formData, isCallOnInit) {
    this.apiUrl = `${environment.AUTHAPIURL}revenue-daily`;
    this.spinnerService.show();
    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    let date = this.formatDate(formData.date);
    console.log("date of " + date); //this.roleID == "4"

    const obj = {
      start_date: date,
      end_date: date,
      get_monthly_tax_for: this.roleID == "1" ? null : "paye",
      // tax_office_id: formData.taxOffice,
      tax_office_id: isCallOnInit && this.roleID == "1" ? "" : formData.taxOffice,
    };

    if (Date.parse(formData.date) > this.today) {
      this.spinnerService.hide();
      Swal.fire({
        icon: "info",
        title: "Not Good",
        text: "The date cannot be a date after today",
        // text:  data.message,
        showConfirmButton: true,
        timer: 6000,
        timerProgressBar: true,
      });
    } else {
      this.httpClient
        .post<any>(this.apiUrl, obj, { headers: reqHeader })
        .subscribe((data) => {
          console.log("dailyRevenueData: ", data);
          if (data.status == true && data.response.length > 0) {
            this.dailyRevenuedata = data.response.filter(
              (x) => x.name == formData.taxOffice
            );
            console.log("dailtiii " + this.dailyRevenuedata);
            if (data.response.length == 0) {
              this.dailyRevenuedata = null;
            } else {
              this.dailyRevenuedata = data.response;
            }
          } else if (data.status == true && data.response.length === 0) {
            this.dailyRevenuedata = null;
            if (!isCallOnInit == true) {
              this.spinnerService.hide();
              Swal.fire({
                icon: "info",
                title: "Please take note",
                text: "No revenue for the selected date",
                showConfirmButton: true,
                timer: 5000,
                timerProgressBar: true,
              });
            }
          }
          if (Date.parse(formData.date) > this.today) {
            this.dailyRevenuedata = null;
            this.spinnerService.hide();
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "The date cannot be a date after today",
              showConfirmButton: true,
              timer: 5000,
              timerProgressBar: true,
            });
          }

          this.spinnerService.hide();
        });
    }
  }

  getUserAgent() {
    this.apiUrl = `${environment.AUTHAPIURL}user-agent`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });
    let d = new Date();
    let date = this.formatDate(d);
    let lastMonth = new Date();
    lastMonth.setDate(d.getDate() - 30);
    let startDate = this.formatDate(lastMonth);
    const obj = {
      start_date: startDate,
      end_date: date,
    };

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("userAgentData: ", data);
        this.userAgentdata = data.response.data;
        this.spinnerService.hide();
      });
  }

  getTodos() {
    this.apiUrl = `${environment.AUTHAPIURL}todos-list`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      title: "",
    };
    this.todosdata = [];
    this.notDone = [];

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        for (let todo of data.response.data) {
          if (todo.done === 0) {
            this.todosdata.push(todo);
          } else if (todo.done === 1) {
            this.notDone.push(todo);
          }
        }

        console.log("todosApiData: ", this.todosdata);
        console.log("notDone: ", this.notDone);

        this.todosdata = this.todosdata.reverse();
        this.todosdata.sort(function (a, b) {
          var keyA = new Date(a.due_date),
            keyB = new Date(b.due_date);
          // Compare the 2 dates
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        });
        this.todosdata = this.todosdata.concat(this.notDone);
        console.log("todosApiData: ", this.todosdata);

        this.spinnerService.hide();
      });
  }

  getBackgroundColor() {
    let bg = ["bg1", "bg2", "bg3", "bg4"];
    return bg[Math.floor(Math.random() * bg.length)];
  }

  active(modal) {
    // this.getActiveTaxpayers();
    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      size: "lg",
    };
    this.showModal(modal);
  }

  getActiveTaxpayers() {
    this.apiUrl = `${environment.AUTHAPIURL}active-taxpayers`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    let d = new Date();
    let date = this.formatDate(d);
    let lastMonth = new Date();
    lastMonth.setDate(d.getDate() - 30);
    let startDate = this.formatDate(lastMonth);
    const obj = {
      start_date: startDate,
      end_date: date,
    };
    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("activetaxpayersApiData: ", data);
        this.activeTaxpayers = data.response.data;
        if (this.activeTaxpayers.length >= 10) {
          this.activeTaxpayers.length = 10;
        }

        let colors = ["bg1", "bg2", "bg3", "bg4", "bg5", "bg6"];
        this.activeTaxpayers.map((tax) => {
          tax.color = colors[Math.floor(Math.random() * colors.length)];
          return tax;
        });
        this.spinnerService.hide();
      });
  }

  getTrasactionData() {
    this.apiUrl = environment.AUTHAPIURL + "transactions/list";
    const obj = {
      latest: true,
    };
    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("transaction" + data.response);
        this.apiTransactions = data.response.data;
        this.spinnerService.hide();
      });
  }

  submitTodo(formAllData: any) {
    this.submitted = true;
    console.log(" todo date" + formAllData.date);
    if (this.todoForm.invalid) {
      return;
    }
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "todos";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {
      title: formAllData.title,
      priority: formAllData.priority,
      due_date: formAllData.date,
      description: formAllData.description,
    };

    if (Date.parse(formAllData.date) < this.today) {
      this.spinnerService.hide();
      Swal.fire({
        icon: "info",
        title: "Not Good",
        text: "Due date cannot be a day before today",
        // text:  data.message,
        showConfirmButton: true,
        timer: 6000,
        timerProgressBar: true,
      });
    } else {
      this.httpClient
        .post<any>(this.apiUrl, obj, { headers: reqHeader })
        .subscribe((data) => {
          console.log("todo: ", data);
          if (data.status == true) {
            this.spinnerService.hide();

            Swal.fire({
              icon: "success",
              title: "Success",
              text: "To-Do has been created successfully",
              // text:  data.message,
              showConfirmButton: true,
              timer: 5000,
              timerProgressBar: true,
            });

            this.cd.detectChanges();
            this.modalService.dismissAll();
            this.getTodos();
            this.todoForm.reset();
          } else {
            this.spinnerService.hide();

            Swal.fire({
              icon: "error",
              title: "Invalid inputs",
              text:
                data.response[0] != null
                  ? data.response[0].message
                  : data.message,
              showConfirmButton: true,
              timer: 5000,
              timerProgressBar: true,
            });
          }
        });
    }

    this.submitted = false;
  }

  revenueStreamTypeChange(selectedValue) {
    this.show = !this.show;
  }

  paymentMethodChange(selectedValue) {
    // console.log("selectedValue: ", selectedValue);
    if (selectedValue == "") {
      return;
    }
    this.isCallOnInit = false;
    this.getPaymentMethods(this.year, selectedValue, this.isCallOnInit);
    this.apiPieLabel.length = 0;
    this.apiPieValue.length = 0;
  }

  getPaymentMethods(year, month, isCallOnInit) {
    this.apiUrl = `${environment.AUTHAPIURL}payment-channels`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      month: `${year}-${month}`,
    };

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("paymentMethodsApiData: ", data);
        console.log(isCallOnInit);
        if (data.status == true) {
          this.paymentMethodsdata = [];
          this.paymentMethodsdata = data.response.payment_channels;
          if (this.paymentMethodsdata.length > 0) {
            // this.apiPieLabel = [];
            // this.apiPieValue = [];

            for (let eachPie of this.paymentMethodsdata) {
              this.apiPieLabel.push(eachPie.channel);
              //this.apiPieValue.push(" ₦ " + eachPie.total);
              this.apiPieValue.push(eachPie.total);
            }
          } else {
            if (!isCallOnInit == true) {
              console.log(isCallOnInit);
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "No content for the selected month",
                showConfirmButton: true,
                timer: 5000,
                timerProgressBar: true,
              });
            }
            this.message = "No content for the selected month";
          }
        } else if (this.paymentMethodsdata == []) {
          if (!isCallOnInit == true) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No content for the selected month",
              showConfirmButton: true,
              timer: 5000,
              timerProgressBar: true,
            });
          }
          this.message = "No content for the selected month";
        } else {
          if (!isCallOnInit == true) {
            this.spinnerService.hide();
            Swal.fire({
              icon: "error",
              title: "No content",
              text: data.response[0].message,
              showConfirmButton: true,
              timer: 5000,
              timerProgressBar: true,
            });
          }
          this.message = data.response[0].message;
        }

        this.spinnerService.hide();
      });
  }

  getAssetBreakDown() {
    this.apiUrl = `${environment.AUTHAPIURL}asset/shares`;
  
    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {
      // date_start: "2021-01-01",
      // date_end: "2021-08-20"
    }

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
      console.log("assetBreakDownApiData", data);
      
      if (data.status) {
        this.assetBreakDownData = [{ assetType: "Businesses", value: data.response.businesses },
        { assetType: "Lands", value: data.response.lands },
        { assetType: "Buildings", value: data.response.buildings }
        ];

        // pieChartLabels1 = this.apiPieLabel;
        // pieChartData1 = this.apiPieValue;
        console.log("assetBreakDownData", this.assetBreakDownData);
      }

      for (let eachPie of this.assetBreakDownData) {
        this.apiPieLabel1.push(eachPie.assetType);
        this.apiPieValue1.push(eachPie.value);
      }
      
      this.spinnerService.hide();
    });
  }

  getChartData(yearSelected: any, stream) {
    this.apiUrl = environment.AUTHAPIURL + "taxes-paid";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {
      year: yearSelected,
      get_monthly_tax_for: stream,
    };
    this.selectedYear = yearSelected;

    this.spinnerService.show();
    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("chart" + data);
        this.spinnerService.hide();

        if (data.status == true) {
          let objs = data.response.monthly_tax;

          function compare(a, b) {
            if (a.month < b.month) {
              return -1;
            }
            if (a.month > b.month) {
              return 1;
            }
            return 0;
          }

          // alert(0);
          this.apiChart = [];
          objs.sort(compare);
          let taxes = objs;
          console.log("sorted " + taxes);
          if (taxes.length >= 1) {
            // tslint:disable-next-line: forin
            // for (var 0 in taxes) {
            if (taxes[0].month == 1) {
              for (let tax of taxes) {
                this.apiChart.push(tax.total);
              }
            } else if (taxes[0].month == 2) {
              for (let tax of taxes) {
                this.apiChart.push(0, tax.total);
              }
            } else if (taxes[0].month == 3) {
              for (let tax of taxes) {
                this.apiChart.push(0, 0, tax.total);
              }
            } else if (taxes[0].month == 4) {
              for (let tax of taxes) {
                this.apiChart.push(0, 0, 0, tax.total);
              }
            } else if (taxes[0].month == 5) {
              for (let tax of taxes) {
                this.apiChart.push(0, 0, 0, 0, tax.total);
              }
            } else if (taxes[0].month == 6) {
              for (let tax of taxes) {
                this.apiChart.push(0, 0, 0, 0, 0, tax.total);
              }
            } else if (taxes[0].month == 7) {
              for (let tax of taxes) {
                this.apiChart.push(0, 0, 0, 0, 0, 0, tax.total);
              }
            } else if (taxes[0].month == 8) {
              for (let tax of taxes) {
                this.apiChart.push(0, 0, 0, 0, 0, 0, 0, tax.total);
              }
            } else if (taxes[0].month == 9) {
              for (let tax of taxes) {
                this.apiChart.push(0, 0, 0, 0, 0, 0, 0, 0, tax.total);
              }
            } else if (taxes[0].month == 10) {
              for (let tax of taxes) {
                this.apiChart.push(0, 0, 0, 0, 0, 0, 0, 0, 0, tax.total);
              }
            } else if (taxes[0].month == 11) {
              for (let tax of taxes) {
                this.apiChart.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, tax.total);
              }
            } else if (taxes[0].month == 12) {
              for (let tax of taxes) {
                this.apiChart.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, tax.total);
              }
            }
          }

          this.individualChartData = [
            {
              data: this.apiChart,
              label: "Monthly Tax Paid",
            },
          ];
          this.chartData = [{ data: this.apiChart, label: "Monthly Tax Paid" }];
          console.log("ch" + this.apiChart);
        } else {
          Swal.fire({
            icon: "error",
            title: "An error occurred",
            text: data.response[0].message,
            showConfirmButton: true,
            timer: 5000,
            timerProgressBar: true,
          });
        }
      });
  }

  changed(event) {
    if (event.target.checked) {
      this.spinnerService.show();
      this.apiUrl = environment.AUTHAPIURL + "todos/update";

      const reqHeader = new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
      });

      const obj = {
        id: event.target.value,
        done: true,
      };

      this.httpClient
        .post<any>(this.apiUrl, obj, { headers: reqHeader })
        .subscribe((data) => {
          console.log("todo: ", data);
          if (data.status == true) {
            this.spinnerService.hide();
            // this.flashMessage.show(data.response, { cssClass: 'alert-success', timeout: 5000 });
            Swal.fire({
              icon: "success",
              title: "Success",
              text: data.message,
              showConfirmButton: true,
              timer: 5000,
              timerProgressBar: true,
            });
            this.cd.detectChanges();
            this.modalService.dismissAll();
            this.getTodos();
          } else {
            this.spinnerService.hide();
            Swal.fire({
              icon: "error",
              title: "Failed",
              text: data.message,
              showConfirmButton: true,
              timer: 5000,
              timerProgressBar: true,
            });
          }
        });
    } else if (!event.target.checked) {
      this.spinnerService.show();
      this.apiUrl = environment.AUTHAPIURL + "todos/update";

      const reqHeader = new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
      });

      const obj = {
        id: event.target.value,
        done: false,
      };

      this.httpClient
        .post<any>(this.apiUrl, obj, { headers: reqHeader })
        .subscribe((data) => {
          console.log("todo: ", data);
          if (data.status == true) {
            this.spinnerService.hide();
            // this.flashMessage.show(data.response, { cssClass: 'alert-success', timeout: 5000 });
            Swal.fire({
              icon: "success",
              title: "Success",
              text: data.message,
              showConfirmButton: true,
              timer: 5000,
              timerProgressBar: true,
            });
            this.cd.detectChanges();
            this.modalService.dismissAll();
            this.getTodos();
          } else {
            this.spinnerService.hide();
            Swal.fire({
              icon: "error",
              title: "Failed",
              text: data.message,
              showConfirmButton: true,
              timer: 5000,
              timerProgressBar: true,
            });
          }
        });
    }
  }

  showTransactionModal(modal) {
    this.showModal(modal);
    this.getTrasactionData();
  }

  getUserData() {
    this.apiUrl = environment.AUTHAPIURL + "timelines";

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    var obj = {}

    this.spinnerService.show();
    this.httpClient.post<any>(this.apiUrl, obj, { headers: reqHeader }).subscribe((data) => {
        // console.log(data);
        if (data.response?.data.length == 0) {
          this.activities = null;
        } else {
          this.activities = data.response?.data.slice(0, 4);
        }

        this.spinnerService.hide();
      });
  }

  logout() {
    this.sess.logOut();
  }

  refresh() {
    localStorage.setItem("admin_is_reload", "true");
    window.location.reload();
  }

  onChartClick($event) {}

  addTodo(modal) {
    //this.modalOptions.size = "lg";
    this.spinnerService.show();
    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      size: "lg",
    };
    this.showModal(modal);
    this.spinnerService.hide();
  }

  viewAllTodo(modal) {
    //this.modalOptions.size = "xl";
    this.spinnerService.show();
    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      size: "xl",
    };
    this.showModal(modal);
    this.spinnerService.hide();
  }

  viewRevenue(modal) {
    this.showModal(modal);
  }

  getMonthName(monthId: string): string {
    this.sess.getAllMonths();
    var monthName = this.sess.getMonthName(monthId);
    return monthName;
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

  redirectToDirectAssessment() {
    localStorage.setItem("redirect_payment_to_dashboard", "1");
    // this.FDServ.redirectToDirectAssessment();
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

  deleteTodo(ID: any) {
    const obj = {
      ids: [ID],
    };
    console.log("id " + ID);

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.apiUrl = environment.AUTHAPIURL + "todos/delete";

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.value) {
        this.spinnerService.show();
        this.httpClient
          .post<any>(this.apiUrl, obj, { headers: reqHeader })
          .subscribe((data) => {
            if (data.status == true) {
              Swal.fire({
                icon: "success",
                title: "Success",
                text: "To-Do has been successfully deleted!",
                showConfirmButton: true,
                timer: 5000,
              });
              this.getTodos();

              // this.reload();
              this.spinnerService.hide();
              this.modalService.dismissAll();
            } else {
              this.spinnerService.hide();

              Swal.fire({
                icon: "error",
                title: "",
                text: data.message,
                // text:  'An error ocurred while trying to delete Todo!',
                showConfirmButton: true,
                timer: 5000,
              });
            }
          });
      }
    });
  }

  toggleBarChart() {
    this.show = !this.show;

    // CHANGE THE NAME OF THE BUTTON.
    if (this.show) this.buttonName = "Tax Offices";
    else this.buttonName = "Revenue";
  }

  reload() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigate(["./"], { relativeTo: this.route });
  }

  updateDiv() {
    $("#here").load(window.location.href + " #here");
  }

  dateValidator(control: FormControl): { [s: string]: boolean } {
    if (control.value) {
      const date = moment(control.value);
      const today = moment();
      if (date.isBefore(today)) {
        return { invalidDate: true };
      }
    }
    return null;
  }
}

// function compare( a, b ) {
//   if ( a.month < b.month ){
//     return -1;
//   }
//   if ( a.month > b.month ){
//     return 1;
//   }
//   return 0;
// }

// objs.sort( compare )
// let taxes = objs;
// console.log('sorted ' + taxes)
// if (taxes.length >= 1)  {

//   // alert(0);
//   if (taxes[0].month == 1) {
//     for (let tax of taxes ) {
//        this.revenueBars.push(tax.total);

//     }
//   } else if (taxes[0].month == 2) {
//     for (let tax of taxes ) {
//       this.revenueBars.push(0, tax.total);

//     }
//   }  else if (taxes[0].month == 3) {
//     for (let tax of taxes ) {
//       this.revenueBars.push(0, 0, tax.total);

//     }
//   }  else if (taxes[0].month == 4) {
//     for (let tax of taxes ) {
//        this.revenueBars.push(0, 0, 0, tax.total);

//     }
//   }  else if (taxes[0].month == 5) {
//     for (let tax of taxes ) {
//       this.revenueBars.push(0, 0, 0, 0, tax.total);

//     }
//   }  else if (taxes[0].month == 6) {
//     for (let tax of taxes ) {
//       this.revenueBars.push(0, 0, 0, 0, 0, tax.total);

//     }
//   }  else if (taxes[0].month == 7) {
//     for (let tax of taxes ) {
//       this.revenueBars.push(0, 0, 0, 0, 0, 0, tax.total);

//     }
//   }  else if (taxes[0].month == 8) {
//     for (let tax of taxes ) {
//       this.revenueBars.push(0, 0, 0, 0, 0, 0, 0, tax.total);

//     }
//   }  else if (taxes[0].month == 9) {
//     for (let tax of taxes ) {
//       this.revenueBars.push(0, 0, 0, 0, 0, 0, 0, 0, tax.total);

//     }
//   }  else if (taxes[0].month == 10) {
//     for (let tax of taxes ) {
//       this.revenueBars.push(0, 0, 0, 0, 0, 0, 0, 0, 0, tax.total);

//     }
//   }  else if (taxes[0].month == 11) {
//     for (let tax of taxes ) {
//       this.revenueBars.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, tax.total);

//     }
//   }  else if (taxes[0].month == 12) {
//     for (let tax of taxes ) {
//       this.revenueBars.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, tax.total);

//     }
//   }

// }

// console.log('ch' + this.revenueBars);
