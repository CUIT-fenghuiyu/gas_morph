const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 测试 GasMorph 合约功能...");
  
  // 合约地址
  const DEMO_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const PAYMASTER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  // 获取签名者
  const [deployer, user1] = await ethers.getSigners();
  console.log("🔑 测试账户:", user1.address);
  console.log("💰 账户余额:", ethers.formatEther(await ethers.provider.getBalance(user1.address)), "ETH");
  
  // 连接合约
  const demoNFT = await ethers.getContractAt("DemoNFT", DEMO_NFT_ADDRESS);
  const paymaster = await ethers.getContractAt("GasMorphPaymaster", PAYMASTER_ADDRESS);
  
  // 测试 1: 检查 NFT 合约信息
  console.log("\n📊 NFT 合约信息:");
  const mintPrice = await demoNFT.mintPrice();
  const totalSupply = await demoNFT.totalSupply();
  const maxSupply = await demoNFT.maxSupply();
  
  console.log("💵 铸造价格:", ethers.formatEther(mintPrice), "ETH");
  console.log("📈 当前供应量:", totalSupply.toString());
  console.log("📊 最大供应量:", maxSupply.toString());
  
  // 测试 2: 检查用户 NFT 余额
  const userBalance = await demoNFT.balanceOf(user1.address);
  console.log("👤 用户 NFT 余额:", userBalance.toString());
  
  // 测试 3: 检查 Gas Session 状态
  console.log("\n⏰ Gas Session 状态:");
  const sessionStatus = await paymaster.getSessionStatus(user1.address);
  console.log("🟢 Session 活跃:", sessionStatus[0]);
  console.log("⏰ Session 结束时间:", new Date(Number(sessionStatus[1]) * 1000).toLocaleString());
  
  // 测试 4: 尝试付费铸造 NFT
  console.log("\n🎨 测试付费铸造 NFT...");
  try {
    const tx = await demoNFT.connect(user1).mint(user1.address, { value: mintPrice });
    await tx.wait();
    console.log("✅ 付费铸造成功! 交易哈希:", tx.hash);
    
    const newBalance = await demoNFT.balanceOf(user1.address);
    console.log("📈 用户新的 NFT 余额:", newBalance.toString());
  } catch (error) {
    console.log("❌ 付费铸造失败:", error.message);
  }
  
  // 测试 5: 开启 Gas Session (需要 owner 权限)
  console.log("\n⚡ 测试开启 Gas Session...");
  try {
    const tx = await paymaster.connect(deployer).startGasSession(user1.address, 300); // 5分钟
    await tx.wait();
    console.log("✅ Gas Session 开启成功! 交易哈希:", tx.hash);
    
    const newSessionStatus = await paymaster.getSessionStatus(user1.address);
    console.log("🟢 新的 Session 状态:", newSessionStatus[0]);
    console.log("⏰ 新的结束时间:", new Date(Number(newSessionStatus[1]) * 1000).toLocaleString());
  } catch (error) {
    console.log("❌ 开启 Session 失败:", error.message);
  }
  
  console.log("\n🎉 合约测试完成!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  });