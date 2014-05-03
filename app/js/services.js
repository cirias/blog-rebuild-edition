'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('services', [])
  .value('version', '0.1')
  .value('siteInfo', {
  	name: "Sirius sight", 
  	subtitle: "EL PSY CONGROO.",
  	description: "用于记录收获与感想的个人博客……", 
  	footer: "Powered by Sirius.", 
  	metaKeywords: "metaKeywords..", 
  	metaDescription: "metaDescription.."
  })
  .value('articleConfig', {
  	defaultCount: 1
  });
