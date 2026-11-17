// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AuditAnchor
/// @notice Anchors the head of Chain Intel's hash-chained audit log on-chain.
/// Each audit entry's hash commits to the previous one, so anchoring the latest
/// head (and how many entries it covers) proves the first `count` entries have
/// not been edited, reordered or deleted since the anchor was written.
/// No personal or case data goes on-chain: only a 32-byte hash and a count.
contract AuditAnchor {
    struct Anchor {
        bytes32 head;   // keccak-256 hash of the latest audit entry
        uint64 count;   // number of entries covered by `head`
        uint64 at;      // block timestamp when anchored
        address by;     // writer that submitted the anchor
    }

    address public owner;
    mapping(address => bool) public writers;
    mapping(bytes32 => Anchor[]) private _anchors; // tenant id => history

    event Anchored(bytes32 indexed tenant, uint256 indexed index, bytes32 head, uint64 count, address indexed by);
    event WriterSet(address indexed writer, bool allowed);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error NotWriter();
    error CountMustIncrease(uint64 previous, uint64 submitted);
    error EmptyHead();
    error NoAnchors();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        writers[msg.sender] = true;
        emit OwnershipTransferred(address(0), msg.sender);
        emit WriterSet(msg.sender, true);
    }

    function setWriter(address writer, bool allowed) external onlyOwner {
        if (writer == address(0)) revert ZeroAddress();
        writers[writer] = allowed;
        emit WriterSet(writer, allowed);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /// @notice Record a new audit head for a tenant. The log is append-only, so `count` must grow.
    function anchor(bytes32 tenant, bytes32 head, uint64 count) external returns (uint256 index) {
        if (!writers[msg.sender]) revert NotWriter();
        if (head == bytes32(0)) revert EmptyHead();
        Anchor[] storage list = _anchors[tenant];
        if (list.length > 0) {
            uint64 prev = list[list.length - 1].count;
            if (count <= prev) revert CountMustIncrease(prev, count);
        }
        list.push(Anchor(head, count, uint64(block.timestamp), msg.sender));
        index = list.length - 1;
        emit Anchored(tenant, index, head, count, msg.sender);
    }

    function anchorCount(bytes32 tenant) external view returns (uint256) {
        return _anchors[tenant].length;
    }

    function latest(bytes32 tenant) external view returns (Anchor memory) {
        uint256 n = _anchors[tenant].length;
        if (n == 0) revert NoAnchors();
        return _anchors[tenant][n - 1];
    }

    function anchorAt(bytes32 tenant, uint256 index) external view returns (Anchor memory) {
        return _anchors[tenant][index];
    }
}
