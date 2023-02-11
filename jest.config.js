const config = {
    collectCoverage: true,
    coverageReporters: ['json', 'html'],    
    coverageThreshold: {
      global: {
        lines: 90
      },
    },
  };
  
  module.exports = config;