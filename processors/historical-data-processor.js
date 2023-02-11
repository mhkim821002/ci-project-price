const yaml = require('yaml');
const csv = require('csv-parse/sync');
const { resolve } = require('path');
const { readFileSync } = require('fs');
const { logger } = require('./logger');
const util = require('util');
const fetch = require('sync-fetch');

const CONFIG_FILE =  `${resolve('.')}/application.yaml`;

const HistoricalDataProcessor = class {
    constructor() {
        const configFile = readFileSync(CONFIG_FILE, {encoding:'utf8', flag:'r'});
        this.config = yaml.parse(configFile);

        this.spotBaseUrl = !!process.env.YAHOO_URL_SPOT ? process.env.YAHOO_URL_SPOT : this.config.yahoo.url.spot;
        this.historicalBaseUrl = !!process.env.YAHOO_URL_HISTORICAL ? process.env.YAHOO_URL_HISTORICAL : this.config.yahoo.url.historical;

        logger.info(`Spot URL Format: ${this.spotBaseUrl}` )
        logger.info(`Historical URL Format: ${this.historicalBaseUrl}`);
    }

    getSpotPrice =  (symbol) => {
        const callUrl = util.format(this.spotBaseUrl, symbol);        
        logger.info(`Spot price call URL: ${callUrl}`);

        const yahooData = fetch(callUrl).json();
        const price = yahooData['optionChain']['result'][0]['quote']['regularMarketPrice'];

        return {
            'ticker': symbol,
            'price': price,
            'timestamp': new Date(new Date().toUTCString()).toJSON().replace('Z', '+00:00')
        }
    }

    getHisoricalPrice = (symbol) => {
        const currentDate = new Date();
        const endMills = Math.floor(currentDate.valueOf() / 1000);        
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        const startMills = Math.floor(currentDate.valueOf() / 1000);

        const callUrl = util.format(this.historicalBaseUrl, symbol, startMills, endMills);
        logger.info(`Historical price call URL: ${callUrl}`);

        const yahooDataStr = fetch(callUrl).text();

        const yahooData = csv.parse(yahooDataStr, {
            columns: true,
            skip_empty_lines: true
        });

        return yahooData.map((data) => {
            return {
                'date': data['Date'],
                'open': parseFloat(data['Open']),
                'high': parseFloat(data['High']),
                'low': parseFloat(data['Low']),
                'close': parseFloat(data['Close']),
                'volume': parseInt(data['Volume'], 10)
            }
        });
    }
}

module.exports.HistoricalDataProcessor = HistoricalDataProcessor;
