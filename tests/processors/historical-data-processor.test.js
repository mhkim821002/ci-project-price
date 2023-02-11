const fetch = require('sync-fetch');
const { readFileSync } = require('fs');
const { HistoricalDataProcessor } = require('../../processors/historical-data-processor');

jest.mock('sync-fetch');

describe('Price processor ', () => {
    const env = process.env;

    afterEach(() => {
        process.env = { ...env };
    });

    test('should change calling URL', () => {
        process.env = {
            YAHOO_URL_SPOT: 'http://localhost/spot/%s',
            YAHOO_URL_HISTORICAL: 'http://localhost/historical/%s'
        };

        const processor = new HistoricalDataProcessor();

        expect(processor.spotBaseUrl).toEqual(process.env.YAHOO_URL_SPOT);
        expect(processor.historicalBaseUrl).toEqual(process.env.YAHOO_URL_HISTORICAL);
    });

    test('should not change calling URL', () => {
        process.env = {};

        const processor = new HistoricalDataProcessor();

        expect(processor.spotBaseUrl).toEqual('https://query2.finance.yahoo.com/v7/finance/options/%s');
        expect(processor.historicalBaseUrl).toEqual('https://query1.finance.yahoo.com/v7/finance/download/%s?period1=%d&period2=%d&interval=1d&events=history&includeAdjustedClose=true');
    });

    test('should fetch spot price', () => {
        const yahooSpotJson = {
            'optionChain': {
                'result': [
                    {
                        'quote': {
                            'regularMarketPrice': 100.21
                        }
                    }
                ]
            }
        };
        
        fetch.mockImplementation(() => {
            return {
                json: () => {
                    return yahooSpotJson;
                }
            }
        });
    
        const currDate = new Date();
        jest.useFakeTimers().setSystemTime(currDate);
    
        const processor = new HistoricalDataProcessor();
        const returnValue = processor.getSpotPrice('AAPL');
    
        expect(returnValue).toEqual({
            'price': 100.21,
            'ticker': 'AAPL',
            'timestamp': new Date(currDate.toUTCString()).toJSON().replace('Z', '+00:00')
        });
    });
    
    test('should fetch historical prices', () => {
        const csvFile = readFileSync(`${__dirname}/historical.csv`, {encoding:'utf8', flag:'r'});
        const currDate = new Date();
        jest.useFakeTimers().setSystemTime(currDate);
    
        fetch.mockImplementation(() => {
            return {
                text: () => {
                    return csvFile;
                }
            }
        });
    
        const processor = new HistoricalDataProcessor();
        const returnValue = processor.getHisoricalPrice('AAPL');
    
        const expectedKeys = ['date', 'open', 'high', 'low', 'close', 'volume'];
        
        expect(returnValue.length).toEqual(252);
        expectedKeys.forEach(keyName => expect(Object.keys(returnValue[0]).includes(keyName)).toBeTruthy());
    });    
});

