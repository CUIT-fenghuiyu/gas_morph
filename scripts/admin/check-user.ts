import { ethers } from "hardhat";

async function main() {
  console.log("🔧 管理员工具：检查用户状态");
  
  // 合约地址
  const NFT_ADDRESS = "0x07366b687f74C1B6FA6f5Aa21C76678ea7F11F89";
  const PAYMASTER_ADDRESS = "0x9ac77eA1280fF4dCf89b2D0f47bd15c396898945";
  
  // 要检查的用户地址（可以修改）
  const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // 示例地址
  
  console.log("🎯 检查用户:", userAddress);
  
  try {
    // 获取合约实例
    const nftContract = await ethers.getContractAt("DemoNFT", NFT_ADDRESS);
    const paymasterContract = await ethers.getContractAt("GasMorphPaymaster", PAYMASTER_ADDRESS);
    
    // 检查 NFT 余额
    const nftBalance = await nftContract.balanceOf(userAddress);
    console.log("🖼️  NFT 余额:", nftBalance.toString());
    
    // 检查 Gas Session 状态
    const [sessionActive, expiryTime] = await paymasterContract.getSessionStatus(userAddress);
    console.log("⛽ Gas Session 状态:", sessionActive ? "活跃" : "已过期");
    
    if (sessionActive) {
      const expiryDate = new Date(Number(expiryTime) * 1000);
      const now = new Date();
      const remainingTime = Math.max(0, Number(expiryTime) - Math.floor(now.getTime() / 1000));
      
      console.log("⏰ Session 过期时间:", expiryDate.toLocaleString());
      console.log("⏳ 剩余时间:", Math.floor(remainingTime / 60), "分", remainingTime % 60, "秒");
    }
    
    // 检查用户是否有资格获得 Gas 补贴
    const hasNFT = nftBalance.gt(0);
    const hasActiveSession = sessionActive;
    
    console.log("\n📋 用户资格总结:");
    console.log("  - 持有 NFT:", hasNFT ? "✅" : "❌");
    console.log("  - 活跃 Session:", hasActiveSession ? "✅" : "❌");
    console.log("  - 可获得 Gas 补贴:", (hasNFT || hasActiveSession) ? "✅" : "❌");
    
  } catch (error) {
    console.error("❌ 检查用户状态失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本执行失败:", error);
    process.exit(1);
  });
