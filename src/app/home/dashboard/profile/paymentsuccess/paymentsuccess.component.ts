import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrentUser } from 'src/app/_models';
import { AuthenticationService } from 'src/app/_services';

@Component({
  selector: "app-paymentsuccess",
  templateUrl: "./paymentsuccess.component.html",
  styleUrls: ["./paymentsuccess.component.scss"],
})
export class PaymentsuccessComponent implements OnInit {
  session_id;
  loggedInUser;
  currentUser: CurrentUser;
  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticationService) {

    this.session_id = this.route.snapshot.queryParams.session_id;
    this.loggedInUser = this.authService.currentUserValue.user
    this.currentUser = authService.currentUserValue
  }

  ngOnInit(): void {

    //  const inputdata={
    //   session_id:this.session_id
    //  }
    //  this.checkout(inputdata)
  }

  //  checkout(inputdata): void {
  //   //  this.commonService.checkout(inputdata).subscribe(response=>{
  //   //   console.log(response);
  //   //   const inputData={
  //   //    amount:response.session.amount_total/100,
  //   //    datetime:Date.now(),
  //   //    user:this.loggedInUser.id,
  //   //    sessionid:this.session_id
  //   //   }
  //   //   this.createRecharge(inputData)
  //   //  })
  //  }

  //  createRecharge(inputData): void {
  //   //  this.commonService.recharge(inputData).subscribe(response=>{
  //   //  console.log(response);
  //   //  this.currentUser.user.amount=response.user.amount
  //   //  })
  //  }
}
