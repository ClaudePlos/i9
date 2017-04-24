/**
 * Created by Piotr on 2015-08-31.
 */

module pl.global.login {

    export class LoginCtrl {

        static $inject = ['$rootScope', '$state', '$scope',  '$http', '$cookies', 'LoginService', 'DictionariesService'];
        // we store edited company in var editedCompany
        static CTRL_NAME:String = "LoginCtrl";

        loginService:LoginService;
        $stateProvider:Object;
        $rootScope;
        $scope;
        $state;
        $cookies;
        loginUser  = { username:"" , password : ""};
        $http;

        constructor($rootScope, $state, $scope,  $http, $cookies, loginService) {
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


        checkCookie() {
            var token = this.$cookies["token"];
            if ( token ){
                this.$http.defaults.headers.common['token'] =token;
            }
        }
        configLogin($cookies) {
            var ctrl = this;

            this.$rootScope.$on('$stateChangeSuccess', function (evt, to, toParams, from, fromParams) {
                // check for token
                console.log("State change : to" + to)
                console.log("STATE CNAGE : " + to.name);
                console.dir(to);
                var token = $cookies["token"];
                console.log("Token:" + token);
                if (!token && to.name != "login") {
                    console.log("Redirect");
                    ctrl.$state.go("login");
                }
            });
        }

        login()
        {
            var ctrl = this;
            if ( this.loginUser.username.length != 0
            && this.loginUser.password.length != 0) {
                this.loginService.login( this.loginUser.username, this.loginUser.password).then
                ( function(res){
                   console.log("Logged In");
                    ctrl.$cookies["token"] = res.data.token;
                    ctrl.$cookies["loggedUser"] = JSON.stringify(res.data);
                    ctrl.$http.defaults.headers.common['token'] = res.data.token;
                    ctrl.$state.go("index.main");
                });
            }
        }

        //static  config() : void {
        //
        //}

    }


    angular.module('iNaprzod').controller(LoginCtrl.CTRL_NAME, LoginCtrl);

    //angular.module('iNaprzod').config( configLogin );
}