// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";

/** @title A contract for crowd founding
 *  @author Emiliano López
 */
contract FoundMe {
    using PriceConverter for uint;

    uint constant MIN_USD = 50 * 1e18;
    address immutable i_owner;
    address immutable i_priceFeed;
    address[] public founders;
    mapping(address => uint) public addressToAmount;

    modifier onlyOwner() {
        require(msg.sender == i_owner, "Not owner");
        _;
    }

    constructor(address priceFeed) {
        i_owner = msg.sender;
        i_priceFeed = priceFeed;
    }

    receive() external payable {
        found();
    }

    fallback() external payable {
        found();
    }

    function found() public payable {
        require(
            msg.value.toUsd(i_priceFeed) >= MIN_USD,
            "Didn't send enough ETH"
        );
        founders.push(msg.sender);
        addressToAmount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint i = 0; i < founders.length; i++) {
            addressToAmount[founders[i]] = 0;
        }
        founders = new address[](0);

        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(sent, "Failed to send Ether");
    }
}
