import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DesignerElectricalInput } from 'src/app/_models/designerelectricalinput';

export interface ElectricalFormData {
  // isDesignerFillMode: boolean;
  electricalinput: DesignerElectricalInput;
  isdataupdated: boolean;

}
@Component({
  selector: 'app-editelectricalinputs',
  templateUrl: './editelectricalinputs.component.html',
  styleUrls: ['./editelectricalinputs.component.scss']
})
export class EditelectricalinputsComponent implements OnInit {

  designerelectricalinputFormGroup: FormGroup;
  typical = new FormControl("", [Validators.required]);
  initialconductorlocation = new FormControl("", [Validators.required]);
  finalconductorlocation = new FormControl("", [Validators.required]);
  ocpd = new FormControl(false, []);
  maxcurrent = new FormControl("", [Validators.required, Validators.max(85)]);
  inputlength = new FormControl("", [Validators.required]);
  parallelcircuits = new FormControl("", [Validators.required]);
  termtemprating = new FormControl("", [Validators.required]);
  conductor1 = new FormControl("", [Validators.required])
  conductor2 = new FormControl("", [Validators.required])
  conductor3 = new FormControl("", [Validators.required])
  conduit = new FormControl("", [Validators.required])
  currentcarryingconductorinconduit = new FormControl("", [Validators.required])
  conduitfillpercent = new FormControl("", [Validators.required])
  egc1 = new FormControl("", [Validators.required])
  egc2 = new FormControl("", [Validators.required])
  tempcorrfactor1 = new FormControl("", [Validators.required])
  tempcorrfactor2 = new FormControl("", [Validators.required])
  conduitfillfactor = new FormControl("", [Validators.required])
  contcurrent = new FormControl("", [Validators.required])
  baseamp = new FormControl("", [Validators.required])
  deratedamp = new FormControl("", [Validators.required])
  voltagedrop = new FormControl("", [Validators.required])
  initialfinalconductorlocation = ["String", "Junction Box", "DC Disconnect", "Inverter", "Load Centre", "Existing Sub panel", "Sub panel", "Non Fused AC Disconnect", "Fused AC Disconnect", "IQ Combiner Box",
    "Enphase Smart Switch", "Enphase Encharge 10", "Enphase Encharge 3", "Generator", "Automatic Transfer Switch", "Tesla Gateway", "Tesla Powerwall", "MSP", "Meter", "MA Smart Meter", "Re-growth Meter", "Production meter", "Grid", "Utility Disconnect"]
  constructor(public dialogRef: MatDialogRef<EditelectricalinputsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ElectricalFormData) {
    this.designerelectricalinputFormGroup = new FormGroup({
      typical: this.typical,
      initialconductorlocation: this.initialconductorlocation,
      finalconductorlocation: this.finalconductorlocation,
      ocpd: this.ocpd,
      maxcurrent: this.maxcurrent,
      length: this.inputlength,
      parallelcircuits: this.parallelcircuits,
      termtemprating: this.termtemprating,
      conductor1: this.conductor1,
      conductor2:this.conductor2,
      conductor3 :this.conductor3,
      conduit :this.conduit,
      currentcarryingconductorinconduit :this.currentcarryingconductorinconduit,
      conduitfillpercent :this.conduitfillpercent,
      egc1 :this.egc1,
      egc2 :this.egc2,
      tempcorrfactor1 :this.tempcorrfactor1,
      tempcorrfactor2 :this.tempcorrfactor2,
      conduitfillfactor :this.conduitfillfactor,
      contcurrent :this.contcurrent,
      baseamp :this.baseamp,
      deratedamp :this.deratedamp,
      voltagedrop : this.voltagedrop
    });
     console.log(this.data.electricalinput);
    this.designerelectricalinputFormGroup.patchValue({typical: this.data.electricalinput.typical,
     
      ocpd: this.data.electricalinput.ocpd,
      maxcurrent: this.data.electricalinput.maxcurrent,
      length: this.data.electricalinput.inputlength,
      parallelcircuits: this.data.electricalinput.parallelcircuits,
      termtemprating: this.data.electricalinput.termtemprating,
      conductor1: this.data.electricalinput.conductor1,
      conductor2:this.data.electricalinput.conductor2,
      conductor3 :this.data.electricalinput.conductor3,
      conduit :this.data.electricalinput.conduit,
      currentcarryingconductorinconduit :this.data.electricalinput.currentcarryingconductorinconduit,
      conduitfillpercent :this.data.electricalinput.conduitfillpercent,
      egc1 :this.data.electricalinput.egc1,
      egc2 :this.data.electricalinput.egc2,
      tempcorrfactor1 :this.data.electricalinput.tempcorrfactor1,
      tempcorrfactor2 :this.data.electricalinput.tempcorrfactor2,
      conduitfillfactor :this.data.electricalinput.conduitfillfactor,
      contcurrent :this.data.electricalinput.contcurrent,
      baseamp :this.data.electricalinput.baseamp,
      deratedamp :this.data.electricalinput.deratedamp,
      voltagedrop : this.data.electricalinput.voltagedrop})
     this.initialconductorlocation.setValue( this.data.electricalinput.initialconductorlocation)
     this.finalconductorlocation.setValue( this.data.electricalinput.finalconductorlocation)
  }

  ngOnInit(): void {
  }

  onCloseClick(): void {
    this.data.isdataupdated = false;
    this.dialogRef.close(this.data);
  }
  getErrorMessage(control: FormControl) {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
  }
  onSaveElectricalsDetails(event){
      this.data.electricalinput.typical= this.typical.value;
      this.data.electricalinput.initialconductorlocation= this.initialconductorlocation.value;
      this.data.electricalinput.finalconductorlocation=this.finalconductorlocation.value;
      this.data.electricalinput.ocpd=this.ocpd.value;
      this.data.electricalinput.maxcurrent=this.maxcurrent.value;
      this.data.electricalinput.inputlength = this.inputlength.value;
      this.data.electricalinput.parallelcircuits = this.parallelcircuits.value;
      this.data.electricalinput.termtemprating = this.termtemprating.value;
      this.data.electricalinput.conductor1 = this.conductor1.value;
      this.data.electricalinput.conductor2 = this.conductor2.value;
      this.data.electricalinput.conductor3  = this.conductor3.value;
      this.data.electricalinput.conduit = this.conduit.value;
      this.data.electricalinput.currentcarryingconductorinconduit  = this.currentcarryingconductorinconduit.value;
      this.data.electricalinput.conduitfillpercent = this.conduitfillpercent.value;
      this.data.electricalinput.egc1 = this.egc1.value;
      this.data.electricalinput.egc2 = this.egc2.value;
      this.data.electricalinput.tempcorrfactor1 = this.tempcorrfactor1.value;
      this.data.electricalinput.tempcorrfactor2 = this.tempcorrfactor2.value;
      this.data.electricalinput.conduitfillfactor = this.conduitfillfactor.value;
      this.data.electricalinput.contcurrent = this.contcurrent.value;
      this.data.electricalinput.baseamp = this.baseamp.value;
      this.data.electricalinput.deratedamp = this.deratedamp.value;
      this.data.electricalinput.voltagedrop = this.voltagedrop.value;
      this.data.isdataupdated = true;
      this.dialogRef.close(this.data);
      this.data.electricalinput.isSaved = false;
  }
}
