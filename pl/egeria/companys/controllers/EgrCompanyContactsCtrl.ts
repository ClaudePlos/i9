/**
 * Created by Piotr on 2015-08-18.
 */

module pl.egeria.companys.controllers {

    import Company = pl.egeria.companys.model.Company;
    import CompanysService = pl.egeria.companys.services.CompanysService;

    export class EgrCompanyContactsCtrl {

        static $inject = ['$rootScope', '$scope', '$location', '$http', '$cookies', 'CompanysService', 'DictionariesService'];
        // we store edited company in var editedCompany

        // is it update or create
        companyEditModeUpdate : boolean = false;
        companyEditModeCreate : boolean = false;
        // edited company
        public company   : Company ;
        CompanysService : CompanysService;

        contactsHistoryTableDef ;
        contactsHistoryTableDataProvider;

        constructor($rootScope, $scope, $location, $http, $cookies, CompanysService, DictionariesService) {

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

        public onSelectedCompanyChange()
        {
            console.log("on selected company change;")

            this.company = this.$scope.selectedCompany;


            // convert to company if is not
            if ( this.company) {
                Company.asCompany(this.company);
                // get data
                this.readCompanyContacts();
            }
        }


        public readCompanyContacts() {
            console.log("readCompanyContacts");
        }


        private createTableDefinition() {
            var columnDefs = [
                // this row shows the row index, doesn't use any data from the row
                //{
                //    headerName: "#", width: 50, cellRenderer: function (params) {
                //    return params.node.id + 1;
                //}
                //},
                {headerName: "id", field: "id", width: 100},
                {headerName: "Nazwa", field: "kldNazwa", width: 0, percentWidth: 100},
                {headerName: "Nip", field: "kldNip", width: 90},
                {headerName: "Miejscowosc", field: "adrMiejscowosc", width: 130},
                {headerName: "Ulica", field: "adrUlica", width: 130}
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

           this.contactsHistoryTableDef =
            {
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
                },
                //rowSelected: function (row) {
                //    rowSelected(row);
                //},
                //cellDoubleClicked: onCellDoubleClicked
            };



        }


    }
    angular.module("iNaprzod").controller("EgrCompanyContactsCtrl", EgrCompanyContactsCtrl);
}