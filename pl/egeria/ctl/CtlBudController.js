/**
 * Created by Piotr on 2015-09-16.
 */
var pl;
(function (pl) {
    var egeria;
    (function (egeria) {
        var ctl;
        (function (ctl) {
            // pozycja budzetu
            var CtlPozycjaTabeli = (function () {
                function CtlPozycjaTabeli(obj) {
                    this.podrzedne = [];
                    this.rozwinieta = true;
                    this.poziom = 1;
                    this.editable = true;
                    this.wartosciBudzetu = {};
                    this.rozwijalna = true;
                    this.visible = true;
                    for (var atr in obj)
                        this[atr] = obj[atr];
                }
                return CtlPozycjaTabeli;
            }());
            ctl.CtlPozycjaTabeli = CtlPozycjaTabeli;
            ;
            var CtlBudController = (function () {
                function CtlBudController($rootScope, $scope, ctlService) {
                    this.miesiace = ["04-2015"];
                    this.budzetyWMc = {};
                    this.$rootScope = $rootScope;
                    this.$scope = $scope;
                    this.ctlService = ctlService;
                    this.ctlService.inicjujAnalityki().then(function () {
                    });
                    var c = this;
                    this.$scope.$on("onPokazBudzet", function (ev, data) {
                        c.onPokazBudzet(data);
                    });
                }
                // dodaje pobrane wartosci budzetu
                CtlBudController.prototype.dodajWartosciMiesiaca = function (wartosci, mc) {
                    this.miesiace.push(this.mcDoDodania);
                    this.generujWartosciBudzetu(wartosci, mc);
                };
                CtlBudController.prototype.generujWartosciBudzetu = function (budzetObiektu) {
                    var okres = this.budzetObiektu.okres;
                    // parsuje wartosci\
                    console.log("generujWartosciBudzetu");
                    console.dir(budzetObiektu);
                    this.budzetyWMc[budzetObiektu.okres] = budzetObiektu;
                    if (budzetObiektu && budzetObiektu.wartosci) {
                        for (var i in budzetObiektu.wartosci) {
                            var bud = budzetObiektu.wartosci[i];
                            var pozTabeli;
                            if (bud.analityka && bud.syntetyka)
                                pozTabeli = this.pozycjeTabeliObj['KOSZT-' + bud.syntetyka + "-" + bud.analityka];
                            else if (bud.syntetyka)
                                pozTabeli = this.pozycjeTabeliObj['KOSZT-' + bud.syntetyka];
                            else if (bud.grupa) {
                                pozTabeli = this.pozycjeTabeliObj[bud.grupa];
                            }
                            console.log("Znaeziono");
                            console.dir(pozTabeli);
                            if (!pozTabeli.wartosciBudzetu[bud.okres]) {
                                pozTabeli.wartosciBudzetu[bud.okres] = { wartosc: 0 };
                            }
                            if (pozTabeli && pozTabeli.wartosciBudzetu[bud.okres] && bud.wartosc != 0) {
                                //console.log("przypisuje wartosc:" + bud.wartosc);
                                pozTabeli.wartosciBudzetu[bud.okres].wartosc = this.formatKwota(bud.wartosc);
                                // jesli trzeba to rozwijam parent
                                if (pozTabeli.nadrzedna && !pozTabeli.nadrzedna.rozwinieta)
                                    this.onClickRozwin(pozTabeli.nadrzedna);
                                pozTabeli.wartosciBudzetu[bud.okres].bud = bud;
                            }
                        }
                    }
                };
                CtlBudController.prototype.tworzPozycjeTabeli = function (data) {
                    var poz = new CtlPozycjaTabeli(data);
                    this.pozycjeTabeliObj[poz.kod] = poz;
                    poz.wartosciBudzetu = {};
                    for (var i in this.miesiace) {
                        poz.wartosciBudzetu[this.miesiace[i]] = { wartosc: 0 };
                    }
                    if (poz.nadrzedna) {
                        poz.nadrzedna.podrzedne.push(poz);
                        poz.poziom = poz.nadrzedna.poziom + 1;
                    }
                    if (!poz.nadrzedna || poz.nadrzedna.rozwinieta) {
                        this.pozycjeTabeliArr.push(poz);
                    }
                    return poz;
                };
                CtlBudController.prototype.generujWierszeTabeli = function () {
                    console.log("generujWierszeTabeli");
                    this.pozycjeTabeliArr = [];
                    this.pozycjeTabeliObj = {};
                    // pozycja koszty
                    // pozycja przychodu
                    var wynik = this.tworzPozycjeTabeli({
                        nazwa: "Wynik",
                        kod: CtlBudController.KOD_WYNIK,
                        editable: false,
                        rozwijalna: false
                    });
                    var przychody = this.tworzPozycjeTabeli({
                        nazwa: "Przychody",
                        kod: CtlBudController.BUD_SUMA_PRZYCHOD,
                        nadrzedna: wynik,
                        editable: false, rozwijalna: false
                    });
                    var iloscOsobodni = this.tworzPozycjeTabeli({
                        nazwa: "Ilość osobodni",
                        kod: CtlBudController.BUD_SUMA_ILOSC_POSILKOW,
                        nadrzedna: przychody,
                        rozwijalna: false,
                        visible: this.budzetObiektu.rodzajDzialalnosci && this.budzetObiektu.rodzajDzialalnosci == '531'
                    });
                    var stawkaOsobodzien = this.tworzPozycjeTabeli({
                        nazwa: "Stawka Osobodzień",
                        kod: CtlBudController.BUD_WSK_STAWKA,
                        nadrzedna: przychody,
                        rozwijalna: false,
                        visible: this.budzetObiektu.rodzajDzialalnosci && this.budzetObiektu.rodzajDzialalnosci == '531'
                    });
                    var przychodFiskalny = this.tworzPozycjeTabeli({
                        nazwa: this.budzetObiektu.rodzajDzialalnosci == '531' ? "Przychód dodatkowy (kwota)" : "Przychód z faktury",
                        kod: CtlBudController.KOD_PRZYCHOD_DODATKOWY,
                        nadrzedna: przychody, rozwijalna: false
                    });
                    // pozycje wsadu
                    var wsad = this.tworzPozycjeTabeli({
                        nazwa: "Wsad - kwota",
                        kod: CtlBudController.BUD_WSK_WSAD,
                        nadrzedna: wynik,
                        rozwijalna: false,
                        visible: this.budzetObiektu.rodzajDzialalnosci && this.budzetObiektu.rodzajDzialalnosci == '531'
                    });
                    var wsadStawka = this.tworzPozycjeTabeli({
                        nazwa: "Wsad jednostkowy",
                        kod: CtlBudController.BUD_WSK_WSAD_JEDNOSTKOWY,
                        nadrzedna: wsad,
                        rozwijalna: false,
                        visible: this.budzetObiektu.rodzajDzialalnosci && this.budzetObiektu.rodzajDzialalnosci == '531'
                    });
                    var koszty = this.tworzPozycjeTabeli({
                        nazwa: "Koszty",
                        kod: CtlBudController.KOD_KOSZTY_RAZEM,
                        nadrzedna: wynik,
                        editable: false, rozwijalna: false
                    });
                    for (var idSynt in this.ctlService.syntetykiArr) {
                        // dodaj pozycje
                        var synt = this.ctlService.syntetykiArr[idSynt];
                        console.dir(synt);
                        var pozycjaSynt = this.tworzPozycjeTabeli({
                            kod: "KOSZT-" + synt.syntetyka,
                            nazwa: synt.nazwa + " (" + synt.syntetyka + ")",
                            syntetyka: synt.syntetyka,
                            rozwinieta: false,
                            nadrzedna: koszty
                        });
                        //koszty.podrzedne.push(pozycjaSynt);
                        // analityki
                        for (var idAnal in synt.analityki) {
                            var anal = synt.analityki[idAnal];
                            var pozycjaAnal = this.tworzPozycjeTabeli({
                                kod: "KOSZT-" + synt.syntetyka + "-" + anal.analityka,
                                nazwa: anal.nazwa + " (" + anal.analityka + ")",
                                syntetyka: synt.syntetyka,
                                analityka: anal.analityka,
                                nadrzedna: pozycjaSynt, rozwijalna: false
                            });
                            //this.pozycjeTabeliArr.push( pozycjaAnal );
                        }
                    }
                };
                CtlBudController.prototype.onClickRozwin = function (pozycja) {
                    console.log("onClickRozwin");
                    pozycja.rozwinieta = !pozycja.rozwinieta;
                    if (pozycja.rozwinieta) {
                        for (var i in pozycja.podrzedne) {
                            this.pozycjeTabeliArr.splice(this.pozycjeTabeliArr.indexOf(pozycja) + 1, 0, pozycja.podrzedne[pozycja.podrzedne.length - i - 1]);
                        }
                    }
                    else {
                        for (var i in pozycja.podrzedne) {
                            this.pozycjeTabeliArr.splice(this.pozycjeTabeliArr.indexOf(pozycja.podrzedne[i]), 1);
                        }
                    }
                    pozycja.editable = !pozycja.rozwinieta;
                };
                CtlBudController.prototype.onPokazBudzet = function (data) {
                    console.log("On Pokaż budżet:");
                    console.log(data);
                    this.pobierzBudzetObiektu(data);
                };
                CtlBudController.prototype.kopiujZMc = function (kopiujZ) {
                    console.log("kopiujzmc" + kopiujZ);
                    var wartosciZ = this.budzetyWMc[kopiujZ].wartosci;
                    var budzetDo = this.budzetObiektu;
                    ;
                    budzetDo.wartosci = [];
                    for (var i in wartosciZ) {
                        var waZ = wartosciZ[i];
                        budzetDo.wartosci.push({
                            grupa: waZ.grupa,
                            wartosc: waZ.wartosc,
                            okres: budzetDo.okres,
                            konto5: waZ.konto5, skKod: waZ.skKod, analityka: waZ.analityka, syntetyka: waZ.syntetyka
                        });
                        // znajdz odpowiednia pozycje
                    }
                    budzetDo.modified = true;
                    this.generujWartosciBudzetu(budzetDo);
                };
                CtlBudController.prototype.pobierzBudzetObiektu = function (data) {
                    var _this = this;
                    console.dir(data);
                    if (!data || !data.rd || !data.skKod || !data.okres) {
                        toastr.warning("Niekompletne dane do wyświetlenia budżetu:" + data.toString());
                        return;
                    }
                    this.miesiace = [data.okres];
                    this.miesiacEdycji = data.okres;
                    this.ctlService.pobierzBudzetObiektu(data.skKod, data.rd, data.okres).then(function (res) {
                        console.log("Pobrano budżet obiektu");
                        _this.budzetObiektu = res;
                        res.editable = true;
                        res.copyable = false;
                        console.dir(_this.budzetObiektu);
                        $('html, body').animate({
                            scrollTop: $("#tblBudzet").offset().top
                        }, 200);
                        // parsuj
                        _this.generujWierszeTabeli();
                        console.log("Wygenerowano");
                        _this.generujWartosciBudzetu(res, data.okres);
                    });
                };
                CtlBudController.prototype.asNumber = function (wa) {
                    var s = String(wa);
                    s = s.replace(",", ".");
                    s = s.replace(" ", "");
                    s = s.replace(" ", "");
                    return Number(s);
                };
                CtlBudController.prototype.formatKwota = function (num) {
                    var p = num.toFixed(2).split(".");
                    return p[0].split("").reduceRight(function (acc, num, i, orig) {
                        if ("-" === num && 0 === i) {
                            return num + acc;
                        }
                        var pos = orig.length - i - 1;
                        return num + (pos && !(pos % 3) ? " " : "") + acc;
                    }, "") + (p[1] ? "." + p[1] : "");
                };
                // dodaje miesiac do tabelki
                CtlBudController.prototype.onClickDodajMiesiac = function () {
                    var _this = this;
                    console.log("onClickDodajMiesiac");
                    if (!this.mcDoDodania) {
                        toastr.error("Wprowadź miesiąć który chcesz dodać");
                        return;
                    }
                    this.ctlService.pobierzBudzetObiektu(this.budzetObiektu.skKod, this.budzetObiektu.rodzajDzialalnosci, this.mcDoDodania).then(function (res) {
                        console.log("Pobrano dodatkowy mc obiektu");
                        _this.miesiace.push(_this.mcDoDodania);
                        res.editable = false;
                        res.copyable = true;
                        _this.generujWartosciBudzetu(res);
                    });
                };
                CtlBudController.prototype.onClickSaveBud = function () {
                    var _this = this;
                    console.log("onClickSaveBud");
                    // create data fo save
                    var toSave = [];
                    var pozWynik = this.pozycjeTabeliObj[CtlBudController.KOD_WYNIK];
                    this.dodajDoZapisu(toSave, pozWynik);
                    console.dir(toSave);
                    // save
                    this.ctlService.saveBudzet(toSave).then(function (res) {
                        console.log("Dane budżetu zostały zapisane");
                        toastr.info("Dane budżetu zostały zapisane!");
                        _this.budzetObiektu = res.data;
                        _this.budzetObiektu.editable = true;
                        _this.generujWierszeTabeli();
                        console.log("Wygenerowano");
                        _this.generujWartosciBudzetu(_this.budzetObiektu);
                        _this.budzetObiektu.modified = false;
                    });
                };
                //onClickKopiujDoOkresu
                CtlBudController.prototype.onClickSaveBudOkres = function () {
                    var _this = this;
                    console.log("onClickSaveBud");
                    // create data fo save
                    var toSave = [];
                    var pozWynik = this.pozycjeTabeliObj[CtlBudController.KOD_WYNIK];
                    this.dodajDoZapisu(toSave, pozWynik);
                    console.dir(toSave);
                    // save
                    this.ctlService.saveBudzetDoOkresu(toSave, this.budzetObiektu.okres, this.mcDoDodaniaDo).then(function (res) {
                        console.log("Dane budżetu zostały zapisane");
                        toastr.info("Dane budżetu zostały zapisane!");
                        _this.budzetObiektu = res.data;
                        _this.budzetObiektu.editable = true;
                        _this.generujWierszeTabeli();
                        console.log("Wygenerowano");
                        _this.generujWartosciBudzetu(_this.budzetObiektu);
                        _this.budzetObiektu.modified = false;
                    });
                };
                CtlBudController.prototype.onClickDoAkceptacji = function () {
                    var _this = this;
                    console.log("onClickDoAkceptacji");
                    this.ctlService.zmienStatus(this.budzetObiektu, "DO_ZATWIERDZENIA").then(function (res) {
                        toastr.info("Status budżetu został zmieniony");
                        _this.budzetObiektu.status = res.data.status;
                    });
                };
                CtlBudController.prototype.onClickZatwierdz = function () {
                    var _this = this;
                    console.log("onClickZatwierdz");
                    this.ctlService.zmienStatus(this.budzetObiektu, "ZATWIERDZONY").then(function (res) {
                        toastr.info("Status budżetu został zmieniony");
                        _this.budzetObiektu.status = res.data.status;
                    });
                };
                CtlBudController.prototype.onClickDoEdycji = function () {
                    var _this = this;
                    console.log("onClickDoEdycji");
                    this.ctlService.zmienStatus(this.budzetObiektu, "NOWY").then(function (res) {
                        toastr.info("Status budżetu został zmieniony");
                        _this.budzetObiektu.status = res.data.status;
                    });
                };
                CtlBudController.prototype.dodajDoZapisu = function (toSave, pozTab) {
                    var _this = this;
                    var bud = null;
                    if (pozTab.wartosciBudzetu[this.budzetObiektu.okres] && pozTab.wartosciBudzetu[this.budzetObiektu.okres].bud)
                        bud = pozTab.wartosciBudzetu[this.budzetObiektu.okres].bud;
                    else {
                        // tworze obiekt bud;
                        bud = {
                            okres: this.budzetObiektu.okres,
                            skKod: this.budzetObiektu.skKod,
                            rodzajDzialalnosci: this.budzetObiektu.rodzajDzialalnosci,
                            analityka: pozTab.analityka,
                            syntetyka: pozTab.syntetyka,
                            grupa: pozTab.kod,
                            konto5: this.budzetObiektu.rodzajDzialalnosci
                        };
                    }
                    if (pozTab.wartosciBudzetu[this.budzetObiektu.okres])
                        bud.wartosc = this.asNumber(pozTab.wartosciBudzetu[this.budzetObiektu.okres].wartosc);
                    toSave.push(bud);
                    if (pozTab.podrzedne) {
                        pozTab.podrzedne.map(function (podrz) {
                            _this.dodajDoZapisu(toSave, podrz);
                        });
                    }
                };
                CtlBudController.prototype.onChangeValue = function (pozycja, mc) {
                    this.budzetObiektu.modified = true;
                    // sumuj analityki
                    console.log("onChangeValue : mc:" + mc);
                    var koszty = this.pozycjeTabeliObj[CtlBudController.KOD_KOSZTY_RAZEM];
                    var sumaKoszt = 0;
                    for (var syntID in koszty.podrzedne) {
                        var synt = koszty.podrzedne[syntID];
                        if (synt.rozwinieta) {
                            var sumaSynt = 0;
                            for (var analId in synt.podrzedne) {
                                var anal = synt.podrzedne[analId];
                                sumaSynt += this.asNumber(anal.wartosciBudzetu[mc].wartosc);
                            }
                            synt.wartosciBudzetu[mc].wartosc = sumaSynt;
                        }
                        sumaKoszt += this.asNumber(synt.wartosciBudzetu[mc].wartosc);
                    }
                    koszty.wartosciBudzetu[mc].wartosc = this.formatKwota(sumaKoszt);
                    // licz przychod
                    var przychody = this.pozycjeTabeliObj[CtlBudController.BUD_SUMA_PRZYCHOD];
                    var iloscOsobodni = this.pozycjeTabeliObj[CtlBudController.BUD_SUMA_ILOSC_POSILKOW];
                    var stawkaOsobodzien = this.pozycjeTabeliObj[CtlBudController.BUD_WSK_STAWKA];
                    // przychod dod
                    var przychodDod = this.pozycjeTabeliObj[CtlBudController.KOD_PRZYCHOD_DODATKOWY];
                    przychody.wartosciBudzetu[mc].wartosc = this.formatKwota(this.asNumber(iloscOsobodni.wartosciBudzetu[mc].wartosc) * this.asNumber(stawkaOsobodzien.wartosciBudzetu[mc].wartosc)
                        + this.asNumber(przychodDod.wartosciBudzetu[mc].wartosc));
                    // licz wsad
                    var wsad = this.pozycjeTabeliObj[CtlBudController.BUD_WSK_WSAD];
                    var wsadStawka = this.pozycjeTabeliObj[CtlBudController.BUD_WSK_WSAD_JEDNOSTKOWY];
                    wsad.wartosciBudzetu[mc].wartosc = this.formatKwota(this.asNumber(iloscOsobodni.wartosciBudzetu[mc].wartosc) * this.asNumber(wsadStawka.wartosciBudzetu[mc].wartosc));
                    /// licz wynik
                    var wynik = this.pozycjeTabeliObj[CtlBudController.KOD_WYNIK];
                    //console.log("Licze wynik:");
                    //console.log(przychody.wartosciBudzetu[mc].wartosc  + " " + this.asNumber(przychody.wartosciBudzetu[mc].wartosc));
                    //console.log(this.asNumber(koszty.wartosciBudzetu[mc].wartosc));
                    wynik.wartosciBudzetu[mc].wartosc = this.formatKwota(this.asNumber(przychody.wartosciBudzetu[mc].wartosc) - this.asNumber(koszty.wartosciBudzetu[mc].wartosc) - this.asNumber(wsad.wartosciBudzetu[mc].wartosc));
                };
                return CtlBudController;
            }());
            CtlBudController.CONTROLLER_NAME = "CtlBudController";
            CtlBudController.BUD_SUMA_PRZYCHOD = "BUD_SUMA_PRZYCHOD";
            CtlBudController.BUD_SUMA_ILOSC_POSILKOW = "BUD_SUMA_ILOSC_POSILKOW";
            CtlBudController.BUD_WSK_STAWKA = "BUD_WSK_STAWKA";
            CtlBudController.KOD_PRZYCHOD_DODATKOWY = "PRZYCHOD_DODATKOWY";
            CtlBudController.BUD_WSK_WSAD = "BUD_WSK_WSAD";
            CtlBudController.BUD_WSK_WSAD_JEDNOSTKOWY = "BUD_WSK_WSAD_JEDNOSTKOWY";
            CtlBudController.KOD_WYNIK = "WYNIK";
            CtlBudController.KOD_KOSZTY_RAZEM = "KOSZTY_RAZEM";
            // narzut kuchni
            CtlBudController.BUD_NARZUT_KUCHNI = "BUD_NARZUT_KUCHNI";
            CtlBudController.BUD_NARZUT_KUCHNI_STAWKA = "BUD_NARZUT_KUCHNI_STAWKA";
            CtlBudController.$inject = ['$rootScope', '$scope', pl.egeria.ctl.CtlService.SERVICE_NAME];
            ctl.CtlBudController = CtlBudController;
            angular.module('iNaprzod').controller(CtlBudController.CONTROLLER_NAME, CtlBudController);
        })(ctl = egeria.ctl || (egeria.ctl = {}));
    })(egeria = pl.egeria || (pl.egeria = {}));
})(pl || (pl = {}));
