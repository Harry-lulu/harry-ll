// 启用环境变量, 可以通过【process.env.xx】获取.env定义的参数xx
require("dotenv").config();
// 运行时的网络环境，可以在hardhat-config.js的 networks:{}定义一下信息，通过network.congig.xx 拿到
const { network } = require("hardhat");
// 导入网络配置
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

// 改为匿名写法
// 运行部署脚步是，“hardhat-delopy”会自动调用这个函数，
// 并将hardhat对象传递给他，就是 hre, hre 为HardhatRuntimeEnvironment 运行时的harthat

// module.exports = async (hre) => {
//   const { getNamedAccounts, deployments } = hre;
// };
//以上写法可以直接写为 { getNamedAccounts, deployments } 是从hre解购出来的
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get, log } = deployments;
  // 部署者账户
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // 根据chainId获取网络对应的feed address
  let ethUsdPriceFeedAddress;

  // 当是本地网络时，不去获取networkConfig中的feed address, 使用Mock部署的地址
  if (developmentChains.includes(network.name)) {
    // 使用deployments中的 get() 获取最近部署的合约
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    // 当不是本地网络时，则使用networkConfig 中的 feed address
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const args = [ethUsdPriceFeedAddress];
  // 部署合约
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    // 部署后等待*个区块被挖出
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("FundMe deployed!");

  // 验证合约
  // 检测network.config是什么网络; * 通过（chainId 或者 network.name） && 是否存在 API_KEY判断
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // verify
    // 将一些公用的代码，抽出来放到 utils目录 下
    await verify(fundMe.address, args);
  }
};

module.exports.tags = ["all", "fundme"];
