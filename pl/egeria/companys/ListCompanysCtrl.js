angular.module('iNaprzod').controller('ListCompanysCtrl', ['$rootScope', '$scope', '$location', '$http', '$cookies',
    'CompanysService', 'mainUrl', '$ocLazyLoad', '$window'
    , function ($rootScope, $scope, $location, $http, $cookies, CompanysService, mainUrl, $ocLazyLoad, $window) {

        // filter variable
        $scope.companysFilter = {name: ""};

        console.log("ListaKontrahentowCtrl.init");
        mainScope = $scope;


        //init function
        var init = function () {
            $rootScope.$on("companySaved",
                function (event) {
                    console.log("onCompanySaved");
                    $scope.kthGridOptions.api.refreshView();
                });
        };

        var columnDefs = [
            // this row shows the row index, doesn't use any data from the row
            //{
            //    headerName: "#", width: 50, cellRenderer: function (params) {
            //    return params.node.id + 1;
            //}
            //},
            {headerName: "Kod", field: "klKod", width: 100},
            {headerName: "Nazwa", field: "kldNazwa", width: 0, percentWidth: 100},
            {headerName: "Nip", field: "kldNip", width: 90},
            {headerName: "Miejscowosc", field: "adrMiejscowosc", width: 130},
            {headerName: "Ulica", field: "adrUlica", width: 130}
        ];

        // cell double click handler
        onCellDoubleClicked = function (ev) {
            // edit company
            $scope.$broadcast("egr_edit_company", ev);
            // navigate to edit
            $('html, body').animate({
                scrollTop: $("#divAddCompany").offset().top
            }, 200);

            //console.log("DBL" + ev.data);
            //$location.path("/egeria/companys/editCrm/" + ev.data.klKod);
        };

        $scope.kthGridOptions =
        {
            headerHeight: 35,
            enableColResize: true,
            virtualPaging: true,
            rowSelection: 'single',
            columnDefs: columnDefs,
            rowDeselection: true,
            enableServerSideSorting: true,
            suppressCellSelection: false,
            dataSource: {
                pageSize: 100,
                overflowSize: 100,
                maxConcurrentRequests: 1,
                maxPagesInCache: 2
            },
            rowSelected: function (row) {
                rowSelected(row);
            },
            cellDoubleClicked: onCellDoubleClicked
        };

        var getCallback = function (data) {
            if (data) {
                data.forEach(function (cmp) {
                    pl.egeria.companys.model.Company.asCompany(cmp);

                });
            }
        }

        $scope.gridDataProvider = new MntGridDataProvider($scope.kthGridOptions, mainUrl + "/N5-EgeriaRest-web/resources/egeria/kontrahenci", $http, getCallback);
        console.log("Created");
        // watch for filter changes

        onFilterChanged = function () {
            console.log("filter changed");
            $scope.kthGridOptions.dataSource.filter = $scope.companysFilter;
            $scope.gridDataProvider.refresh();
        };

        rowSelected = function (row) {
            console.log("Row selected");
            console.dir(row);
            var a = 1;
            $scope.selectedCompany = row;
        };

        $scope.onClickAddCompany = function () {
            console.log("onClickAddCompany()");


            $('html, body').animate({
                scrollTop: $("#divAddCompany").offset().top
            }, 200);

            // load partial
            //$ocLazyLoad.load('pl/egeria/companys/parts/EgrCompanyEdit.html').then(
            //    function(response, content){
            //        console.log("Loaded tpl");
            //        var divToAdd = document.createElement("div");
            //        divToAdd.innerHTML = response;
            //        console.log("loaded:");
            //        console.log(content);
            //        mainDiv.append(divToAdd);
            //    });

        }

        $scope.$watch('companysFilter.name', onFilterChanged);


        $scope.fit = function () {
            console.log("FIT");
            if ($scope.kthGridOptions.api) {
                $scope.kthGridOptions.api.sizeColumnsToPercentageFit();
                console.log("FIT AFTER");
            }
            // $scope.gridOptions.api.sizeColumnsToFit();
        }
        window.onresize = $scope.fit();

        angular.element($window).bind('resize', function () {
            console.log("RESIZE EVENT");
            setTimeout(function () {
                $scope.fit();
                $scope.fit();
            }, 50);
            // $scope.fit();
            //$scope.initializeWindowSize();
            //return $scope.$apply();
        });
        setTimeout(function () {
            $scope.fit();
            $scope.fit();
        }, 50);

        init();

    }]);

