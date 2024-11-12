   // SPDX-License-Identifier: MIT
   pragma solidity ^0.8.19;

   import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
   import "@openzeppelin/contracts/access/Ownable.sol";
   import "@openzeppelin/contracts/utils/Strings.sol";

   contract MyNFT is ERC721, Ownable {
       using Strings for uint256;

       uint256 public _tokenIdCounter;
       mapping(uint256 => string) private _tokenURIs; // Mapping from token ID to token URI

       constructor() ERC721("MyNFT", "MNFT") {}

       function getCurrentTokenId() public view returns (uint256) {
           return _tokenIdCounter;
       }

       function safeMint(address to, string memory tokenURI) public onlyOwner {
           _safeMint(to, _tokenIdCounter);
           _setTokenURI(_tokenIdCounter, tokenURI); // Set the token URI
           _tokenIdCounter++;
       }

       function _setTokenURI(uint256 tokenId, string memory tokenURI) internal {
           _tokenURIs[tokenId] = tokenURI;
       }

       function tokenURI(uint256 tokenId) public view override returns (string memory) {
           require(_exists(tokenId), "URI query for nonexistent token");
           return _tokenURIs[tokenId];
       }

       function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256) {
           require(index < balanceOf(owner), "Index out of bounds");
           return _ownedTokens[owner][index]; // You need to implement this mapping
       }

       // You may need to implement a mapping to track owned tokens
       mapping(address => mapping(uint256 => uint256)) private _ownedTokens; // Mapping from owner to token index

       // Override the _transfer function to update the _ownedTokens mapping
       function _transfer(address from, address to, uint256 tokenId) internal override {
           super._transfer(from, to, tokenId);
           // Update the _ownedTokens mapping here
       }
   }