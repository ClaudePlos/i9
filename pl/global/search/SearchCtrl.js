/**
 * Created by Piotr on 2015-08-21.
 */
var pl;
(function (pl) {
    var global;
    (function (global) {
        var search;
        (function (search) {
            var SearchCtrl = (function () {
                function SearchCtrl($rootScope, $scope, searchService) {
                    var _this = this;
                    this.results = [];
                    this.resultCount = 0;
                    this.showResults = false;
                    this.searchFocus = false;
                    this.searchService = searchService;
                    this.$rootScope = $rootScope;
                    this.$scope = $scope;
                    $scope.$watch("searchText", function () {
                        _this.onSearchChange();
                    });
                    //$scope.searchText = "Legnica";
                    //this.onSearchChange();
                    // listen for clicks
                    //$('body').click(function (event) {
                    //    var obj = $(event.target);
                    //    obj = obj['context']; // context : clicked element inside body
                    //    console.log("clicked element id:" + $(obj).attr('id'));
                    //    if ($(obj).attr('id') != "menuscontainer" && $('#menuscontainer').is(':visible') == true) {
                    //        //hide menu
                    //    }
                    //});
                }
                SearchCtrl.prototype.onClickOutside = function () {
                    console.log("onClickOutside , searchFocus:" + this.searchFocus);
                    if (!this.searchFocus) {
                        this.showResults = false;
                        this.results = null;
                    }
                    //   this.results = null;
                };
                SearchCtrl.prototype.onDblClickItem = function (item) {
                    console.log("onDblClickItem:" + item);
                    this.$rootScope.$broadcast("onDblClickSearchItem", item);
                };
                SearchCtrl.prototype.onSearchChange = function () {
                    var _this = this;
                    if (this.$scope.searchText) {
                        console.log("onSearchChange");
                        this.results = [];
                        this.searchService.search(this.$scope.searchText).then(function (result) {
                            _this.showResults = true;
                            _this.results = result.data.hits.hits;
                            _this.resultCount = result.data.hits.total;
                        });
                    }
                };
                SearchCtrl.prototype.onBlurSearchBox = function () {
                    //    this.showResults = false;
                    //   this.results = null;
                };
                SearchCtrl.$inject = ['$rootScope', '$scope', 'SearchService'];
                return SearchCtrl;
            })();
            search.SearchCtrl = SearchCtrl;
            angular.module('iNaprzod').controller("SearchCtrl", SearchCtrl);
        })(search = global.search || (global.search = {}));
    })(global = pl.global || (pl.global = {}));
})(pl || (pl = {}));
//# sourceMappingURL=SearchCtrl.js.map