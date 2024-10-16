// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RentToOwnNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct RentalAgreement {
        address renter;
        uint256 rentalPrice;
        uint256 totalPaid;
        uint256 nextPaymentDue;
        bool isActive;
    }

    mapping(uint256 => RentalAgreement) public rentalAgreements;

    constructor() ERC721("RentToOwnNFT", "RTO") {}

    function mintNFT(address recipient) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        return newItemId;
    }

    function startRental(uint256 tokenId, uint256 rentalPrice) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can start a rental");
        require(!rentalAgreements[tokenId].isActive, "Rental already active");

        rentalAgreements[tokenId] = RentalAgreement({
            renter: address(0),
            rentalPrice: rentalPrice,
            totalPaid: 0,
            nextPaymentDue: block.timestamp + 30 days, // Set payment due in 30 days
            isActive: true
        });
    }

    function rentNFT(uint256 tokenId) public payable {
        RentalAgreement storage agreement = rentalAgreements[tokenId];
        require(agreement.isActive, "No active rental agreement");
        require(msg.value >= agreement.rentalPrice, "Insufficient payment");

        // Refund logic if payment is late
        if (block.timestamp > agreement.nextPaymentDue) {
            // Refund the last payment to the owner
            payable(ownerOf(tokenId)).transfer(agreement.totalPaid);
            agreement.totalPaid = 0; // Reset total paid
            agreement.isActive = false; // Deactivate the rental agreement
            return; // Exit the function
        }

        agreement.renter = msg.sender;
        agreement.totalPaid += msg.value;

        // Transfer funds to the owner
        payable(ownerOf(tokenId)).transfer(msg.value);

        // Update next payment due date
        agreement.nextPaymentDue += 30 days; // Set next payment due in another 30 days

        // Check if total payments meet purchase price (e.g., 5 rentals)
        if (agreement.totalPaid >= agreement.rentalPrice * 5) {
            _transfer(ownerOf(tokenId), msg.sender, tokenId);
            agreement.isActive = false; // End the rental agreement
        }
    }

    function getRentalDetails(uint256 tokenId) public view returns (RentalAgreement memory) {
        return rentalAgreements[tokenId];
    }
}
