/**
 * Created by Piotr on 2015-08-31.
 */
var pl;
(function (pl) {
    var global;
    (function (global) {
        var login;
        (function (login) {
            var LoginService = (function () {
                function LoginService($http, $cookies, mainUrl) {
                    this.serviceUrl = mainUrl + "/N1-Controlling-web/resources/login";
                    this.$http = $http;
                }
                LoginService.prototype.login = function (username, password) {
                    var req = {
                        url: this.serviceUrl,
                        data: {
                            uzNazwa: username, uzHaslo: password
                        },
                        method: "POST"
                    };
                    return this.$http(req);
                };
                LoginService.$inject = ['$http', '$cookies', 'mainUrl'];
                return LoginService;
            }());
            login.LoginService = LoginService;
            angular.module('iNaprzod').service("LoginService", LoginService);
        })(login = global.login || (global.login = {}));
    })(global = pl.global || (pl.global = {}));
})(pl || (pl = {}));
