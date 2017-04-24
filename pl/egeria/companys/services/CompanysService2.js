angular.module("iNaprzod").factory('CompanysService', ['$http', 'mainUrl',function($http,mainUrl) {

    var urlBase = mainUrl + '/egeria/kontrahenci';
    var f = {};

    f.list = function (firstResult, maxResults,orderBy,filters) 
    {
        return $http.get(firstResult,maxResults,orderBy,filters);
    };
    
    f.get = function(id)
    {
        return $http.get(urlBase+"/"+id);
    };
    
    f.update = function( company )
    {
       return  $http.put(urlBase+"/"+company.klKod, company);
    };
    
     f.create = function( company )
    {
       
       return $http.post(urlBase, company);
    }
    
     return f;
}]);