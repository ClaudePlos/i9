/**
 * Created by Piotr on 2015-08-18.
 */
var pl;
(function (pl) {
    var egeria;
    (function (egeria) {
        var companys;
        (function (companys) {
            var services;
            (function (services) {
                var CompanysService = (function () {
                    function CompanysService($http, mainUrl, $rootScope) {
                        this.list = function (firstResult, maxResults, orderBy, filters) {
                            return this.$http.get(firstResult, maxResults, orderBy, filters);
                        };
                        this.get = function (id) {
                            return this.$http.get(this.urlBase + "/" + id);
                        };
                        this.save = function (company) {
                            var srv = this;
                            var promise = new Promise(function (resolve, reject) {
                                var req = {
                                    method: "POST",
                                    url: srv.urlBase + "/" + company,
                                    data: company
                                };
                                if (company.klKod) {
                                    // update
                                    req.method = "PUT";
                                    req.url += +"/" + company.klKod;
                                }
                                srv.$http(req).then(function (result) {
                                    console.log("Company was updated");
                                    company.updateAttributes(result.data);
                                    resolve(company);
                                    setTimeout(function () {
                                        srv.$rootScope.$broadcast("companySaved");
                                    });
                                });
                            });
                            return promise;
                        };
                        this.$http = $http;
                        this.$rootScope = $rootScope;
                        this.urlBase = mainUrl + '/N5-EgeriaRest-web/resources/egeria/kontrahenci';
                    }
                    // pobiera szczegoly firmy
                    CompanysService.prototype.completeCompany = function (company) {
                        this.get(company.klKod).then(function (result) {
                            console.log("Got complete company");
                            company.updateAttributes(result.data);
                        });
                    };
                    CompanysService.$inject = ['$http', 'mainUrl', '$rootScope'];
                    return CompanysService;
                })();
                services.CompanysService = CompanysService;
                angular.module('iNaprzod').service("CompanysService", CompanysService);
            })(services = companys.services || (companys.services = {}));
        })(companys = egeria.companys || (egeria.companys = {}));
    })(egeria = pl.egeria || (pl.egeria = {}));
})(pl || (pl = {}));
;
//# sourceMappingURL=CompanysService.js.map