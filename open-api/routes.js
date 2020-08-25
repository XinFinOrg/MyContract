const impl = require("./impl");

module.exports = (app) => {
  app.post(
    "/open-api/stablecoin/configure-minter",
    impl.ConfigureMinterStableCoin
  );
  app.post("/open-api/stablecoin/mint", impl.MintStablecoin);
  app.post("/open-api/stablecoin/burn", impl.BurnStablecoin);
};
