import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SocketService } from './service/socket.service';
import { CurrencyService } from './service/currency.service';
import { CcResponse } from './model/cc-response';
import * as Highcharts from 'highcharts';
import {ChartObject} from 'highcharts';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [SocketService, CurrencyService]
    // changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent implements OnInit {

    onMessage;
    highchart: ChartObject;

    /**
     * List of all available currencies
     * @type {Array}
     */
    currencies = [];

    /**
     * List of available conversions
     * @type {{}}
     */
    availableConversions = [];

    /**
     * Mapping between currency and supported conversion currencies
     * @type {{}}
     */
    currencyExchangeMap = {};

    /**
     * Currently tracked currencies
     * @type {{}}
     */
    listedCurrencies = [
        {
            'from': 'BTC',
            'to': 'USD',
            'price': 0
        }
    ];

    listedCurrenciesMappingIndex = 0;
    listedCurrenciesMapping = {
        'BTCUSD': this.listedCurrenciesMappingIndex++
    };

    /**
     * Currency tracked currency key
     * @type {string}
     */
    trackedCurrencyKey = 'BTCUSD';

    currencyFrom: string;
    currencyTo: string;

    error: string;

    constructor(private socketService: SocketService, private currencyService: CurrencyService) { }

    ngOnInit(): void {

        this.currencyService.getCurrencies({'Bitstamp': true})
            .then(currencies => {
                this.currencies = currencies;
            });

        this.currencyService.getCurrencyExchangeMap({'Bitstamp': true })
            .then(currencyExchangeMap => {
                this.currencyExchangeMap = currencyExchangeMap;
            });

        this.socketService.init();

        this.highchart = Highcharts.chart('chart', {
            chart: {
                type: 'line',
                marginRight: 10
            },
            title: {
                text: 'Live BTC/USD rate'
            },
            xAxis: {
                title: {
                  text: 'Date'
                },
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Rate'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                id: 'series-0',
                name: 'BTC/USD',
                data: []
            }]
        });

        this.onMessage = this.socketService.onMessage()
            .subscribe((response: CcResponse) => {
                if (response.price != null) {
                    console.log(response);
                    if (this.trackedCurrencyKey === response.fromSymbol + response.toSymbol) {
                        this.highchart.series[0].addPoint([response.lastUpdateUnix * 1000, response.price]);
                    }
                    this.updateCurrencyListings(response);
                }
            });

        this.socketService.subscribe(['2~Bitstamp~BTC~USD']);
    }

    /**
     * Resets the chart to start tracking a new currency
     * @param highchart ChartObject
     * @param from fromCurrency
     * @param to toCurrency
     * @returns {SeriesObject}
     */
    resetSerie(highchart: ChartObject, from: string, to: string) {
        const key = from + to;
        const currency = this.listedCurrencies[this.listedCurrenciesMapping[key]];

        console.log(currency);

        highchart.get('series-0').remove();
        highchart.addSeries({
            id: 'series-0',
            name: from + '/' + to,
            data: [{ x: new Date().getTime(), y: currency.price }]
        }, true);

        highchart.setTitle({ text: 'Live ' + from + '/' + to + ' rate'});
        this.trackedCurrencyKey = key;
    }

    /**
     * Update listed currencies
     * @param detail
     */
    updateCurrencyListings(detail) {
        const index = this.listedCurrenciesMapping[detail.fromSymbol + detail.toSymbol];
        this.listedCurrencies[index]['price'] = detail.price;
    }

    /**
     * Update the list available conversions
     */
    updateAvailableConversions(e: any) {
        if (e.item in this.currencyExchangeMap) {
            this.availableConversions = Object.keys(this.currencyExchangeMap[e.item]);
            this.currencyTo = '';
        }
    }

    /**
     * Add a currency to the list of tracked currencies
     */
    addCurrency() {
        if (this.currencyFrom + this.currencyTo in this.listedCurrenciesMapping) {
            this.error = 'The selected currency pair is already tracked';
        } else if (this.currencyFrom in this.currencyExchangeMap && this.currencyTo in this.currencyExchangeMap[this.currencyFrom]) {
            this.listedCurrencies.push({
                'from': this.currencyFrom,
                'to': this.currencyTo,
                'price': 0
            });
            this.listedCurrenciesMapping[this.currencyFrom + this.currencyTo] = this.listedCurrenciesMappingIndex++;
            this.socketService.subscribe(['2~' + this.currencyExchangeMap[this.currencyFrom][this.currencyTo] +
                '~' + this.currencyFrom + '~' + this.currencyTo]);

            this.currencyFrom = '';
            this.currencyTo = '';
            this.error = '';
        } else {
            this.error = 'Currency not supported';
        }
    }

    setChartCurrency(e, index) {
        const currency = this.listedCurrencies[index];
        this.resetSerie(this.highchart, currency.from, currency.to);
    }
}
