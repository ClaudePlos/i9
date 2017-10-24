///<reference path="CtlService.ts"/>
/**
 * Created by Piotr on 2015-08-24.
 */


module pl.egeria.ctl {


    export class CtlController {
        public static CONTROLLER_NAME = "egeria.CtlController";

        public static $inject = ['$rootScope', '$scope', CtlService.SERVICE_NAME, "$window"];

        $rootScope;
        $scope;
        $window;
        ctlService:CtlService;
        kosztyMc;
        kolumnyAnalityk;

        ctlGridOptions;
        gridOptionsListaKSiegowan;

        syntetyki;
        syntetykiArr;
        analityki = {};
        daneDrzewo;
        wierszeWidoczne;

        jednostkiOrg = {};
        zakresyAnalizy = [];
        zakresAnalizy;
        mcAnalizy = "01-2015";
        pokazuj_wszystkie_obiekty:boolean = false;
        pokazuj_budzet:boolean = true;
        selectedRow;
        //params = { zakresAnalizy:null};

        edytujBudzetSkKod;
        edytujBudzetRd;
        edytujBudzetRd2;
        rozwin_analityke;
        jednostka_organizacyjna = "00";

        constructor($rootScope, $scope, ctlService, $window) {
            this.ctlService = ctlService;

            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$window = $window;
            this.createColumnDef();
            // pobierz analityki
            this.ctlService.listAnalityki().then((res)=> {
                this.parsujAnalityki(res.data);

            });
            this.budujZakresyAnalizy();
            this.createTableKsiegowania();

        }

        private  readLS() {
            if (this.$window.localStorage['ctl.last_month'])
                this.mcAnalizy = this.$window.localStorage['ctl.last_month'];
            if (this.$window.localStorage['ctl.zakres']) {
                //this.params.zakresAnalizy = this.zakresyAnalizy[1];
                var str = this.$window.localStorage['ctl.zakres'];
                var z = JSON.parse(str);
                this.zakresyAnalizy.forEach((za)=> {
                    if (za.dywizja == z.dywizja && za.frmId == z.frmId)
                        this.zakresAnalizy = za;
                });
            }
        }

        public onClickOdswiez() {
            var s = this;
            // save params

            this.ctlService.odswiezDane(this.mcAnalizy, {pokazuj_wszystkie_obiekty: this.pokazuj_wszystkie_obiekty}).then
            ((result)=> {

                alert(result.data.message);
                s.onGetKosztyWMc();

            });
        }

        public onBudzetTest() {
            this.$scope.$broadcast("onPokazBudzet", {skKod: "C246", okres: "04-2015", rd: "531"});
        }

        public onEdytujBudzet() {

            if ( this.edytujBudzetRd == "*" ){
                toastr.warning("Pole 'rd:' ma oznaczenie *. Budzet przygotuje na: " + this.edytujBudzetRd2);
                this.edytujBudzetRd = this.edytujBudzetRd2;
            }

            if (!this.selectedRow) {
                toastr.warning("Podświetl rekord dla którego chcesz edytować budżet");
                return;
            }
            var data = {skKod: this.edytujBudzetSkKod, okres: this.mcAnalizy, rd: this.edytujBudzetRd};
            this.$scope.$broadcast("onPokazBudzet", data);
        }

        public onGetKosztyWMc() {
            console.log("onGetKosztyMc");

            // zakres analizy
            console.log(this.zakresAnalizy);
            if (!this.zakresAnalizy || ( !this.zakresAnalizy.dywizja && !this.zakresAnalizy.frmId)) {
                alert("Wybierz zakres analizy");
                return;
            }

            console.log("saving LS");
            console.dir(this.$window.localStorage);
            this.$window.localStorage['ctl.last_month'] = this.mcAnalizy;

            var str = JSON.stringify(this.zakresAnalizy);
            console.dir(this.zakresAnalizy);
            console.log(str);
            this.$window.localStorage['ctl.zakres'] = str;

            this.ctlService.listKosztyWMc(this.zakresAnalizy.dywizja, this.zakresAnalizy.frmId, this.mcAnalizy,
                {pokazuj_wszystkie_obiekty: this.pokazuj_wszystkie_obiekty,
                jednostka_organizacyjna: this.jednostka_organizacyjna}).then
            (
                (result)=> {
                    this.pobranoKosztyWMc(result);
                });
        }

