   // SPDX-License-Identifier: MIT
   pragma solidity ^0.8.19;

   import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
   import "@openzeppelin/contracts/access/Ownable.sol";

   contract MyNFT is ERC721, Ownable {
       uint256 private _tokenIdCounter;

       constructor() ERC721("MyNFT", "MNFT") {}

       function safeMint(address to) public onlyOwner {
           _safeMint(to, _tokenIdCounter);
           _tokenIdCounter++;
       }
   }