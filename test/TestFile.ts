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

  describe("it should deploy correctly", function () {
    it("should deploy the contract", async function () {
      const { nftMarketPlace, owner } = await loadFixture(deployNftMarketplace);
      expect(await nftMarketPlace.getAddress()).to.not.equal(owner.getAddress());
    });
  });

});
