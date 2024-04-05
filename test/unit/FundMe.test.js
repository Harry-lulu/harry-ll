/**
 * unit测试，以合约中的每个方法为单位，确保都可以正常运行
 *
 * Terminal 执行： yarn hardhat test
 * describe是一个关键字，Hardhat的 Mocha将会识别它
 *
 * beforeEach 是在每个it执行之前执行，
 * 可以有很多的it, it里就是编写运行测试的地方
 *
 * gas 花费， 安装：npm install hardhat-gas-reporter --save-dev
 *     并在hardhat.config.js中的gasReporter中配置
 */
const { deployments, ethers, getNamedAccounts } = require("hardhat");
// 测试用的包
// expect().to.be.reverted 断言来验证某个函数调用是否会导致事务回滚
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

// FundMe.sol的测试
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.parseEther("1");
      this.beforeEach(async function () {
        // 1.部署合约 deployments.fixture()可以运行deploy文件下的部署文件，并且可以通过tags来指定
        await deployments.fixture(["all"]);
        // 获取deployer默认账户，在hardhat-config.js配置
        // const { deploter } = await getNamedAccounts();
        deployer = (await getNamedAccounts()).deployer;
        // 另一种获取部署账户的方法,ethers.getSigners(), 返回hardhat-config.js中 networks中的accounts
        // await ethers.getSigners();
        console.log(`FundMe-----${deployer}`);
        // 2.获取部署好的合约
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
          const response = await fundMe.getPriceFeed();
          console.log(`constructor----${mockV3Aggregator.target}`);
          assert.equal(response, mockV3Aggregator.target);
        });
      });
      describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });
      });

      describe("withdraw", function () {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });
        it("withdraws ETH from a single funder", async () => {
          // Arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          // Assert
          // Maybe clean up to understand the testing
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            (startingFundMeBalance + startingDeployerBalance).toString(),
            (endingDeployerBalance + gasCost).toString()
          );
        });
        // this test is overloaded. Ideally we'd split it into multiple tests
        // but for simplicity we left it as one
        it("is allows us to withdraw with multiple funders", async () => {
          // Arrange
          const accounts = await ethers.getSigners();
          for (i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          // Let's comapre gas costs :)
          // const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait();
          const { gasUsed, gasPrice } = transactionReceipt;
          const withdrawGasCost = gasUsed * gasPrice;
          console.log(`GasCost: ${withdrawGasCost}`);
          console.log(`GasUsed: ${gasUsed}`);
          console.log(`GasPrice: ${gasPrice}`);
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          // Assert
          assert.equal(
            (startingFundMeBalance + startingDeployerBalance).toString(),
            (endingDeployerBalance + withdrawGasCost).toString()
          );
          // 断言事务因任何原因而恢复，而不检查恢复原因
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it("Only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const fundMeConnectedContract = await fundMe.connect(accounts[1]);
          await expect(fundMeConnectedContract.withdraw()).to.be.rejectedWith(
            "NotOwner"
          );
        });
      });
    });
