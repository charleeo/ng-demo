import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-viewreports',
  templateUrl: './viewreports.component.html',
  styleUrls: ['./viewreports.component.css']
})
export class ViewreportsComponent implements OnInit {
  title = 'Paye - Reports'
  constructor(private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.title)
  }

  redirectToDirectAssessment() {
    localStorage.setItem("redirect_payment_to_dashboard", "0");
    // this.FDServ.redirectToDirectAssessment();
  }
}
