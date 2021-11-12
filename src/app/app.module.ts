import { FiledeclarationComponent } from "./directassessment/filedeclaration/filedeclaration.component";
import { BrowserModule, Title } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HeaderComponent } from "./__inc/header/header.component";
import { SidebarComponent } from "./__inc/sidebar/sidebar.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { FooterComponent } from "./__inc/footer/footer.component";
import { HttpClientModule } from "@angular/common/http";
import { NgxPaginationModule } from "ngx-pagination";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { EditComponent } from "./users/edit/edit.component";
import { DeleteComponent } from "./paye/delete/delete.component";
import { LoginComponent } from "./auth/login/login.component";
import { PagenotfoundComponent } from "./pagenotfound/pagenotfound.component";
import { SessionService } from "./session.service";
import { LogoutComponent } from "./auth/logout/logout.component";
import { BnNgIdleService } from "bn-ng-idle"; // import bn-ng-idle service for session
import { RecaptchaModule } from "ng-recaptcha";
import { FlashMessagesModule } from "angular2-flash-messages";
import { Ng4LoadingSpinnerModule } from "ng4-loading-spinner";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DataTablesModule } from "angular-datatables";
import { AdduserComponent } from "./users/adduser/adduser.component";
import { DisplayuserComponent } from "./paye/displayuser/displayuser.component";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import {
  DatePipe,
  HashLocationStrategy,
  LocationStrategy,
} from "@angular/common";
import { ChangepasswordComponent } from "./auth/changepassword/changepassword.component";

import { FaqComponent } from "./website/faq/faq.component";
import { AllcasesComponent } from "./paye/allcases/allcases.component";

import { MatNativeDateModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SatNativeDateModule, SatDatepickerModule } from "saturn-datepicker";
import { UseractivitiesComponent } from "./auth/useractivities/useractivities.component";
import { NotificationComponent } from "./paye/notification/notification.component";
import { ForgotpasswordComponent } from "./auth/forgotpassword/forgotpassword.component";
import { VerifyotpComponent } from "./auth/verifyotp/verifyotp.component";
import { ResetpasswordComponent } from "./auth/resetpassword/resetpassword.component";
import {
  MatMomentDateModule,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import { SignupComponent } from "./auth/signup/signup.component";
import { EmployeescheduleComponent } from "./paye/monthlyremittance/employeeschedule/employeeschedule.component";
import { AddemployeeComponent } from "./paye/monthlyremittance/addemployee/addemployee.component";
import { UploademployeeComponent } from "./paye/monthlyremittance/uploademployee/uploademployee.component";
import { MyprofileComponent } from "./myprofile/myprofile.component";
import { CompanyprofileComponent } from "./profile/companyprofile/companyprofile.component";
import { AnnualprojectionlistComponent } from "./paye/annual projecction/annualprojectionlist/annualprojectionlist.component";
import { SchedulesComponent } from "./paye/monthlyremittance/schedules/schedules.component";
import { AssessmentsComponent } from "./paye/monthlyremittance/assessments/assessments.component";
import { UploadprojectionComponent } from "./paye/annual projecction/uploadprojection/uploadprojection.component";
import { ApprovedprojectionComponent } from "./paye/annual projecction/approvedprojection/approvedprojection.component";
import { AnnualreturnsComponent } from "./paye/annualreturns/annualreturns/annualreturns.component";
import { AnnualreturnschedulesComponent } from "./paye/annualreturns/annualreturnschedules/annualreturnschedules.component";
import { AnnualreturnassessmentsComponent } from "./paye/annualreturns/annualreturnassessments/annualreturnassessments.component";
// tslint:disable-next-line:max-line-length
import { AnnualreturnemployeesuploadComponent } from "./paye/annualreturns/annualreturnemployeesupload/annualreturnemployeesupload.component";
import { ReassessmentsComponent } from "./paye/annualreturns/reassessments/reassessments.component";
import { ReassessmentappealsComponent } from "./paye/annualreturns/reassessmentappeals/reassessmentappeals.component";
import { PendingprojectionComponent } from "./paye/annual projecction/pendingprojection/pendingprojection.component";
import { DeletedemployeesComponent } from "./profile/deletedemployees/deletedemployees.component";
import { PaymenthistoryComponent } from "./paye/reports/paymenthistory/paymenthistory.component";
import { ContactusComponent } from "./website/contactus/contactus.component";
import { HomeComponent } from "./website/home/home.component";
import { NgxPrintModule } from "ngx-print";
import { AdminusersComponent } from "./paye/adminusers/adminusers.component";
import { AddcorporateComponent } from "./paye/addcorporate/addcorporate.component";
import { CorporatesComponent } from "./paye/corporates/corporates.component";
import { BulkcorporateuploadComponent } from "./paye/bulkcorporateupload/bulkcorporateupload.component";
import { OthercorporatesComponent } from "./paye/reports/othercorporates/othercorporates.component";
import { ViewreportsComponent } from "./paye/reports/viewreports/viewreports.component";
import { AssessmentreportsComponent } from "./paye/reports/assessmentreports/assessmentreports.component";
import { ReassessmentreportsComponent } from "./paye/reports/reassessmentreports/reassessmentreports.component";
import { AnnualassessmentreportsComponent } from "./paye/reports/annualassessmentreports/annualassessmentreports.component";
import { ProjectionreportsComponent } from "./paye/reports/projectionreports/projectionreports.component";
import { ChartsModule } from "ng2-charts";
import { Daterangepicker } from "ng2-daterangepicker";
import { ActivitylogComponent } from "./paye/activitylog/activitylog.component";
import { PaidinvoicesComponent } from "./paye/Invoices/paidinvoices/paidinvoices.component";
import { UnpaidinvoicesComponent } from "./paye/Invoices/unpaidinvoices/unpaidinvoices.component";
import { CorporatetaxpayerreportsComponent } from "./paye/reports/corporatetaxpayerreports/corporatetaxpayerreports.component";
import { DeclarationsComponent } from "./directassessment/declarations/declarations.component";
import { RemindermanagementComponent } from "./directassessment/remindermanagement/remindermanagement.component";
import { IndividualsComponent } from "./directassessment/individuals/individuals.component";
import { IndividualschedulesComponent } from "./directassessment/individualschedules/individualschedules.component";
import { AnnualassessmentComponent } from "./directassessment/report/annualassessment/annualassessment.component";
import { DapaymenthistoryComponent } from "./directassessment/report/dapaymenthistory/dapaymenthistory.component";
import { IndividualtaxpayersComponent } from "./directassessment/report/individualtaxpayers/individualtaxpayers.component";
import { IndividualassessmentsComponent } from './directassessment/individualassessments/individualassessments.component';
import { IndividualappealsComponent } from './directassessment/individualappeals/individualappeals.component';
import { ReminderserverpageingComponent } from './directassessment/reminderserverpageing/reminderserverpageing.component';
// import { AddBusinessComponent } from './add-business/add-business.component';
import { AddbusinessComponent } from './addbusiness/addbusiness.component';
import { AddlandComponent } from './addland/addland.component';
import { AddbuildingComponent } from './addbuilding/addbuilding.component';
import { LandsComponent } from './assets/lands/lands.component';
import { BuildingsComponent } from './assets/buildings/buildings.component';
import { BusinessesComponent } from './assets/businesses/businesses.component';
import { AddindividualComponent } from './paye/addindividual/addindividual.component';
import { LinktaxpayerComponent } from './assets/linktaxpayer/linktaxpayer.component';
import { WalletComponent } from './wallet/wallet.component';
import { GeneratewhtassessmentComponent } from './withholdingtax/generatewhtassessment/generatewhtassessment.component';
import { WhtassessmentsComponent } from './withholdingtax/whtassessments/whtassessments.component';
import { WhtobjectionsComponent } from './withholdingtax/whtobjections/whtobjections.component';
import { WhtpaymenthistoryComponent } from './withholdingtax/whtpaymenthistory/whtpaymenthistory.component';
import { WhtassessmentsreportComponent } from './withholdingtax/whtassessmentsreport/whtassessmentsreport.component';
import { GeneratestampassessmentComponent } from './stampduty/generatestampassessment/generatestampassessment.component';
import { StampassessmentsComponent } from './stampduty/stampassessments/stampassessments.component';
import { StampobjectionsComponent } from './stampduty/stampobjections/stampobjections.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    DashboardComponent,
    FooterComponent,
    EditComponent,
    DeleteComponent,
    DeletedemployeesComponent,
    LoginComponent,
    SignupComponent,
    EmployeescheduleComponent,
    AddemployeeComponent,
    PagenotfoundComponent,
    LogoutComponent,
    AdduserComponent,
    UseractivitiesComponent,
    DisplayuserComponent,
    ChangepasswordComponent,

    CompanyprofileComponent,
    IndividualtaxpayersComponent,
    AnnualprojectionlistComponent,
    DapaymenthistoryComponent,
    AnnualassessmentComponent,
    UploadprojectionComponent,
    PendingprojectionComponent,
    ApprovedprojectionComponent,
    FaqComponent,
    MyprofileComponent,
    AllcasesComponent,
    NotificationComponent,
    ForgotpasswordComponent,
    VerifyotpComponent,
    ResetpasswordComponent,
    RemindermanagementComponent,
    FiledeclarationComponent,
    DeclarationsComponent,
    AddemployeeComponent,
    UploademployeeComponent,
    SchedulesComponent,
    AssessmentsComponent,
    AnnualreturnsComponent,
    AnnualreturnschedulesComponent,
    AnnualreturnassessmentsComponent,
    AnnualreturnemployeesuploadComponent,
    ReassessmentsComponent,
    ReassessmentappealsComponent,
    PaymenthistoryComponent,
    ContactusComponent,
    HomeComponent,
    AdminusersComponent,
    AddcorporateComponent,
    CorporatesComponent,
    BulkcorporateuploadComponent,
    OthercorporatesComponent,
    ViewreportsComponent,
    AssessmentreportsComponent,
    ReassessmentreportsComponent,
    AnnualassessmentreportsComponent,
    ProjectionreportsComponent,
    UseractivitiesComponent,
    ActivitylogComponent,
    CorporatetaxpayerreportsComponent,
    PaidinvoicesComponent,
    IndividualsComponent,
    UnpaidinvoicesComponent,
    IndividualschedulesComponent,
    IndividualassessmentsComponent,
    IndividualappealsComponent,
    ReminderserverpageingComponent,
    // AddBusinessComponent,
    AddbusinessComponent,
    AddlandComponent,
    AddbuildingComponent,
    LandsComponent,
    BuildingsComponent,
    BusinessesComponent,
    AddindividualComponent,
    LinktaxpayerComponent,
    WalletComponent,
    GeneratewhtassessmentComponent,
    WhtassessmentsComponent,
    WhtobjectionsComponent,
    WhtpaymenthistoryComponent,
    WhtassessmentsreportComponent,
    GeneratestampassessmentComponent,
    StampassessmentsComponent,
    StampobjectionsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RecaptchaModule,
    FlashMessagesModule.forRoot(),
    Ng4LoadingSpinnerModule.forRoot(),
    NgbModule,
    DataTablesModule,
    SweetAlert2Module.forRoot(),
    MatDatepickerModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    SatNativeDateModule,
    SatDatepickerModule,
    MatMomentDateModule,
    NgxPrintModule,
    ChartsModule,
    Daterangepicker,
  ],
  // tslint:disable-next-line: max-line-length
  providers: [
    SessionService,
    BnNgIdleService,
    DatePipe,
    Title,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}
