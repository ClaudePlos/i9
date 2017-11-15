/**
 * Created by Piotr on 2015-09-16.
 */

module pl.egeria.ctl {



    // pozycja budzetu
    export class CtlPozycjaTabeli {
        nazwa:String;
        kod:String;
        podrzedne = [];
        analityka:String;
        syntetyka:String;
        budzet:Object;
        rozwinieta:Boolean = true;
        nadrzedna:CtlPozycjaTabeli;
        poziom:Number = 1;
        editable:boolean = true;
        wartosciBudzetu = {};
        rozwijalna:boolean = true;
        visible = true;


        constructor(obj) {
            for (var atr in  obj)
                this[atr] = obj[atr];
        }
    }
    ;

    export class CtlBudController {

        public static CONTROLLER_NAME = "CtlBudController";

        public static  BUD_SUMA_PRZYCHOD = "BUD_SUMA_PRZYCHOD";
        public static  BUD_SUMA_ILOSC_POSILKOW = "BUD_SUMA_ILOSC_POSILKOW";
        public static  BUD_WSK_STAWKA = "BUD_WSK_STAWKA";
        public static  KOD_PRZYCHOD_DODATKOWY = "PRZYCHOD_DODATKOWY";

        public static  BUD_WSK_WSAD = "BUD_WSK_WSAD";
        public static  BUD_WSK_WSAD_JEDNOSTKOWY = "BUD_WSK_WSAD_JEDNOSTKOWY";

        public static  KOD_WYNIK = "WYNIK";

        public static  KOD_KOSZTY_RAZEM = "KOSZTY_RAZEM";

        // narzut kuchni
        public static  BUD_NARZUT_KUCHNI = "BUD_NARZUT_KUCHNI";
        public static  BUD_NARZUT_KUCHNI_STAWKA = "BUD_NARZUT_KUCHNI_STAWKA";


        public static $inject = ['$rootScope', '$scope', pl.egeria.ctl.CtlService.SERVICE_NAME];

        $rootScope;
        $scope;
        ctlService;

        analityki;
        pozycjeTabeliArr;
        pozycjeTabeliObj:Object;
        miesiace = ["04-2015"];
        miesiacEdycji:string;
        budzetObiektu;
        mcDoDodania:string;
        mcDoDodaniaDo:string;
        budzetyWMc = {};

        constructor($rootScope, $scope, ctlService) {
            this.$rootScope = $rootScope;
            this.$scope = $scope;
            this.ctlService = ctlService;

            this.ctlService.inicjujAnalityki().then(
                ()=> {

                }
            )

            var c = this;
            this.$scope.$on("onPokazBudzet", function (ev, data) {
                c.onPokazBudzet(data);
            })
        }

        // dodaje pobrane wartosci budzetu
        public dodajWartosciMiesiaca(wartosci, mc) {
            this.miesiace.push(this.mcDoDodania);
            this.generujWartosciBudzetu(wartosci, mc);
        }

