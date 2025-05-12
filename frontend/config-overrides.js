module.exports = function override(config, env) {
  // Disable source map warnings for react-datepicker
  config.ignoreWarnings = [
    {
      module: /node_modules\/react-datepicker/,
      message: /Failed to parse source map/,
    },
  ];
  return config;
}; 