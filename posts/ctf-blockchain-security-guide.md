---
title: "CTF区块链安全经验总结——Solidity基础与智能合约漏洞"
slug: "ctf-blockchain-security-guide"
date: "2026-07-21"
excerpt: "全面总结CTF区块链安全类题目的核心考点和实战经验，涵盖Solidity基础、智能合约漏洞利用与解题流程"
---

## CTF区块链安全经验总结——Solidity基础与智能合约漏洞

### 一、区块链安全概述

区块链安全是 CTF 中近年较火的方向，主要考察以太坊智能合约的漏洞挖掘与利用。题目通常部署一个存在漏洞的合约，要求选手通过构造交易使 `isSolved()` 返回 `true` 以获取 flag。

**核心能力要求：**
- 掌握 Solidity 语言基础与合约结构
- 理解以太坊运行机制（账户、gas、存储、调用）
- 熟悉常见智能合约漏洞（重入、整数溢出、访问控制等）
- 熟练使用 Remix、Foundry、Hardhat、web3.js 等工具

**常见题型：**
1. 合约源码审计 + 编写攻击合约
2. 无源码时反编译合约还原逻辑
3. 链上交互（读取存储、调用函数、构造交易）

---

### 二、Solidity 基础

#### 2.1 合约文件结构

一个 Solidity 合约文件的结构如下：

```
合约文件：
    版本声明（pragma）
    import 引入
    合约（contract）：
        状态变量
        函数
        结构类型（struct）
        事件（event）
        函数修改器（modifier）
    代码注释
```

完整合约示例：

```solidity
pragma solidity ^0.4.0;

import "solidity_for_import.sol";  // 引入另一个合约

contract Test{
    // 状态变量
    uint a;

    // 函数
    function setA(uint x) public {
        a = x;
        emit Set_A(x);  // 调用 setA 时触发事件 Set_A
    }

    // 事件
    event Set_A(uint a);

    // 结构体
    struct Position{
        int lat;
        int lng;
    }

    address public ownerAddr;

    // 函数修改器
    modifier owner(){
        require(msg.sender == ownerAddr);
        _;
    }

    function mine() public owner {
        a += 1;
    }
}
```

#### 2.2 语言类型

**常量：** 有理数/整型常量、字符常量、十六进制常量、地址常量。

**地址类型（address）：** 表示一个账户地址（20 字节），`balance` 表示账户余额，`transfer` 用于转账。

**bool 类型：**
```solidity
pragma solidity ^0.8.7;
contract BooleanTest{
    bool a;
    // view：只读取状态，不修改状态，本地运行不消耗 gas
    function getBool() public view returns(bool){
        return a;
    }
}
```

**整型运算：**
```solidity
pragma solidity ^0.8.7;
contract Math{
    uint numa = 4;
    uint numb = 2;
    // pure：不读取且不修改任何状态，本地运行不消耗 gas
    function add(uint a, uint b) public pure returns(uint){
        return a + b;
    }
    function jian(uint a, uint b) public pure returns(uint){
        return a - b;
    }
    function cheng(uint a, uint b) public pure returns(uint){
        return a * b;
    }
    function chu(uint a, uint b) public pure returns(uint){
        return a / b;
    }
}
```

**位运算：** `&`（与）、`|`（或）、`~`（取反）、`^`（异或）、`<<`（左移）、`>>`（右移）。

**固定长度字节数组（bytes1~bytes32）：**
- `bytes1 = uint8`，`bytes2 = uint16`，…，`bytes32 = uint256`
- 可以更好地显示十六进制（`bytes1 = 0x6A`）
- 声明为 `public` 可自动生成调用长度的函数
- 自带 `length` 属性，长度固定不可修改

```solidity
pragma solidity ^0.8.7;
contract Math{
    bytes1 public num1 = 0x12;
    bytes4 public num2 = 0x12121212;
    function getlength1() public view returns(uint8){
        return num1.length;
    }
    function getlength2() public view returns(uint8){
        return num2.length;
    }
}
```

**数组：**
```solidity
uint[3] fixed;   // 固定长度 3
uint[] dynamic;  // 动态数组，可增长
Voter[] public voting;  // 结构体数组，public 自动生成 getter
```

#### 2.3 数据存储

Solidity 数据存储位置有三种：

| 位置 | 说明 |
|------|------|
| storage | 持久化存储在链上，消耗 gas |
| memory | 临时存储在内存中，函数结束即释放，节省 gas |
| calldata | 只读的函数参数存储 |

