/**
 * 测试网用的测试
 */
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
// 测试用的包
// expect().to.be.reverted 断言来验证某个函数调用是否会导致事务回滚
const { assert, expect } = require("chai");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe;
      let deployer;
      const sendValue = ethers.parseEther("1");

      this.beforeEach(async function () {
        // 1.部署合约 deployments.fixture()可以运行deploy文件下的部署文件，并且可以通过tags来指定
        await deployments.fixture(["fundme"]);
        // 获取deployer默认账户，在hardhat-config.js配置
        // const { deploter } = await getNamedAccounts();
        deployer = (await getNamedAccounts()).deployer;
        // 另一种获取部署账户的方法,ethers.getSigners(), 返回hardhat-config.js中 networks中的accounts
        // await ethers.getSigners();
        // 2.获取部署好的合约
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund and withdraw ", async function () {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provide.getBalance(fundMe.target);
        assert.equal(endingBalance.toString(), "0");
      });
    });
