
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract minting_contract_1 is ERC20, Ownable {
    uint256 private _maxSupply;

    event MaxSupplySet(uint256 newMaxSupply);
    event TokensMinted(address to, uint256 amount);

    constructor() ERC20("MyToken", "MTK") Ownable() {
        _maxSupply = 1000000 * 10**decimals(); // Default max supply: 1 million tokens
    }

    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply >= totalSupply(), "New max supply must be >= current total supply");
        _maxSupply = newMaxSupply;
        emit MaxSupplySet(newMaxSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= _maxSupply, "Minting would exceed max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    function getCurrentSupply() external view returns (uint256) {
        return totalSupply();
    }

    function getMaxSupply() external view returns (uint256) {
        return _maxSupply;
    }
}
