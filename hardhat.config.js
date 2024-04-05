require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");

require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
// 启用环境变量
require("dotenv").config();

// 走翻墙VPN连接网络
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

/** @type import('hardhat/config').HardhatUserConfig */
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  // 指定solidity编译的版本，可以指定多个
  // solidity: "0.8.24",
  solidity: {
    compilers: [{ version: "0.8.24" }, { version: "0.8.8" }],
  },
  defaultNetwork: "hardhat",
  // 以太网网络、账户配置
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      // 定义配置，部署后等待6个区块被挖出
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:7545/",
      // accounts: Thanks hardhat!,
      chainId: 31337,
    },
  },
  namedAccounts: {
    // 默认将第一个账户作为部署者
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  // gas花费 配置
  gasReporter: {
    // 是否开启
    enabled: true,
    // 输出为文件
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // 转换为市值币，需要去请求网站，需要网站的API_KEY
    // coinmarketcap: xxx_API_KEY,
    // token 查看在某个网络上部署，需要花费的gas，不写默认为 以太坊网络
    // token: "MATIC",
  },
};
