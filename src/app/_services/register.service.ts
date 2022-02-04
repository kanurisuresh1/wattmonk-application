import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RegisterService {
  constructor() {
    //do nothing
  }  // private genericService: GenericService // private http: HttpClient,

  registerDesigner(): Observable<any> {
    return of("test");
    // dummy success - of('test');
    // dummy error - throwError('');
    // return this.http.post<registerDesignerModel[]>(
    //   BaseUrl + "register/designer",
    //   {
    //     headers: this.genericService.authheaders,
    //     observe: "response",
    //   }
    // );
  }
}
