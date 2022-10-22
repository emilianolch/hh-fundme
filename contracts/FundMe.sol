// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";

error FundMe__NotOwner();

/** @title A contract for crowd funding
 *  @author Emiliano López
 */
contract FundMe {
    using PriceConverter for uint;

    uint constant MIN_USD = 50 * 1e18;
    address immutable i_owner;
    address public immutable i_priceFeed;
    address[] public s_funders;
    mapping(address => uint) public s_addressToAmount;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address _priceFeed) {
        i_owner = msg.sender;
        i_priceFeed = _priceFeed;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.toUsd(i_priceFeed) >= MIN_USD,
            "Didn't send enough ETH"
        );
        s_funders.push(msg.sender);
        s_addressToAmount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint i = 0; i < s_funders.length; i++) {
            s_addressToAmount[s_funders[i]] = 0;
        }
        s_funders = new address[](0);

        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(sent, "Failed to send Ether");
    }

    function cheapperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (uint i = 0; i < funders.length; i++) {
            s_addressToAmount[funders[i]] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }
}
