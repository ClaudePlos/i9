/**
 * Created by Piotr on 2015-08-24.
 */

module pl.egeria.ctl {
    export class CtlService {
        public static SERVICE_NAME = "egeria.CtlService";

        static $inject = ['$http', 'mainUrl', '$rootScope', '$q'];

        $rootScope;
        $http;
        urlBase;
        mainUrl;

        // pobrane dane
        analitykiFlat; // plaska tabela z pobranymi danymi analityk
        analitki;
        syntetykiObj;
        syntetykiArr;
        $q;

        constructor($http, mainUrl, $rootScope, $q) {
            this.$http = $http;
            this.$rootScope = $rootScope;
            this.urlBase = mainUrl + '/N1-Controlling-web/resources/egeria/ctl';
            this.mainUrl = mainUrl;
            this.$q = $q;
        }


        public listAnalityki() {
            var s = this;
            var req = {
                url: s.urlBase + "/api/listAnalityki"
            };

            return this.$http(req);

        }

        public listDostepneFirmy() {
            var s = this;
            var req = {
                url: s.urlBase + "/api/listDostepneFirmy"
            };

            return this.$http(req);
        }


        public inicjujAnalityki() {
            var c = this;
            var p = this.$q(function (resolve, reject) {
                if (c.analitykiFlat) {
                    // sa juz pobrane
                    resolve();
                }
                // trzeba pobrac
                c.listAnalityki().then(
                    function (res) {
                        //console.dir(res);
                        c.analitykiFlat = res.data;
                        c.parsujAnalityki(c.analitykiFlat);
                        resolve();
                    })
            });
            return p;
        }

        public parsujAnalityki(data) {
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

            data.forEach((an)=> {
                if (!this.syntetykiObj.hasOwnProperty(an.syntetyka)) {
                    this.syntetykiObj[an.syntetyka] = {
                        "nazwa": an.syntetyka_nazwa,
                        "syntetyka": an.syntetyka,
                        "analityki": {}
                    };
                    this.syntetykiArr.push(this.syntetykiObj[an.syntetyka]);
                }

                this.syntetykiObj[an.syntetyka].analityki[an.analityka] = {
                    "nazwa": an.analityka_nazwa,
                    "syntetyka": an.syntetyka,
                    "analityka": an.analityka
                };
            });
            // sort

        }

        public odswiezDane(mc, params):Promise {

            var req = {
                method: 'GET',
                params: params,
                url: this.urlBase + "/calculate/month/" + mc
            };

            return this.$http(req);

        }

        public saveBudzet(dane) {
            var req = {
                method: 'POST',
                url: this.mainUrl + "/N1-Controlling-web/resources/budzet/sk/wartosci",
                data: dane
            }

            return this.$http(req);
        }

        public zmienStatus(wierszBudzetu, nowyStatus) {

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

                c.$http(req).then((res)=> {
                    console.log("Status budzetu zostal zmieniony");
                    wierszBudzetu.statusBudzetu = res.data.status;
                    for (var i = wierszBudzetu.podrzedne.length - 1; i >= 0; i--) {
                        wierszBudzetu.podrzedne[i].statusBudzetu = wierszBudzetu.statusBudzetu;
                    }
                    resolve(res.data);
                });


            });
            return p;
        }

        public pobierzBudzetObiektu(skKod, rd, okres) {

            var self = this;
            var req = {
                method: 'GET',
                url: this.mainUrl + "/N1-Controlling-web/resources/budzet/sk",
                params: {
                    okres: okres,
                    skKod: skKod,
                    rd: rd
                }
            }
            var p = this.$q((resolve, reject)=> {
                self.$http(req).then(
                    (result)=> {
                        resolve(result.data);
                    }, (failure)=> {
                        reject(failure);
                    }
                )
            });
            return p;

        }

        public listKosztyWMc(dywizja, frmId, mc, params):Promise {
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
                s.$http(req).then((result)=> {
                    console.log("got");
                    resolve(result.data);
                });

            });
            return p;
        }

        public listKsiegowania(dywizja, frmId, skKod, okres, syntetyka, analityka) {

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

        }

        public openDokEgeriaPdf(dokId) {
            var time:Date = new Date();
            var url = "https://i.naprzod.pl/i/dok?action=getdokegeriapdf&rn=" + time.getTime() + "&dokEgeriaId=";
            url += dokId;
            window.open(url, "_blank");
        }
    }

    angular.module('iNaprzod').service(CtlService.SERVICE_NAME, CtlService);
}