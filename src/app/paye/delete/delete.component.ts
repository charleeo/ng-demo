import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from "@angular/router";
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent implements OnInit {

  userID: any;
  apiUrl: any;
  roleID: any;
  constructor(private httpClient: HttpClient, private router: Router, private route: ActivatedRoute) {
    // id is defined on app.routing.module.ts
    this.userID = this.route.snapshot.params.id;
  }

  ngOnInit(): void {

    if(this.roleID!= 5) {
      this.router.navigate(['/dashboard']);
     }
    this.deleteNote();
  }

  deleteNote() {
    const obj = {
        user_id: this.userID,
        admin_user_id: localStorage.getItem('admin_id'),
        admin_user_name: localStorage.getItem('admin_username'),
        admin_role: localStorage.getItem('admin_role_name')
      };

    this.apiUrl = environment.AUTHAPIURL + 'authapi/auth/deleteUser';
    this.httpClient.post<any>(this.apiUrl, obj).subscribe(data => {
          console.log(data);
          // Swal.fire('Oops...', 'Something went wrong!', 'error');
          Swal.fire({
            icon: 'success',
            title: 'Record Successfully Deleted',
            showConfirmButton: false,
            timer: 1500
          });
          this.router.navigate(['/displayuser']);
    });
  }




}
