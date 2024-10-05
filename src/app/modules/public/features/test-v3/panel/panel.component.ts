import {Component, OnInit} from '@angular/core';

import {AuthService} from "@core/services/auth.service";
@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit {

  pageChange:'admin'| 'contestant'|'loading'  = "loading";

  constructor(
    private auth: AuthService,
  ) {

  }
  ngOnInit(): void {

    this.checkInit();
  }

  checkInit() {
    const rolesUsers = this.auth.roles;
    this.pageChange= rolesUsers.find(f=>f.name === 'thi-sinh') ? 'contestant' : 'admin';
  }


}
