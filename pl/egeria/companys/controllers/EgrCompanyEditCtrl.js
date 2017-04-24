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
                var EgrCompanyEditCtr = (function () {
                    function EgrCompanyEditCtr($rootScope, $scope, $location, $http, $cookies, CompanysService, DictionariesService) {
                        // we store edited company in var editedCompany
                        // is it update or create
                        this.companyEditModeUpdate = false;
                        this.companyEditModeCreate = false;
                        this.onClickAddAddress = function () {
                            console.log("onClickAddAddress, this");
                            console.log(this);
                            if (this.$scope.editedCompany) {
                                if (!this.$scope.editedCompany.adresy)
                                    this.$scope.editedCompany.adresy = [];
                                this.$scope.editedCompany.adresy.push({ "aktualne": true });
                            }
                        };
                        this.companySaved = function (result) {
                            alert("Firma została zapisana ! ");
                            console.log("companySaved");
                            this.editedCompany = result;
                            this.companyEditModeCreate = false;
                            this.companyEditModeUpdate = true;
                            this.editedCompany.__proto__ = Company.prototype;
                            this.editedCompany.prepareCompanyFromServer();
                        };
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
                        $scope.onClickAddAddress = function () {
                            ctrl.onClickAddAddress();
                        };
                    }
                    EgrCompanyEditCtr.prototype.onSelectedCompanyChange = function () {
                        console.log("on selected company change;");
                        this.$scope.editedCompany = this.$scope.selectedCompany;
                        this.editedCompany = this.$scope.selectedCompany;
                        this.companyEditModeUpdate = true;
                        // convert to company if is not
                        if (this.editedCompany) {
                            Company.asCompany(this.editedCompany);
                            // get data
                            this.CompanysService.completeCompany(this.editedCompany);
                        }
                    };
                    EgrCompanyEditCtr.prototype.readDictionaries = function () {
                        var ctrl = this;
                        this.DictionariesService.getDictionary('TYP KLIENTA').success(function (res) {
                            ctrl.$scope.dictClientType = res;
                        });
                        this.DictionariesService.getDictionary('TYP WLASNOSCI').success(function (res) {
                            ctrl.$scope.dictOwnerType = res;
                        });
                        this.DictionariesService.getDictionary('TYP ADRESU').success(function (res) {
                            ctrl.$scope.dictAddressType = res;
                        });
                        this.DictionariesService.getDictionary('NAPWF_ORGAN_ZALOZYCIELSKI').success(function (res) {
                            ctrl.$scope.dictOrganZalozycielski = res;
                        });
                        this.DictionariesService.listWojewodztwa().success(function (res) {
                            ctrl.$scope.dictWojewodztwa = res;
                        });
                    };
                    EgrCompanyEditCtr.prototype.saveCompany = function () {
                        var ctrl = this;
                        if (!this.editedCompany)
                            return;
                        this.editedCompany.prepareBeforeSave();
                        var errors = this.editedCompany.isValid();
                        if (errors != "OK") {
                            alert("Błąd formularza:" + errors);
                            return;
                        }
                        this.CompanysService.save(this.$scope.editedCompany).then(function (result) {
                            // alert("Firma zapisana poprawnie");
                            console.log("Firma zostałą zapisana!");
                            alert("Firma została zapisana");
                            ctrl.companySaved(result);
                            //this.$scope.navigateBack();
                        });
                    };
                    EgrCompanyEditCtr.prototype.onClickDeleteAddress = function (address) {
                        var index = $.inArray(address, this.$scope.editedCompany.adresy);
                        this.$scope.editedCompany.adresy.splice(index, 1);
                    };
                    EgrCompanyEditCtr.$inject = ['$rootScope', '$scope', '$location', '$http', '$cookies', 'CompanysService', 'DictionariesService'];
                    return EgrCompanyEditCtr;
                })();
                controllers.EgrCompanyEditCtr = EgrCompanyEditCtr;
                console.log("Registering EgrCompanyEditCtr");
                angular.module("iNaprzod").controller("EgrCompanyEditCtr", EgrCompanyEditCtr);
            })(controllers = companys.controllers || (companys.controllers = {}));
        })(companys = egeria.companys || (egeria.companys = {}));
    })(egeria = pl.egeria || (pl.egeria = {}));
})(pl || (pl = {}));
//# sourceMappingURL=EgrCompanyEditCtrl.js.map