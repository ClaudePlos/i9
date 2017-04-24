/**
 * Created by Piotr on 2015-09-02.
 */

module pl.global.error {


    //export class GlobalErrorHandler {
    //
    //
    //    static $inject = ['$httpProvider'];
    //
    //    constructor($httpProvider) {
    //        $httpProvider.interceptors.push(function ($q, dependency1, dependency2) {
    //            return {
    //
    //                'responseError': function (response) {
    //                    // same as above
    //                    console.log("Response error");
    //                }
    //            };
    //        });
    //   }
    //}

  //angular.module('iNaprzod').provider('c',GlobalErrorHandler);

    angular.module('iNaprzod').factory('GlobalErrorHandler', [  function($q, dependency1, dependency2)  {
        return {
            'responseError': function (rejection) {
                // same as above
                console.log("Response error");

                toastr.options = {
                    "closeButton": true,
                    "debug": false,
                    "progressBar": true,
                    "preventDuplicates": false,
                    "positionClass": "toast-top-right",
                    "onclick": null,
                    "showDuration": "400",
                    "hideDuration": "1000",
                    "timeOut": "7000",
                    "extendedTimeOut": "1000",
                    "showEasing": "swing",
                    "hideEasing": "linear",
                    "showMethod": "fadeIn",
                    "hideMethod": "fadeOut"
                };
                var message = JSON.stringify( rejection.data ) ;

                if ( rejection.hasOwnProperty("data") &&  rejection.data != null &&  rejection.data.hasOwnProperty('message'))
                    message = rejection.data.message;


                //if ( response );

                toastr.error(message, "Błąd servera");
                return $q.reject(rejection);
            }
        }
    }]);
}