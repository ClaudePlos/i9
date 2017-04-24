/**
 * Created by Piotr on 2015-08-18.
 */

module pl.egeria.companys.services {

    import Company = pl.egeria.companys.model.Company;
    export class CompanysService {

        static $inject = ['$http', 'mainUrl','$rootScope'];

        $rootScope;
        $http;
        urlBase;

        constructor($http, mainUrl, $rootScope) {
            this.$http = $http;
            this.$rootScope = $rootScope;
            this.urlBase = mainUrl + '/N5-EgeriaRest-web/resources/egeria/kontrahenci';
        }

        list = function (firstResult, maxResults, orderBy, filters) {
            return this.$http.get(firstResult, maxResults, orderBy, filters);
        };

        get = function (id) {
            return this.$http.get(this.urlBase + "/" + id);
        };

        save = function (company : Company)
        {
            var srv = this;

            var promise = new Promise(function(resolve,reject)
            {
                var req = {
                    method:"POST",
                    url:srv.urlBase + "/" + company,
                    data:company
                };

                if ( company.klKod ){
                    // update
                    req.method = "PUT";
                    req.url += +"/"+company.klKod;
                }

                srv.$http(req).then(
                    (result)=>
                    {
                        console.log("Company was updated");
                        company.updateAttributes(result.data);

                        resolve(company);
                        setTimeout(()=>{ srv.$rootScope.$broadcast("companySaved");})
                    }
                )
            });
            return promise;
        };



        // pobiera szczegoly firmy
        completeCompany(company : Company)
        {
            this.get(company.klKod).then(
                function(result){
                    console.log("Got complete company");
                    company.updateAttributes(result.data);
                }
            );
        }

    }


    angular.module('iNaprzod').service("CompanysService", CompanysService);
}
;
