import { ForgotpasswordComponent } from "./auth/forgotpassword/forgotpassword.component";
import { UseractivitiesComponent } from "./auth/useractivities/useractivities.component";
import { FaqComponent } from "./website/faq/faq.component";

import { LogoutComponent } from "./auth/logout/logout.component";
import { PagenotfoundComponent } from "./pagenotfound/pagenotfound.component";
import { LoginComponent } from "./auth/login/login.component";
import { DeleteComponent } from "./paye/delete/delete.component";
import { EditComponent } from "./users/edit/edit.component";

import { DashboardComponent } from "./dashboard/dashboard.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AdduserComponent } from "./users/adduser/adduser.component";
import { DisplayuserComponent } from "./paye/displayuser/displayuser.component";
import { ChangepasswordComponent } from "./auth/changepassword/changepassword.component";

import { AllcasesComponent } from "./paye/allcases/allcases.component";
import { NotificationComponent } from "./paye/notification/notification.component";
import { VerifyotpComponent } from "./auth/verifyotp/verifyotp.component";
import { ResetpasswordComponent } from "./auth/resetpassword/resetpassword.component";

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
import { AnnualreturnemployeesuploadComponent } from "./paye/annualreturns/annualreturnemployeesupload/annualreturnemployeesupload.component";
import { ReassessmentappealsComponent } from "./paye/annualreturns/reassessmentappeals/reassessmentappeals.component";
import { ReassessmentsComponent } from "./paye/annualreturns/reassessments/reassessments.component";
import { PendingprojectionComponent } from "./paye/annual projecction/pendingprojection/pendingprojection.component";
import { DeletedemployeesComponent } from "./profile/deletedemployees/deletedemployees.component";
import { PaymenthistoryComponent } from "./paye/reports/paymenthistory/paymenthistory.component";
import { ContactusComponent } from "./website/contactus/contactus.component";
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
import { ActivitylogComponent } from "./paye/activitylog/activitylog.component";
import { PaidinvoicesComponent } from "./paye/Invoices/paidinvoices/paidinvoices.component";
import { UnpaidinvoicesComponent } from "./paye/Invoices/unpaidinvoices/unpaidinvoices.component";
import { CorporatetaxpayerreportsComponent } from "./paye/reports/corporatetaxpayerreports/corporatetaxpayerreports.component";
import { FiledeclarationComponent } from "./directassessment/filedeclaration/filedeclaration.component";
import { DeclarationsComponent } from "./directassessment/declarations/declarations.component";
import { RemindermanagementComponent } from "./directassessment/remindermanagement/remindermanagement.component";
import { IndividualsComponent } from "./directassessment/individuals/individuals.component";
import { IndividualschedulesComponent } from "./directassessment/individualschedules/individualschedules.component";
import { AnnualassessmentComponent } from "./directassessment/report/annualassessment/annualassessment.component";
import { DapaymenthistoryComponent } from "./directassessment/report/dapaymenthistory/dapaymenthistory.component";
import { IndividualtaxpayersComponent } from "./directassessment/report/individualtaxpayers/individualtaxpayers.component";
import { IndividualassessmentsComponent } from "./directassessment/individualassessments/individualassessments.component";
import { IndividualappealsComponent } from "./directassessment/individualappeals/individualappeals.component";
import { ReminderserverpageingComponent } from "./directassessment/reminderserverpageing/reminderserverpageing.component";
import { BuildingsComponent } from "./assets/buildings/buildings.component";
import { LandsComponent } from "./assets/lands/lands.component";
import { BusinessesComponent } from "./assets/businesses/businesses.component";
import { GeneratewhtassessmentComponent } from './withholdingtax/generatewhtassessment/generatewhtassessment.component';
import { WhtassessmentsComponent } from './withholdingtax/whtassessments/whtassessments.component';
import { WhtobjectionsComponent } from './withholdingtax/whtobjections/whtobjections.component';
import { WhtpaymenthistoryComponent } from './withholdingtax/whtpaymenthistory/whtpaymenthistory.component';
import { WhtassessmentsreportComponent } from './withholdingtax/whtassessmentsreport/whtassessmentsreport.component';
import { GeneratestampassessmentComponent } from './stampduty/generatestampassessment/generatestampassessment.component';
import { StampassessmentsComponent } from './stampduty/stampassessments/stampassessments.component';
import { StampobjectionsComponent } from './stampduty/stampobjections/stampobjections.component';

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent, children: [] },
  {
    path: "useractivities",
    component: UseractivitiesComponent,
    data: { title: "Activity Logs" },
  },
  {
    path: "diplayuser",
    component: DisplayuserComponent,
  },
  {
    path: "adduser",
    component: AdduserComponent,
  },
  { path: "edit/:id", component: EditComponent },
  { path: "delete/:id", component: DeleteComponent },

  { path: "login", component: LoginComponent },
  //{path: 'signup', component: SignupComponent},
  { path: "logout", component: LogoutComponent },
  { path: "forgotpassword", component: ForgotpasswordComponent },
  { path: "resetpassword", component: ResetpasswordComponent },
  { path: "paymenthistory", component: PaymenthistoryComponent },
  { path: "deletedemployees", component: DeletedemployeesComponent },

  { path: "filedeclaration", component: FiledeclarationComponent },
  { path: "declarations", component: DeclarationsComponent },
  { path: "annualassessment", component: AnnualassessmentComponent },
  { path: "da-paymenthistory", component: DapaymenthistoryComponent },
  { path: "individualtaxpayers", component: IndividualtaxpayersComponent },

  { path: "companyprofile/:id", component: CompanyprofileComponent },

  { path: "myprofile/:id", component: MyprofileComponent },
  { path: "displayuser", component: DisplayuserComponent },
  { path: "projectionlist", component: AnnualprojectionlistComponent },
  { path: "approvedprojection", component: ApprovedprojectionComponent },
  { path: "pendingprojection", component: PendingprojectionComponent },
  { path: "uploadprojection", component: UploadprojectionComponent },
  { path: "changepassword", component: ChangepasswordComponent },

  { path: "faq", component: FaqComponent },
  { path: "contactus", component: ContactusComponent },
  // {path: 'allcases', component: AllcasesComponent},
  { path: "notification", component: NotificationComponent },
  { path: "verifyotp", component: VerifyotpComponent },
  { path: "employeeschedule", component: EmployeescheduleComponent },
  { path: "addemployee", component: AddemployeeComponent },
  { path: "bulkemployee", component: UploademployeeComponent },
  { path: "schedules", component: SchedulesComponent },
  { path: "assessments", component: AssessmentsComponent },
  { path: "annualreturns", component: AnnualreturnsComponent },
  { path: "annualreturnschedules", component: AnnualreturnschedulesComponent },
  {
    path: "annualreturnassessments",
    component: AnnualreturnassessmentsComponent,
  },
  {
    path: "annualreturnemployeesupload",
    component: AnnualreturnemployeesuploadComponent,
  },
  { path: "reassessments", component: ReassessmentsComponent },
  { path: "reassessmentappeals", component: ReassessmentappealsComponent },
  { path: "adminusers", component: AdminusersComponent },
  { path: "addcorporate", component: AddcorporateComponent },
  { path: "corporates", component: CorporatesComponent },
  { path: "bulkcorporateupload", component: BulkcorporateuploadComponent },
  { path: "othercorporates", component: OthercorporatesComponent },
  { path: "viewreports", component: ViewreportsComponent },
  { path: "assessmentreports", component: AssessmentreportsComponent },
  { path: "reassessmentreports", component: ReassessmentreportsComponent },
  {
    path: "annualassessmentreports",
    component: AnnualassessmentreportsComponent,
  },
  { path: "projectionreports", component: ProjectionreportsComponent },
  { path: "activitylog", component: ActivitylogComponent },
  { path: "paidinvoices", component: PaidinvoicesComponent },
  { path: "unpaidinvoices", component: UnpaidinvoicesComponent },
  { path: "corporatereport", component: CorporatetaxpayerreportsComponent },
  { path: "individuals", component: IndividualsComponent },
  { path: "individualschedules", component: IndividualschedulesComponent },
  { path: "individualassessments", component: IndividualassessmentsComponent },
  { path: "individualappeals", component: IndividualappealsComponent },
  { path: "remindermanagement", component: ReminderserverpageingComponent },
  { path: "remindermanagement-client", component: RemindermanagementComponent },

  { path: "businesses", component: BusinessesComponent },
  { path: "buildings", component: BuildingsComponent },
  { path: "lands", component: LandsComponent },

  { path: "generatewhtassessment", component: GeneratewhtassessmentComponent },
  { path: "whtassessments", component: WhtassessmentsComponent },
  { path: "whtobjections", component: WhtobjectionsComponent },
  { path: "whtpaymenthistory", component: WhtpaymenthistoryComponent },
  { path: "whtassessmentsreport", component: WhtassessmentsreportComponent },

  { path: "generatestampassessment", component: GeneratestampassessmentComponent },
  { path: "stampassessments", component: StampassessmentsComponent },
  { path: "stampobjections", component: StampobjectionsComponent },

  { path: "**", component: PagenotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
