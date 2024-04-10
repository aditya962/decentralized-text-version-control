// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract VersionControl {
    struct TextVersion {
        string ipfsHash;
        uint256 timestamp;
    }

    mapping(address => TextVersion[]) private textVersions;

    event TextSaved(address indexed user, string ipfsHash, uint256 timestamp);

    function saveText(string memory _ipfsHash) public {
        textVersions[msg.sender].push(TextVersion(_ipfsHash, block.timestamp));
        emit TextSaved(msg.sender, _ipfsHash, block.timestamp);
    }

    function getNumVersions(address _user) public view returns (uint256) {
        return textVersions[_user].length;
    }

    function getTextVersion(address _user, uint256 _index) public view returns (string memory ipfsHash, uint256 timestamp) {
        require(_index < textVersions[_user].length, "Index out of range");
        TextVersion memory version = textVersions[_user][_index];
        return (version.ipfsHash, version.timestamp);
    }
}
