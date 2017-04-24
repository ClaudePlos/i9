/**
 * Created by Piotr on 2015-08-18.
 */
var pl;
(function (pl) {
    var egeria;
    (function (egeria) {
        var dictionaries;
        (function (dictionaries) {
            var DictionariesService = (function () {
                function DictionariesService($http, mainUrl) {
                    this.$http = $http;
                    this.urlBase = mainUrl + '/N5-EgeriaRest-web/resources/egeria/dictionaries';
                    this.wojewodztwaUrl = mainUrl + "/N5-EgeriaRest-web/resources/egeria/wojewodztwa";
                }
                DictionariesService.prototype.list = function (firstResult, maxResults, orderBy, filters) {
                    return this.$http.get(firstResult, maxResults, orderBy, filters);
                };
                DictionariesService.prototype.getDictionary = function (dictionaryCode) {
                    return this.$http.get(this.urlBase + "/" + dictionaryCode);
                };
                DictionariesService.prototype.getDictionaryValue = function (dictionaryCode, dictionaryValue) {
                    return this.$http.get(this.urlBase + "/" + dictionaryCode + "/" + dictionaryValue);
                };
                DictionariesService.prototype.listWojewodztwa = function () {
                    return this.$http.get(this.wojewodztwaUrl);
                };
                DictionariesService.prototype.save = function (company) {
                };
                DictionariesService.$inject = ['$http', 'mainUrl'];
                return DictionariesService;
            })();
            dictionaries.DictionariesService = DictionariesService;
            angular.module('iNaprzod').service("DictionariesService", DictionariesService);
        })(dictionaries = egeria.dictionaries || (egeria.dictionaries = {}));
    })(egeria = pl.egeria || (pl.egeria = {}));
})(pl || (pl = {}));
;
//# sourceMappingURL=DictionariesService.js.map