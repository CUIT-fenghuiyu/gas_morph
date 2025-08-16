import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { mintNFTDirect, startGasSession as startRealGasSession, getSessionStatus, getNFTBalance } from './utils/erc4337';
import './App.css';

// 硬编码的规则：持有特定 NFT 的地址
const ELIGIBLE_ADDRESSES = [
  '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // 示例地址
  '0x1234567890123456789012345678901234567890', // 示例地址
];

// 移除了未使用的 DEMO_NFT_ADDRESS 常量

// 任务配置
const TASKS = [
  {
    id: 1,
    title: '关注 GasMorph 官方推特',
    description: '关注 @GasMorph 官方推特账号',
    type: 'social',
    completed: false
  },
  {
    id: 2,
    title: '加入 Discord 社区',
    description: '加入 GasMorph Discord 服务器',
    type: 'social',
    completed: false
  },
  {
    id: 3,
    title: '分享项目介绍',
    description: '在社交媒体分享 GasMorph 项目介绍',
    type: 'social',
    completed: false
  }
];

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionEndTime, setSessionEndTime] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [mintCount, setMintCount] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [mintHistory, setMintHistory] = useState<Array<{timestamp: number, hash: string, gasSponsored: boolean}>>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks] = useState(TASKS);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [nftBalance, setNftBalance] = useState<number>(0);

  // 检查用户是否有资格享受 Gas 补贴（基于 NFT 持有）
  const checkEligibility = async (address: string): Promise<boolean> => {
    try {
      const nftBalance = await getNFTBalance(address);
      return nftBalance > 0; // 持有 NFT 即有资格
    } catch (error) {
      console.error('检查资格失败:', error);
      return ELIGIBLE_ADDRESSES.includes(address.toLowerCase()); // 降级到硬编码检查
    }
  };

  // 检查任务完成状态
  const checkTaskCompletion = (): boolean => {
    return completedTasks.length >= 2; // 至少完成2个任务
  };

  // 连接钱包
  const handleConnect = async () => {
    setError('');
    setSuccess('');
    
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        console.log('正在连接钱包...');
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          console.log('钱包地址:', address);
          
          const prov = new ethers.BrowserProvider((window as any).ethereum);
          const signerInstance = await prov.getSigner();
          
          // 检查网络
          const network = await prov.getNetwork();
          console.log('当前网络 Chain ID:', network.chainId);
          
          // 将 BigInt 转换为 Number 进行比较
          const chainId = Number(network.chainId);
          
          // 获取当前配置的网络
          const targetChainId = 10143; // Monad 测试网
          const targetChainIdHex = '0x279f'; // 10143 in hex
          const targetNetworkName = 'Monad Testnet';
          const targetRpcUrl = 'https://testnet-rpc.monad.xyz';
          
          // 如果不在目标网络，尝试自动切换
          if (chainId !== targetChainId) {
            console.log(`尝试切换到 ${targetNetworkName}...`);
            try {
              await (window as any).ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainIdHex }], // 10143 in hex
              });
              
              // 重新获取网络信息
              const newNetwork = await prov.getNetwork();
              const newChainId = Number(newNetwork.chainId);
              
              if (newChainId !== targetChainId) {
                // 如果切换失败，尝试添加网络
                await (window as any).ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: targetChainIdHex,
                    chainName: targetNetworkName,
                    nativeCurrency: {
                      name: 'Monad',
                      symbol: 'MONAD',
                      decimals: 18
                    },
                    rpcUrls: [targetRpcUrl],
                    blockExplorerUrls: ['https://explorer.testnet.monad.xyz/']
                  }]
                });
              }
              
              console.log('网络切换成功');
            } catch (switchError: any) {
              console.error('网络切换失败:', switchError);
              if (switchError.code === 4902) {
                // 网络不存在，尝试添加
                try {
                  await (window as any).ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: targetChainIdHex,
                      chainName: targetNetworkName,
                      nativeCurrency: {
                        name: 'Monad',
                        symbol: 'MONAD',
                        decimals: 18
                      },
                      rpcUrls: [targetRpcUrl],
                      blockExplorerUrls: ['https://explorer.testnet.monad.xyz/']
                    }]
                  });
                  console.log('网络添加成功');
                } catch (addError) {
                  console.error('网络添加失败:', addError);
                  setError(`请手动在 MetaMask 中添加 ${targetNetworkName} (Chain ID: ${targetChainId}, RPC: ${targetRpcUrl})`);
                  return;
                }
              } else {
                setError(`网络切换失败，请手动切换到 ${targetNetworkName}`);
                return;
              }
            }
          }
          
          setUserAddress(address);
          setProvider(prov);
          setSigner(signerInstance);
          setIsConnected(true);
          
          // 检查用户资格和 NFT 余额
          try {
            const eligible = await checkEligibility(address);
            const balance = await getNFTBalance(address);
            setIsEligible(eligible);
            setNftBalance(balance);
            
            // 检查当前 Gas Session 状态
            const sessionStatus = await getSessionStatus(address);
            if (sessionStatus.isActive) {
              setSessionActive(true);
              setSessionEndTime(sessionStatus.expiryTime);
            }
            
            setSuccess(`✅ 钱包连接成功！${eligible ? ' 您持有 NFT，享受 Gas 补贴资格！' : ''}`);
          } catch (error) {
            console.error('检查用户状态失败:', error);
            setSuccess('钱包连接成功！');
          }
          
          console.log('钱包连接成功');
        }
      } catch (error: any) {
        console.error('连接钱包失败:', error);
        
        if (error.code === 4001) {
          setError('用户拒绝了连接请求，请重新尝试连接钱包');
        } else if (error.code === -32002) {
          setError('MetaMask 已经在处理连接请求，请检查 MetaMask 窗口');
        } else {
          setError(error.message || '连接钱包失败');
        }
      }
    } else {
      setError('请安装 MetaMask 钱包');
    }
  };

  // 断开连接
  const handleDisconnect = () => {
    setIsConnected(false);
    setUserAddress('');
    setProvider(null);
    setSigner(null);
    setSessionActive(false);
    setSessionEndTime(0);
    setRemainingTime('');
    setMintCount(0);
    setMintHistory([]);
    setError('');
    setSuccess('');
    setShowTaskModal(false);
    setCompletedTasks([]);
    setIsEligible(false);
    setNftBalance(0);
  };

  // 显示任务模态框
  const showTasks = () => {
    setShowTaskModal(true);
  };

  // 完成任务
  const completeTask = (taskId: number) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks(prev => [...prev, taskId]);
      setSuccess(`✅ 任务"${tasks.find(t => t.id === taskId)?.title}"已完成！`);
      
      // 检查是否满足开启 Session 的条件
      if (completedTasks.length + 1 >= 2) {
        setSuccess('🎉 恭喜！您已完成足够任务，现在可以开启 Gas Session！');
      }
    }
  };

  // 开启 Gas Session
  const startGasSession = async () => {
    if (!signer || !userAddress) {
      setError('请先连接钱包');
      return;
    }

    if (!checkTaskCompletion()) {
      setError('请先完成至少2个任务才能开启 Gas Session');
      return;
    }

    setError('');
    setSuccess('');
    
    try {
      console.log('开启 Gas Session...');
      
      // 调用真实的合约函数
      const result = await startRealGasSession(userAddress, 120, signer); // 2分钟
      
      if (result && result.hash) {
        const endTime = Math.floor(Date.now() / 1000) + 120;
        setSessionActive(true);
        setSessionEndTime(endTime);
        setSuccess(`✅ Gas Session 已开启！您现在有 2 分钟的免费 Gas 体验。\n交易哈希: ${result.hash}`);
        setShowTaskModal(false);
        
        console.log('Gas Session 开启成功，交易哈希:', result.hash);
      } else {
        throw new Error('Gas Session 开启失败');
      }
    } catch (error: any) {
      console.error('开启 Session 失败:', error);
      setError(error.message || '开启 Session 失败');
    }
  };

  // 真实 NFT 铸造
  const mintNFT = async () => {
    if (!signer || !userAddress) {
      setError('请先连接钱包');
      return;
    }

    setIsMinting(true);
    setError('');
    
    try {
      console.log('开始铸造 NFT...');
      
      // 检查是否有免费 Gas（基于任务完成和 Session 状态）
      const gasSponsored = sessionActive && checkTaskCompletion();
      
      // 调用真实的合约函数
      const result = await mintNFTDirect(userAddress, signer, gasSponsored);
      
      // 添加铸造记录
      const newMint = {
        timestamp: Date.now(),
        hash: result.hash,
        gasSponsored: result.gasSponsored
      };
      
      setMintHistory(prev => [newMint, ...prev]);
      setMintCount(prev => prev + 1);
      
      // 更新 NFT 余额
      try {
        const newBalance = await getNFTBalance(userAddress);
        setNftBalance(newBalance);
        
        // 重新检查资格
        const eligible = await checkEligibility(userAddress);
        setIsEligible(eligible);
      } catch (error) {
        console.error('更新余额失败:', error);
      }
      
      if (result.gasSponsored) {
        setSuccess(`🎉 NFT 铸造成功！Gas 已由 GasMorph 赞助！\n交易哈希: ${result.hash}`);
      } else {
        setSuccess(`🎉 NFT 铸造成功！您支付了 Gas 费用。\n交易哈希: ${result.hash}`);
      }
      
      console.log('NFT 铸造成功，哈希:', result.hash, 'Gas赞助:', result.gasSponsored);
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('铸造 NFT 失败:', error);
      setError(error.message || '铸造 NFT 失败');
    } finally {
      setIsMinting(false);
    }
  };

  // 计算剩余时间和定期刷新状态
  useEffect(() => {
    if (sessionActive && sessionEndTime > 0) {
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = sessionEndTime - now;
        
        if (remaining <= 0) {
          setSessionActive(false);
          setSessionEndTime(0);
          setRemainingTime('');
          setError('Gas Session 已过期');
        } else {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [sessionActive, sessionEndTime]);

  // 定期刷新用户状态（每30秒）
  useEffect(() => {
    if (isConnected && userAddress) {
      const refreshInterval = setInterval(async () => {
        try {
          // 刷新 NFT 余额
          const balance = await getNFTBalance(userAddress);
          setNftBalance(balance);
          
          // 刷新资格状态
          const eligible = await checkEligibility(userAddress);
          setIsEligible(eligible);
          
          // 刷新 Gas Session 状态
          const sessionStatus = await getSessionStatus(userAddress);
          if (sessionStatus.isActive && !sessionActive) {
            setSessionActive(true);
            setSessionEndTime(sessionStatus.expiryTime);
          } else if (!sessionStatus.isActive && sessionActive) {
            setSessionActive(false);
            setSessionEndTime(0);
            setRemainingTime('');
          }
        } catch (error) {
          console.error('刷新用户状态失败:', error);
        }
      }, 30000); // 30秒刷新一次
      
      return () => clearInterval(refreshInterval);
    }
  }, [isConnected, userAddress, sessionActive]);

  return (
    <div className="app">
      <div className="app-header">
        <div className="logo">
          <h1>⛽ GasMorph</h1>
          <p>意图驱动的 Gas 补贴协议</p>
        </div>
        <div className="network-info">
          <span className="network-badge">Hardhat Local</span>
        </div>
      </div>

      <div className="app-container">
        {!isConnected ? (
          <div className="welcome-section">
            <div className="welcome-card">
              <h2>🚀 欢迎使用 GasMorph</h2>
              <p>
                GasMorph 是一个创新的意图驱动 Gas 补贴协议，旨在将 DApp 的 Gas 支出
                从成本转变为可量化的增长投资。
              </p>
              <div className="demo-info">
                <h3>🎯 Demo 功能</h3>
                <ul>
                  <li><strong>动态规则 Demo:</strong> 持有特定 NFT 的地址享受 Gas 全免</li>
                  <li><strong>任务完成 Demo:</strong> 完成任务后获得免费 Gas 体验</li>
                </ul>
              </div>
              <button onClick={handleConnect} className="connect-btn">
                连接钱包
              </button>
            </div>
          </div>
        ) : (
          <div className="main-content">
            {/* 用户信息 */}
            <div className="user-info">
              <h3>👤 用户信息</h3>
              <p><strong>地址:</strong> {userAddress}</p>
              <p><strong>NFT 余额:</strong> {nftBalance} 个</p>

              <p><strong>任务完成:</strong> {completedTasks.length}/3</p>
              <button onClick={handleDisconnect} className="disconnect-btn">
                断开连接
              </button>
            </div>

            {/* Gas Session 管理 */}
            <div className="session-section">
              <h3>⏰ Gas Session 管理</h3>
              {!sessionActive ? (
                <div className="session-inactive">
                  <p>当前没有活跃的 Gas Session</p>
                  <div className="task-progress">
                    <p><strong>任务进度:</strong> {completedTasks.length}/3 完成</p>
                    {completedTasks.length < 2 && (
                      <p className="task-requirement">⚠️ 需要完成至少2个任务才能开启 Session</p>
                    )}
                  </div>
                  <div className="session-buttons">
                    <button onClick={showTasks} className="show-tasks-btn">
                      📋 查看任务
                    </button>
                    <button 
                      onClick={startGasSession} 
                      disabled={!checkTaskCompletion()}
                      className="start-session-btn"
                    >
                      开启 2 分钟免 Gas 体验
                    </button>
                  </div>
                </div>
              ) : (
                <div className="session-active">
                  <div className="session-status">
                    <span className="status-indicator active"></span>
                    <span>Session 活跃中</span>
                  </div>
                  <p><strong>剩余时间:</strong> {remainingTime}</p>
                  <p><strong>结束时间:</strong> {new Date(sessionEndTime * 1000).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* NFT 铸造区域 */}
            <div className="mint-section">
              <h3>🎨 NFT 铸造 Demo</h3>
              <div className="mint-info">
                <p><strong>铸造次数:</strong> {mintCount}</p>
                <p><strong>Gas 状态:</strong> 
                  {sessionActive && checkTaskCompletion() ? 
                    <span className="mint-available">🟢 免费铸造 (Gas 已赞助)</span> : 
                    <span className="mint-unavailable">🔴 需要支付 Gas 费用</span>
                  }
                </p>
              </div>
              
              <button 
                onClick={mintNFT}
                disabled={isMinting}
                className="mint-btn"
              >
                {isMinting ? '铸造中...' : '🎨 Mint NFT'}
              </button>
              
              {mintCount > 0 && (
                <div className="mint-history">
                  <h4>铸造历史</h4>
                  <div className="history-list">
                    {mintHistory.slice(0, 5).map((mint, index) => (
                      <div key={index} className="history-item">
                        <span>{new Date(mint.timestamp).toLocaleTimeString()}</span>
                        <span className="hash">{mint.hash.slice(0, 10)}...</span>
                        <span className={`status ${mint.gasSponsored ? 'sponsored' : 'paid'}`}>
                          {mint.gasSponsored ? '✅ 免费' : '💰 付费'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 任务模态框 */}
            {showTaskModal && (
              <div className="modal-overlay">
                <div className="task-modal">
                  <div className="modal-header">
                    <h3>📋 完成任务获得免费 Gas</h3>
                    <button onClick={() => setShowTaskModal(false)} className="close-btn">×</button>
                  </div>
                  <div className="modal-content">
                    <p className="task-description">
                      完成以下任务中的至少2个，即可获得2分钟免费 Gas 体验：
                    </p>
                    <div className="tasks-list">
                      {tasks.map(task => (
                        <div key={task.id} className={`task-item ${completedTasks.includes(task.id) ? 'completed' : ''}`}>
                          <div className="task-info">
                            <h4>{task.title}</h4>
                            <p>{task.description}</p>
                          </div>
                          <button
                            onClick={() => completeTask(task.id)}
                            disabled={completedTasks.includes(task.id)}
                            className={`task-btn ${completedTasks.includes(task.id) ? 'completed' : ''}`}
                          >
                            {completedTasks.includes(task.id) ? '✅ 已完成' : '完成'}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="modal-footer">
                      <p className="task-progress-text">
                        已完成: {completedTasks.length}/3 任务
                      </p>
                      {checkTaskCompletion() && (
                        <button onClick={startGasSession} className="start-session-btn">
                          开启 Gas Session
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 错误和成功消息 */}
            {error && (
              <div className="message error">
                ❌ {error}
              </div>
            )}
            {success && (
              <div className="message success">
                ✅ {success}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 