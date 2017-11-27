/**
 * Created by Piotr on 2015-08-31.
 */
var pl;
(function (pl) {
    var global;
    (function (global) {
        var login;
        (function (login) {
            var LoginCtrl = (function () {
                function LoginCtrl($rootScope, $state, $scope, $http, $cookies, loginService) {
                    this.loginUser = { username: "", password: "" };
                    this.loginService = loginService;
                    //this.$stateProvider = $stateProvider;
                    this.$rootScope = $rootScope;
                    this.$scope = $scope;
                    this.$state = $state;
                    this.$cookies = $cookies;
                    this.$http = $http;
                    this.configLogin($cookies);
                    this.checkCookie();
                }
                LoginCtrl.prototype.checkCookie = function () {
                    var token = this.$cookies["token"];
                    if (token) {
                        this.$http.defaults.headers.common['token'] = token;
                    }
                };
                LoginCtrl.prototype.configLogin = function ($cookies) {
                    var ctrl = this;
                    this.$rootScope.$on('$stateChangeSuccess', function (evt, to, toParams, from, fromParams) {
                        // check for token
                        console.log("State change : to" + to);
                        console.log("STATE CNAGE : " + to.name);
                        console.dir(to);
                        var token = $cookies["token"];
                        console.log("Token:" + token);
                        if (!token && to.name != "login") {
                            console.log("Redirect");
                            ctrl.$state.go("login");
                        }
                    });
                };
                LoginCtrl.prototype.login = function () {
                    var ctrl = this;
                    if (this.loginUser.username.length != 0
                        && this.loginUser.password.length != 0) {
                        this.loginService.login(this.loginUser.username, this.loginUser.password).then(function (res) {
                            console.log("Logged In");
                            ctrl.$cookies["token"] = res.data.token;
                            ctrl.$cookies["loggedUser"] = JSON.stringify(res.data);
                            ctrl.$http.defaults.headers.common['token'] = res.data.token;
                            ctrl.$state.go("index.main");
                        });
                    }
                };
                LoginCtrl.$inject = ['$rootScope', '$state', '$scope', '$http', '$cookies', 'LoginService', 'DictionariesService'];
                // we store edited company in var editedCompany
                LoginCtrl.CTRL_NAME = "LoginCtrl";
                return LoginCtrl;
            }());
            login.LoginCtrl = LoginCtrl;
            angular.module('iNaprzod').controller(LoginCtrl.CTRL_NAME, LoginCtrl);
            //angular.module('iNaprzod').config( configLogin );
        })(login = global.login || (global.login = {}));
    })(global = pl.global || (pl.global = {}));
})(pl || (pl = {}));
