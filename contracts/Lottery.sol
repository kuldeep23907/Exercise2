pragma solidity >=0.7.0;

contract Lottery {
    
    uint public amount;
    address payable owner;
    mapping(address => bool) users;
    address payable[] usersList;
    bool feeTransferredToOwner;
    bool resultDeclared;
    event betComplete(address indexed user, uint betAmount);
    

    constructor(uint _amount) {
        owner = msg.sender;
        amount = _amount;
        feeTransferredToOwner = false;
        resultDeclared = false;
    }
    
    function bet() public payable returns(bool) {
        require(msg.sender != owner, "Owner can not bet");
        require(usersList.length < 3, "Only 3 users allowed");
        require(!users[msg.sender], "You have bet already");
        require(msg.value/10**18 == amount, "Not sufficient amount to bet");
        users[msg.sender] = true;
        usersList.push(msg.sender);
        emit betComplete(msg.sender, amount);
        return true;
    }
    
    function result() public returns(bool) {
        require(!resultDeclared, "Result already declared");
        require(msg.sender == owner, "Not authorised");
        require(usersList.length == 3, "Not all users have bet yet");
        require(!feeTransferredToOwner, "Owner has got the fee already");
        uint feeToOwner = (address(this).balance)/100;
        feeTransferredToOwner = true;
        owner.transfer(feeToOwner);
        uint randomWinner = block.timestamp%3;
        resultDeclared = true;
        uint winnerPrize = ((address(this).balance)*2)/3;
        uint runnerUpPrize = address(this).balance - winnerPrize;
        
        
        if(randomWinner != 2) {
            usersList[randomWinner].transfer(winnerPrize);
            usersList[randomWinner + 1].transfer(runnerUpPrize); 
        } else {
            usersList[randomWinner].transfer(winnerPrize);
            usersList[0].transfer(runnerUpPrize);
        }
        return true;
    }
}