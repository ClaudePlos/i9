var MntGridDataProvider = function (gridOptions, url, http, getCallback)
{
    // vars
    this.url = url; // url to access
    this.gridOptions = gridOptions;
    this.http = http;
    this.size = null;
    gridOptions.dataSource.filter = {};
    gridOptions.getCallback = getCallback;

    //console.log("Contructor htp" + this.http);

    //

    // functions
    gridOptions.dataSource.readSize = function () {
        console.log("read size");
        // this.dataSource.rowCount = 1000;
        var req = {
            method: 'GET',
            url: url
        };

        http(req).success(function (result) {
            console.log("count:" + result);
            gridOptions.dataSource.rowCount = result;
            gridOptions.api.onNewDatasource();
        });

    }

    gridOptions.dataSource.updateSize = function (newSize) {
        console.log("Update size");
        gridOptions.dataSource.rowCount = newSize;
        gridOptions.api.onNewDatasource();
    };

    this.refresh = function () {
        console.log("refresh");
        if (gridOptions.api)
            gridOptions.api.setDatasource(gridOptions.dataSource);
    }

    // called by grid to get several rorws

    gridOptions.dataSource.getRows = function (params) {
        console.log('asking for ' + params.startRow + ' to ' + params.endRow);

        // on first query - fetch size
        /*
         * if ( gridOptions.dataSource.rowCount == null ) {
         * gridOptions.dataSource.readSize(); return ; }
         */
        urlParams = {
            firstResult: params.startRow,
            maxResults: params.endRow - params.startRow,
            filter: gridOptions.dataSource.filter
        };

        var req = {
            method: 'GET',
            url: url,
            params: urlParams
        };
        http(req).success(
            function (data, status, headers, config) {
                console.log("RESULT");
//					console.log('return rownum: ');
//					console.log(data);
                // read size
                //console.dir(headers);
                var h = headers();
                var newSize = headers("X-Total-Count");
                console.log("GOT NEW SIZE :" + newSize + " actual Size: "
                    + gridOptions.dataSource.rowCount);
                if (newSize != gridOptions.dataSource.rowCount) {
                    gridOptions.dataSource.updateSize(newSize);
                }


                //
                var lastRowNumber = Number(newSize);
                var isNum = ( typeof lastRowNumber === 'number');
                var type = typeof lastRowNumber;

                lastRow = lastRowNumber;
                console.log("lastRow:" + lastRow);

                if (gridOptions.getCallback != null)
                    gridOptions.getCallback(data);


                params.successCallback(data, lastRow);
            });

        // create dummy rows
        var rows = [params.endRow - params.startRow];
        for (var i = 0; i < params.endRow - params.startRow; i++) {
            rows[i] = ({
                rownum: params.startRow + i,
                value: "ABC"
            });
        }
        ;


    };


    //setTimeout(function(){
    //   gridOptions.api.setDatasource( gridOptions.dataSource );
    //},0);


    // TODO JUNAID - somehow data doesn't start till i reset datasource
    // it works here but there is a problem with that working in template
    /*angular.element(document).ready(function($rootScope) {
     console.log("ANGULAR READY");
     console.dir(gridOptions);
     console.dir(gridOptions.api);
     if (gridOptions.api != null) {
     console.log("Setting datasource");
     gridOptions.api.setDatasource(gridOptions.dataSource);
     }
     // gridOptions.api.onNewDatasource();
     });
     */
}
