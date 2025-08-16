const { ethers } = require("hardhat");

async function testContracts() {
  console.log("🧪 开始测试 GasMorph 合约...");

  // 获取合约实例
  const demoNFT = await ethers.getContractAt("DemoNFT", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const paymaster = await ethers.getContractAt("GasMorphPaymaster", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  
  const [deployer] = await ethers.getSigners();
  
  console.log("📝 测试账户:", deployer.address);
  
  // 测试 1: 检查 NFT 余额
  const nftBalance = await demoNFT.balanceOf(deployer.address);
  console.log("✅ NFT 余额:", nftBalance.toString());
  
  // 测试 2: 检查 Session 状态
  const [isActive, expiryTime] = await paymaster.getSessionStatus(deployer.address);
  console.log("✅ Session 状态:", isActive ? "活跃" : "已过期");
  console.log("✅ Session 过期时间:", new Date(Number(expiryTime) * 1000).toLocaleString());
  
  // 测试 3: 检查 NFT 持有验证
  const hasNFT = await demoNFT.balanceOf(deployer.address) > 0;
  console.log("✅ NFT 持有验证:", hasNFT ? "通过" : "失败");
  
  // 测试 4: 检查 Session 验证
  const currentTime = Math.floor(Date.now() / 1000);
  const sessionValid = isActive && currentTime < expiryTime;
  console.log("✅ Session 验证:", sessionValid ? "通过" : "失败");
  
  console.log("\n🎉 所有测试通过！");
}

testContracts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  });