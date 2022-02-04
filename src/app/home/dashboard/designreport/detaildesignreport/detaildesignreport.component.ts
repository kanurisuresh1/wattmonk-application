import { HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Workstatusdetail } from 'src/app/_models/workstatusdetail';
import { AuthenticationService } from 'src/app/_services';

export interface WorkDetailData {
  user: Workstatusdetail
  subscription: string,
}

@Component({
  selector: "app-detaildesignreport",
  templateUrl: "./detaildesignreport.component.html",
  styleUrls: ["./detaildesignreport.component.scss"],
})
export class DetaildesignreportComponent implements OnInit {
  headers: HttpHeaders;
  // private authenticationService : AuthenticationService;

  constructor(
    // private http: HttpClient,    
    public bottomsheetRef: MatBottomSheetRef<DetaildesignreportComponent>,
    private authService: AuthenticationService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: Workstatusdetail) {
    // this.authenticationService = authService;
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + this.authService.currentUserValue.jwt,
    });
  }

  ngOnInit(): void {
    // do nothing.
  }

  oncloseclick(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.bottomsheetRef.dismiss();
  }
}
