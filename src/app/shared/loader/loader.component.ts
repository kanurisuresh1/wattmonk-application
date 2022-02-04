import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { LoaderService } from "../../_services";


@Component({
  selector: "app-loader",
  templateUrl: "./loader.component.html",
  styleUrls: ["./loader.component.scss"],
})
export class LoaderComponent implements OnInit {
  color = "primary";
  mode = "indeterminate";
  value = 50;
  isLoading: Subject<boolean> = this.loaderService.isLoading;

  constructor(private loaderService: LoaderService) { }

  ngOnInit(): void {
    // do nothing.
  }
}
