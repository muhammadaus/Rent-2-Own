// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract ReentrancyGuard {
    // Status constants
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    // Variable to store current reentrancy status
    uint256 private _status;

    // Constructor initializes the status to _NOT_ENTERED
    constructor() {
        _status = _NOT_ENTERED;
    }

    // Modifier to prevent reentrant calls
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Set status to _ENTERED before function execution
        _status = _ENTERED;

        // Execute the function
        _;

        // Reset status to _NOT_ENTERED after function execution
        _status = _NOT_ENTERED;
    }
}
