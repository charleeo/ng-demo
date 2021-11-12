import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/session.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  userID: any;
  username: any;
  roleID: any;
  corporateID: any;
  isManager: boolean = false;
  isEditor: boolean = false;
  isViewer: boolean = false;
  isSuperAdmin: boolean = false;
  constructor(private sess: SessionService) { }

  ngOnInit(): void {
    this.username = localStorage.getItem('admin_username');
    this.roleID = localStorage.getItem('admin_role_id');
    this.userID = localStorage.getItem('admin_id');
    this.corporateID = localStorage.getItem('admin_corporate_id');

    if (this.roleID == 1) {
      this.isSuperAdmin = true;
    }

    if (this.roleID == 2) {
      this.isManager = true;
    }

    if(this.roleID == 3) {
      this.isEditor = true;
    }

    if(this.roleID == 4){
      this.isViewer = true;
    }

  }


}
