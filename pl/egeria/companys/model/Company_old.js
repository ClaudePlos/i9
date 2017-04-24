var deleteFromArray = function (arr, me) {
    if (arr) {
        var i = arr.length;
        while (i--) if (arr[i] === me) arr.splice(i, 1);
    }
};


var Company = function () {
    this.adresy = [
        {typ: "S"}
    ];
    this.cechy = [];
};


Company.asCompany = function (obj) {
    obj.__proto__ = Company.prototype;
    obj.prepareCompanyFromServer();
}

Company.ZABUDOWA_MONOLIT = "ZABUDOWA_MONOLIT";
Company.ZABUDOWA_PAWILONOWA = "ZABUDOWA_PAWILONOWA";
Company.BLOKI_OPERACYJNE = "BLOKI_OPERACYJNE";
Company.JEDNA_LOKALIZACJA = "JEDNA LOKALIZACJA";
Company.WIELE_LOKALIZACJI = "WIELE LOKALIZACJI";

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

Company.prototype.usunCeche = function (cecha) {
    deleteFromArray(this.cechy, cecha);
};

Company.prototype.dodajCeche = function (cecha) {
    this.cechy.push(cecha);
};

Company.prototype.ustawCeche = function (cecha, wartosc) {
    if (wartosc === true)
        this.dodajCeche(cecha);
    else
        this.usunCeche(cecha);
};


Company.prototype.prepareCompanyFromServer = function () {

    if (this.czyMaCeche("ZABUDOWA_MONOLIT"))
        this.rodzajZabudowy = "ZABUDOWA_MONOLIT";
    else if (this.czyMaCeche("ZABUDOWA_PAWILONOWA"))
        this.rodzajZabudowy = "ZABUDOWA_PAWILONOWA";
    else
        this.rodzajZabudowy = null;


    if (this.czyMaCeche(Company.JEDNA_LOKALIZACJA))
        this.rodzajLokalizacji = Company.JEDNA_LOKALIZACJA;
    else if (this.czyMaCeche(Company.WIELE_LOKALIZACJI))
        this.rodzajLokalizacji = Company.WIELE_LOKALIZACJI;
    else
        this.rodzajLokalizacji = null;


    this.blokiOperacyjne = this.czyMaCeche("BLOKI_OPERACYJNE");

    if (typeof this.adresy != 'undefined') {

        for (var i = 0; i < this.adresy.length; i++) {
            adres = this.adresy[i];
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
}
;

Company.prototype.pobierzAdres = function (typ) {
    for (i = 0; i < this.adresy.length; i++) {
        if (this.adresy[i].typ == typ)
            return this.adresy[i];
    }
    return null;
};

// prepare before save
Company.prototype.prepareBeforeSave = function () {

    if (!this.cechy)
        this.cechy = [];
    this.ustawCeche(Company.ZABUDOWA_MONOLIT, this.rodzajZabudowy === Company.ZABUDOWA_MONOLIT);
    this.ustawCeche(Company.ZABUDOWA_PAWILONOWA, this.rodzajZabudowy === Company.ZABUDOWA_PAWILONOWA);
    this.ustawCeche(Company.JEDNA_LOKALIZACJA, this.rodzajLokalizacji === Company.JEDNA_LOKALIZACJA);
    this.ustawCeche(Company.WIELE_LOKALIZACJI, this.rodzajLokalizacji === Company.WIELE_LOKALIZACJI);
    this.ustawCeche(Company.BLOKI_OPERACYJNE, this.blokiOperacyjne === Company.BLOKI_OPERACYJNE);


};

Company.prototype.isValid = function () {

    if (typeof this.kldTyp === 'undefined')
        return "Wybierz typ firmy";
    if (typeof this.kldFormaWlasnosci === 'undefined')
        return "Wybierz formę własności";

    if (typeof this.kldNazwa == 'undefined')
        return "Brak nazwy firmy";


    if (this.adresy == null || this.adresy.length == 0)
        return "Firma nie ma adresów";


    for (i = 0; i < this.adresy.length; i++) {
        if (typeof this.adresy[i].wojId == 'undefined')
            return "Adres nie ma województwa";
    }
    ;


    return "OK";

};
