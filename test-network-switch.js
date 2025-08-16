// 测试网络切换功能
console.log('🔧 测试网络切换功能...');

// 模拟 MetaMask 网络切换
async function testNetworkSwitch() {
  try {
    // 检查是否在正确的网络
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('当前 Chain ID:', chainId);
    
    if (chainId !== '0x539') { // 1337 in hex
      console.log('尝试切换到 Hardhat 网络...');
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x539' }]
        });
        console.log('✅ 网络切换成功');
      } catch (switchError) {
        console.log('网络切换失败，尝试添加网络...');
        
        if (switchError.code === 4902) {
          try {
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
          } catch (addError) {
            console.error('❌ 网络添加失败:', addError);
          }
        }
      }
    } else {
      console.log('✅ 已在正确的网络');
    }
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 如果 MetaMask 可用，运行测试
if (typeof window !== 'undefined' && window.ethereum) {
  testNetworkSwitch();
} else {
  console.log('❌ MetaMask 不可用');
} 