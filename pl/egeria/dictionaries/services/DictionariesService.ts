/**
 * Created by Piotr on 2015-08-18.
 */

module pl.egeria.dictionaries {

    export class DictionariesService {

        static $inject = ['$http', 'mainUrl'];
        $http;
        urlBase;
        wojewodztwaUr;


        constructor($http, mainUrl) {
            this.$http = $http;
            this.urlBase = mainUrl + '/N5-EgeriaRest-web/resources/egeria/dictionaries';
            this.wojewodztwaUrl = mainUrl + "/N5-EgeriaRest-web/resources/egeria/wojewodztwa";
        }


        list(firstResult, maxResults, orderBy, filters) {
            return this.$http.get(firstResult, maxResults, orderBy, filters);
        }

        getDictionary(dictionaryCode) {
            return this.$http.get(this.urlBase + "/" + dictionaryCode);
        }

        getDictionaryValue(dictionaryCode, dictionaryValue) {
            return this.$http.get(this.urlBase + "/" + dictionaryCode + "/" + dictionaryValue);
        }

        listWojewodztwa() {
            return this.$http.get(this.wojewodztwaUrl);
        }

        save(company) {

        }
    }


    angular.module('iNaprzod').service("DictionariesService", DictionariesService);
}
;