        public pobranoKosztyWMc(result) {
            console.log("pobranoKosztyWMc");
            this.$scope.$apply(()=> {
                this.kosztyMc = result;
                // sort
                this.kosztyMc.sort(function (a, b) {
                    if (a.skKod && b.skKod) {
                        if (a.skKod == b.skKod)
                            return a.rd.localeCompare(b.rd);
                        return a.skKod.localeCompare(b.skKod);
                    }
                    if (a.obPelnyKod != null && b.obPelnyKod != null)
                        return a.obPelnyKod.localeCompare(b.obPelnyKod);
                    return 0;
                });

                console.log("Test");
                console.log(this.kosztyMc);

                this.budujDrzewo();
            });


        }


        public rozwinJo(wiersz) {
            console.log("rozwinJo");
            console.dir(wiersz);
            var idx = this.wierszeWidoczne.indexOf(wiersz);
            for (var i = wiersz.podrzedne.length - 1; i >= 0; i--) {
                this.wierszeWidoczne.splice(idx + 1, 0, wiersz.podrzedne[i]);
            }
            wiersz.rozwiniety = true;
        }

        public zwinJo(wiersz) {
            console.log("zwinJo");
            console.dir(wiersz);
            for (var i = wiersz.podrzedne.length - 1; i >= 0; i--) {
                var podrz = wiersz.podrzedne[i];
                console.log("szukam pozycji:");
                console.dir(podrz);
                console.log(this.wierszeWidoczne.indexOf(podrz));
                if (this.wierszeWidoczne.indexOf(podrz) >= 0) {
                    console.log("Wycinam");
                    this.wierszeWidoczne.splice(this.wierszeWidoczne.indexOf(podrz), 1);
                }
            }
            wiersz.rozwiniety = false;
        }

        public budujDrzewo() {
            this.daneDrzewo = [];
            this.jednostkiOrg = {};
            this.wierszeWidoczne = [];
            // parsuje najpierw jo
            //
            this.kosztyMc.forEach((wiersz)=> {
                if (wiersz.rodzajRekordu == "SUMA") {
                    this.jednostkiOrg[wiersz.obPelnyKod] = wiersz;
                    this.daneDrzewo.push(wiersz);
                    this.wierszeWidoczne.push(wiersz);
                    wiersz.podrzedne = [];
                }
            });
            this.kosztyMc.forEach((wiersz)=> {
                //if (wiersz.obPelnyKod != "00" && wiersz.skKod == null ) {

                if (this.jednostkiOrg.hasOwnProperty(wiersz.obPelnyKod) && wiersz.rodzajRekordu != 'SUMA') {
                    this.jednostkiOrg[wiersz.obPelnyKod].podrzedne.push(wiersz);
                }

                //}
                // proboje znalezc nadrzedny


            });
            // sortuje jeszcze raz
            this.wierszeWidoczne.sort(function (a, b) {
                if (a.obPelnyKod != null && b.obPelnyKod != null)
                    return a.obPelnyKod.localeCompare(b.obPelnyKod);
                return 0;
            });

            this.ctlGridOptions.rowData = this.wierszeWidoczne;

            //rozwn porzedne
            for (var i = 0; i < this.daneDrzewo.length; i++) {
                this.rozwinJo(this.daneDrzewo[i]);
            }
            this.ctlGridOptions.api.onNewRows();


        }


