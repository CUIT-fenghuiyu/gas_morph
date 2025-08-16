# GasMorph Web Testing Guide

## 🎯 项目概述

GasMorph 是一个基于 ERC-4337 的意图驱动 Gas 补贴协议，为 Monad 生态系统提供创新的 Gas 费用解决方案。

## 🚀 快速开始

### 1. 环境准备

确保已安装以下依赖：
- Node.js (v16+)
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 编译合约

```bash
npm run compile
```

### 4. 启动本地网络

```bash
npm run chain
```

### 5. 部署合约

```bash
npm run deploy
```

## 📋 合约地址

部署完成后，你会看到类似以下的合约地址：

```javascript
const CONTRACT_ADDRESSES = {
  DEMO_NFT: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  PAYMASTER: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  DEPLOYER: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
};
```

## 🧪 测试合约功能

### 运行测试脚本

```bash
npx hardhat run test-contracts.js --network localhost
```

### 测试结果示例

```
🧪 开始测试 GasMorph 合约...
📝 测试账户: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ NFT 余额: 1
✅ Session 状态: 活跃
✅ Session 过期时间: 8/16/2025, 4:02:23 PM
✅ NFT 持有验证: 通过
✅ Session 验证: 通过

🎉 所有测试通过！
```

## 🎨 前端开发

### 启动前端应用

```bash
npm run frontend
```

### 前端配置

在 `frontend/src/` 目录中，确保配置正确的合约地址：

```typescript
// frontend/src/utils/erc4337.ts
export const CONTRACT_ADDRESSES = {
  DEMO_NFT: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  PAYMASTER: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
};
```

## 🔧 合约功能

### DemoNFT 合约

- **铸造 NFT**: 用户可以通过支付 0.001 ETH 铸造 NFT
- **免费铸造**: 合约所有者可以为指定地址免费铸造 NFT
- **余额查询**: 查询指定地址的 NFT 持有数量

### GasMorphPaymaster 合约

- **NFT 模式验证**: 验证用户是否持有指定的 NFT
- **Session 模式验证**: 验证用户的 Gas Session 是否有效
- **Session 管理**: 为指定地址开启 Gas Session

## 🛠️ 开发模式

使用以下命令同时启动所有服务：

```bash
npm run dev
```

这将同时启动：
- 本地 Hardhat 网络
- 合约部署
- 前端开发服务器

## 📊 监控和调试

### 查看网络状态

```bash
npx hardhat console --network localhost
```

### 查看合约事件

```bash
npx hardhat verify --network localhost <CONTRACT_ADDRESS>
```

## 🔍 故障排除

### 常见问题

1. **编译错误**: 确保 Solidity 版本兼容 (^0.8.20)
2. **部署失败**: 检查网络连接和账户余额
3. **前端连接失败**: 确认合约地址正确且网络配置匹配

### 日志查看

- 合约部署日志会显示在控制台
- 前端错误可以在浏览器开发者工具中查看
- Hardhat 网络日志会显示交易详情

## 🎯 下一步

1. **集成 ERC-4337 Bundler**: 连接真实的 ERC-4337 基础设施
2. **多链支持**: 扩展到其他 EVM 兼容链
3. **高级功能**: 实现更复杂的 Gas 补贴策略
4. **用户界面优化**: 改进前端用户体验

## 📞 支持

如有问题，请查看：
- 合约代码: `contracts/`
- 前端代码: `frontend/`
- 部署脚本: `scripts/`

---

**GasMorph Team** - 为 Monad 生态系统构建创新的 Gas 解决方案