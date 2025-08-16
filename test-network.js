// 简单的网络切换测试
console.log('🔧 测试网络切换功能...');

// 测试添加 Hardhat 本地网络
async function testAddLocalhost() {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.log('❌ MetaMask 不可用');
    return;
  }

  try {
    console.log('🔄 尝试添加 Hardhat 本地网络...');
    
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x539',
        chainName: 'Hardhat Localhost',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['http://localhost:8545'],
        blockExplorerUrls: []
      }]
    });
    
    console.log('✅ 网络添加成功');
    
    // 尝试切换到新添加的网络
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x539' }]
    });
    
    console.log('✅ 网络切换成功');
    
  } catch (error) {
    console.error('❌ 网络操作失败:', error);
  }
}

// 导出函数供全局使用
window.testAddLocalhost = testAddLocalhost;

console.log('✅ 测试工具已加载');
console.log('使用方法: testAddLocalhost()'); 