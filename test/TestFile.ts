import { loadFixture,} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("NftMarketplace", function () {
  

  async function deployNftMarketplace() {

    // Contracts are deployed using the first signer/account by default
    const [owner, addr1, addr2,addr3] = await ethers.getSigners();

    const NftMarketPlace = await hre.ethers.getContractFactory("NftMarketplace");
    const nftMarketPlace = await NftMarketPlace.deploy();

    return { nftMarketPlace, owner, addr1, addr2,addr3};
  }

  describe("Deployment", function () {
    it("should deploy the successfully", async function () {
      const { nftMarketPlace, owner } = await loadFixture(deployNftMarketplace);
      expect(await nftMarketPlace.getAddress()).to.not.equal(owner.getAddress());
    });
  });

  describe("Minting", function () {
    it("should mint a new NFT", async function () {
      const { nftMarketPlace, owner } = await loadFixture(deployNftMarketplace);
      await nftMarketPlace.connect(owner).mintNFT("https://example.com/token/1", 100);
      expect(await nftMarketPlace.tokenURI(1)).to.equal("https://example.com/token/1");
    });

    it("confirms owner has minted nft", async function () {
      const { nftMarketPlace, owner } = await loadFixture(deployNftMarketplace);
      await nftMarketPlace.connect(owner).mintNFT("https://example.com/token/1", 100);
      const balance = await nftMarketPlace.balanceOf(owner.getAddress());
      expect(balance).to.equal(1);
    });
  });

  describe("Listing", function () {
    it("should list an NFT for sale", async function () {
      const { nftMarketPlace, owner } = await loadFixture(deployNftMarketplace);
      await nftMarketPlace.connect(owner).mintNFT("https://example.com/token/1",ethers.parseEther("10"));
      await nftMarketPlace.connect(owner).listNFTForSale(1, ethers.parseEther("1"));
      const listing = await nftMarketPlace.getListing(1);
      expect(listing.price).to.equal(ethers.parseEther("1"));
     
    });

    it("should not list an NFT for sale with zero price", async function () {
      const { nftMarketPlace, owner } = await loadFixture(deployNftMarketplace);
      await nftMarketPlace.connect(owner).mintNFT("https://example.com/token/1",ethers.parseEther("10"));
      await expect(nftMarketPlace.connect(owner).listNFTForSale(1, ethers.parseEther("0"))).to.be.revertedWith("Price must be greater than zero");
    });

    it("it should check only owner can list NFT for sale", async function () {
      const { nftMarketPlace, owner, addr1 } = await loadFixture(deployNftMarketplace);
      await nftMarketPlace.connect(owner).mintNFT("https://example.com/token/1",ethers.parseEther("10"));
      await expect(nftMarketPlace.connect(addr1).listNFTForSale(1, ethers.parseEther("1"))).to.be.revertedWith("Only owner can list NFT for sale");
    });

  });

  describe("Buying", function () {
    it("should buy an NFT", async function () {
      const { nftMarketPlace, owner, addr1 } = await loadFixture(deployNftMarketplace);
      await nftMarketPlace.connect(owner).mintNFT("https://example.com/token/1",ethers.parseEther("10"));
      await nftMarketPlace.connect(owner).listNFTForSale(1, ethers.parseEther("1"));
      await nftMarketPlace.connect(addr1).buyNFT(1, { value: ethers.parseEther("1") });

      const balance = await nftMarketPlace.balanceOf(addr1.getAddress());
      expect(balance).to.equal(1);
    })
  });

  describe("Withdraw", function () {
    it("should withdraw funds from the contract", async function () {
      const { nftMarketPlace, owner, addr1 } = await loadFixture(deployNftMarketplace);
      await nftMarketPlace.connect(owner).mintNFT("https://example.com/token/1",ethers.parseEther("10"));
      await nftMarketPlace.connect(owner).listNFTForSale(1, ethers.parseEther("1"));
      await nftMarketPlace.connect(addr1).buyNFT(1, { value: ethers.parseEther("1") });
      
      await nftMarketPlace.connect(owner).withdraw();
      const balance = await ethers.provider.getBalance(owner.getAddress());
      expect(balance).to.equal(ethers.parseEther("1"));
    })
  })

});
