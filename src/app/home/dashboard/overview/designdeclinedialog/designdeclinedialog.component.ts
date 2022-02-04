import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import heic2any from "heic2any";
import { ROLES } from "src/app/_helpers";
import { Design } from "src/app/_models";
import {
  AuthenticationService,
  DesignService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";

export interface DesignDeclineDialogData {
  design: Design;
  reason: string;
  issubmitted: boolean;
  action: string;
  istimerstart: boolean;
}
@Component({
  selector: "app-designdeclinedialog",
  templateUrl: "./designdeclinedialog.component.html",
  styleUrls: ["./designdeclinedialog.component.scss"],
})
export class DesigndeclinedialogComponent implements OnInit {
  declinereason = new FormControl("", [Validators.required]);
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  loggedInUser;
  isLoading = false;
  loadingmessage = "Save data.";
  constructor(
    public dialogRef: MatDialogRef<DesigndeclinedialogComponent>,
    private commonService: CommonService,
    private notifyService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    private designService: DesignService,
    private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: DesignDeclineDialogData
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
  }

  onNoClick(): void {
    this.data.issubmitted = false;
    this.dialogRef.close(this.data);
  }

  onSubmit(): void {
    if (this.declinereason.value != "") {
      this.isLoading = true;
      if (this.isAttachmentUploaded) {
        this.uploadAttachmentdeclineDesignFiles(this.data.action);
      } else {
        this.editDesignOnServer(this.data.action);
      }
    } else {
      this.declinereason.markAsTouched();
      this.declinereason.markAsDirty();
    }
  }

  /*onAttachmentFileSelect(event) {
    this.isAttachmentUploaded = true;
    for (const index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      const extension = element.name.substring(element.name.lastIndexOf('.'));

      const mimetype = this.genericService.getMimetype(extension);
      const data = new Blob([element], {
        type: mimetype
      });
      const replacedfile = new File([data], element.name, { type: mimetype });
      this.attachmentfiles.push(replacedfile);

    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }*/
  onAttachmentFileSelect(event): void {
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      const type = element.name.split(".");
      // WEB ARCHIVE EXT NOT SUPPORTED CODE
      if (type[1] == "webarchive") {
        this.notifyService.showError(
          "Web archive file format is not supported",
          "Error"
        );
      } else {
        this.isAttachmentUploaded = true;
        element.isImage = false;
        if (element.type.includes("image")) {
          element.isImage = true;
        }
        if (type[1] == "heic" || type[1] == "HEIC") {
          element.isImage = true;
          const reader = new FileReader();
          reader.onload = (event: any) => {
            fetch(event.target.result)
              .then((res) => res.blob())
              .then((blob) => heic2any({ blob: blob, toType: "image/jpeg" }))
              .then((jpgBlob: Blob) => {
                let replacedfile;
                if (type[1] == "HEIC") {
                  replacedfile = new File(
                    [jpgBlob],
                    element.name.replace("HEIC", "jpeg"),
                    { type: "image/jpeg" }
                  );
                } else {
                  replacedfile = new File(
                    [jpgBlob],
                    element.name.replace("heic", "jpeg"),
                    { type: "image/jpeg" }
                  );
                }

                this.attachmentfiles.push(replacedfile);
                this.attachmentfiles.forEach(
                  (item) => (item["isImage"] = true)
                );
                setTimeout(() => {
                  this.changeDetectorRef.detectChanges();
                }, 300);
                this.changeDetectorRef.detectChanges();
              })
              .catch(() => {
                // see error handling section
              });
          };
          reader.readAsDataURL(element);
        } else {
          this.attachmentfiles.push(element);
          this.changeDetectorRef.detectChanges();
        }
      }
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onAttachmentFileRemove(event): void {
    this.attachmentfiles.splice(this.attachmentfiles.indexOf(event), 1);
    if (this.attachmentfiles.length == 0) {
      this.isAttachmentUploaded = false;
    }
  }
  uploadAttachmentdeclineDesignFiles(action): void {
    this.isLoading = true;
    if (action == "onhold") {
      this.loadingmessage = "Uploading On Hold Attachment.";
      this.commonService
        .uploadFilesWithLoader(
          this.data.design.id,
          "designs/" + this.data.design.id,
          this.attachmentfiles,
          "requestdeclineattachment",
          "design"
        )
        .subscribe(
          () => {
            this.editDesignOnServer(this.data.action);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.loadingmessage = "Uploading Un Hold Attachment.";
      this.commonService
        .uploadFilesWithLoader(
          this.data.design.id,
          "designs/" + this.data.design.id,
          this.attachmentfiles,
          "requestunholdattachment",
          "design"
        )
        .subscribe(
          () => {
            this.editDesignOnServer(this.data.action);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    }
  }

  editDesignOnServer(action): void {
    const cdate = Date.now();
    if (action == "onhold") {
      let currenttime;
      let postData;
      if (this.loggedInUser.role.id == ROLES.Designer) {
        postData = {
          status: "requestdeclined",
          // outsourcedto : null,
          isoutsourced: "false",
          requestdeclinereason: this.declinereason.value,
          designacceptanceendtime: cdate,
          designassignedto: null
        };
      } else if (this.loggedInUser.role.id == ROLES.Analyst) {
        postData = {
          status: "requestdeclined",
          // outsourcedto : null,
          isoutsourced: "false",
          requestdeclinereason: this.declinereason.value,
          designacceptanceendtime: cdate,
          designassignedto: null,
          reviewassignedto: null
        };
      } else {
        postData = {
          status: "requestdeclined",
          // outsourcedto : null,
          isoutsourced: "false",
          unhold: false,
          requestdeclinereason: this.declinereason.value,
          designacceptanceendtime: cdate,
          designassignedto: null,
          reviewassignedto: null
        };
      }

      this.designService.onholdDesign(this.data.design.id, postData).subscribe(
        (response) => {
          if (this.data?.istimerstart) {
            currenttime = new Date().getTime();
            let timepostdata = {
              taskstatus: "onhold",
              endtime: currenttime,
              onholdtime: currenttime
            }
            this.designService.updateJobTime(this.data.design?.newtasktimings?.id, timepostdata).subscribe(() => {
              this.data.design = response;
              this.isLoading = false;
              this.changeDetectorRef.detectChanges();
              this.data.issubmitted = true;
              this.notifyService.showSuccess(
                "Design request has been put on hold successfully.",
                "Success"
              );
              this.dialogRef.close(this.data);
            }, (error) => {
              this.notifyService.showError(error, "Error");
            })
          }
          else {
            this.data.design = response;
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.data.issubmitted = true;
            this.notifyService.showSuccess(
              "Design request has been put on hold successfully.",
              "Success"
            );
            this.dialogRef.close(this.data);
          }

        },
        (error) => {
          this.notifyService.showError(error, "Error");
          this.dialogRef.close(this.data);
        }
      );
    } else {
      const postData = {
        isoutsourced: "true",
        status: "requestaccepted",
        unhold: true,
        requestunholdreason: this.declinereason.value,
        designacceptanceendtime: cdate,
      };

      this.designService.unholddesign(this.data.design.id, postData).subscribe(
        (response) => {
          this.data.design = response;
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.data.issubmitted = true;
          this.notifyService.showSuccess(
            "Design request has been Un Hold successfully.",
            "Success"
          );
          this.dialogRef.close(this.data);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
          this.dialogRef.close(this.data);
        }
      );
    }
  }

  /*  createNewDesignChatGroup(design: Design) {
     this.isLoading = true;
     this.changeDetectorRef.detectChanges();
     const GUID = "" + design.chatid;

     const address = design.address.substring(0, 60);
     const groupName = design.name + "_" + address;

     const groupType = CometChat.GROUP_TYPE.PRIVATE;
     const password = "";

     const group = new CometChat.Group(GUID, groupName, groupType, password);
     CometChat.getGroup(GUID).then(
       group => {
         this.isLoading = false;
         this.changeDetectorRef.detectChanges();
         this.data.issubmitted = true;
         this.notifyService.showSuccess("Design request has been put on hold successfully.", "Success");
         this.dialogRef.close(this.data);
       }, error => {
         CometChat.createGroup(group).then(
           group => {
             const membersList = [
               new CometChat.GroupMember("" + design.createdby.id, CometChat.GROUP_MEMBER_SCOPE.ADMIN),
               new CometChat.GroupMember("" + this.loggedInUser.id, CometChat.GROUP_MEMBER_SCOPE.ADMIN)
             ];
             CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
               response => {
                  const inputData ={
                 title: groupName,
                 guid : GUID,
                 parentid: design.createrparentid
              }
              this.commonService.addChatGroup(inputData).subscribe(response=>{
                
              })
                //  console.log(response)
                 this.isLoading = false;
                 this.changeDetectorRef.detectChanges();
                 this.data.issubmitted = true;
                 this.notifyService.showSuccess("Design request has been put on hold successfully.", "Success");
                 this.dialogRef.close(this.data);
               },
               error => {
                //  console.log(error)

               }
             );
           },
           error => {

           }
         );
       }
     )

   } */

  ngOnInit(): void {
    // do nothing.
  }
}
