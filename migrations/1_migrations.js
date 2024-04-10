// migrations/2_deploy_contract.js
const VersionControl = artifacts.require("VersionControl");

module.exports = function (deployer) {
  deployer.deploy(VersionControl);
};
