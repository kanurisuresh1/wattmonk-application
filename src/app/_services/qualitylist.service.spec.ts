import { TestBed } from "@angular/core/testing";

import { QualitylistService } from "./qualitylist.service";

describe("QualitylistService", () => {
  let service: QualitylistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QualitylistService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
