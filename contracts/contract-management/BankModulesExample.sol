// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract BankStorage {
    mapping(address => uint256) private userBalances;

    function getUserBalance(address user) public view returns (uint256) {
        return userBalances[user];
    }

    function _setUserBalance(address user, uint256 balance) internal {
        userBalances[user] = balance;
    }
}

pragma solidity ^0.8.18;

interface IBalanceModule {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function getBalance(address user) external view returns (uint256);
    function updateUserBalances(address from, address to, uint256 amount) external;
}

pragma solidity ^0.8.18;

contract BalanceModule is BankStorage, IBalanceModule {
    function deposit() public payable {
        uint256 currentBalance = getUserBalance(msg.sender);
        _setUserBalance(msg.sender, currentBalance + msg.value);
    }

    function withdraw(uint256 amount) public {
        uint256 currentBalance = getUserBalance(msg.sender);
        require(amount <= currentBalance, "Insufficient balance");
        _setUserBalance(msg.sender, currentBalance - amount);
        payable(msg.sender).transfer(amount);
    }

    function getBalance(address user) public view returns (uint256) {
        return getUserBalance(user);
    }

    function updateUserBalances(address from, address to, uint256 amount) external override {
        uint256 fromBalance = getUserBalance(from);
        uint256 toBalance = getUserBalance(to);
        require(amount <= fromBalance, "Insufficient balance");
        _setUserBalance(from, fromBalance - amount);
        _setUserBalance(to, toBalance + amount);
    }
}

pragma solidity ^0.8.18;

contract LoanModule {
    IBalanceModule public balanceModule;
    address public loanProvider;
    mapping(address => uint256) private userDebts;

    constructor(IBalanceModule _balanceModule, address _loanProvider) {
        balanceModule = _balanceModule;
        loanProvider = _loanProvider;
    }

    function borrow(uint256 amount) public {
        require(amount > 0, "Loan amount must be greater than 0");
        uint256 currentDebt = userDebts[msg.sender];
        uint256 loanProviderBalance = balanceModule.getBalance(loanProvider);
        require(amount <= loanProviderBalance, "Loan provider does not have enough balance");

        userDebts[msg.sender] = currentDebt + amount;

        balanceModule.updateUserBalances(loanProvider, msg.sender, amount);
    }

    function repay(uint256 amount) public {
        require(amount > 0, "Repayment amount must be greater than 0");
        uint256 currentDebt = userDebts[msg.sender];
        uint256 userBalance = balanceModule.getBalance(msg.sender);
        require(amount <= currentDebt, "Cannot repay more than debt");
        require(amount <= userBalance, "Insufficient balance for repayment");

        userDebts[msg.sender] = currentDebt - amount;

        balanceModule.updateUserBalances(msg.sender, loanProvider, amount);
    }

    function getDebt(address user) public view returns (uint256) {
        return userDebts[user];
    }
}