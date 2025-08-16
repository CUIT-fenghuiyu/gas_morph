# GasMorph - Intent-driven Gas Subsidy Protocol

## 🎯 项目概述

GasMorph 是一个基于 ERC-4337 的意图驱动 Gas 补贴协议，为 Monad 生态系统提供创新的 Gas 费用解决方案。

## 🚀 最新更新

### ✅ 已修复的问题

1. **编译警告修复**:
   - 修复了 `GasMorphPaymaster.sol` 中未使用的参数警告
   - 优化了合约代码结构

2. **部署错误修复**:
   - 添加了本地网络支持
   - 创建了本地测试部署脚本
   - 解决了 RPC 连接问题

3. **测试和文档**:
   - 创建了完整的测试脚本
   - 添加了详细的测试指南
   - 提供了故障排除文档

## 🛠️ 快速开始

### 环境要求

- Node.js (v16+)
- npm 或 yarn

### 安装和设置

```bash
# 克隆仓库
git clone https://github.com/Noe1017/gas_morph.git
cd gas_morph

# 安装依赖
npm install

# 编译合约
npm run compile

# 启动本地网络
npm run chain

# 部署合约
npm run deploy

# 部署到 Monad 测试网
npm run deploy:monad
```

## 📋 合约地址

### 本地网络 (Hardhat)

部署完成后，你会看到类似以下的合约地址：

```javascript
const CONTRACT_ADDRESSES = {
  DEMO_NFT: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  PAYMASTER: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  DEPLOYER: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
};
```

### Monad 测试网

已部署到 Monad 测试网的合约地址：

```javascript
const CONTRACT_ADDRESSES = {
  DEMO_NFT: "0x07366b687f74C1B6FA6f5Aa21C76678ea7F11F89",
  PAYMASTER: "0x9ac77eA1280fF4dCf89b2D0f47bd15c396898945",
  DEPLOYER: "0xa526F5D0c2627C099Ca83AE3A8F5d937B9C85fB2"
};
```

**网络信息**:
- **Chain ID**: 10143
- **RPC URL**: https://testnet-rpc.monad.xyz
- **区块浏览器**: https://explorer.testnet.monad.xyz/

### 部署到测试网

```bash
# 部署到 Monad 测试网
npm run deploy:monad
```

## 🧪 测试

### 运行合约测试

```bash
npx hardhat run test-contracts.js --network localhost
```

### 启动前端

```bash
npm run frontend
```

### 开发模式

```bash
npm run dev
```

## 🔧 主要功能

### DemoNFT 合约
- NFT 铸造功能
- 余额查询
- 权限管理

### GasMorphPaymaster 合约
- ERC-4337 Paymaster 实现
- NFT 持有验证
- Session 管理
- Gas 补贴逻辑

## 📚 文档

- [Web 测试指南](./WEB_TESTING_GUIDE.md) - 详细的测试和部署指南
- [合约文档](./contracts/) - 智能合约源码和说明

## 🎯 技术栈

- **区块链**: Monad, Ethereum
- **智能合约**: Solidity 0.8.20
- **开发框架**: Hardhat
- **前端**: React, TypeScript
- **标准**: ERC-4337, ERC-721

## 🤝 贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- Monad 生态系统
- ERC-4337 社区
- 所有贡献者

---

**GasMorph Team** - 为 Monad 生态系统构建创新的 Gas 解决方案 