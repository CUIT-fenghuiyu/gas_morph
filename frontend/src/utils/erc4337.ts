import { ethers } from 'ethers';

// 合约地址配置（从部署脚本更新）
export const CONTRACT_ADDRESSES = {
  DEMO_NFT: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // DemoNFT 合约地址
  PAYMASTER: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // GasMorphPaymaster 合约地址
  DEPLOYER: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"  // 部署者地址
};

// 本地 Hardhat 网络配置
export const MONAD_CONFIG = {
  chainId: 1337, // Hardhat 本地网络
  rpcUrl: "http://localhost:8545",
  bundlerUrl: "http://localhost:8545", // 本地网络
  entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789" // 标准的 EntryPoint 地址
};

// UserOperation 接口定义
export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

// 模式类型
export type PaymasterMode = 'nft' | 'session';

// DemoNFT 合约 ABI（简化版本）
export const DEMO_NFT_ABI = [
  "function mint(address to) external payable",
  "function mintForFree(address to) external",
  "function balanceOf(address owner) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function mintPrice() external view returns (uint256)"
];

// GasMorphPaymaster 合约 ABI（简化版本）
export const PAYMASTER_ABI = [
  "function startGasSession(address user, uint256 durationInSeconds) external",
  "function getSessionStatus(address user) external view returns (bool active, uint256 endTime)",
  "function sessionStorage(address user) external view returns (uint256)"
];

/**
 * 创建 Provider 实例
 */
export function createProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(MONAD_CONFIG.rpcUrl);
}

/**
 * 创建 Bundler Provider 实例
 */
export function createBundlerProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(MONAD_CONFIG.bundlerUrl);
}

/**
 * 构建 paymasterAndData
 * @param userAddress 用户地址
 * @param mode 模式 ('nft' | 'session')
 * @returns paymasterAndData 字节串
 */
export function buildPaymasterAndData(userAddress: string, mode: PaymasterMode): string {
  const paymasterAddress = CONTRACT_ADDRESSES.PAYMASTER;
  
  // 移除地址前缀 "0x"
  const paymasterAddressBytes = paymasterAddress.slice(2);
  const userAddressBytes = userAddress.slice(2);
  
  // 模式字节：0x00 为 NFT 模式，0x01 为 Session 模式
  const modeByte = mode === 'nft' ? '00' : '01';
  
  // 组合：paymasterAddress + userAddress + mode
  return '0x' + paymasterAddressBytes + userAddressBytes + modeByte;
}

/**
 * 创建赞助的 UserOperation
 * @param tx 交易对象
 * @param userAddress 用户地址
 * @param mode 模式
 * @returns UserOperation 对象
 */
export async function createSponsoredUserOp(
  tx: any,
  userAddress: string,
  mode: PaymasterMode
): Promise<UserOperation> {
  const provider = createProvider();
  
  // 获取当前 gas 价格
  const feeData = await provider.getFeeData();
  
  // 构建 paymasterAndData
  const paymasterAndData = buildPaymasterAndData(userAddress, mode);
  
  // 创建 UserOperation
  const userOp: UserOperation = {
    sender: userAddress,
    nonce: ethers.toBeHex(await provider.getTransactionCount(userAddress)),
    initCode: "0x",
    callData: tx.data || "0x",
    callGasLimit: ethers.toBeHex(300000), // 默认 gas 限制
    verificationGasLimit: ethers.toBeHex(100000),
    preVerificationGas: ethers.toBeHex(21000),
    maxFeePerGas: ethers.toBeHex(feeData.maxFeePerGas || 0),
    maxPriorityFeePerGas: ethers.toBeHex(feeData.maxPriorityFeePerGas || 0),
    paymasterAndData: paymasterAndData,
    signature: "0x" // 初始为空，由钱包签名
  };
  
  return userOp;
}

/**
 * 发送赞助的 UserOperation
 * @param userOp UserOperation 对象
 * @returns 交易哈希
 */
export async function sendSponsoredUserOp(userOp: UserOperation): Promise<string> {
  const bundlerProvider = createBundlerProvider();
  
  try {
    // 发送 UserOperation 到 Bundler
    const response = await bundlerProvider.send('eth_sendUserOperation', [
      userOp,
      MONAD_CONFIG.entryPoint
    ]);
    
    return response;
  } catch (error) {
    console.error('发送 UserOperation 失败:', error);
    throw error;
  }
}

/**
 * 检查 UserOperation 状态
 * @param userOpHash UserOperation 哈希
 * @returns 状态信息
 */
export async function getUserOpStatus(userOpHash: string): Promise<any> {
  const bundlerProvider = createBundlerProvider();
  
  try {
    const response = await bundlerProvider.send('eth_getUserOperationByHash', [userOpHash]);
    return response;
  } catch (error) {
    console.error('获取 UserOperation 状态失败:', error);
    throw error;
  }
}

/**
 * 估算 UserOperation 的 gas 成本
 * @param userOp UserOperation 对象
 * @returns gas 估算结果
 */
export async function estimateUserOpGas(userOp: UserOperation): Promise<any> {
  const bundlerProvider = createBundlerProvider();
  
  try {
    const response = await bundlerProvider.send('eth_estimateUserOperationGas', [
      userOp,
      MONAD_CONFIG.entryPoint
    ]);
    
    return response;
  } catch (error) {
    console.error('估算 UserOperation Gas 失败:', error);
    throw error;
  }
}

