import { ethers } from "hardhat";

async function main() {
  console.log("🚀 开始部署 GasMorph 合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署者地址:", deployer.address);
  console.log("💰 部署者余额:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "ETH");

  // 部署 DemoNFT 合约
  console.log("\n🎨 部署 DemoNFT 合约...");
  const DemoNFT = await ethers.getContractFactory("DemoNFT");
  const demoNFT = await DemoNFT.deploy(deployer.address);
  await demoNFT.waitForDeployment();
  const demoNFTAddress = await demoNFT.getAddress();
  console.log("✅ DemoNFT 已部署到:", demoNFTAddress);

  // 部署 GasMorphPaymaster 合约
  console.log("\n⛽ 部署 GasMorphPaymaster 合约...");
  const GasMorphPaymaster = await ethers.getContractFactory("GasMorphPaymaster");
  const gasMorphPaymaster = await GasMorphPaymaster.deploy(demoNFTAddress, deployer.address);
  await gasMorphPaymaster.waitForDeployment();
  const paymasterAddress = await gasMorphPaymaster.getAddress();
  console.log("✅ GasMorphPaymaster 已部署到:", paymasterAddress);

  // 为演示目的，给部署者免费铸造一个 NFT
  console.log("\n🎁 为部署者免费铸造一个演示 NFT...");
  const mintTx = await demoNFT.mintForFree(deployer.address);
  await mintTx.wait();
  console.log("✅ 演示 NFT 已铸造给部署者");

  // 验证 NFT 余额
  const nftBalance = await demoNFT.balanceOf(deployer.address);
  console.log("📊 部署者的 NFT 余额:", nftBalance.toString());

  // 为部署者开启一个 2 分钟的 Gas Session
  console.log("\n⏰ 为部署者开启 2 分钟 Gas Session...");
  const sessionTx = await gasMorphPaymaster.startGasSession(deployer.address, 120); // 120 秒 = 2 分钟
  await sessionTx.wait();
  console.log("✅ Gas Session 已开启");

  // 验证 Session 状态
  const [isActive, expiryTime] = await gasMorphPaymaster.getSessionStatus(deployer.address);
  console.log("📊 Session 状态:", isActive ? "活跃" : "已过期");
  console.log("⏰ Session 过期时间:", new Date(Number(expiryTime) * 1000).toLocaleString());

  console.log("\n🎉 部署完成！");
  console.log("=".repeat(50));
  console.log("📋 部署摘要:");
  console.log("DemoNFT 地址:", demoNFTAddress);
  console.log("GasMorphPaymaster 地址:", paymasterAddress);
  console.log("部署者地址:", deployer.address);
  console.log("=".repeat(50));
  console.log("\n💡 前端配置信息:");
  console.log(`const CONTRACT_ADDRESSES = {
  DEMO_NFT: "${demoNFTAddress}",
  PAYMASTER: "${paymasterAddress}",
  DEPLOYER: "${deployer.address}"
};`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 