// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DemoNFT
 * @dev 演示用的 NFT 合约，用于测试 GasMorph 的 NFT 持有验证功能
 */
contract DemoNFT is ERC721, Ownable {
    // 使用简单的 uint256 计数器替代 Counters
    uint256 private _tokenIds;
    
    // 铸造价格
    uint256 public mintPrice = 0.001 ether;
    
    // 最大供应量
    uint256 public maxSupply = 1000;
    
    // 事件
    event NFTMinted(address indexed to, uint256 indexed tokenId);
    
    constructor(address initialOwner) ERC721("GasMorph Demo NFT", "GMNFT") Ownable(initialOwner) {}
    
    /**
     * @dev 铸造 NFT
     * @param to 接收者地址
     */
    function mint(address to) external payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIds < maxSupply, "Max supply reached");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _safeMint(to, newTokenId);
        
        emit NFTMinted(to, newTokenId);
    }
    
    /**
     * @dev 免费铸造（仅限 owner）
     * @param to 接收者地址
     */
    function mintForFree(address to) external onlyOwner {
        require(_tokenIds < maxSupply, "Max supply reached");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _safeMint(to, newTokenId);
        
        emit NFTMinted(to, newTokenId);
    }
    
    /**
     * @dev 设置铸造价格
     * @param newPrice 新的铸造价格
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }
    
    /**
     * @dev 提取合约中的 ETH
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev 获取当前总供应量
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
} 