# ⛽ GasMorph - 意图驱动的 Gas 补贴协议

GasMorph 是一个创新的意图驱动 Gas 补贴协议，旨在将 DApp 的 Gas 支出从成本转变为可量化的增长投资。本项目是为 Monad 黑客松开发的 MVP 版本。

## 🎯 核心功能

### 1. 基于 NFT 持有的动态 Gas 补贴
- 持有指定 NFT 的用户自动享受 Gas 补贴服务
- 通过 ERC-4337 Paymaster 实现无缝的用户体验
- 支持智能合约钱包和传统 EOA 钱包

### 2. Gas Session 限时体验
- 为用户提供限时的免费 Gas 体验
- 降低新用户的使用门槛
- 可配置的 Session 时长和权限

### 3. ERC-4337 账户抽象
- 基于最新的账户抽象标准
- 支持 Bundler 和 Paymaster 集成
- 提供更好的用户体验

## 🏗️ 技术架构

### 智能合约
- **GasMorphPaymaster.sol**: 核心 Paymaster 合约，实现 Gas 补贴逻辑
- **DemoNFT.sol**: 演示用 NFT 合约，用于测试 NFT 持有验证
- **技术栈**: Solidity ^0.8.20, OpenZeppelin Contracts

### 前端应用
- **React + TypeScript**: 现代化的前端框架
- **Ethers.js v6**: 以太坊交互库
- **ERC-4337 集成**: 账户抽象支持

### 网络支持
- **Monad 测试网**: 主要测试网络
- **ERC-4337 Bundler**: 支持账户抽象交易

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 yarn
- MetaMask 钱包

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install
```

### 部署合约

1. 配置环境变量（可选）：
```bash
export PRIVATE_KEY="your_private_key_here"
```

2. 编译合约：
```bash
npm run compile
```

3. 部署到 Monad 测试网：
```bash
npm run deploy
```

4. 更新前端配置：
部署完成后，将输出的合约地址更新到 `frontend/src/utils/erc4337.ts` 中的 `CONTRACT_ADDRESSES` 配置。

### 启动前端应用

```bash
# 在项目根目录
npm run frontend

# 或在前端目录
cd frontend
npm start
```

应用将在 `http://localhost:3000` 启动。

## 🎮 演示流程

1. **连接钱包**
   - 确保钱包已连接到 Monad 测试网
   - 如果未连接，应用会自动提示添加网络

2. **体验 NFT 持有者模式**
   - 点击 "Mint NFT" 按钮
   - 如果持有 NFT，交易将被 GasMorph 赞助

3. **开启 Gas Session**
   - 点击 "开启 2 分钟免 Gas 体验" 按钮
   - 需要合约 owner 权限（在 MVP 中由部署者执行）

4. **体验 Session 模式**
   - 在 Session 期间再次铸造 NFT
   - 交易将被 GasMorph 赞助

## 📁 项目结构

```
gasmorph-hackathon/
├── contracts/
│   ├── GasMorphPaymaster.sol   # 核心 Paymaster 合约
│   └── DemoNFT.sol             # 演示用 NFT 合约
├── scripts/
│   └── deploy.ts               # 部署脚本
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/         # React 组件
│   │   │   ├── ConnectWallet.tsx
│   │   │   ├── NFTMintCard.tsx
│   │   │   └── GasSessionManager.tsx
│   │   ├── utils/              # 工具函数
│   │   │   └── erc4337.ts      # ERC-4337 相关逻辑
│   │   ├── App.tsx             # 主应用组件
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── hardhat.config.ts
└── package.json
```

## 🔧 核心合约说明

### GasMorphPaymaster

核心的 Paymaster 合约，实现了两种 Gas 补贴模式：

1. **NFT 模式** (`mode = 0x00`): 验证用户是否持有指定的 NFT
2. **Session 模式** (`mode = 0x01`): 验证用户的 Gas Session 是否在有效期内

关键函数：
- `_validatePaymasterUserOp()`: 核心验证逻辑
- `startGasSession()`: 为用户开启 Gas Session
- `getSessionStatus()`: 查询用户的 Session 状态

### DemoNFT

演示用的 NFT 合约，用于测试 NFT 持有验证功能：

- `mint()`: 付费铸造 NFT
- `mintForFree()`: 免费铸造（仅 owner）
- `balanceOf()`: 查询用户 NFT 余额

## 🌟 创新特性

1. **意图驱动的 Gas 补贴**: 根据用户的意图和行为动态调整 Gas 补贴策略
2. **双重验证机制**: 支持 NFT 持有和 Session 两种验证方式
3. **无缝用户体验**: 基于 ERC-4337 实现真正的账户抽象
4. **可扩展架构**: 支持多种补贴策略和验证方式

## 🔮 未来规划

- [ ] 支持更多验证方式（代币持有、活跃度等）
- [ ] 实现动态 Gas 价格预测
- [ ] 添加治理机制
- [ ] 支持多链部署
- [ ] 集成更多 DApp 和协议

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**GasMorph** - 让 Gas 费用成为增长投资，而不是使用障碍。 