import {Injectable} from '@angular/core';

@Injectable()
export class CurrencyService {

    private readonly URL_EXCHANGES = 'https://min-api.cryptocompare.com/data/all/exchanges';

    constructor() { }

    /**
     * Get list of all available currencies across all exchanges
     * @returns {Promise<Response>}
     */
    public getCurrencies(exchanges: {}) {
        return fetch(this.URL_EXCHANGES)
            .then(response => response.json())
            .then(json => {
                const cryptos = new Set();

                for (const k in json) {
                    if (k in exchanges && json.hasOwnProperty(k)) {
                        for (const kk in json[k]) {
                            if (json[k].hasOwnProperty(kk)) {
                                cryptos.add(kk);
                            }
                        }
                    }
                }
                return Array.from(cryptos);
            });
    }

    /**
     * Get a mapping between currencies and their corresponding 'trade-to' currencies
     * @returns {Promise<Response>}
     */
    public getCurrencyExchangeMap(exchanges: {}) {
        return fetch(this.URL_EXCHANGES)
            .then(response => response.json())
            .then(json => {
                const currencyExchangeMap = {};

                // Exchanges
                for (const k in json) {
                    if (k in exchanges && json.hasOwnProperty(k)) {
                        // Currency from
                        for (const kk in json[k]) {
                            if (json[k].hasOwnProperty(kk)) {
                                if (!(kk in currencyExchangeMap)) {
                                    currencyExchangeMap[kk] = {};
                                }
                                // Currency to
                                json[k][kk].forEach(c_to => {
                                    currencyExchangeMap[kk][c_to] = k;
                                });
                            }
                        }
                    }
                }
                return currencyExchangeMap;
            });
    }
}
