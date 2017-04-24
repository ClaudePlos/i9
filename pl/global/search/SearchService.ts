/**
 * Created by Piotr on 2015-08-21.
 */

module pl.global.search {

    export class SearchService {

        static $inject = ['$http', 'mainUrl'];

        $http;
        urlBase;

        constructor($http, mainUrl) {
            this.$http = $http;
            this.urlBase = mainUrl + '/N5-EgeriaRest-web/resources/search';
        }

        public search(searchText) {
            var req = {
                    method: "GET",
                    url: this.urlBase,
                    params: {
                        search: searchText
                    }
                }                ;

            return this.$http(req);

        }
    }


    angular.module('iNaprzod').service("SearchService", SearchService);

}