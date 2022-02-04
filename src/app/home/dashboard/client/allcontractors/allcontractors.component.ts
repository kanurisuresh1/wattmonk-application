import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ContractorService, NotificationService } from 'src/app/_services';

@Component({
  selector: 'app-allcontractors',
  templateUrl: './allcontractors.component.html',
  styleUrls: ['./allcontractors.component.scss']
})
export class AllcontractorsComponent implements OnInit {

  constructor(
    private contractorService: ContractorService,
    private notifyService: NotificationService,
    private location: Location
  ) { }

  ngOnInit(): void {
    // do nothing.
  }

  fetchAllContractorsList(): void {
    this.contractorService.getContractorsData().subscribe(
      () => {
        // do nothing.
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  handleBack(): void {
    this.location.back();
  }

} 
