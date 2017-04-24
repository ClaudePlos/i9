/**
 * Created by Piotr on 2015-08-18.
 */
var pl;
(function (pl) {
    var egeria;
    (function (egeria) {
        var companys;
        (function (companys) {
            var model;
            (function (model) {
                var Company = (function () {
                    //
                    function Company() {
                        this.adresy = [
                            { typ: "S" }
                        ];
                        this.cechy = [];
                    }
                    Company.prototype.deleteFromArray = function (arr, me) {
                        if (arr) {
                            var i = arr.length;
                            while (i--)
                                if (arr[i] === me)
                                    arr.splice(i, 1);
                        }
                    };
                    ;
                    Company.asCompany = function (obj) {
                        obj.__proto__ = Company.prototype;
                        obj.prepareCompanyFromServer();
                    };
                    Company.prototype.czyMaCeche = function (feature) {
                        var a = this;
                        if (typeof this.cechy == 'undefined')
                            return false;
                        for (var i = 0; i < this.cechy.length; i++) {
                            if (this.cechy[i].nazwa === feature)
                                return true;
                        }
                        return false;
                    };
                    ;
                    Company.prototype.prepareCompanyFromServer = function () {
                        if (this.czyMaCeche("ZABUDOWA_MONOLIT"))
                            this.rodzajZabudowy = "ZABUDOWA_MONOLIT";
                        else if (this.czyMaCeche("ZABUDOWA_PAWILONOWA"))
                            this.rodzajZabudowy = "ZABUDOWA_PAWILONOWA";
                        else
                            this.rodzajZabudowy = null;
                        if (this.czyMaCeche(Company.JEDNA_LOKALIZACJA))
                            this.iloscLokalizacji = Company.JEDNA_LOKALIZACJA;
                        else if (this.czyMaCeche(Company.WIELE_LOKALIZACJI))
                            this.iloscLokalizacji = Company.WIELE_LOKALIZACJI;
                        else
                            this.iloscLokalizacji = null;
                        this.blokiOperacyjne = this.czyMaCeche("BLOKI_OPERACYJNE");
                        if (typeof this.adresy != 'undefined') {
                            for (var i = 0; i < this.adresy.length; i++) {
                                var adres = this.adresy[i];
                                this['adres' + adres.typ] = adres;
                            }
                            ;
                            // skopiuj podstawoy adres
                            var mainAddress = this.pobierzAdres('S');
                            if (mainAddress != null) {
                                this.ulica = mainAddress.ulica;
                                this.miejscowosc = mainAddress.miejscowosc;
                            }
                        }
                        ;
                    };
                    ;
                    Company.prototype.usunCeche = function (cecha) {
                        if (this.cechy) {
                            var i = this.cechy.length;
                            while (i--)
                                if (this.cechy[i].nazwa === cecha)
                                    this.cechy.splice(i, 1);
                        }
                    };
                    ;
                    Company.prototype.dodajCeche = function (cecha) {
                        this.cechy.push({ nazwa: cecha });
                    };
                    ;
                    Company.prototype.ustawCeche = function (cecha, wartosc) {
                        if (wartosc === true) {
                            if (!this.czyMaCeche(cecha))
                                this.dodajCeche(cecha);
                        }
                        else
                            this.usunCeche(cecha);
                    };
                    ;
                    Company.prototype.pobierzAdres = function (typ) {
                        for (var i = 0; i < this.adresy.length; i++) {
                            if (this.adresy[i].typ == typ)
                                return this.adresy[i];
                        }
                        return null;
                    };
                    ;
                    // prepare before save
                    Company.prototype.prepareBeforeSave = function () {
                        if (!this.cechy)
                            this.cechy = [];
                        console.log("Prepare before save:");
                        console.dir(this.cechy);
                        console.log(this.blokiOperacyjne);
                        if (this.rodzajZabudowy) {
                            this.ustawCeche(Company.ZABUDOWA_MONOLIT, this.rodzajZabudowy === Company.ZABUDOWA_MONOLIT);
                            this.ustawCeche(Company.ZABUDOWA_PAWILONOWA, this.rodzajZabudowy === Company.ZABUDOWA_PAWILONOWA);
                        }
                        if (this.iloscLokalizacji) {
                            this.ustawCeche(Company.JEDNA_LOKALIZACJA, this.iloscLokalizacji === Company.JEDNA_LOKALIZACJA);
                            this.ustawCeche(Company.WIELE_LOKALIZACJI, this.iloscLokalizacji === Company.WIELE_LOKALIZACJI);
                        }
                        if (this.blokiOperacyjne)
                            this.ustawCeche(Company.BLOKI_OPERACYJNE, this.blokiOperacyjne == true);
                        console.dir(this.cechy);
                    };
                    ;
                    Company.prototype.isValid = function () {
                        if (typeof this.kldTyp === 'undefined')
                            return "Wybierz typ firmy";
                        if (typeof this.kldFormaWlasnosci === 'undefined')
                            return "Wybierz formę własności";
                        if (typeof this.kldNazwa == 'undefined')
                            return "Brak nazwy firmy";
                        if (this.adresy == null || this.adresy.length == 0)
                            return "Firma nie ma adresów";
                        for (var i = 0; i < this.adresy.length; i++) {
                            if (typeof this.adresy[i].wojId == 'undefined')
                                return "Adres nie ma województwa";
                        }
                        ;
                        return "OK";
                    };
                    ;
                    // updates attributes to complete company data
                    Company.prototype.updateAttributes = function (data) {
                        for (var propName in data) {
                            // if ( this.hasOwnProperty(propName)){
                            this[propName] = data[propName];
                        }
                        this.prepareCompanyFromServer();
                    };
                    Company.ZABUDOWA_MONOLIT = "ZABUDOWA_MONOLIT";
                    Company.ZABUDOWA_PAWILONOWA = "ZABUDOWA_PAWILONOWA";
                    Company.BLOKI_OPERACYJNE = "BLOKI_OPERACYJNE";
                    Company.JEDNA_LOKALIZACJA = "JEDNA LOKALIZACJA";
                    Company.WIELE_LOKALIZACJI = "WIELE LOKALIZACJI";
                    return Company;
                })();
                model.Company = Company;
            })(model = companys.model || (companys.model = {}));
        })(companys = egeria.companys || (egeria.companys = {}));
    })(egeria = pl.egeria || (pl.egeria = {}));
})(pl || (pl = {}));
//# sourceMappingURL=Company.js.map