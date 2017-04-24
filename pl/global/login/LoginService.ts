/**
 * Created by Piotr on 2015-08-31.
 */

module pl.global.login {

    export class LoginService {

        static $inject = [  '$http', '$cookies','mainUrl'];
// we store edited company in var editedCompany

        serviceUrl : String;
        $http;
        constructor( $http, $cookies, mainUrl)
        {
            this.serviceUrl = mainUrl +"/N1-Controlling-web/resources/login";
            this.$http =$http;
        }


        login( username, password )
        {
            var req = {
                url: this.serviceUrl,
                data: {
                    uzNazwa:username, uzHaslo :password
                },
                method:"POST"
            }
            return this.$http(req);
        }
    }
    angular.module('iNaprzod').service("LoginService", LoginService);
}
