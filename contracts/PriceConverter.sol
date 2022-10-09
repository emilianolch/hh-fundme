// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(address _priceFeed) internal view returns (uint) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_priceFeed);
        (, int price, , , ) = priceFeed.latestRoundData();
        return uint(price * 1e10);
    }

    function toUsd(uint ethAmount, address priceFeed)
        internal
        view
        returns (uint)
    {
        return (getPrice(priceFeed) * ethAmount) / 1e18;
    }
}
