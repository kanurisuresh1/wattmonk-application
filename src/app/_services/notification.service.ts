import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
@Injectable({
  providedIn: "root",
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  showSuccess(message, title): void {
    this.toastr.success(message, title, {
      tapToDismiss: true,
      progressBar: true,
      progressAnimation: "increasing",
    });
  }

  showError(message, title): void {
    this.toastr.error(message, title);
  }

  showInfo(message, title): void {
    this.toastr.info(message, title);
  }

  showWarning(message, title): void {
    this.toastr.warning(message, title);
  }
}
