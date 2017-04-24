/**
 * Created by Piotr on 2015-08-18.
 */
var pl;
(function (pl) {
    var egeria;
    (function (egeria) {
        var companys;
        (function (companys) {
            var controllers;
            (function (controllers) {
                var Company = pl.egeria.companys.model.Company;
                var EgrCompanyContactsCtrl = (function () {
                    function EgrCompanyContactsCtrl($rootScope, $scope, $location, $http, $cookies, CompanysService, DictionariesService) {
                        // we store edited company in var editedCompany
                        // is it update or create
                        this.companyEditModeUpdate = false;
                        this.companyEditModeCreate = false;
                        this.$scope = $scope;
                        this.DictionariesService = DictionariesService;
                        this.CompanysService = CompanysService;
                        var ctrl = this;
                        console.log("EgrCompanyEditCtr ");
                        $scope.$watch('selectedCompany', function () {
                            ctrl.onSelectedCompanyChange();
                        });
                        this.createTableDefinition();
                    }
                    EgrCompanyContactsCtrl.prototype.onSelectedCompanyChange = function () {
                        console.log("on selected company change;");
                        this.company = this.$scope.selectedCompany;
                        // convert to company if is not
                        if (this.company) {
                            Company.asCompany(this.company);
                            // get data
                            this.readCompanyContacts();
                        }
                    };
                    EgrCompanyContactsCtrl.prototype.readCompanyContacts = function () {
                        console.log("readCompanyContacts");
                    };
                    EgrCompanyContactsCtrl.prototype.createTableDefinition = function () {
                        var columnDefs = [
                            { headerName: "id", field: "id", width: 100 },
                            { headerName: "Nazwa", field: "kldNazwa", width: 0, percentWidth: 100 },
                            { headerName: "Nip", field: "kldNip", width: 90 },
                            { headerName: "Miejscowosc", field: "adrMiejscowosc", width: 130 },
                            { headerName: "Ulica", field: "adrUlica", width: 130 }
                        ];
                        // cell double click handler
                        //onCellDoubleClicked = function (ev) {
                        //    // edit company
                        //    $scope.$broadcast("egr_edit_company");
                        //    // navigate to edit
                        //    $('html, body').animate({
                        //        scrollTop: $("#divAddCompany").offset().top
                        //    }, 200);
                        //
                        //    //console.log("DBL" + ev.data);
                        //    //$location.path("/egeria/companys/editCrm/" + ev.data.klKod);
                        //};
                        this.contactsHistoryTableDef = {
                            headerHeight: 35,
                            enableColResize: true,
                            virtualPaging: true,
                            rowSelection: 'single',
                            columnDefs: columnDefs,
                            rowDeselection: true,
                            enableServerSideSorting: true,
                            suppressCellSelection: true,
                            dataSource: {
                                pageSize: 100,
                                overflowSize: 100,
                                maxConcurrentRequests: 1,
                                maxPagesInCache: 2
                            }
                        };
                    };
                    EgrCompanyContactsCtrl.$inject = ['$rootScope', '$scope', '$location', '$http', '$cookies', 'CompanysService', 'DictionariesService'];
                    return EgrCompanyContactsCtrl;
                })();
                controllers.EgrCompanyContactsCtrl = EgrCompanyContactsCtrl;
                angular.module("iNaprzod").controller("EgrCompanyContactsCtrl", EgrCompanyContactsCtrl);
            })(controllers = companys.controllers || (companys.controllers = {}));
        })(companys = egeria.companys || (egeria.companys = {}));
    })(egeria = pl.egeria || (pl.egeria = {}));
})(pl || (pl = {}));
//# sourceMappingURL=EgrCompanyContactsCtrl.js.map