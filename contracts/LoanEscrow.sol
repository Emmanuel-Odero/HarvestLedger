// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LoanEscrow {
    address public owner;
    uint public loanAmount;
    string public tokenId;  // e.g., HTS token for yield

    event LoanReleased(address indexed buyer, uint amount);

    constructor(uint _amount) {
        owner = msg.sender;
        loanAmount = _amount;
    }

    function verifyAndRelease(string memory _tokenId) external payable {
        require(msg.value == loanAmount, "Incorrect amount");
        require(keccak256(bytes(_tokenId)) != keccak256(bytes(tokenId)), "Already verified");  // Simple check
        tokenId = _tokenId;
        payable(owner).transfer(msg.value);
        emit LoanReleased(msg.sender, msg.value);
    }

    function getContractId() external view returns (address) {
        return address(this);
    }
}