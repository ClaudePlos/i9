/**
 * Created by Piotr on 2015-08-21.
 */


module pl.global.search {

    export class SearchCtrl {

        public static $inject = ['$rootScope', '$scope', 'SearchService'];

        $rootScope;
        searchService:SearchService;
        public results = [];
        public resultCount:number = 0;
        public showResults:boolean = false;
        public searchFocus:boolean = false;


        constructor($rootScope, $scope, searchService) {
            this.searchService = searchService;
            this.$rootScope = $rootScope;
            this.$scope = $scope;

            $scope.$watch("searchText", ()=> {
                this.onSearchChange();
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

        public onClickOutside() {
            console.log("onClickOutside , searchFocus:" + this.searchFocus);
            if (!this.searchFocus) {
                this.showResults = false;
                this.results = null;
            }
            //   this.results = null;
        }


        public onDblClickItem(item)
        {
            console.log("onDblClickItem:" + item);
            this.$rootScope.$broadcast("onDblClickSearchItem", item);
        }

        public onSearchChange() {
            if (this.$scope.searchText) {
                console.log("onSearchChange");
                this.results = [];
                this.searchService.search(this.$scope.searchText).then
                ((result)=> {
                    this.showResults = true;
                    this.results = result.data.hits.hits;
                    this.resultCount = result.data.hits.total;

                });
            }
        }

        public onBlurSearchBox() {
            //    this.showResults = false;
            //   this.results = null;
        }
    }

    angular.module('iNaprzod').controller("SearchCtrl", SearchCtrl);
}