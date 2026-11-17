const { expect } = require('chai');
const { ethers } = require('hardhat');

const TENANT = ethers.id('tenant:example-bank');
const h = (s) => ethers.id(s);

describe('AuditAnchor', () => {
  async function deploy() {
    const [owner, writer, outsider] = await ethers.getSigners();
    const c = await ethers.deployContract('AuditAnchor');
    return { c, owner, writer, outsider };
  }

  it('makes the deployer owner and writer', async () => {
    const { c, owner } = await deploy();
    expect(await c.owner()).to.equal(owner.address);
    expect(await c.writers(owner.address)).to.equal(true);
  });

  it('anchors a head and emits Anchored', async () => {
    const { c, owner } = await deploy();
    await expect(c.anchor(TENANT, h('head-1'), 10)).to.emit(c, 'Anchored').withArgs(TENANT, 0, h('head-1'), 10, owner.address);
    const a = await c.latest(TENANT);
    expect(a.head).to.equal(h('head-1'));
    expect(a.count).to.equal(10n);
    expect(await c.anchorCount(TENANT)).to.equal(1n);
  });

  it('keeps history and requires the count to increase', async () => {
    const { c } = await deploy();
    await c.anchor(TENANT, h('a'), 10);
    await c.anchor(TENANT, h('b'), 12);
    await expect(c.anchor(TENANT, h('c'), 12)).to.be.revertedWithCustomError(c, 'CountMustIncrease').withArgs(12, 12);
    expect((await c.anchorAt(TENANT, 0)).head).to.equal(h('a'));
    expect((await c.latest(TENANT)).head).to.equal(h('b'));
  });

  it('keeps tenants separate', async () => {
    const { c } = await deploy();
    await c.anchor(TENANT, h('a'), 5);
    const other = ethers.id('tenant:other');
    await c.anchor(other, h('x'), 1);
    expect(await c.anchorCount(TENANT)).to.equal(1n);
    expect((await c.latest(other)).count).to.equal(1n);
  });

  it('rejects writers that are not allowed', async () => {
    const { c, outsider } = await deploy();
    await expect(c.connect(outsider).anchor(TENANT, h('a'), 1)).to.be.revertedWithCustomError(c, 'NotWriter');
  });

  it('lets only the owner manage writers', async () => {
    const { c, writer, outsider } = await deploy();
    await expect(c.connect(outsider).setWriter(writer.address, true)).to.be.revertedWithCustomError(c, 'NotOwner');
    await expect(c.setWriter(writer.address, true)).to.emit(c, 'WriterSet').withArgs(writer.address, true);
    await c.connect(writer).anchor(TENANT, h('a'), 1);
    await c.setWriter(writer.address, false);
    await expect(c.connect(writer).anchor(TENANT, h('b'), 2)).to.be.revertedWithCustomError(c, 'NotWriter');
  });

  it('rejects an empty head and reading with no anchors', async () => {
    const { c } = await deploy();
    await expect(c.anchor(TENANT, ethers.ZeroHash, 1)).to.be.revertedWithCustomError(c, 'EmptyHead');
    await expect(c.latest(TENANT)).to.be.revertedWithCustomError(c, 'NoAnchors');
  });

  it('transfers ownership', async () => {
    const { c, writer } = await deploy();
    await c.transferOwnership(writer.address);
    expect(await c.owner()).to.equal(writer.address);
    await expect(c.setWriter(writer.address, true)).to.be.revertedWithCustomError(c, 'NotOwner');
  });
});
