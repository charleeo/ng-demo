import { Injectable } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
// import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  modalOptions: NgbModalOptions;
  closeResult: string;
  modalRef: any;
  apiUrl: string;
  taxTaxOffices: any;
  // private httpClient: HttpClientstateLocalGovts: any;
  stateLocalGovts: any;
  taxpayerRoles: any;
// ,
  
  constructor(
    private modalService: NgbModal,
    private httpClient: HttpClient,) 
    { 
      this.modalOptions = {
        backdrop: true,
        centered: true,
        backdropClass: "customBackdrop",
        size: "xl",
      };

      
    }

  calculateGrossIncome(addEmployeeForm: any) {
    // console.log("testForm: ", addEmployeeForm.get('lifeAssurance').value);
    let nhis = Number(addEmployeeForm.get('NHIS').value);
    let nhf = Number(addEmployeeForm.get('NHF').value);
    let pension = Number(addEmployeeForm.get('pension').value);
    let totalIncome = Number(addEmployeeForm.get('totalIncome').value);

    let lifeAssurance = Number(addEmployeeForm.get('lifeAssurance').value);

    let grossIncome = totalIncome - (pension + nhis + nhf + lifeAssurance);
    addEmployeeForm.controls['grossIncome'].setValue(grossIncome);
    
    // check if gross income is correct
    let grossIncomeIncorrect;
    grossIncome <= 0 ? grossIncomeIncorrect = true : grossIncomeIncorrect = false;

    // calculate CRA
    let cra = (grossIncome * 0.2) + 16666.667;
    let cra1 = (grossIncome * 0.2) + (0.01 * grossIncome);

    let approxCra = Math.round((cra + Number.EPSILON) * 100) / 100;
    let approxCra1 = Math.round((cra1 + Number.EPSILON) * 100) / 100;

    if (approxCra > approxCra1) {
      addEmployeeForm.controls['CRA'].setValue(approxCra);
    }
    else {
      addEmployeeForm.controls['CRA'].setValue(approxCra1);
    }

    return grossIncomeIncorrect;
  }

  calculateTotalIncomeDA(declarationForm: any) {
    let bi = Number(declarationForm.get('businessIncome').value);
    let ei = Number(declarationForm.get('employmentIncome').value);
    let cf = Number(declarationForm.get('professionalFee').value);
    let oi = Number(declarationForm.get('otherIncome').value);
    let df = Number(declarationForm.get('directorFees').value);

    let bk = Number(declarationForm.get('benefit').value);
    let tb = Number(declarationForm.get('terminalBonus').value);
    let co = Number(declarationForm.get('contract').value);
    let al = Number(declarationForm.get('allowance').value);
    let ps = Number(declarationForm.get('profitSharing').value);

    let cm = Number(declarationForm.get('commission').value);
    let int = Number(declarationForm.get('interest').value);
    let ro = Number(declarationForm.get('royalty').value);
    let re = Number(declarationForm.get('rent').value);
    let bc = Number(declarationForm.get('balancingCharge').value);

    let totalIncome = bi + ei + cf + oi + df + bk + tb + co + al + ps + cm + int + ro + re + bc;
    declarationForm.controls['totalIncome'].setValue(totalIncome);

  }

  calculateGrossIncomeDA(reliefForm: any, declarationForm: any) {
    let nhis = Number(reliefForm.get('nhis').value);
    let nhf = Number(reliefForm.get('nhf').value);
    let la = Number(reliefForm.get('lifeAssurance').value);
    let pension = Number(reliefForm.get('nps').value);
    let totalIncome = Number(declarationForm.get('totalIncome').value);

   
    let grossIncome = totalIncome - (pension + nhis + nhf + la);
    reliefForm.controls['grossIncome'].setValue(grossIncome);
    
    // check if gross income is correct
    let grossIncomeIncorrectDA;
    grossIncome <= 0 ? grossIncomeIncorrectDA = true : grossIncomeIncorrectDA = false;

    // calculate CRA
    let cra = (grossIncome * 0.2) + 200000;
    let cra1 = (grossIncome * 0.21);
    let approxCra = Math.round((cra + Number.EPSILON) * 100) / 100;
    let approxCra1 = Math.round((cra1 + Number.EPSILON) * 100) / 100;

    if (approxCra > approxCra1) {
      reliefForm.controls['consolidateRelief'].setValue(approxCra);
    }
    else {
      reliefForm.controls['consolidateRelief'].setValue(approxCra1);
    }

    return grossIncomeIncorrectDA;
  }

  calculateAmountTaxDue(totalIncome: number) {
    // let totalIncome = Number(reassessmentForm.get('estimatedTotalIncome').value);
    let grossIncome = totalIncome - 0 ; // totalIncome equals grossIncome

    let cra = (grossIncome * 0.2) + 200000;
    let cra1 = grossIncome * 0.21;
    let taxableIncome = 0; let amountTaxDue = 0; let taxableIncomeNet = 0;

    if (cra > cra1) {
      taxableIncome = totalIncome - cra;
    }
    else {
      taxableIncome = totalIncome - cra1;
    }

    console.log("taxableIncome: ", taxableIncome);
    
    if (taxableIncome > 0) {
      amountTaxDue += 300000 * 0.07;
      taxableIncomeNet = taxableIncome - 300000;
    }

    if (taxableIncomeNet > 0) {
      if (taxableIncomeNet - 300000 < 0) {
        amountTaxDue += taxableIncomeNet * 0.11;
      }
      else{
        amountTaxDue += 300000 * 0.11;
      }

      taxableIncomeNet = taxableIncomeNet - 300000;
    }

    if (taxableIncomeNet > 0) {
      if (taxableIncomeNet - 500000 < 0) {
        amountTaxDue += taxableIncomeNet * 0.15;
      }
      else {
        amountTaxDue += 500000 * 0.15;
      }

      taxableIncomeNet = taxableIncomeNet - 500000;
    }

    if (taxableIncomeNet > 0) {
      if (taxableIncomeNet - 500000 < 0) {
        amountTaxDue += taxableIncomeNet * 0.19;
      }
      else {
        amountTaxDue += 500000 * 0.19;
      }

      taxableIncomeNet = taxableIncomeNet - 500000;
    }

    if (taxableIncomeNet > 0) {
      if (taxableIncomeNet - 1600000 < 0) {
        amountTaxDue += taxableIncomeNet * 0.21;
      }
      else {
        amountTaxDue += 1600000 * 0.21;
      }
       
      taxableIncomeNet = taxableIncomeNet - 1600000;
    }

    if (taxableIncomeNet > 0) {
      // console.log("amountTaxDue5: ", amountTaxDue);
      amountTaxDue += taxableIncomeNet * 0.24;
    }

    let amountTaxDue1 =  totalIncome * 0.01;
    amountTaxDue = this.roundUpToTwoDecimalPlaces(amountTaxDue);
    amountTaxDue1 = this.roundUpToTwoDecimalPlaces(amountTaxDue1);

    if (amountTaxDue > amountTaxDue1) {
      // reassessmentForm.controls['annualTaxDue'].setValue(amountTaxDue);
      return amountTaxDue;
    }
    else {
      // reassessmentForm.controls['annualTaxDue'].setValue(amountTaxDue1);
      return amountTaxDue1;
    }
  } 


  getStateLocalGovts() {
    let test;
    this.apiUrl = environment.AUTHAPIURL + "postalcodes";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("stateLocalGovts: ", data);
      this.stateLocalGovts = data.response;
      test = data;
      console.log("stateLocalGovts4: ", test.response);
      return test.response;
    });
    
  }

  roundUpToTwoDecimalPlaces(value) {
    let test = Math.round((value + Number.EPSILON) * 100) / 100;
    return test;
  }

  getTaxOfficeById(taxOfficeId) {
    if (taxOfficeId == null) {
      return "NOT UNDER ANY TAX OFFICE";
    }

    this.getTaxOffices();
    var taxOffice = this.taxTaxOffices?.filter((x) => x.id == taxOfficeId)[0]?.name;
    return taxOffice;
  }

  getTaxOffices() {
    this.apiUrl = environment.AUTHAPIURL + "tax-offices";

    this.httpClient.get<any>(this.apiUrl).subscribe((data) => {
      console.log("taxTaxOffices11: ", data);
      this.taxTaxOffices = data.response;
    });
  }

  getTaxpayerRoles(requestObj) : any {
    this.apiUrl = `${environment.AUTHAPIURL}asset-taxpayer/relations`;

    const reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("admin_access_token"),
    });

    this.httpClient.post<any>(this.apiUrl, requestObj, { headers: reqHeader }).subscribe((data) => {
      this.taxpayerRoles = data.response;
      return this.taxpayerRoles;
      // console.log("taxpayerRoles: ", data);
    });
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

  closeAllModals(){
    this.modalService.dismissAll();
  }

  openModal(modal) {
    this.modalRef = this.modalService.open(modal, this.modalOptions);
    this.manageModal(this.modalRef);
    return this.modalRef;
  }

  private manageModal(modalReference) {
    modalReference.result.then(
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
