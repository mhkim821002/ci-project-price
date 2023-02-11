const express = require('express');
const router = express.Router();
const { HistoricalDataProcessor } = require('../processors/historical-data-processor');

const processor = new HistoricalDataProcessor();

router.get('/spot/:symbol', function(req, res) {
    res.send(processor.getSpotPrice(req.params.symbol));
});

router.get('/historical/:symbol', function(req, res) {
    res.send(processor.getHisoricalPrice(req.params.symbol));
});
  
module.exports = router;
