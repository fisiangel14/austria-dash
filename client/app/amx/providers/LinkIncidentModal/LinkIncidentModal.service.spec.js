'use strict';

describe('Service: LinkIncidentModal', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var LinkIncidentModal;
  beforeEach(inject(function (_LinkIncidentModal_) {
    LinkIncidentModal = _LinkIncidentModal_;
  }));

  it('should do something', function () {
    expect(!!LinkIncidentModal).to.be.true;
  });

});
