// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LotterySpin is ERC20 {

    address public owner;  // the owner of the token

    // constructor will only be invoked during contract 
    // deployment time
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        owner = msg.sender;    // address of the token owner
        uint256 n = 1000;
        // mint the tokens
        _mint(msg.sender, n*10**18);
    }

    mapping (address => uint256) public _spinbalance;
    mapping (address => uint256) public _tax;
    mapping (address => uint256) public _time;
    mapping (address => uint256) public _state;
    mapping (address => uint256) public _number;    
    
    function deposit(uint256 amount) public payable {
        uint256 _amount = amount;
        amount = 0.00000025 ether * amount;
        require(msg.value >= amount, "User don't pay");
        _spinbalance[msg.sender] = _spinbalance[msg.sender] + _amount ;
    }

    function randomnumber() internal returns (uint256) {
        _number[msg.sender] = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty,  msg.sender))) % 8 + 1;
        return _number[msg.sender];
    }

    function getresult(address player) public view returns(uint256) {
        return _number[player];
    }

    function getspincount(address player) public view returns(uint256) {
        return _spinbalance[player];
    }

    function play() external returns(uint256) {
        if(_spinbalance[msg.sender] >= 1) {
            _spinbalance[msg.sender] = _spinbalance[msg.sender] - 1;
            uint256 result = randomnumber();
            uint256 amount = 0;
            uint256 playtime = block.timestamp;
            if((playtime < _time[msg.sender])) {
                if(_state[msg.sender] == 1) {
                _tax[msg.sender] = 0;
                }
                else if(_state[msg.sender] == 2) {
                    _tax[msg.sender] = 10;
                }
            }
            else {
                _tax[msg.sender] = 20;
            }
            if(_state[msg.sender] == 3){
                _tax[msg.sender] = 0;
                _state[msg.sender] = 0;
            }
            if(result == 1) {
                _state[msg.sender] = 1;
                _time[msg.sender] = block.timestamp + 1800;
            }
            if(result == 5) {
                _state[msg.sender] = 2;
                _time[msg.sender] = block.timestamp + 3600;
            }

            if(result == 3) {
                amount = (100 - _tax[msg.sender])/100;
                rewardBNB(msg.sender, amount);
            } else if(result == 2) {
                amount = (100 - _tax[msg.sender])/100/2;
                rewardBNB(msg.sender, amount);
            } else if(result == 6) {
                amount = (1 - _tax[msg.sender]/100)*1000;
                rewardtoken(msg.sender, amount);
            } else if(result == 8) {
                rewardspin(msg.sender, 1);
            } else if(result == 4) {
                rewardspin(msg.sender, 3);
            } else if(result == 7) {
                _state[msg.sender] = 3;
            }
            return result;
        }
        return 0;
    }

    function rewardBNB(address to, uint256 amount) internal{
        (bool success, ) = to.call{value: amount/100000 ether}("");
        require(success, "Failed to send Ether");
    }

    function rewardtoken(address to, uint256 amount) internal {
        _mint(to, amount*10**18);
    }

    function rewardspin(address to, uint256 amount) internal {
        _spinbalance[to] = _spinbalance[to] + amount;
    }
    function withdraw() external{
        require(msg.sender == owner, "You are not owner");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

}