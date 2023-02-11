const request = require('supertest');
const app = require('../app');

const mockPrice = {
    'price': 100.21,
    'ticker': 'AAPL',
    'timestamp': new Date(new Date().toUTCString()).toJSON().replace('Z', '+00:00')                                    
};

const mockHistoricalPrices = [
    {
        'date': '2022-11-17',
        'open': 100.01,
        'high': 101.01,
        'low': 99.01,
        'close': 100.06,
        'volume': 200        
    }
]

jest.mock('../processors/historical-data-processor', function() {
    return {
        HistoricalDataProcessor: function() {
            return {
                getSpotPrice: (symbol) => mockPrice,
                getHisoricalPrice: (symbol) => mockHistoricalPrices
            }
        }
    }
});

describe('Price router ', () => {
    test('should return spot price', async () => {
        const res = await request(app).get('/price/spot/AAPL');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockPrice);
    });

    test('should return historical prices', async () => {
        const res = await request(app).get('/price/historical/AAPL');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockHistoricalPrices);
    });
})