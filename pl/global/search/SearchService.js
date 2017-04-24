/**
 * Created by Piotr on 2015-08-21.
 */
var pl;
(function (pl) {
    var global;
    (function (global) {
        var search;
        (function (search) {
            var SearchService = (function () {
                function SearchService($http, mainUrl) {
                    this.$http = $http;
                    this.urlBase = mainUrl + '/N5-EgeriaRest-web/resources/search';
                }
                SearchService.prototype.search = function (searchText) {
                    var req = {
                        method: "GET",
                        url: this.urlBase,
                        params: {
                            search: searchText
                        }
                    };
                    return this.$http(req);
                };
                SearchService.$inject = ['$http', 'mainUrl'];
                return SearchService;
            })();
            search.SearchService = SearchService;
            angular.module('iNaprzod').service("SearchService", SearchService);
        })(search = global.search || (global.search = {}));
    })(global = pl.global || (pl.global = {}));
})(pl || (pl = {}));
//# sourceMappingURL=SearchService.js.map