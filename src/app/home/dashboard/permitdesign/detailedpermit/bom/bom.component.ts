import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationsnackbarComponent } from 'src/app/shared/confirmationsnackbar/confirmationsnackbar.component';
import { EVENTS_PERMIT_DESIGN } from 'src/app/_helpers';
import { Design } from 'src/app/_models';
import { DesignService, LoaderService } from 'src/app/_services';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';

@Component({
  selector: 'app-bom',
  templateUrl: './bom.component.html',
  styleUrls: ['./bom.component.scss']
})
export class BomComponent implements OnInit {
  bominputs = []
  disabledinputs = false;
  @Input() generateddesign: Design;
  constructor(private designService: DesignService,
    private changedetector: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private loaderService: LoaderService,
    private eventEmitterService: EventEmitterService) {

  }


  ngOnInit(): void {
    if (this.generateddesign.autopermitdesign) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.DesignBomDetailSaved);
    }
    this.getDesignBom();

    if (this.generateddesign.status != "designassigned") {
      this.disabledinputs = true;
    }
  }

  getDesignBom(): void {
    this.designService.getDesignBOM(this.generateddesign.designerdetails.id).subscribe((response: any) => {
      if (response.length > 0) {
        response.forEach(element => {
          element.issaved = true;
        });
        this.bominputs = response;
        this.changedetector.detectChanges();
      }
      else {
        this.generateDesignBOM();
      }
    })
  }

  generateDesignBOM(): void {
    const inputData = {
      designid: this.generateddesign.id,
      designerdetailid: this.generateddesign.designerdetails.id
    }

    this.designService.generateDesignBOM(inputData).subscribe((response: any) => {
      response.data.forEach(element => {
        element.issaved = true;
      });
      this.bominputs = response.data;
      this.changedetector.detectChanges();
    })
  }
  addBom(): void {
    this.bominputs.push({ id: null, equipment: "", quantity: 0, description: "", issaved: false })
  }
  deleteBOM(index, bom): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message:
            "Are you sure you want to delete the entry " +
            " ?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.bominputs.splice(index, 1)
      if (bom.id != null) {
        this.designService.deleteDesignBOM(bom.id).subscribe(() => {

        })
      }
      this.changedetector.detectChanges();
    });
  }

  onSaveBOM(): void {
    this.loaderService.show();
    var editedbom = []
    this.bominputs.map(data => {
      if (!data?.issaved) {
        editedbom.push(data);
      }
    })

    let inputData = {
      designbom: editedbom,
      designerdetailid: this.generateddesign.designerdetails.id
    }

    this.designService.updateDesignBOM(inputData).subscribe(res => {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.DesignBomDetailSaved);
    })
  }


  addEquipment(event, i): void {
    this.bominputs[i].equipment = event.target.value;
    this.bominputs[i].issaved = false;
  }
  addQuantity(event, i): void {
    this.bominputs[i].quantity = event.target.value;
    this.bominputs[i].issaved = false;
  }
  addDescription(event, i): void {
    this.bominputs[i].description = event.target.value;
    this.bominputs[i].issaved = false;
  }
}
