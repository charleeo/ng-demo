import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../session.service';
import { environment } from '../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

  apiUrl: string;
  apidata: any;
  apiDataById: any;
  dtOptions: any = {};
  userID: any;
  closeResult: string;
  faqCategory1Data: any;
  faqCategory2Data: any;
  faqCategories: any[];
  faqCategory3Data: any;
  faqCategory4Data: any;
  faqCategory5Data: any;
  faqCategory6Data: any;
  faqCategory7Data: any;
  faqCategory8Data: any;
  faqCategoriesData: any;
  title = 'Paye - FAQ'

  // tslint:disable-next-line: max-line-length
  constructor(private httpClient: HttpClient,
              private route: ActivatedRoute,
              private titleService: Title,
              private router: Router,
              private spinnerService: Ng4LoadingSpinnerService) { }

              ngOnInit(): void {
    this.titleService.setTitle(this.title)
    this.getFaqCategories();
    this.getFaqData();
  }

  getFaqData() {
    this.apiUrl = environment.AUTHAPIURL + 'faqs';
    this.spinnerService.show(); // show the spinner

    this.httpClient.get<any>(this.apiUrl).subscribe(data => {
          console.log("faqApiResponse", data.response);
          this.apidata = data.response;

          this.faqCategory1Data = this.getFaqByCategoryId(1);
          this.faqCategory2Data = this.getFaqByCategoryId(2);
          this.faqCategory3Data = this.getFaqByCategoryId(3);
          this.faqCategory4Data = this.getFaqByCategoryId(4);
          this.faqCategory5Data = this.getFaqByCategoryId(5);
          this.faqCategory6Data = this.getFaqByCategoryId(6);
          this.faqCategory7Data = this.getFaqByCategoryId(7);
          this.faqCategory8Data = this.getFaqByCategoryId(8);

          this.faqCategories = [ this.faqCategory1Data,
                                 this.faqCategory2Data,
                                 this.faqCategory3Data,
                                 this.faqCategory4Data,
                                 this.faqCategory5Data,
                                 this.faqCategory6Data,
                                 this.faqCategory7Data,
                                 this.faqCategory8Data
                                ];

          console.log("faqCategories", this.faqCategories);
          this.spinnerService.hide(); // hide the spinner if success
    });
  }

  getFaqCategories() {
    this.spinnerService.show();
    this.apiUrl = environment.AUTHAPIURL + 'faqs/category';

    this.httpClient.get<any>(this.apiUrl).subscribe(data => {
      console.log("faqCategoriesApiData: ", data);
      this.faqCategoriesData = data.response;
      this.spinnerService.hide();
    });
  }

  getFaqByCategoryId(categoryId: Number) : any {
    var filtered = this.apidata.filter(c => c.faq_category_id == categoryId);
    var categoryName = this.faqCategoriesData.filter(c => c.id == categoryId)[0].category;
    // var categoryName = categoryId == 1 ? "General Questions" : categoryId == 2 ? "Pay-As-You-Earn (PAYE)" : categoryId == 3 ? "Direct Assessment" : categoryId == 4 ? "ETCC" : categoryId == 5 ? "Withholding Tax" : categoryId == 6 ? "Capital Gains Tax (CGT)" : categoryId == 7 ? "Stamp Duties (SD)" : "QWERTY";
    var responseObj = { categoryId: categoryId, categoryName: categoryName, categoryRecords: filtered };
    return responseObj;
  }
}