        public createColumnDef() {
            //this.kolumnyAnalityk = [];
            //this.kolumnyAnalityk.push({"header": "Amoertyzacja", "kod": "01"});
            //this.kolumnyAnalityk.push({"header": "Materiały", "kod": "02"});

            var columnDefs = [
                // this row shows the row index, doesn't use any data from the row
                //{
                //    headerName: "#", width: 50, cellRenderer: function (params) {
                //    return params.node.id + 1;
                //}
                //},
                {headerName: "Jednostka", field: "skOpis", width: 100, cellRenderer: this.cellRendererJo},

                {
                    headerName: "Przychod",
                    field: "przychod.wartosc",
                    width: 0,
                    percentWidth: 100,
                    cellRenderer: this.cellRenderer,
                    cellClass: "ctlValueCell"
                },
                {
                    headerName: "Wsad",
                    field: "wsad.wartosc",
                    width: 90,
                    cellRenderer: this.cellRenderer,
                    cellClass: "ctlValueCell"
                },
                {
                    headerName: "Koszt",
                    field: "koszt.wartosc",
                    width: 130,
                    cellRenderer: this.cellRenderer,
                    cellClass: "ctlValueCell"
                },


            ];

            //for ( var synt in this.syntetyki) {
            //    columnDefs.push({
            //        headerName: this.syntetyki[synt].nazwa,
            //        field: synt,
            //        width: 90,
            //        cellRenderer: this.cellRenderer,
            //        cellClass: "ctlValueCell"
            //    });
            //};
// generate columns

            this.ctlGridOptions =
            {
                headerHeight: 70,
                enableColResize: true,
                virtualPaging: true,
                rowSelection: 'single',
                columnDefs: columnDefs,
                rowDeselection: true,
                enableServerSideSorting: true,
                suppressCellSelection: false,
                pinnedColumnCount: this.pokazuj_budzet ? 9 : 5,
                groupHeaders: true,
                headerCellRenderer: this.headerCellRendererFunc, //(data)=>{ this.headerCellRendererFunc(data); } ,
                //plugins: [new ngGridCsvExportPlugin()],
                showFooter: true,
                dataSource: {
                    pageSize: 100,
                    overflowSize: 100,
                    maxConcurrentRequests: 1,
                    maxPagesInCache: 2
                },
                ctlController: this,
                cellDoubleClicked: (data)=> {
                    this.onCellDoubleClicked(data)
                },
                rowSelected: (row) => {
                    this.rowSelected(row);

                },
                //cellDoubleClicked: onCellDoubleClicked
            };
        }


        public rowSelected(row) {
            this.selectedRow = row;
            if (this.selectedRow && this.selectedRow.skKod) {

                this.edytujBudzetSkKod = this.selectedRow.skKod;
                this.edytujBudzetRd = this.selectedRow.rd;
                this.edytujBudzetRd2 = this.selectedRow.rd2;
            }
        }

        public onCellDoubleClicked(cell) {
            console.log("CELL DBL");

            var coldef = cell.colDef;
            var data = cell.data;
            if (coldef.hasOwnProperty("rodzajKosztu") && data.hasOwnProperty("skKod")) {
                var rodzajKosztu = coldef.rodzajKosztu;
                console.log(cell);

                var analityka = null;
                var c = this;
                this.ctlService.listKsiegowania(data.dywizja, data.frmId, data.skKod, data.okres, rodzajKosztu, analityka).
                    then(function (res) {
                        console.log("Res ksiegowania");
                        console.dir(res.data);
                        c.pokazOknoHistoriaKsiegowan(res.data);
                    });
            }
            else if (data.rodzajRekordu == "SUMA") {
                //toastr.info("Ta opcja działa tylko dla komórek kosztowych dla wierszy SK (nie dla regionu)");
                if (cell.data.rozwiniety) {
                    this.zwinJo(cell.data);
                }
                else
                    this.rozwinJo(cell.data);
                this.ctlGridOptions.api.onNewRows();
            }
            ;

        }

        public createTableKsiegowania() {
            this.gridOptionsListaKSiegowan =

                {
                    headerHeight: 35,
                    enableColResize: true,
                    virtualPaging: true,
                    rowSelection: 'single',

                    rowDeselection: true,
                    enableServerSideSorting: true,
                    suppressCellSelection: true,
                    dataSource: {
                        pageSize: 100,
                        overflowSize: 100,
                        maxConcurrentRequests: 1,
                        maxPagesInCache: 2
                    },

                    cellDoubleClicked: (data)=> {
                        this.onDblClickKsiegowanie(data)
                    }
                    //rowSelected: function (row) {
                    //    rowSelected(row);
                    //},
                    //cellDoubleClicked: onCellDoubleClicked
                };

            this.gridOptionsListaKSiegowan.columnDefs = [
                {headerName: "Nr Wlasny", field: "dokNumerWlasny", width: 200, percentWidth: 100},
                {headerName: "Kwota", field: "kwota", width: 80, percentWidth: 100, cellClass: "ctlValueCell", cellRenderer: this.cellRendererCs},
                {headerName: "Tresc", field: "ksTresc", width: 350, percentWidth: 100},
                {headerName: "kntNazwa", field: "kntNazwa", width: 350, percentWidth: 100},
                {headerName: "skKod", field: "skKod", width: 80, percentWidth: 100},
                {headerName: "Frm", field: "frmNazwa", width: 180, percentWidth: 100},
                {headerName: "Rd", field: "rd", width: 50, percentWidth: 100},
                {headerName: "Konto", valueGetter: 'data.syntetyka', width: 120, percentWidth: 100},
                {headerName: "Data", field: "dokDataOperacji", width: 100, percentWidth: 100},
                {headerName: "Nr Obcy", field: "dokNumberObcy", width: 100, percentWidth: 100},
                {headerName: "klKodPod", field: "klKodPod", width: 60, percentWidth: 100},
            ];
            // show popup

        }

