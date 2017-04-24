/**
 * Created by Piotr on 2015-08-18.
 */

module pl.egeria.companys.model {

    export class Company {

        public static  ZABUDOWA_MONOLIT = "ZABUDOWA_MONOLIT";
        public static  ZABUDOWA_PAWILONOWA = "ZABUDOWA_PAWILONOWA";
        public static  BLOKI_OPERACYJNE = "BLOKI_OPERACYJNE";
        public static  JEDNA_LOKALIZACJA = "JEDNA LOKALIZACJA";
        public static  WIELE_LOKALIZACJI = "WIELE LOKALIZACJI";

        //adresy:Array;
        //cechy:Array;
        kldId:number;
        klKod:number;
        klSkrot:string;
        kldTyp:string;
        kldNazwa:string;
        kldNip:string;
        kldPesel:string;
        kldRegon:string;
        kldFormaWlasnosci:string;
        def0:string;
        def1:string;
        def2:string;
        def3:string;
        def4:string;
        def5:string;
        klWapId:string;
        kldZatwierdzony:string;
        kldMiejsceUrodzenia:string;
        kldKrs:string;
        kldPkd:string;
        kodOrganZalozycielski:string;
        powierzchnia:number;
        liczbaLozek:number;
        branza:string;
        rodzajZabudowy:string;
        iloscLokalizacji:string;
        blokiOperacyjne:boolean;
        adrWojId:number;
        adrLp:number;
        adrMiejscowosc:string;
        adrTypUlicy:string;
        adrZatwierdzony:string;
        adrAktualne:string;
        adrGmina:string;
        adrKodPocztowy:string;
        adrUlica:string;
        adrNumerDomu:string;
        adrNumerLokalu:string;
        adrPoczta:string;
        adrPowiat:string;
        //

        constructor() {
            this.adresy = [
                {typ: "S"}
            ];
            this.cechy = [];
        }

        deleteFromArray(arr, me) {
            if (arr) {
                var i = arr.length;
                while (i--) if (arr[i] === me) arr.splice(i, 1);
            }
        };


        public static asCompany(obj) {
            obj.__proto__ = Company.prototype;
            obj.prepareCompanyFromServer();

        }


        public czyMaCeche(feature) {
            var a = this;
            if (typeof this.cechy == 'undefined')
                return false;

            for (var i = 0; i < this.cechy.length; i++) {
                if (this.cechy[i].nazwa === feature)
                    return true;
            }
            return false;
        };

        public prepareCompanyFromServer() {

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
        }
        ;

        usunCeche(cecha) {
            if (this.cechy) {
                var i = this.cechy.length;
                while (i--)
                    if (this.cechy[i].nazwa === cecha)
                        this.cechy.splice(i, 1);
            }

        };

        dodajCeche(cecha) {
            this.cechy.push({nazwa: cecha});
        };

        ustawCeche(cecha, wartosc) {
            if (wartosc === true) {
                if (!this.czyMaCeche(cecha))
                    this.dodajCeche(cecha);
            }
            else
                this.usunCeche(cecha);
        };


        pobierzAdres(typ) {
            for (var i = 0; i < this.adresy.length; i++) {
                if (this.adresy[i].typ == typ)
                    return this.adresy[i];
            }
            return null;
        };

// prepare before save
        prepareBeforeSave() {

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

        isValid() {

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


        // updates attributes to complete company data
        public updateAttributes(data) {

            for (var propName in data) {
                // if ( this.hasOwnProperty(propName)){
                this[propName] = data[propName];
                //}
            }
            this.prepareCompanyFromServer();

        }

    }
}