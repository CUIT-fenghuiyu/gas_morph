import { ethers } from "hardhat";

async function main() {
  console.log("🔧 管理员工具：免费铸造 NFT");
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 管理员地址:", deployer.address);
  
  // 合约地址
  const NFT_ADDRESS = "0x07366b687f74C1B6FA6f5Aa21C76678ea7F11F89";
  
  // 获取合约实例
  const nftContract = await ethers.getContractAt("DemoNFT", NFT_ADDRESS);
  
  // 要免费铸造的用户地址（可以修改）
  const userAddress = "0x72b974868ceb"; // 从控制台日志中看到的用户地址
  
  console.log("🎯 目标用户:", userAddress);
  
  try {
    // 检查用户当前的 NFT 余额
    const balanceBefore = await nftContract.balanceOf(userAddress);
    console.log("📊 铸造前余额:", balanceBefore.toString());
    
    // 免费铸造 NFT
    const tx = await nftContract.mintForFree(userAddress);
    console.log("📤 交易已发送:", tx.hash);
    
    // 等待确认
    const receipt = await tx.wait();
    console.log("✅ 交易已确认，区块号:", receipt?.blockNumber);
    
    // 检查铸造后的余额
    const balanceAfter = await nftContract.balanceOf(userAddress);
    console.log("📊 铸造后余额:", balanceAfter.toString());
    console.log("🎉 成功铸造 NFT 数量:", balanceAfter.sub(balanceBefore).toString());
    
  } catch (error) {
    console.error("❌ 免费铸造失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本执行失败:", error);
    process.exit(1);
  });