```solidity
pragma solidity ^0.8.7;
contract DynamicByte{
    string name = "xxxx";
    function getLength() public view returns(uint){
        return bytes(name).length;  // 强制转换获取长度
    }
    function changename() public view returns(bytes1){
        return bytes(name)[1];
    }
    function getName() public view returns(bytes memory){
        return bytes(name);
    }
}
```

#### 2.4 以太坊的本质与转账

以太坊账户分两类：**外部账户（EOA）** 与 **合约账户**。合约通过 `payable` 函数接收/转账以太币。

```solidity
pragma solidity ^0.8.7;
contract PayableTest{
    function pay() payable {
    }
    function getBalance() public view returns(uint){
        return address(this).balance;  // 获取合约余额
    }
}
```

转账示例（`this` 代表合约地址）：
```solidity
pragma solidity ^0.4.0;
contract Transfer{
    function transfer() public payable{
        address account = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
        account.transfer(msg.value);  // 把钱转到 account
    }
}
```

### 三、开发与调试工具

#### 3.1 Remix IDE

Remix 是以太坊官方推荐的智能合约开发 IDE，无需本地安装，可直接在浏览器中部署与测试合约。

- 地址：http://remix.ethereum.org/
- **ENVIRONMENT**：默认使用 JS 虚拟机本地模拟测试链；连接测试网选择 Injected Provider（配合 MetaMask）
- **ACCOUNT**：当前账户；JS 虚拟机会分配数个有大量测试币的账户
- **GAS LIMIT**：合约 gas 上限
- **VALUE**：转入多少 ETH
- **CONTRACT**：一个文件含多个合约时选择部署哪一个；已部署合约可在 At Address 输入地址交互

#### 3.2 其他工具

| 工具 | 用途 | 地址 |
|------|------|------|
| 水龙头 | 获取测试网 ETH（Goerli） | https://goerlifaucet.com/ |
| MetaMask | 钱包与网络切换 | https://metamask.io/ |
| 反编译 | 合约反编译 | https://ethervm.io/decompile |
| 区块链浏览器 | 查看链上信息 | https://goerli.etherscan.io/ |

区块链浏览器可检索账户地址、合约地址、交易 Hash 等信息；查询账户地址可看到余额与近期交易。

---

### 四、智能合约常见漏洞

#### 4.1 重入攻击（Reentrancy）

合约在更新状态**之前**调用外部合约并转账，攻击者通过 fallback/receive 函数反复回调，重复提取资金。

```solidity
// 有漏洞的合约
function withdraw(uint _amount) public {
    require(balances[msg.sender] >= _amount);
    (bool ok, ) = msg.sender.call{value: _amount}("");  // 先转账
    require(ok);
    balances[msg.sender] -= _amount;  // 后更新余额
}
```

**攻击合约：**
```solidity
contract Attack {
    fallback() external payable {
        target.withdraw(1 ether);  // 在接收转账时再次调用
    }
}
```

**防护：** 遵循 checks-effects-interactions 模式（先校验、再更新状态、最后交互），或使用 OpenZeppelin `ReentrancyGuard`。

#### 4.2 整数溢出/下溢

Solidity 0.8.0 之前，整数运算不检查溢出；0.8.0 起默认开启溢出检查（抛出异常）。

```solidity
// 0.8 之前需 SafeMath 防护；0.8 之后默认安全
uint8 a = 255;
a = a + 1;  // 0.8 之前溢出为 0，0.8 之后回滚
```

**CTF 考点：** 使余额/计数溢出，绕过 `require` 检查。

#### 4.3 访问控制缺陷

**构造函数命名错误（0.4.x）：** Solidity 0.4 中构造函数需与合约同名，若拼写错误则成为可被任意调用的普通函数。

```solidity
contract Ownable {
    address public owner;
    function Ownable() public { owner = msg.sender; }  // 正确
    function ownable() public { owner = msg.sender; }  // 拼写错误，任何人可调用夺权
}
```

**缺失 onlyOwner 修饰器：** 敏感函数（初始化、提款、销毁）未做权限校验。

#### 4.4 tx.origin 身份验证缺陷

`tx.origin` 是交易的原始发起者，`msg.sender` 是当前调用者。用 `tx.origin` 做身份验证可被钓鱼攻击：诱导受害者（owner）调用恶意合约，恶意合约再调用目标合约时 `tx.origin` 仍为 owner。

```solidity
// 有漏洞
require(tx.origin == owner);
// 应使用
require(msg.sender == owner);
```

#### 4.5 delegatecall 任意调用

`delegatecall` 在**调用者自己的存储上下文**中执行被调用合约的代码，可被利用修改调用者的关键存储变量。

```solidity
// 有漏洞
address(delegate).delegatecall(msg.data);  // 存储布局冲突可导致覆盖 owner
```

