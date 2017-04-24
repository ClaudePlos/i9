/**
 * INSPINIA - Responsive Admin Theme
 *
 */

/**
 * MainCtrl - controller
 */
function MainCtrl() {

    this.userName = 'User';
    this.helloText = 'Strona główna';
    //this.descriptionText = 'It is an application skeleton for a typical AngularJS web app. You can use it to quickly bootstrap your angular webapp projects and dev environment for these projects.';

};


angular
    .module('iNaprzod')
    .controller('MainCtrl', MainCtrl)