        public generujWartosciBudzetu(budzetObiektu) {

            var okres = this.budzetObiektu.okres;
            // parsuje wartosci\
            console.log("generujWartosciBudzetu");
            console.dir(budzetObiektu);
            this.budzetyWMc[budzetObiektu.okres] = budzetObiektu;
            if (budzetObiektu && budzetObiektu.wartosci) {
                for (var i in budzetObiektu.wartosci) {
                    var bud = budzetObiektu.wartosci[i];
                    var pozTabeli:CtlPozycjaTabeli;
                    if (bud.analityka && bud.syntetyka)
                        pozTabeli = this.pozycjeTabeliObj['KOSZT-' + bud.syntetyka + "-" + bud.analityka];
                    else if (bud.syntetyka)
                        pozTabeli = this.pozycjeTabeliObj['KOSZT-' + bud.syntetyka];
                    // z kodem
                    else if (bud.grupa) {
                        pozTabeli = this.pozycjeTabeliObj[bud.grupa];
                    }

                    console.log("Znaeziono");
                    console.dir(pozTabeli);
                    if (!pozTabeli.wartosciBudzetu[bud.okres]) {
                        pozTabeli.wartosciBudzetu[bud.okres] = {wartosc: 0};
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
        }

        public tworzPozycjeTabeli(data) {
            var poz = new CtlPozycjaTabeli(data);
            this.pozycjeTabeliObj[poz.kod] = poz;

            poz.wartosciBudzetu = {};
            for (var i in this.miesiace) {
                poz.wartosciBudzetu[this.miesiace[i]] = {wartosc: 0};
            }

            if (poz.nadrzedna) {
                poz.nadrzedna.podrzedne.push(poz)
                poz.poziom = poz.nadrzedna.poziom + 1;
            }
            if (!poz.nadrzedna || poz.nadrzedna.rozwinieta) {
                this.pozycjeTabeliArr.push(poz);

            }

            return poz;
        }

        public generujWierszeTabeli() {
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
        }

        public onClickRozwin(pozycja) {
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
        }


        private onPokazBudzet(data) {
            console.log("On Pokaż budżet:");
            console.log(data);
            this.pobierzBudzetObiektu(data);
        }


        public kopiujZMc(kopiujZ) {
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
            budzetDo.modified= true;
            this.generujWartosciBudzetu(budzetDo);
        }

        private pobierzBudzetObiektu(data) {
            console.dir(data);
            if (!data || !data.rd || !data.skKod || !data.okres) {
                toastr.warning("Niekompletne dane do wyświetlenia budżetu:" + data.toString());
                return;
            }

            this.miesiace = [data.okres];
            this.miesiacEdycji = data.okres;

            this.ctlService.pobierzBudzetObiektu(data.skKod, data.rd, data.okres).then
            ((res)=> {
                console.log("Pobrano budżet obiektu");
                this.budzetObiektu = res;
                res.editable = true;
                res.copyable = false;
                console.dir(this.budzetObiektu);
                $('html, body').animate({
                    scrollTop: $("#tblBudzet").offset().top
                }, 200);
                // parsuj
                this.generujWierszeTabeli();
                console.log("Wygenerowano");
                this.generujWartosciBudzetu(res, data.okres);
            });
        }

        public asNumber(wa) {
            var s = String(wa);
            s = s.replace(",", ".");
            s = s.replace(" ", "");
            s = s.replace(" ", "");
            return Number(s);
        }

        formatKwota(num) {
            var p = num.toFixed(2).split(".");
            return p[0].split("").reduceRight(function (acc, num, i, orig) {
                    if ("-" === num && 0 === i) {
                        return num + acc;
                    }
                    var pos = orig.length - i - 1
                    return num + (pos && !(pos % 3) ? " " : "") + acc;
                }, "") + (p[1] ? "." + p[1] : "");
        }


        // dodaje miesiac do tabelki
        public onClickDodajMiesiac() {
            console.log("onClickDodajMiesiac");
            if (!this.mcDoDodania) {
                toastr.error("Wprowadź miesiąć który chcesz dodać");
                return;
            }

            this.ctlService.pobierzBudzetObiektu(this.budzetObiektu.skKod, this.budzetObiektu.rodzajDzialalnosci, this.mcDoDodania).then
            ((res)=> {
                console.log("Pobrano dodatkowy mc obiektu");
                this.miesiace.push(this.mcDoDodania);
                res.editable = false;
                res.copyable = true;
                this.generujWartosciBudzetu(res);
            });


        }

        public onClickSaveBud() {
            console.log("onClickSaveBud");

            // create data fo save
            var toSave = [];
            var pozWynik = this.pozycjeTabeliObj[CtlBudController.KOD_WYNIK];
            this.dodajDoZapisu(toSave, pozWynik);
            console.dir(toSave);
            // save
            this.ctlService.saveBudzet(toSave).then
            (
                (res)=> {
                    console.log("Dane budżetu zostały zapisane");
                    toastr.info("Dane budżetu zostały zapisane!");
                    this.budzetObiektu = res.data;
                    this.budzetObiektu.editable = true; 
                    this.generujWierszeTabeli();
                    console.log("Wygenerowano");
                    this.generujWartosciBudzetu(this.budzetObiektu);
                    this.budzetObiektu.modified = false;


                }
            );
        }


        //onClickKopiujDoOkresu
        public onClickSaveBudOkres() {
            console.log("onClickSaveBud");

            // create data fo save
            var toSave = [];
            var pozWynik = this.pozycjeTabeliObj[CtlBudController.KOD_WYNIK];
            this.dodajDoZapisu(toSave, pozWynik);
            console.dir(toSave);
            // save
            this.ctlService.saveBudzetDoOkresu(toSave, this.budzetObiektu.okres, this.mcDoDodaniaDo ).then
            (
                (res)=> {
                    console.log("Dane budżetu zostały zapisane");
                    toastr.info("Dane budżetu zostały zapisane!");
                    this.budzetObiektu = res.data;
                    this.budzetObiektu.editable = true;
                    this.generujWierszeTabeli();
                    console.log("Wygenerowano");
                    this.generujWartosciBudzetu(this.budzetObiektu);
                    this.budzetObiektu.modified = false;


                }
            );
        }



        public  onClickDoAkceptacji() {
            console.log("onClickDoAkceptacji");
            this.ctlService.zmienStatus(this.budzetObiektu, "DO_ZATWIERDZENIA").then(
                (res)=> {
                    toastr.info("Status budżetu został zmieniony");
                    this.budzetObiektu.status = res.data.status;
                }
            );

        }


        public  onClickZatwierdz() {
            console.log("onClickZatwierdz");
            this.ctlService.zmienStatus(this.budzetObiektu, "ZATWIERDZONY").then(
                (res)=> {
                    toastr.info("Status budżetu został zmieniony");
                    this.budzetObiektu.status = res.data.status;
                }
            );

        }

        public  onClickDoEdycji() {
            console.log("onClickDoEdycji");
            this.ctlService.zmienStatus(this.budzetObiektu, "NOWY").then(
                (res)=> {
                    toastr.info("Status budżetu został zmieniony");
                    this.budzetObiektu.status = res.data.status;
                }
            );

        }

        public dodajDoZapisu(toSave, pozTab:CtlPozycjaTabeli) {
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
                }
            }
            if (pozTab.wartosciBudzetu[this.budzetObiektu.okres])
                bud.wartosc = this.asNumber(pozTab.wartosciBudzetu[this.budzetObiektu.okres].wartosc);

            toSave.push(bud);
            if (pozTab.podrzedne) {
                pozTab.podrzedne.map((podrz)=> {
                    this.dodajDoZapisu(toSave, podrz);
                })
            }
        }


        public onChangeValue(pozycja, mc) {
            this.budzetObiektu.modified = true;
            // sumuj analityki
            console.log("onChangeValue : mc:" + mc);
            var koszty = this.pozycjeTabeliObj[CtlBudController.KOD_KOSZTY_RAZEM];
            var sumaKoszt:number = 0;
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
            var przychody = this.pozycjeTabeliObj[CtlBudController.BUD_SUMA_PRZYCHOD]
            var iloscOsobodni = this.pozycjeTabeliObj[CtlBudController.BUD_SUMA_ILOSC_POSILKOW]
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
        }


    }


    angular.module('iNaprzod').controller(CtlBudController.CONTROLLER_NAME, CtlBudController);


}