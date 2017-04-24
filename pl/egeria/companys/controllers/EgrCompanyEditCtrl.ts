/**
 * Created by Piotr on 2015-08-18.
 */

module pl.egeria.companys.controllers {

    import Company = pl.egeria.companys.model.Company;
    import CompanysService = pl.egeria.companys.services.CompanysService;

    export class EgrCompanyEditCtr {

        static $inject = ['$rootScope', '$scope', '$location', '$http', '$cookies', 'CompanysService', 'DictionariesService'];
        // we store edited company in var editedCompany

        // is it update or create
        companyEditModeUpdate : boolean = false;
        companyEditModeCreate : boolean = false;
        // edited company
        editedCompany   : Company ;
        CompanysService : CompanysService;
        $scope;
        $rootScope;
        DictionariesService;


        constructor($rootScope, $scope, $location, $http, $cookies, CompanysService, DictionariesService) {

            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.DictionariesService = DictionariesService;
            this.CompanysService = CompanysService;
            var ctrl = this;
            console.log("EgrCompanyEditCtr ");
            $scope.$watch('selectedCompany', function () {
                ctrl.onSelectedCompanyChange();
            });
            this.readDictionaries();


            //
            $scope.onClickAddAddress = function ()
            {
                ctrl.onClickAddAddress()
            };
        }

        public onSelectedCompanyChange() {
            console.log("on selected company change;")

            this.$scope.editedCompany = this.$scope.selectedCompany;

            this.editedCompany = this.$scope.selectedCompany;
            this.companyEditModeUpdate = true;
            // convert to company if is not
            if ( this.editedCompany) {
                Company.asCompany(this.editedCompany);
                // get data
                this.CompanysService.completeCompany(this.editedCompany);
            }
        }


        private readDictionaries() {
            var ctrl = this;
            this.DictionariesService.getDictionary('TYP KLIENTA').success(
                function (res) {
                    ctrl.$scope.dictClientType = res;
                });

            this.DictionariesService.getDictionary('TYP WLASNOSCI').success(
                function (res) {
                    ctrl.$scope.dictOwnerType = res;
                });


            this.DictionariesService.getDictionary('TYP ADRESU').success(
                function (res) {
                    ctrl.$scope.dictAddressType = res;
                });

            this.DictionariesService.getDictionary('NAPWF_ORGAN_ZALOZYCIELSKI').success(
                function (res) {
                    ctrl.$scope.dictOrganZalozycielski = res;
                });


            this.DictionariesService.listWojewodztwa().success(
                function (res) {
                    ctrl.$scope.dictWojewodztwa = res;
                });

        }

        onClickAddAddress = function () {
            console.log("onClickAddAddress, this");
            console.log(this);
            if (this.$scope.editedCompany) {
                if (!this.$scope.editedCompany.adresy)
                    this.$scope.editedCompany.adresy = [];
                this.$scope.editedCompany.adresy.push({"aktualne": true});
            }
        };

        saveCompany ()
        {
            var ctrl = this;
            if ( !this.editedCompany )
            return ;
            this.editedCompany.prepareBeforeSave();

            var errors = this.editedCompany.isValid();

            if (errors != "OK") {
                alert("Błąd formularza:" + errors);
                return;
            }


                this.CompanysService.save(this.$scope.editedCompany).then(
                     (result)=> {
                        // alert("Firma zapisana poprawnie");
                        console.log("Firma zostałą zapisana!");
                         alert("Firma została zapisana");
                        ctrl.companySaved(result);
                        //this.$scope.navigateBack();
                    });

        }

        companySaved = function (result)
        {
            alert("Firma została zapisana ! ");
            console.log("companySaved");
            this.editedCompany = result;
            this.companyEditModeCreate = false;
            this.companyEditModeUpdate = true;

            this.editedCompany.__proto__ = Company.prototype;
            this.editedCompany.prepareCompanyFromServer();
        }


        onClickDeleteAddress(address) {
            var index = $.inArray(address, this.$scope.editedCompany.adresy);
            this.$scope.editedCompany.adresy.splice(index, 1);
        }


    }
    console.log("Registering EgrCompanyEditCtr");
    angular.module("iNaprzod").controller("EgrCompanyEditCtr", EgrCompanyEditCtr);
}