/**
 * 创建 NFT 铸造交易
 * @param userAddress 用户地址
 * @returns 交易对象
 */
export async function createMintTransaction(userAddress: string): Promise<any> {
  const provider = createProvider();
  const demoNFT = new ethers.Contract(
    CONTRACT_ADDRESSES.DEMO_NFT,
    [
      'function mint(address to) external payable',
      'function mintPrice() external view returns (uint256)'
    ],
    provider
  );
  
  // 获取铸造价格
  const mintPrice = await demoNFT.mintPrice();
  
  // 创建交易
  const tx = await demoNFT.mint.populateTransaction(userAddress, {
    value: mintPrice
  });
  
  return tx;
}

/**
 * 检查用户的 NFT 余额
 * @param userAddress 用户地址
 * @returns NFT 余额
 */
export async function getNFTBalance(userAddress: string): Promise<number> {
  const provider = createProvider();
  const demoNFT = new ethers.Contract(
    CONTRACT_ADDRESSES.DEMO_NFT,
    ['function balanceOf(address owner) external view returns (uint256)'],
    provider
  );
  
  const balance = await demoNFT.balanceOf(userAddress);
  return Number(balance);
}

/**
 * 检查用户的 Gas Session 状态
 * @param userAddress 用户地址
 * @returns Session 状态
 */
export async function getSessionStatus(userAddress: string): Promise<{isActive: boolean, expiryTime: number}> {
  const provider = createProvider();
  const paymaster = new ethers.Contract(
    CONTRACT_ADDRESSES.PAYMASTER,
    ['function getSessionStatus(address userAddress) external view returns (bool, uint256)'],
    provider
  );
  
  const [isActive, expiryTime] = await paymaster.getSessionStatus(userAddress);
  return {
    isActive,
    expiryTime: Number(expiryTime)
  };
}

/**
 * 开启 Gas Session（仅限 owner 调用）
 * @param userAddress 用户地址
 * @param durationInSeconds 持续时间（秒）
 * @param signer 签名者（用于获取 provider）
 */
export async function startGasSession(
  userAddress: string,
  durationInSeconds: number,
  signer: ethers.Signer
): Promise<any> {
  // 使用部署者的 signer 来调用合约
  const provider = signer.provider;
  if (!provider) {
    throw new Error('Provider not available');
  }
  
  // 使用部署者私钥创建 owner signer
  const ownerSigner = new ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // 部署者私钥
    provider
  );
  
  const paymaster = new ethers.Contract(
    CONTRACT_ADDRESSES.PAYMASTER,
    ['function startGasSession(address userAddress, uint256 durationInSeconds) external'],
    ownerSigner
  );
  
  // 添加延迟，确保 nonce 正确
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return await paymaster.startGasSession(userAddress, durationInSeconds);
}

/**
 * 直接调用合约铸造 NFT
 * @param userAddress 用户地址
 * @param signer Signer 实例
 * @param gasSponsored 是否由 Gas 赞助
 * @returns 交易结果
 */
export async function mintNFTDirect(
  userAddress: string,
  signer: ethers.Signer,
  gasSponsored: boolean = false
): Promise<any> {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.DEMO_NFT,
      DEMO_NFT_ABI,
      signer
    );

    // 获取 mint 价格
    const mintPrice = await contract.mintPrice();
    console.log('Mint 价格:', ethers.formatEther(mintPrice), 'ETH');

    let tx;
    if (gasSponsored) {
      // 如果有 Gas 赞助，通过 owner 调用 mintForFree
      console.log('使用 Gas 赞助铸造...');
      
      // 创建 owner 的 signer (部署者账户)
      const provider = signer.provider;
      if (!provider) {
        throw new Error('Provider not available');
      }
      
      // 使用部署者私钥创建 owner signer
      const ownerSigner = new ethers.Wallet(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // 部署者私钥
        provider
      );
      
      // 获取当前 nonce 并等待确认
      const currentNonce = await provider.getTransactionCount(ownerSigner.address);
      console.log('当前 nonce:', currentNonce);
      
      // 添加延迟，确保之前的交易已确认
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const ownerContract = new ethers.Contract(
        CONTRACT_ADDRESSES.DEMO_NFT,
        DEMO_NFT_ABI,
        ownerSigner
      );
      
      // 通过 owner 免费铸造给用户，添加重试机制
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          tx = await ownerContract.mintForFree(userAddress);
          console.log('免费铸造交易已发送:', tx.hash);
          break;
        } catch (error: any) {
          retryCount++;
          console.log(`铸造失败，重试 ${retryCount}/${maxRetries}:`, error.message);
          
          if (error.message.includes('nonce') && retryCount < maxRetries) {
            // 如果是 nonce 错误，等待更长时间
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }
          
          throw error;
        }
      }
    } else {
      // 正常付费铸造
      console.log('付费铸造，支付:', ethers.formatEther(mintPrice), 'ETH');
      tx = await contract.mint(userAddress, { value: mintPrice });
    }

    console.log('交易已发送:', tx.hash);
    
    // 等待交易确认
    const receipt = await tx.wait();
    console.log('交易已确认:', receipt);

    return {
      hash: tx.hash,
      gasSponsored,
      receipt
    };

  } catch (error) {
    console.error('铸造 NFT 失败:', error);
    throw error;
  }
} 