// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title GasMorphPaymaster
 * @dev 基于 ERC-4337 的 Paymaster 合约，实现动态 Gas 补贴
 * 支持两种模式：
 * 1. NFT 持有者模式：持有指定 NFT 的用户获得 Gas 补贴
 * 2. Gas Session 模式：在有效期内获得免费 Gas 体验
 */
contract GasMorphPaymaster is Ownable {
    // 状态变量
    IERC721 public immutable sponsorshipNFT;  // 用于验证资格的 NFT 合约
    mapping(address => uint256) public sessionStorage;  // 用户 Gas Session 过期时间戳
    address public bundler;  // 受信任的 Bundler 地址
    
    // 事件
    event GasSessionStarted(address indexed user, uint256 expiryTime);
    event BundlerUpdated(address indexed oldBundler, address indexed newBundler);
    
    // 错误定义
    error InvalidPaymasterData();
    error NFTNotHeld();
    error SessionExpired();
    error UnauthorizedBundler();
    
    // 模式常量
    uint8 private constant NFT_MODE = 0x00;
    uint8 private constant SESSION_MODE = 0x01;
    
    /**
     * @dev 构造函数
     * @param _sponsorshipNFT 用于验证资格的 NFT 合约地址
     * @param _owner 合约拥有者地址
     */
    constructor(address _sponsorshipNFT, address _owner) Ownable(_owner) {
        sponsorshipNFT = IERC721(_sponsorshipNFT);
        bundler = msg.sender; // 初始 bundler 为部署者
    }
    
    /**
     * @dev 设置受信任的 Bundler 地址
     * @param _bundler 新的 Bundler 地址
     */
    function setBundler(address _bundler) external onlyOwner {
        address oldBundler = bundler;
        bundler = _bundler;
        emit BundlerUpdated(oldBundler, _bundler);
    }
    
    /**
     * @dev 为用户开启 Gas Session
     * @param userAddress 用户地址
     * @param durationInSeconds Session 持续时间（秒）
     */
    function startGasSession(address userAddress, uint256 durationInSeconds) external onlyOwner {
        sessionStorage[userAddress] = block.timestamp + durationInSeconds;
        emit GasSessionStarted(userAddress, sessionStorage[userAddress]);
    }
    
    /**
     * @dev 批量开启 Gas Session
     * @param userAddresses 用户地址数组
     * @param durationInSeconds Session 持续时间（秒）
     */
    function startGasSessionBatch(address[] calldata userAddresses, uint256 durationInSeconds) external onlyOwner {
        uint256 expiryTime = block.timestamp + durationInSeconds;
        for (uint256 i = 0; i < userAddresses.length; i++) {
            sessionStorage[userAddresses[i]] = expiryTime;
            emit GasSessionStarted(userAddresses[i], expiryTime);
        }
    }
    
    /**
     * @dev 检查用户的 Session 状态
     * @param userAddress 用户地址
     * @return 是否在有效期内
     * @return 过期时间戳
     */
    function getSessionStatus(address userAddress) external view returns (bool, uint256) {
        uint256 expiryTime = sessionStorage[userAddress];
        return (block.timestamp < expiryTime, expiryTime);
    }
    
    /**
     * @dev 核心验证函数 - 实现 ERC-4337 Paymaster 接口
     * @param userOp UserOperation 结构
     * @param userOpHash UserOperation 的哈希
     * @param maxCost 最大成本
     * @return context 上下文数据
     * @return validationData 验证数据
     */
    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external view returns (bytes memory context, uint256 validationData) {
        // 验证调用者是否为受信任的 Bundler
        if (msg.sender != bundler) {
            revert UnauthorizedBundler();
        }
        
        // 解析 paymasterAndData
        bytes calldata paymasterAndData = userOp.paymasterAndData;
        if (paymasterAndData.length < 21) {
            revert InvalidPaymasterData();
        }
        
        // 前 20 字节是用户地址
        address userAddress = address(uint160(uint256(bytes32(paymasterAndData[:20]))));
        
        // 第 21 字节是模式标识
        uint8 mode = uint8(paymasterAndData[20]);
        
        // 根据模式进行验证
        if (mode == NFT_MODE) {
            _validateNFTMode(userAddress);
        } else if (mode == SESSION_MODE) {
            _validateSessionMode(userAddress);
        } else {
            revert InvalidPaymasterData();
        }
        
        // 验证通过，返回空上下文和成功状态
        return ("", 0);
    }
    
    /**
     * @dev 验证 NFT 模式
     * @param userAddress 用户地址
     */
    function _validateNFTMode(address userAddress) internal view {
        uint256 nftBalance = sponsorshipNFT.balanceOf(userAddress);
        if (nftBalance == 0) {
            revert NFTNotHeld();
        }
    }
    
    /**
     * @dev 验证 Session 模式
     * @param userAddress 用户地址
     */
    function _validateSessionMode(address userAddress) internal view {
        uint256 expiryTime = sessionStorage[userAddress];
        if (block.timestamp >= expiryTime) {
            revert SessionExpired();
        }
    }
    
    /**
     * @dev 后处理函数 - 在 UserOperation 执行后调用
     * @param mode 模式
     * @param context 上下文数据
     * @param actualGasCost 实际 Gas 成本
     */
    function _postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost) external {
        // 在这个 MVP 中，我们不需要特殊的后处理逻辑
        // 但保留这个函数以满足 ERC-4337 接口要求
    }
    
    /**
     * @dev 接收 ETH 的函数
     */
    receive() external payable {}
    
    /**
     * @dev 提取合约中的 ETH
     * @param amount 提取金额
     */
    function withdrawETH(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
}

/**
 * @dev UserOperation 结构体定义
 */
struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}

/**
 * @dev PostOpMode 枚举
 */
enum PostOpMode {
    opSucceeded,
    opReverted,
    postOpReverted
} 