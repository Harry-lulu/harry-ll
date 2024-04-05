const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  // 部署者账户
  const { deployer } = await getNamedAccounts();

  // 判断是否部署Mock合约，当网络上 helper-hardhat-config.js中配置的本地开发网络时，需要部署
  if (developmentChains.includes(network.name)) {
    log(`本地开发网络:${network.name}，部署Mock合约...`);
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [8, 200000000],
    });
    log("Mocks deployed!");
  }
};

// 加tags，就可以 yarn hardhat deploy --tags mocks 只执行tags带有mocks的js
module.exports.tags = ["all", "mocks"];
