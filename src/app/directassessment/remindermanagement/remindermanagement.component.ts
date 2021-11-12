import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SessionService } from "src/app/session.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-remindermanagement",
  templateUrl: "./remindermanagement.component.html",
  styleUrls: ["./remindermanagement.component.scss"],
})
export class RemindermanagementComponent implements OnInit {
  submitted: boolean;
  apiUrl: string;
  declarationData: any;
  modalOptions: NgbModalOptions;
  closeResult: string;
  dtOptions: any = {};
  roleID: any;
  reminderData: any;
  reminderForm: FormGroup;
  userId: string;
  showEditor: boolean;
  apiResponseMessage: any;
  reminder: any;
  emailHtml: any;
  detailReminderType: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private sess: SessionService,
    private modalService: NgbModal,
    private httpClient: HttpClient,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  ngOnInit() {
    this.roleID = localStorage.getItem("admin_role_id");
    if (this.roleID == 3) {
      this.showEditor = true;
    }
    this.getReminders();

    this.modalOptions = {
      backdrop: true,
      centered: true,
      backdropClass: "customBackdrop",
      // size: 'lg'
      size: "xl",
    };

    this.dtOptions = {
      paging: true,
      scrollX: true,
      pagingType: "full_numbers",
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
          searchable: false,
        },
      ],
    };

    this.initialiseForms();
  }
  initialiseForms() {
    this.reminderForm = this.formBuilder.group({
      id: ["", Validators.required],
      taxpayerName: ["", [Validators.required]],
      taxpayerId: ["", Validators.required],

      reminderType: ["", [Validators.required]],
      dateSent: ["", [Validators.required]],
      recipientEmail: ["", Validators.required],
      revenueStream: ["", Validators.required],
      deliveryStatus: ["", Validators.required],
      emailContent: ["", [Validators.required]],
      numberOfTimeSent: ["", [Validators.required]],
    });
  }

  loadForms(reminder) {
    const status =
      reminder.delivery_status === 0 ? "Not Delivered" : "Delivered";
    const stream = reminder.revenue_stream === 3 ? "Direct assessment" : "PAYE";

    this.reminderForm = this.formBuilder.group({
      id: [reminder.id, [Validators.required]],
      taxpayerName: [reminder.taxpayer_name, [Validators.required]],
      taxpayerId: [reminder.taxpayer_id, Validators.required],

      reminderType: [reminder.reminder_type, [Validators.required]],
      dateSent: [reminder.date_sent, [Validators.required]],
      recipientEmail: [reminder.reciepient_email, Validators.required],
      revenueStream: [stream, Validators.required],
      deliveryStatus: [status, Validators.required],
      //emailContent: [reminder.email_template, [Validators.required]],
      numberOfTimeSent: [reminder.no_of_times_sent, [Validators.required]],
    });

    var myEmail = reminder.email_template;
    // create a new dov container
    var div = document.createElement("div");
    // assing your HTML to div's innerHTML
    div.innerHTML = myEmail;
    // get all <a> elements from div
    var elements = div.getElementsByTagName("title");

    // remove all <a> elements
    while (elements[0]) elements[0].parentNode.removeChild(elements[0]);

    // get div's innerHTML into a new variable
    var repl = div.innerHTML;
    this.emailHtml = repl;

    this.detailReminderType = reminder.reminder_type;
  }

  getReminders() {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "reminder";

    const obj = { per_page: 700, page_no: 1 };
    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("reminder ", data);
        this.reminderData = data.response == null ? [] : data.response.data;
        this.apiResponseMessage = data.message;

        this.spinnerService.hide();
      });
  }

  getReminderById(id) {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + "reminder/" + id;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient
      .get<any>(this.apiUrl, { headers: reqHeader })
      .subscribe((data) => {
        console.log("reminder ", data);
        this.reminder = data.response == null ? [] : data.response;
        this.loadForms(this.reminder);
        this.spinnerService.hide();
      });
  }

  onSubmit(formData) {
    this.spinnerService.show();
    this.apiUrl =
      environment.AUTHAPIURL + "reminder/resend-reminder-email/" + formData.id;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    const obj = {};

    this.httpClient
      .post<any>(this.apiUrl, obj, { headers: reqHeader })
      .subscribe((data) => {
        console.log("reminder:::: ", data);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message,
          showConfirmButton: true,
          timer: 5000,
        });

        this.spinnerService.hide();
      });
  }

  viewReminder(modal, data) {
    this.getReminderById(data.id);
    this.showModal(modal);
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

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }
}
