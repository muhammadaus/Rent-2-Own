// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./security/ReentrancyGuard.sol";

contract RentToOwn is ReentrancyGuard, Ownable {
    using Address for address;
    using SafeERC20 for IERC20;

    struct Agreement {
        address borrower;
        address lender;
        address nftContract;
        uint256 nftId;
        uint256 monthlyPayment;
        uint256 totalPrice;
        uint256 totalPaid;
        uint256 nextPaymentDue;
        bool isActive;
    }

    struct AirdropClaim {
        address tokenContract;
        uint256 amount;
        bytes32 merkleRoot;
        uint256 expiryTime;
    }

    mapping(uint256 => Agreement) public agreements;
    mapping(bytes32 => AirdropClaim) public airdrops;
    mapping(uint256 => mapping(bytes32 => bool)) public claimedAirdrops;
    uint256 public agreementCounter;

    event AgreementCreated(
        uint256 agreementId,
        address lender,
        address nftContract,
        uint256 nftId,
        uint256 monthlyPayment,
        uint256 totalPrice
    );
    event PaymentMade(uint256 agreementId, uint256 amount, uint256 remaining);
    event AgreementCompleted(uint256 agreementId, address newOwner);
    event AgreementDefaulted(uint256 agreementId);
    event AirdropRegistered(
        bytes32 indexed airdropId,
        address tokenContract,
        uint256 amount,
        bytes32 merkleRoot
    );
    event AirdropClaimed(
        uint256 indexed agreementId,
        address indexed borrower,
        uint256 nftId,
        address tokenContract,
        uint256 amount,
        bytes32 indexed airdropId
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    // Lender lists NFT for rent-to-own
    function listNFT(
        address _nftContract,
        uint256 _nftId,
        uint256 _monthlyPayment,
        uint256 _numberOfPayments
    ) external nonReentrant {
        require(_monthlyPayment > 0, "Payment must be greater than 0");
        require(_numberOfPayments > 0, "Number of payments must be greater than 0");

        // Transfer NFT to contract
        IERC721(_nftContract).transferFrom(msg.sender, address(this), _nftId);

        // Verify transfer was successful
        require(
            IERC721(_nftContract).ownerOf(_nftId) == address(this),
            "NFT transfer to contract failed"
        );

        uint256 totalPrice = _monthlyPayment * _numberOfPayments;
        uint256 agreementId = agreementCounter++;

        agreements[agreementId] = Agreement({
            borrower: address(0),
            lender: msg.sender,
            nftContract: _nftContract,
            nftId: _nftId,
            monthlyPayment: _monthlyPayment,
            totalPrice: totalPrice,
            totalPaid: 0,
            nextPaymentDue: 0,
            isActive: true
        });

        emit AgreementCreated(
            agreementId,
            msg.sender,
            _nftContract,
            _nftId,
            _monthlyPayment,
            totalPrice
        );
    }

    // Borrower starts the agreement with first payment
    function startAgreement(uint256 _agreementId) external payable nonReentrant {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.isActive, "Agreement not active");
        require(agreement.borrower == address(0), "Already has a borrower");
        require(msg.value == agreement.monthlyPayment, "Incorrect payment");

        agreement.borrower = msg.sender;
        agreement.nextPaymentDue = block.timestamp + 30 days;
        agreement.totalPaid = msg.value;

        // Transfer payment to lender
        payable(agreement.lender).transfer(msg.value);

        emit PaymentMade(
            _agreementId,
            msg.value,
            agreement.totalPrice - agreement.totalPaid
        );
    }

    // Make monthly payment
    function makePayment(uint256 _agreementId) external payable nonReentrant {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.isActive, "Agreement not active");
        require(msg.sender == agreement.borrower, "Not the borrower");
        require(msg.value == agreement.monthlyPayment, "Incorrect payment");
        require(block.timestamp <= agreement.nextPaymentDue, "Payment is late");

        agreement.totalPaid += msg.value;
        agreement.nextPaymentDue += 30 days;

        // Transfer payment to lender
        payable(agreement.lender).transfer(msg.value);

        emit PaymentMade(
            _agreementId,
            msg.value,
            agreement.totalPrice - agreement.totalPaid
        );

        // Check if fully paid
        if (agreement.totalPaid >= agreement.totalPrice) {
            agreement.isActive = false;
            // Only transfer NFT to borrower after full payment
            IERC721(agreement.nftContract).transferFrom(
                address(this),
                agreement.borrower,
                agreement.nftId
            );
            emit AgreementCompleted(_agreementId, agreement.borrower);
        }
    }

    // Handle default (can be called by lender)
    function handleDefault(uint256 _agreementId) external nonReentrant {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.isActive, "Agreement not active");
        require(msg.sender == agreement.lender, "Not the lender");
        require(block.timestamp > agreement.nextPaymentDue, "Not defaulted yet");

        // Transfer NFT back to lender
        IERC721(agreement.nftContract).transferFrom(
            address(this),
            agreement.lender,
            agreement.nftId
        );

        agreement.isActive = false;
        emit AgreementDefaulted(_agreementId);
    }

    // Register new airdrop
    function registerAirdrop(
        address tokenContract,
        uint256 amount,
        bytes32 merkleRoot,
        uint256 duration
    ) external onlyOwner {
        bytes32 airdropId = keccak256(abi.encodePacked(
            tokenContract,
            amount,
            merkleRoot,
            block.timestamp
        ));

        airdrops[airdropId] = AirdropClaim({
            tokenContract: tokenContract,
            amount: amount,
            merkleRoot: merkleRoot,
            expiryTime: block.timestamp + duration
        });

        emit AirdropRegistered(airdropId, tokenContract, amount, merkleRoot);
    }

    // Claim airdrop
    function claimAirdrop(
        uint256 agreementId,
        bytes32 airdropId,
        bytes32[] calldata merkleProof
    ) external nonReentrant {
        Agreement storage agreement = agreements[agreementId];
        AirdropClaim storage airdrop = airdrops[airdropId];

        require(agreement.isActive, "Agreement not active");
        require(agreement.borrower == msg.sender, "Not the borrower");
        require(!claimedAirdrops[agreementId][airdropId], "Airdrop already claimed");
        require(block.timestamp <= airdrop.expiryTime, "Airdrop expired");

        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(agreementId, msg.sender));
        require(
            MerkleProof.verify(merkleProof, airdrop.merkleRoot, leaf),
            "Invalid merkle proof"
        );

        // Mark as claimed
        claimedAirdrops[agreementId][airdropId] = true;

        // Transfer tokens
        IERC20(airdrop.tokenContract).safeTransfer(msg.sender, airdrop.amount);

        emit AirdropClaimed(
            agreementId,
            msg.sender,
            agreement.nftId,
            airdrop.tokenContract,
            airdrop.amount,
            airdropId
        );
    }

    // Helper functions
    function getRemainingBalance(uint256 _agreementId) external view returns (uint256) {
        Agreement storage agreement = agreements[_agreementId];
        return agreement.totalPrice - agreement.totalPaid;
    }

    function isAirdropClaimed(uint256 agreementId, bytes32 airdropId)
    external
    view
    returns (bool)
    {
        return claimedAirdrops[agreementId][airdropId];
    }
}
