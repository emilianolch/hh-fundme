// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";

/** @title A contract for crowd funding
 *  @author Emiliano López
 */
contract FundMe {
    using PriceConverter for uint;

    uint constant MIN_USD = 50 * 1e18;
    address immutable i_owner;
    address public immutable priceFeed;
    address[] public funders;
    mapping(address => uint) public addressToAmount;

    modifier onlyOwner() {
        require(msg.sender == i_owner, "Not owner");
        _;
    }

    constructor(address _priceFeed) {
        i_owner = msg.sender;
        priceFeed = _priceFeed;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.toUsd(priceFeed) >= MIN_USD,
            "Didn't send enough ETH"
        );
        funders.push(msg.sender);
        addressToAmount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint i = 0; i < funders.length; i++) {
            addressToAmount[funders[i]] = 0;
        }
        funders = new address[](0);

        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(sent, "Failed to send Ether");
    }
}
