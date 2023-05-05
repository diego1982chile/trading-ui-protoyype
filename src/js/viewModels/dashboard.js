/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['ojs/ojcore','knockout',"ojs/ojarraydataprovider","ojs/ojconverter-number", 
        "ojs/ojcontext", "ojs/ojknockout", "ojs/ojchart", "ojs/ojcheckboxset", 
        ],
 function(oj, ko, ArrayDataProvider, ojconverter_number_1, Context) {
    function DashboardViewModel() {
        // Below are a set of the ViewModel methods invoked by the oj-module component.
        // Please reference the oj-module jsDoc for additional information.
        
        var self = this; 
        
        self.twoYearData = ko.observable();
        //work with 300 days worth of stock data
        self.stockData = ko.observable();
        self.stockDataObservable = ko.observableArray();
        
        self.dataProvider = ko.observable();
        self.viewportMinValue = ko.observable();
        
        self.referenceObjectValue = ko.observableArray();
        
        self.yAxisConverter = ko.observable(new ojconverter_number_1.IntlNumberConverter({ style: "percent" }));
        self.compareListValue = ko.observable(["dj"]);
        
                
        self.cashFlowValues = ko.observable();
        self.djData = ko.observableArray();      
        
        self.dataProvider = ko.computed(function () {
            $.getJSON("http://dnssemantikos:8181/TradingService/api/periods/500072").
                then(function (backtest) {
                    
                    self.twoYearData(backtest.bars);
                    self.stockData(self.twoYearData());                    
                    self.stockDataObservable(self.stockData());
                    self.viewportMinValue(self.twoYearData()[438].group);                                        
                    
                    Context.getContext(document.getElementById("stockChart"))
                        .getBusyContext()
                        .whenReady()
                        .then(() => {                                                                                                           
                            //self.updatePercentages(self.viewportMinValue());
                        });
                    
                    alert(JSON.stringify(backtest.cashflowRecord));
                    
                    self.cashFlowValues(backtest.cashflowRecord);
                    
                    self.djData(backtest.trades);
                    
                    //alert(JSON.stringify(backtest.trades));

                    //.html('<g pointer-events="none" visibility="hidden"><line stroke="rgba(22, 21, 19, 0.8)" transform="matrix(1,0,0,1,34,0)" y1="97" y2="400"></line><line x2="0.001" class="oj-chart-data-cursor-outer-line" transform="matrix(1,0,0,1,35,0)" y1="97" y2="400"></line><g pointer-events="none" transform="matrix(1,0,0,1,34,198.85000000000002)"><circle r="6" fill="rgba(22, 21, 19, 0.8)"></circle><circle r="5" fill="white"></circle><circle r="4" fill="rgb(214, 59, 37)"></circle></g></g>');
                                                                                                                            
                });  
                
            return new ArrayDataProvider(self.stockDataObservable, {keyAttributes: "id"});
        });
                             
        
        /*
        this.nasdaqvalues = JSON.parse(nasdaqData);
        this.nasdaqData = {
            name: "NASDAQ",
            color: "#008000",
            type: "line",
            items: this.nasdaqvalues,
        };
        this.spvalues = JSON.parse(sp500Data);
        this.sandpData = {
            name: "S&P 500",
            color: "#ff9900",
            type: "line",
            items: this.spvalues,
        };
        */        
        
        // Use binary search to find the closest group
        self.closestGroup = (array, x) => {            
            let low = 0;
            let hi = array.length;
            while (hi - low > 1) {
                const mid = Math.round((low + hi) / 2);
                if (array[mid].group <= x)
                    low = mid;
                else
                    hi = mid;
            }
            if (array[low].group == x)
                hi = low;
            return low;
        };
        
        self.tooltipFunction = (dataContext) => {               
            $(dataContext.parentElement.parentElement).trigger("hover");
            // Set a black border for the tooltip
            dataContext.parentElement.style.borderColor = "#000000";
            const tooltipElem = document.createElement("div");
            // Add series and group text
            const textDiv = document.createElement("div");
            textDiv.style.textAlign = "center";
            tooltipElem.appendChild(textDiv);
            const dateText = document.createElement("span");
            const date = new Date(dataContext.group);
            dateText.textContent = `${date.getDate()} ${date.toString().split(" ")[1]} ${date.getFullYear()}`;
            dateText.style.fontWeight = "bold";
            textDiv.appendChild(dateText);
            textDiv.appendChild(document.createElement("br"));
            const table = document.createElement("table");
            textDiv.appendChild(table);
            let row = document.createElement("tr");
            table.appendChild(row);
            let column1 = document.createElement("td");
            row.appendChild(column1);
            column1.style.backgroundColor = "#267db3";
            column1.style.backgroundClip = "padding-box";
            column1.style.border = "4px solid transparent";
            column1.style.width = "6px";
            let column2 = document.createElement("td");
            row.appendChild(column2);
            const seriesText = document.createElement("span");
            seriesText.textContent = dataContext.series;
            seriesText.style.cssFloat = "left";
            column2.appendChild(seriesText);
            let column3 = document.createElement("td");
            row.appendChild(column3);
            const valueText = document.createElement("span");
            let value = Math.round(Number(dataContext.close) * 10000) / 100;            
            valueText.textContent = `${Math.abs(value)}`;
            if (value >= 0) {
                valueText.style.color = "#68c182";
                valueText.textContent += " \u25B2";
            }
            else {
                valueText.style.color = "#ed6647";
                valueText.textContent += " \u25BC";
            }
            valueText.style.fontStyle = "italic";
            valueText.style.cssFloat = "right";
            column3.appendChild(valueText);
            const refObjs = self.referenceObjectValue();
            for (let i = 0; i < refObjs.length; i++) {
                const refObj = refObjs[i];
                row = document.createElement("tr");
                table.appendChild(row);
                column1 = document.createElement("td");
                row.appendChild(column1);
                column1.style.backgroundColor = refObj.color;
                column1.style.backgroundClip = "padding-box";
                column1.style.border = "4px solid transparent";
                column1.style.width = "6px";
                column2 = document.createElement("td");
                row.appendChild(column2);
                const refText = document.createElement("span");
                refText.textContent = refObj.name;
                refText.style.cssFloat = "left";
                column2.appendChild(refText);
                column3 = document.createElement("td");
                row.appendChild(column3);
                const refValueText = document.createElement("span");
                const groupIndex = self.closestGroup(self.stockData(), dataContext.group);
                value = Math.round(Number(refObj["items"][groupIndex]) * 10000) / 100;
                //alert("refObj['items'] = " + refObj["items"]);
                //alert("Number(refObj['items'][groupIndex]) = " + Number(refObj["items"][groupIndex]));
                refValueText.textContent = `${Math.abs(value)}`;
                if (value >= 0) {
                    refValueText.style.color = "#68c182";
                    refValueText.textContent += " \u25B2";
                }
                else {
                    refValueText.style.color = "#ed6647";
                    refValueText.textContent += " \u25BC";
                }
                refValueText.style.fontStyle = "italic";
                refValueText.style.cssFloat = "right";
                column3.appendChild(refValueText);
            }
            // Return an object with 'insert' key and an element, that will be appended to the tooltip
            return { insert: tooltipElem };
        };
        
        self.seriesTypeValue = ko.observable("auto");
        //show 3 months data
                
        
        self.updatePercentages = (startTime) => {              
            
            $("g[shape-rendering='crispEdges']").each(function(k, v) {
                
                var order = self.getTrade(self.djData(), k);
                
                if (order) {
                    
                    var tokens = $(this).children().first().attr("points").split(" ");
                    var min = parseInt(tokens[0]);
                    var max = parseInt(tokens[2]);
                    var pos = (min + max)/2;
                    
                    var color = "blue";                                        
                    
                    if (order.type === "SELL") {
                        color = "red";
                    }
                        
                    //alert("min = " + min + " max = " + max + " pos = " + pos);
                    var html = $(this).html();
                    html = '<g><line stroke="' + color + '" transform="matrix(1,0,0,1,' + pos + ',0)" y1="1" y2="400"></line></g>' + html;
                    $(this).html(html);
                    
                }
                                
            }); 
            
        };
        
        self.viewportChange = (event) => {            
            self.updatePercentages(event.detail["xMin"]);
        };

        
        self.getTrade = (trades, index) => { 
            
            var order;
            
            $(trades).each(function() {
                var entry = this.entry;
                var exit = this.exit;
                                
                //alert("index = " + index + " entry.index = " + entry.index);                
               
                if (entry.index === index) {
                    //alert("entre");
                    order = entry;
                    return false;
                }
                
                if (exit.index === index) {
                    //alert("sali");
                    order = exit;
                    return false;
                }
            });
            
            return order;
        }
        
    }    
   

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return DashboardViewModel;
  }
);