**考点：** 利用存储布局对齐，通过 `delegatecall` 覆盖 slot 0（owner 等关键变量）。

#### 4.6 未初始化存储指针

Solidity 中未初始化的 `storage` 指针默认指向 slot 0，可能导致覆盖关键状态变量。

```solidity
contract Test {
    address public owner;  // slot 0
    function f() public {
        address x;  // 未初始化，指向 slot 0，可能覆盖 owner
    }
}
```

#### 4.7 自毁与强制转账

`selfdestruct(addr)` 会强制把合约余额发送到指定地址，即使目标合约没有 `payable` 函数。攻击者可利用此绕过"余额只能通过业务逻辑增加"的假设。

```solidity
contract Attack {
    constructor() payable {}
    function kill(address payable target) public {
        selfdestruct(target);  // 强制转账
    }
}
```

#### 4.8 默认可见性

Solidity 0.5 之前函数默认 `public`，若忘记声明可见性，敏感函数可被任意调用。

#### 4.9 伪随机数

链上随机数（`blockhash`、`block.timestamp`、`block.difficulty`）可被矿工或攻击者预测/操纵，不能用于生成安全随机数。

```solidity
// 不安全
uint random = uint(keccak256(abi.encodePacked(block.timestamp))) % 100;
```

---

### 五、实战案例（Chainflag）

Chainflag 是区块链 CTF 刷题平台，题目合约部署在 Sepolia 测试网，通过 `nc` 交互。

#### 5.1 部署题目

```bash
nc chall.chainflag.org 10022
We design a pretty easy contract challenge. Enjoy it!
Your goal is to make isSolved() function returns true!

[1] - Create an account which will be used to deploy the challenge contract
[2] - Deploy the challenge contract using your generated account
[3] - Get your flag once you meet the requirement
[4] - Show the contract source code
```

流程：选项 1 创建部署账户 → 用 MetaMask 向该账户转测试币 → 选项 2 部署合约（得到合约地址与交易 hash）→ 选项 4 获取源码 → 编写攻击合约 → 选项 3 提交 token 获取 flag。

#### 5.2 例题：Greeter

题目源码（`isSolved` 要求 `greeting == "HelloChainFlag"`）：

```solidity
pragma solidity 0.8.7;

contract Greeter {
    string greeting;

    constructor(string memory _greeting) public {
        greeting = _greeting;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }

    function isSolved() public view returns (bool) {
        string memory expected = "HelloChainFlag";
        return keccak256(abi.encodePacked(expected)) == keccak256(abi.encodePacked(greeting));
    }
}
```

攻击合约 exp.sol：

```solidity
pragma solidity 0.8.7;

contract Greeter {
    string greeting;
    constructor(string memory _greeting) public { greeting = _greeting; }
    function setGreeting(string memory _greeting) public { greeting = _greeting; }
    function isSolved() public view returns (bool) {
        string memory expected = "HelloChainFlag";
        return keccak256(abi.encodePacked(expected)) == keccak256(abi.encodePacked(greeting));
    }
}

contract exp {
    address instance_address = 0x17b96ca2944b1CaA75708d0f2b660D208f2DF1f7;
    Greeter target = Greeter(instance_address);

    constructor() payable {}

    function hack() public returns (bool){
        bool answer = false;
        string memory greeting = "HelloChainFlag";  // memory 存储节省 gas
        target.setGreeting(greeting);               // 调用题目合约修改 greeting
        answer = target.isSolved();                 // 达成条件
        return answer;
    }
}
```

在 Remix 中部署 `exp.sol` 后点击 `hack` 按钮，支付 gas 后在 `nc` 中输入 token 获取 flag。

---

### 六、工具速查表

| 工具 | 用途 |
|------|------|
| Remix IDE | 合约开发/部署/交互 |
| MetaMask | 钱包、网络切换 |
| Foundry | 合约测试与脚本（cast/forge） |
| Hardhat | 合约开发框架 |
| web3.js / ethers.js | 链上交互脚本 |
| ethervm.io | 合约反编译 |
| Etherscan | 区块链浏览器 |
| Slither / Mythril | 智能合约静态分析 |

---

### 七、参考链接

- [Lunatic《Misc-区块链安全》](https://goodlunatic.github.io/posts/3e9e231/)（本文主要来源）
- [Remix IDE](http://remix.ethereum.org/)
- [Solidity 官方文档](https://docs.soliditylang.org/)
- [OpenZeppelin 合约库](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Ethervm 反编译](https://ethervm.io/decompile)
- [Chainflag](https://chainflag.org/)

