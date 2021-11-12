import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  // months: { monthId: string; monthName: string; }[];
  months: { monthId: string; monthName: string; } [] = [];

  constructor(private router: Router) {  }

  validtoken: any;

  public checkLogin() {
    this.validtoken = localStorage.getItem('admin_access_token');

    // tslint:disable-next-line: triple-equals
    if (this.validtoken == '' || this.validtoken === null) {
      this.router.navigate(['/login']);
    }
  }

  public logOut() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  public islogin() {
    this.validtoken = localStorage.getItem('admin_access_token');
    // alert(this.validtoken);

    if (this.validtoken != null) {
      this.router.navigate(['/dashboard']);
    }
  }


  getAllMonths() {
    this.months = [ { monthId: "01", monthName: "January" }, 
                    { monthId: "02", monthName: "February" }, 
                    { monthId: "03", monthName: "March" },
                    { monthId: "04", monthName: "April" },
                    { monthId: "05", monthName: "May" },
                    { monthId: "06", monthName: "June" },
                    { monthId: "07", monthName: "July" },
                    { monthId: "08", monthName: "August" },
                    { monthId: "09", monthName: "September" },
                    { monthId: "10", monthName: "October" },
                    { monthId: "11", monthName: "November" },
                    { monthId: "12", monthName: "December" },
                  ]
  }

  getMonthName(monthId: string): string {
    // console.log("monthId: ", monthId);
    var monthName = this.months.filter(m => m.monthId == monthId)[0]?.monthName;
    return monthName;
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
    console.log("grossIncomeIncorrect1: ", grossIncomeIncorrect);

    // calculate CRA
    let cra = (grossIncome * 0.5) + 16666.667;
    let cra1 = (grossIncome * 0.5) + (0.01 * grossIncome);

    let approxCra = Math.round((cra + Number.EPSILON) * 100) / 100
    let approxCra1 = Math.round((cra1 + Number.EPSILON) * 100) / 100

    if (approxCra > approxCra1) {
      addEmployeeForm.controls['CRA'].setValue(approxCra);
    }
    else {
      addEmployeeForm.controls['CRA'].setValue(approxCra1);
    }

    return grossIncomeIncorrect;
  }

}
