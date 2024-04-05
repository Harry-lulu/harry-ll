require("dotenv").config();
/**
 * 验证合约
 * 判断网络是否需要验证，因为如果是本地的hardhat网络则不需要验证，没有意义
 * 验证合约，安装hardhat的 plugins :yarn add --save-dev @nomicfoundation/hardhat-verify
 * 详情查看：https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify
 */
async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  verify,
};
