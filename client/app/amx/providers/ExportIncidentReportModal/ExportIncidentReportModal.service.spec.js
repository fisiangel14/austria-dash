'use strict';

describe('Service: ExportIncidentReportModal', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var ExportIncidentReportModal;
  beforeEach(inject(function (_ExportIncidentReportModal_) {
    ExportIncidentReportModal = _ExportIncidentReportModal_;
  }));

  it('should do something', function () {
    expect(!!ExportIncidentReportModal).to.be.true;
  });

});
