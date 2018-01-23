/**
 * Created by Piotr on 2015-08-24.
 */
var pl;
(function (pl) {
    var egeria;
    (function (egeria) {
        var ctl;
        (function (ctl) {
            var CtlService = (function () {
                function CtlService($http, mainUrl, $rootScope, $q) {
                    this.$http = $http;
                    this.$rootScope = $rootScope;
                    this.urlBase = mainUrl + '/N1-Controlling-web/resources/egeria/ctl';
                    this.mainUrl = mainUrl;
                    this.$q = $q;
                }
                CtlService.prototype.listAnalityki = function () {
                    var s = this;
                    var req = {
                        url: s.urlBase + "/api/listAnalityki"
                    };
                    return this.$http(req);
                };
                CtlService.prototype.listDostepneFirmy = function () {
                    var s = this;
                    var req = {
                        url: s.urlBase + "/api/listDostepneFirmy"
                    };
                    return this.$http(req);
                };
                CtlService.prototype.inicjujAnalityki = function () {
                    var c = this;
                    var p = this.$q(function (resolve, reject) {
                        if (c.analitykiFlat) {
                            // sa juz pobrane
                            resolve();
                        }
                        // trzeba pobrac
                        c.listAnalityki().then(function (res) {
                            //console.dir(res);
                            c.analitykiFlat = res.data;
                            c.parsujAnalityki(c.analitykiFlat);
                            resolve();
                        });
                    });
                    return p;
                };
                CtlService.prototype.parsujAnalityki = function (data) {
                    var _this = this;
                    this.syntetykiObj = {};
                    this.syntetykiArr = [];
                    data.sort(function (a, b) {
                        var an = Number(a);
                        var bn = Number(b);
                        if (a.syntetyka == b.syntetyka)
                            return a.analityka.localeCompare(b.analityka);
                        else
                            return a.syntetyka.localeCompare(b.syntetyka);
                    });
                    data.forEach(function (an) {
                        if (!_this.syntetykiObj.hasOwnProperty(an.syntetyka)) {
                            _this.syntetykiObj[an.syntetyka] = {
                                "nazwa": an.syntetyka_nazwa,
                                "syntetyka": an.syntetyka,
                                "analityki": {}
                            };
                            _this.syntetykiArr.push(_this.syntetykiObj[an.syntetyka]);
                        }
                        _this.syntetykiObj[an.syntetyka].analityki[an.analityka] = {
                            "nazwa": an.analityka_nazwa,
                            "syntetyka": an.syntetyka,
                            "analityka": an.analityka
                        };
                    });
                    // sort
                };
                CtlService.prototype.odswiezDane = function (mc, params) {
                    var req = {
                        method: 'GET',
                        params: params,
                        url: this.urlBase + "/calculate/month/" + mc
                    };
                    return this.$http(req);
                };
                CtlService.prototype.saveBudzet = function (dane) {
                    var req = {
                        method: 'POST',
                        url: this.mainUrl + "/N1-Controlling-web/resources/budzet/sk/wartosci",
                        data: dane
                    };
                    return this.$http(req);
                };
                CtlService.prototype.saveBudzetDoOkresu = function (dane, okresOd, okresDo) {
                    var req = {
                        method: 'POST',
                        url: this.mainUrl + "/N1-Controlling-web/resources/budzet/sk/okres/wartosci",
                        data: dane,
                        params: {
                            okresOd: okresOd,
                            okresDo: okresDo
                        }
                    };
                    return this.$http(req);
                };
                CtlService.prototype.zmienStatus = function (wierszBudzetu, nowyStatus) {
                    var c = this;
                    var p = this.$q(function (resolve, reject) {
                        var req = {
                            method: 'POST',
                            url: c.mainUrl + "/N1-Controlling-web/resources/budzet/zmienStatus",
                            params: {
                                ob_pelny_kod: wierszBudzetu.obPelnyKod,
                                rd: wierszBudzetu.statusBudzetu.rodzajDzialalnosci,
                                okres: wierszBudzetu.okres,
                                nowyStatus: nowyStatus
                            }
                        };
                        c.$http(req).then(function (res) {
                            console.log("Status budzetu zostal zmieniony");
                            wierszBudzetu.statusBudzetu = res.data.status;
                            for (var i = wierszBudzetu.podrzedne.length - 1; i >= 0; i--) {
                                wierszBudzetu.podrzedne[i].statusBudzetu = wierszBudzetu.statusBudzetu;
                            }
                            resolve(res.data);
                        });
                    });
                    return p;
                };
                CtlService.prototype.pobierzBudzetObiektu = function (skKod, rd, okres) {
                    var self = this;
                    var req = {
                        method: 'GET',
                        url: this.mainUrl + "/N1-Controlling-web/resources/budzet/sk",
                        params: {
                            okres: okres,
                            skKod: skKod,
                            rd: rd
                        }
                    };
                    var p = this.$q(function (resolve, reject) {
                        self.$http(req).then(function (result) {
                            resolve(result.data);
                        }, function (failure) {
                            reject(failure);
                        });
                    });
                    return p;
                };
                CtlService.prototype.listKosztyWMc = function (dywizja, frmId, mc, params) {
                    var s = this;
                    params.mc = mc;
                    params.dywizja = dywizja;
                    params.frmId = frmId;
                    var p = new Promise(function (resolve, reject) {
                        var req = {
                            method: 'GET',
                            url: s.urlBase + "/api/mc",
                            params: params
                        };
                        console.log("query");
                        s.$http(req).then(function (result) {
                            console.log("got");
                            //console.log(result.data);
                            resolve(result.data);
                        });
                    });
                    return p;
                };
                CtlService.prototype.listKsiegowania = function (dywizja, frmId, skKod, okres, syntetyka, analityka) {
                    if (frmId == "*")
                        frmId = null;
                    if (dywizja == "*")
                        dywizja = "ALL";
                    var ret = {
                        url: this.urlBase + "/api/ksiegowania",
                        method: "GET",
                        params: {
                            okres: okres, skKod: skKod,
                            dywizja: dywizja, frmId: frmId, syntetyka: syntetyka, analityka: analityka
                        }
                    };
                    return this.$http(ret);
                };
                CtlService.prototype.openDokEgeriaPdf = function (dokId) {
                    var time = new Date();
                    var url = "https://i.naprzod.pl/i/dok?action=getdokegeriapdf&rn=" + time.getTime() + "&dokEgeriaId=";
                    url += dokId;
                    window.open(url, "_blank");
                };
                CtlService.SERVICE_NAME = "egeria.CtlService";
                CtlService.$inject = ['$http', 'mainUrl', '$rootScope', '$q'];
                return CtlService;
            }());
            ctl.CtlService = CtlService;
            angular.module('iNaprzod').service(CtlService.SERVICE_NAME, CtlService);
        })(ctl = egeria.ctl || (egeria.ctl = {}));
    })(egeria = pl.egeria || (pl.egeria = {}));
})(pl || (pl = {}));
