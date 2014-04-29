'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
  .value('version', '0.1')
  .value('siteInfo', {
  	name: "name", 
  	subtitle: "subtitle",
  	description: "description", 
  	footer: "footer", 
  	metaKeywords: "metaKeywords", 
  	metaDescription: "metaDescription"
  });