        public onDblClickKsiegowanie(data) {
            this.ctlService.openDokEgeriaPdf(data.data.dokId);
        }

        public pokazOknoHistoriaKsiegowan(ksiegowania) {

            this.gridOptionsListaKSiegowan.rowData = ksiegowania;
            this.gridOptionsListaKSiegowan.api.onNewCols();
            this.gridOptionsListaKSiegowan.api.onNewRows();
            $('html, body').animate({
                scrollTop: $("#tblListaKsiegowan").offset().top
            }, 200);


        }

        public onChangeView() {
            this.przeliczKolumny();
        }

        public onClickExcel()
        {

            console.log("onClickExcel");

                var params = {
                    skipHeader: false,
                    skipFooters:false,
                    skipGroups: false,
                    fileName:"ctlRaport.csv",
                };
            console.log("show DS");
            var keys = [];
            for (var f in  this.ctlGridOptions.columnDefs) { keys.push( this.ctlGridOptions.columnDefs[f].field);}
            var csvData = '';
            var htmlTable = "<table>";
            function csvStringify(str) {
                if (str == null) return '';  // we want to catch anything null-ish, hence just == not ===
                if (typeof(str) === 'number') return '' + str;
                if (typeof(str) === 'boolean') return (str ? 'TRUE' : 'FALSE') ;
                if (typeof(str) === 'string') return str.replace(/"/g,'""');
                return JSON.stringify(str).replace(/"/g,'""');
            }
            function swapLastCommaForNewline(str) {
                var newStr = str.substr(0,str.length - 1);
                return newStr + "\n";
            }

            var columnController = this.ctlGridOptions.api.columnController;
            var headStr = "<th><tr>";
            for (var k in keys) {
                var colDef = columnController.allColumns[k].colDef;
                //csvData += '"' + colDef.headerName + '",';
                var colName = colDef.headerName;
                if ( colDef.headerGroup)
                 colName = colDef.headerGroup + " " +colName;
                headStr += "<td>" +  colName + "</td>";
            }
            headStr += "</tr></th>";
            htmlTable += headStr;
            csvData = swapLastCommaForNewline(csvData);

            var rownum = 0;

            //this.ctlGridOptions.api.grid.rowModel.forEachInMemory(
            var rowData= this.ctlGridOptions.api.grid.gridOptions.rowData;
            var rs = "";
            var ss = "";
            rowData.forEach(
                (row)=>{
                    rownum++;
                   var rowStr = "<tr>";
                    for ( k in keys) {
                        var colDef = columnController.allColumns[k].colDef;
                        var keyName = keys[k];
                        rowStr = rowStr + "<td>" ;
                        var valRaw = row.data[keyName];
                        if ( colDef.cellRenderer) {
                            //console.log("Call cell rend for col:" + keys[k]);
                            valRaw = colDef.cellRenderer({data:row, colDef:colDef});
                            }
                        //var val = gridData[row][keys[k]];
                        // get column def
                        rowStr = rowStr + valRaw ;
                        rowStr = rowStr + "</td>\n";
                        //csvData +=
                    }
                    rowStr += "</tr>\n";
                    htmlTable += rowStr;
                    //
                    //csvData = swapLastCommaForNewline(csvData);
                }
            );

            //for (var gridRow in gridData)
            //{
            //    for ( k in keys) {
            //        var curCellRaw;
            //        if (opts != null && opts.columnOverrides != null && opts.columnOverrides[keys[k]] != null) {
            //            curCellRaw = opts.columnOverrides[keys[k]](gridData[gridRow][keys[k]]);
            //        } else {
            //            curCellRaw = gridData[gridRow][keys[k]];
            //        }
            //        csvData += '"' + csvStringify(curCellRaw) + '",';
            //    }
            //    csvData = swapLastCommaForNewline(csvData);
            //}
            //toastr.info(htmlTable);
            htmlTable +=" </table>";

            var fp = document.getElementById( 'div_excel_link' ) ;
            console.log("FP");
            console.log(fp);
            var csvDataLinkHtml = "<span class=\"csv-data-link-span\" style='display:inline'>";
            csvDataLinkHtml += "<br><a href=\"data:application/vnd.ms-excel;charset=UTF-8,";
            csvDataLinkHtml += encodeURIComponent(htmlTable);
            csvDataLinkHtml += "\" download=\"Export_Controlling.xls\">Pobierz Excel</a></br></span>" ;
            fp.innerHTML = csvDataLinkHtml;
            //fp.append(csvDataLinkHtml);


            //window.prompt("Naciśnij Ctrl+C i następnie Ctrl+V w Excelu", htmlTable);
            //var fp = grid.$root.find(".ngFooterPanel");
            //var csvDataLinkPrevious = grid.$root.find('.ngFooterPanel .csv-data-link-span');
            //if (csvDataLinkPrevious != null) {csvDataLinkPrevious.remove() ; }
            //var csvDataLinkHtml = "<span class=\"csv-data-link-span\">";
            //csvDataLinkHtml += "<br><a href=\"data:text/csv;charset=UTF-8,";
            //csvDataLinkHtml += encodeURIComponent(csvData);
            //csvDataLinkHtml += "\" download=\"Export.csv\">CSV Export</a></br></span>" ;
            //fp.append(csvDataLinkHtml);
                //
                //if ($scope.customHeader) {
                //    params.customHeader = '[[[ This ia s sample custom header - so meta data maybe?? ]]]\n';
                //}
                //if ($scope.customFooter) {
                //    params.customFooter = '[[[ This ia s sample custom footer - maybe a summary line here?? ]]]\n';
                //}

                //this.ctlGridOptions.api.exportDataAsCsv(params);


        }

        public przeliczKolumny() {
            var columnDefs = [];
            columnDefs.push(
                {
                    headerName: "Jednostka Org.",
					headerTooltip: "Jednostka",
                    field: "skOpis",
                    width: 400,
                    percentWidth: 100,
                    cellRenderer: this.cellRendererJo
                });
            columnDefs.push({
                headerName: "wartość",
                headerGroup: "Wynik",
                field: "wynik.wartosc",
                width: 90,
                cellRenderer: this.cellRenderer,
                cellClass: "ctlValueCell"
            });
            if (this.pokazuj_budzet) {
                columnDefs.push({
                    headerName: "budżet",
                    headerGroup: "Wynik",
                    field: "wynik.budzet",
                    width: 90,
                    cellRenderer: this.cellRenderer,
                    cellClass: "ctlValueCell"
                });
            }
            columnDefs.push({
                headerName: "wartość",
                headerGroup: "Przychód",
                field: "przychod.wartosc",
                width: 90,
                cellRenderer: this.cellRenderer,
                cellClass: "ctlValueCell",

            });
            if (this.pokazuj_budzet) {
                columnDefs.push({
                    headerName: "budżet",
                    headerGroup: "Przychód",
                    field: "przychod.budzet",
                    width: 90,
                    cellRenderer: this.cellRenderer,
                    cellClass: "ctlValueCell",

                });
            }
            columnDefs.push({
                headerName: "wartość",
                headerGroup: "Wsad",
                field: "wsad.wartosc",
                width: 80,
                cellRenderer: this.cellRenderer,
                cellClass: "ctlValueCell"
            });
            if (this.pokazuj_budzet) {
                columnDefs.push({
                    headerName: "budżet",
                    headerGroup: "Wsad",
                    field: "wsad.budzet",
                    width: 80,
                    cellRenderer: this.cellRenderer,
                    cellClass: "ctlValueCell"
                });
            }
            columnDefs.push({
                headerName: "wartość",
                headerGroup: "Koszty",
                field: "koszt.wartosc",
                width: 100,
                cellRenderer: this.cellRenderer,
                cellClass: "ctlValueCell"
            });
            if (this.pokazuj_budzet) {
                columnDefs.push({
                    headerName: "budżet",
                    headerGrouop: "Koszty",
                    field: "koszt.budzet",
                    width: 100,
                    cellRenderer: this.cellRenderer,
                    cellClass: "ctlValueCell"
                });
            }


            for (var i = 0; i < this.syntetykiArr.length; i++) {
                var synt = this.syntetykiArr[i];
                columnDefs.push({
                    headerGroup: synt.nazwa,
					headerTooltip: synt.nazwa,
                    headerName: "wartość",
                    field: synt.syntetyka,
                    width: 70,
                    cellRenderer: this.cellRendererSy,
                    cellClass: "ctlValueCell",
                    rodzajKosztu: synt.syntetyka,
                    syntetyka: synt,
                });
                // budzet
                if (this.pokazuj_budzet) {
                    columnDefs.push({
                        headerGroup: synt.nazwa,
						headerTooltip: synt.nazwa,
                        headerName: "budżet",
                        field: synt.syntetyka,
                        width: 90,
                        cellRenderer: this.cellRendererBu,
                        cellClass: "ctlValueCell",
                        rodzajKosztu: synt.syntetyka,
                        syntetyka: synt,
                    });
                }
                // rozwinanalityke

            }
            ;

            this.ctlGridOptions.columnDefs = columnDefs;
            this.ctlGridOptions.api.onNewCols();

        }

        zwinKolumne(colDef) {
            /// ustal syntetke tej kolumny
            //console.log("zwinKolumne:");
            //console.dir(colDef);
            if (!colDef.colDef.kolumna_syntetyki)
                return;

            var idx = this.ctlGridOptions.columnDefs.indexOf(colDef.colDef);
            if (colDef.colDef.kolumna_syntetyki.kolumny_analityk) {
                console.log("idx: " + idx + " Ilosc kolumn analityk:" + colDef.colDef.kolumna_syntetyki.kolumny_analityk.length);
            }
            colDef.colDef.kolumna_syntetyki.kolumny_analityk.forEach(
                (kolumna_analityki)=>{
                    var idx_an = this.ctlGridOptions.columnDefs.indexOf(kolumna_analityki);
                    //console.log("idx_an:" + idx_an);
                    this.ctlGridOptions.columnDefs.splice(idx_an,1);
                });
            //this.ctlGridOptions.columnDefs.splice(idx,2 ) ; // colDef.colDef.kolumna_syntetyki.kolumny_analityk.length, null);
            //colDef.colDef.kolumna_syntetyki.analityka_rozwinieta = false;
            this.ctlGridOptions.api.onNewCols();
        }

        rozwinKolumne(colDef, rozwin) {
            console.log("rozwinKolumne");
            var idx = this.ctlGridOptions.columnDefs.indexOf(colDef.colDef);
            console.log("Idx:" + idx);
            var kolumny_analityk = [];
            if (rozwin) {
                if (colDef.colDef.syntetyka) {
                    console.log("Rozwijam, anlityki:" + colDef.colDef.syntetyka.analityki);
                    for (var anal in colDef.colDef.syntetyka.analityki) {
                        var analityka = colDef.colDef.syntetyka.analityki[anal];
                        console.log("Dodaje kolumne");
                        var nowa_kolumna = {
                            headerGroup:colDef.colDef.headerGroup,
							headerTooltip: this.analityki[analityka.analityka],
                            headerName: this.analityki[analityka.analityka],
                            field: analityka.analityka,
                            width: 80,
                            cellRenderer: this.cellRendererAn,
                            cellClass: "ctlValueCell",
                            rodzajKosztu: analityka.analityka,
                            analityka: analityka,
                            syntetyka: colDef.colDef.syntetyka,
                            analityka_kod: analityka.analityka,
                            syntetyka_kod: colDef.colDef.syntetyka.syntetyka,
                            kolumna_syntetyki: colDef
                        };

                        kolumny_analityk.push(nowa_kolumna);
                        this.ctlGridOptions.columnDefs.splice(idx, 0, nowa_kolumna);

                        // budzet
                        //if (this.pokazuj_budzet) {
                        //    columnDefs.push({
                        //        headerGroup: synt.nazwa,
                        //        headerName: "budżet",
                        //        field: synt.syntetyka,
                        //        width: 90,
                        //        cellRenderer: this.cellRendererBu,
                        //        cellClass: "ctlValueCell",
                        //        rodzajKosztu: synt.syntetyka,
                        //        syntetyka:synt,
                        //    });
                        //}
                        // rozwinanalityke

                    }
                }
                colDef.kolumny_analityk = kolumny_analityk;
                console.log("synt:");
                console.dir(colDef);
                this.ctlGridOptions.api.onNewCols();
            }
        }

        headerCellRendererFunc(params) {

            var eHeader = document.createElement('span');

            var title = params.colDef.headerName;
            if (params.colDef.analityka_rozwinieta)
                title + " ->";

            var eTitle = document.createTextNode(title);
            //var eTitle = document.createTextNode('> ' + params.colDef.headerName + ' <');
            eHeader.appendChild(eTitle);

            var self = params.api.grid.gridOptions.ctlController;
            eHeader.addEventListener('click', function () {
                console.log("On header click");

                // jesli jest to analityka to zwijam
                if (params.colDef.analityka) {
                    self.zwinKolumne(params);
                    return;
                }
                else {
                    if (eHeader.style.color === 'red') {
                        eHeader.style.color = '';
                        params.colDef.analityka_rozwinieta = false;
                        self.zwinKolumne(params);
                        //self.przeliczKolumny();
                    } else {
                        eHeader.style.color = 'red';
                        params.colDef.analityka_rozwinieta = true;
                        self.rozwinKolumne(params, true);
                        //self.przeliczKolumny();
                    }
                }
            });
            //return "HE";
            return eHeader;
        }


        public
        onClickZmienStatusBudzetu(row, nowy_status) {
            row.statusBudzetu.rodzajDzialalnosci = edytujBudzetRd; // add ks
            this.ctlService.zmienStatus(row, nowy_status).then(
                (res)=> {
                    toastr.info("Status budżetu został zmieniony");
                    console.dir(row);
                    console.dir(res);

                    //row.statusBudzetu = res.data.status;
                    this.ctlGridOptions.api.onNewCols();
                }
            );
        }

        public
        cellRendererJo(params) {

            var ret;
            var style = null;
            if (params.data.statusBudzetu) {
                if (params.data.statusBudzetu == "BRAK")
                    style = "text-muted";
                else if (params.data.statusBudzetu == "NOWY")
                    style = "text-warning";
                else if (params.data.statusBudzetu == "DO_ZATWIERDZENIA")
                    style = "text-info";
                else if (params.data.statusBudzetu == "ZATWIERDZONY")
                    style = "text-success";
            }
            if (params.data.rodzajRekordu == 'DANE') {
                ret = '<span class="' + style + '" style="padding-left:10px"><strong>' + params.data.skKod + '</strong> - ' + params.data.skOpis + "</span>";
            }
            else {

                ret = '<strong class="' + style + '">' + params.data.obPelnyKod + '</strong>';
            }

            ret = ret;
            if (params.data.rd != "*")
                ret = "<small>" + params.data.rd + "&nbsp;</small>&nbsp;" + ret;
            return ret;
        }

        public
        cellRenderer(params) {

            var formatKwota = function (num) {
                if (!num)
                    return "";
                var p = num.toFixed(0).split(".");
                return p[0].split("").reduceRight(function (acc, num, i, orig) {
                        if ("-" === num && 0 === i) {
                            return num + acc;
                        }
                        var pos = orig.length - i - 1
                        return num + (pos && !(pos % 3) ? " " : "") + acc;
                    }, "") + (p[1] ? "." + p[1] : "");
            };
            if (params.colDef.field == "przychod.wartosc")
                return formatKwota(params.data.przychod.wartosc);
            if (params.colDef.field == "wynik.wartosc")
                return formatKwota(params.data.wynik.wartosc);
            if (params.colDef.field == "wsad.wartosc")
                return formatKwota(params.data.wsad.wartosc);
            ;
            if (params.colDef.field == "koszt.wartosc")
                return formatKwota(params.data.koszt.wartosc);
            ;
            if (params.colDef.field == "przychod.budzet")
                return formatKwota(params.data.przychod.budzet);
            if (params.colDef.field == "wynik.budzet")
                return formatKwota(params.data.wynik.budzet);
            if (params.colDef.field == "wsad.budzet")
                return formatKwota(params.data.wsad.budzet);
            ;
            if (params.colDef.field == "koszt.budzet")
                return formatKwota(params.data.koszt.budzet);
            ;
        }


        public
        cellRendererAn(params) {
            //console.log("cellRendererAn");
            //console.log(params.colDef);

            var formatKwota = function (num) {
                var p = num.toFixed(0).split(".");
                return p[0].split("").reduceRight(function (acc, num, i, orig) {
                        if ("-" === num && 0 === i) {
                            return num + acc;
                        }
                        var pos = orig.length - i - 1
                        return num + (pos && !(pos % 3) ? " " : "") + acc;
                    }, "") + (p[1] ? "." + p[1] : "");
            };
            var analityka_kod = params.colDef.analityka_kod;
            var syntetyka_kod = params.colDef.syntetyka_kod;
            //console.dir(params.data.koszt);
            //console.dir("synt:" + syntetyka_kod + " AN: " + analityka_kod);
            if (params.data.koszt.hasOwnProperty(syntetyka_kod)
                && params.data.koszt[syntetyka_kod].hasOwnProperty(analityka_kod)) {
                //return params.data.koszt[params.colDef.field].wartosc.toFixed(0);
                return formatKwota(params.data.koszt[syntetyka_kod][analityka_kod].wartosc);
            }

            return "0";

        }

        public
        cellRendererSy(params) {

            var formatKwota = function (num) {
                var p = num.toFixed(0).split(".");
                return p[0].split("").reduceRight(function (acc, num, i, orig) {
                        if ("-" === num && 0 === i) {
                            return num + acc;
                        }
                        var pos = orig.length - i - 1
                        return num + (pos && !(pos % 3) ? " " : "") + acc;
                    }, "") + (p[1] ? "." + p[1] : "");
            };
            if (params.data.koszt.hasOwnProperty(params.colDef.field)) {
                //return params.data.koszt[params.colDef.field].wartosc.toFixed(0);
                return formatKwota(params.data.koszt[params.colDef.field].wartosc);
            }

            return "0";

        }

        // renderer dla budzetu
        public
        cellRendererBu(params) {

            var formatKwota = function (num) {
                var p = num.toFixed(0).split(".");
                return p[0].split("").reduceRight(function (acc, num, i, orig) {
                        if ("-" === num && 0 === i) {
                            return num + acc;
                        }
                        var pos = orig.length - i - 1
                        return num + (pos && !(pos % 3) ? " " : "") + acc;
                    }, "") + (p[1] ? "." + p[1] : "");
            };
            if (params.data.koszt.hasOwnProperty(params.colDef.field)) {
                //return params.data.koszt[params.colDef.field].budzet.toFixed(0);
                return formatKwota(params.data.koszt[params.colDef.field].budzet);
            }

            return "0";

        }

        public
        parsujAnalityki(data) {
            this.syntetyki = {};
            this.syntetykiArr = [];
            this.analityki = {};

            data.sort(function (a, b) {
                var an = Number(a);
                var bn = Number(b);
                if (a.syntetyka == b.syntetyka)
                    return a.analityka.localeCompare(b.analityka);
                else
                    return a.syntetyka.localeCompare(b.syntetyka);

            });

            data.forEach((an)=> {
                if (!this.syntetyki.hasOwnProperty(an.syntetyka)) {
                    this.syntetyki[an.syntetyka] = {
                        "nazwa": an.syntetyka_nazwa,
                        "syntetyka": an.syntetyka,
                        "analityki": {}
                    };
                    this.syntetykiArr.push(this.syntetyki[an.syntetyka]);
                }

                this.syntetyki[an.syntetyka].analityki[an.analityka] = {
                    "nazwa": an.analityka_nazwa,
                    "syntetyka": an.syntetyka,
                    "analityka": an.analityka
                };
                this.analityki[an.analityka] = an.analityka_nazwa;
            });
            // sort

            this.przeliczKolumny();
        }

        private
        budujZakresyAnalizy() {
            var c = this;
            this.zakresyAnalizy = [];
            this.ctlService.listDostepneFirmy().
                then(
                function (res) {
                    console.log("got dostepne firmy:");
                    console.dir(res.data);

                    for (var upri in  res.data) {
                        var upr = res.data[upri];
                        var jestDyw = false;
                        var jestFrm = false;
                        for (var za in this.zakresyAnalizy) {
                            if (za.dywizja == upr.dywizj && za.frmId == "*")
                                jestDyw = true;
                            if (za.frmId == upr.frmId)
                                jestFrm = true;
                        }

                        if (!jestDyw && upr.dywizja == "Z")
                            c.zakresyAnalizy.push({"etykieta": "Dywizja Sprzątanie", "frmId": "*", "dywizja": "Z"});
                        if (!jestFrm)
                            c.zakresyAnalizy.push({
                                "etykieta": upr.frmNazwa,
                                "frmId": upr.frmId,
                                "dywizja": upr.dywizja
                            });
                    }

                    c.readLS();

                    console.dir("zakresy:");
                    console.dir(c.zakresyAnalizy);
                }
            )
            ;

            //this.zakresyAnalizy = [
            //    {"etykieta": "SI Naprzód", "frmId": "1", "dywizja": "Z"},
            //    {"etykieta": "Vendi Servis", "frmId": "300038", "dywizja": "C"},
            //    {"etykieta": "Dywizja Sprzątanie", "frmId": "*", "dywizja": "Z"},
            //];

            // {"etykieta": "Dywizja Catering", "frmId": "*", "dywizja": "C"},

        }


    }


    angular
        .
        module(
        'iNaprzod'
    ).
        controller(CtlController

            .
            CONTROLLER_NAME
        ,
        CtlController
    );
}