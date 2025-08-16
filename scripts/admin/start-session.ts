import { ethers } from "hardhat";

async function main() {
  console.log("🔧 管理员工具：开启 Gas Session");
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 管理员地址:", deployer.address);
  
  // 合约地址（从部署输出中获取）
  const PAYMASTER_ADDRESS = "0x9ac77eA1280fF4dCf89b2D0f47bd15c396898945";
  
  // 获取合约实例
  const paymaster = await ethers.getContractAt("GasMorphPaymaster", PAYMASTER_ADDRESS);
  
  // 要开启 Session 的用户地址（可以修改）
  const userAddress = "0x72b974868ceb"; // 从控制台日志中看到的用户地址
  const durationInSeconds = 120; // 2分钟
  
  console.log("🎯 目标用户:", userAddress);
  console.log("⏰ Session 持续时间:", durationInSeconds, "秒");
  
  try {
    // 开启 Gas Session
    const tx = await paymaster.startGasSession(userAddress, durationInSeconds);
    console.log("📤 交易已发送:", tx.hash);
    
    // 等待确认
    const receipt = await tx.wait();
    console.log("✅ 交易已确认，区块号:", receipt?.blockNumber);
    
    // 验证 Session 状态
    const [isActive, expiryTime] = await paymaster.getSessionStatus(userAddress);
    console.log("📊 Session 状态:", isActive ? "活跃" : "已过期");
    console.log("⏰ 过期时间:", new Date(Number(expiryTime) * 1000).toLocaleString());
    
  } catch (error) {
    console.error("❌ 开启 Session 失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本执行失败:", error);
    process.exit(1);
  });
