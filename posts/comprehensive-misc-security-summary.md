---
title: "MISC"
slug: "comprehensive-misc-security-summary"
date: "2026-08-13"
excerpt: "MISC 个人总结"
---

## MISC 总结

### 目录

1. [MISC 概述与解题方法论](#一misc-概述与解题方法论)
2. [文件格式识别与修复](#二文件格式识别与修复)
3. [编码与加密](#三编码与加密)
4. [图片隐写](#四图片隐写)
5. [音频与视频隐写](#五音频与视频隐写)
6. [文档隐写（PDF / Office / TXT / HTML）](#六文档隐写)
7. [压缩包分析](#七压缩包分析)
8. [流量分析](#八流量分析)
9. [工控安全](#九工控安全)
10. [数字取证与内存取证](#十数字取证与内存取证)
11. [应急响应与恶意文件分析](#十一应急响应与恶意文件分析)
12. [其他方向（侧信道 / pyjail / OSINT / 数据安全等）](#十二其他方向)
13. [工具速查表](#十三工具速查表)
14. [参考链接汇总](#十四参考链接汇总)

---

### 一、MISC 概述与解题方法论

#### 1.1 什么是 MISC

MISC（Miscellaneous，杂项）是 CTF 中题型边界最宽泛、自由度最高的门类。它不局限于单一技术栈，而是融合了隐写、编码加密、文件分析、流量分析、数字取证、应急响应、工控安全、社会工程学（OSINT）、侧信道、沙箱逃逸等多方面知识。

#### 1.2 通用解题流程

1. **识别文件类型**：先用 `file` 命令或 `magika` 判断真实文件类型，防止后缀伪装。
2. **检查文件头尾**：用 010 Editor 查看文件头（Magic Bytes）与文件尾，判断是否被篡改。
3. **搜索关键词**：在二进制中搜索 `flag`、`key`、`password` 等字符串及其常见变形。
4. **自动化初步扫描**：`binwalk`、`foremost`、`zsteg`、`stegsolve`、在线网站一把梭（如 Aperisolve）。
5. **人工深入分析**：针对具体载体（图片/音频/视频/文档/压缩包/流量）使用对应工具与脚本。
6. **交叉验证**：用多种工具与思路相互印证，避免被假 flag 误导。

#### 1.3 常用关键词搜索

出题人常把 flag 拆成片段或加密后隐藏，可搜索以下关键词（遇到一个加一个）：

```python
search_items = [
    "key", "password", "dasctf", "k3y", "p@ssword", "passw0rd",
    "p@ssw0rd", "secret", "s3cret", "s3cr3t", "s3cre4", "F14ggg",
    "Ic4unq1U", "ISCC"
]
```

查找脚本（支持二进制搜索与模糊匹配）：

```python
import re

search_items = [
    b"key", b"password", b"dasctf", b"k3y", b"p@ssword", b"passw0rd",
    b"p@ssw0rd", b"secret", b"s3cret", b"s3cr3t", b"s3cre4", b"F14ggg"
]

with open("test.txt", 'rb') as f:
    data = f.read()

for item in search_items:
    regex = re.compile(re.escape(item) + b'.*', re.IGNORECASE)
    for match in regex.finditer(data):
        print(f"[+] Found {item.decode()} match: {match.group()[:50]}...")
```

常用关键词的 base64 编码（用于在编码后的数据中快速定位）：

| 明文 | base64 |
|------|--------|
| flag | `Zmxh` |
| F14g | `RjE0` |
| DASCTF | `REFTQ1RGe` |
| s3cr3t | `czNjcjN0` |
| secret | `c2VjcmV0` |
| password | `cGFzc3dvc` |
| PNG 文件头 | `iVBORw0KGgo` |
| ZIP 文件头 | `UEsDBA` |

---

### 二、文件格式识别与修复

#### 2.1 判断文件类型

```bash
# Linux 自带
file filename

# Google 出品，基于 Rust + AI，更精准
pip install magika
magika filename
```

> 出题人可能把文件头的小写字母偷偷改成大写（如 `Rar` -> `RAR`），或篡改文件头导致无法识别，需人工核对。

#### 2.2 图像文件头/尾

| 类型 | 文件头(hex) | ASCII | 文件尾(hex) | 备注 |
|------|-------------|-------|-------------|------|
| JPEG | `FF D8 FF E0` | `ÿØÿà` | `FF D9` | |
| PNG | `89 50 4E 47 0D 0A 1A 0A` | `.PNG....` | `49 45 4E 44 AE 42 60 82` | IEND |
| GIF | `47 49 46 38 39 61` | `GIF89a` | `00 3B` | GIF87A 为 `47 49 46 38 37 61` |
| BMP | `42 4D` | `BM` | — | 通道顺序为 BGR |
| TIFF | `49 49 2A 00` | `II*.` | — | |
| PSD | `38 42 50 53` | `8BPS` | — | |
| CAD(dwg) | `41 43 31 30` | `AC10` | — | |

#### 2.3 压缩文件头/尾

| 类型 | 文件头(hex) | ASCII | 文件尾(hex) |
|------|-------------|-------|-------------|
| ZIP | `50 4B 03 04` | `PK..` | `50 4B 05 06` |
| RAR | `52 61 72 21 1A 07 01 00` | `Rar!....` | `C4 3D 7B 00 40 07 00` |
| 7Z | `37 7A BC AF 27 1C` | `7z¼¯'` | — |
| GZ | `1F 8B 08 00` | — | — |
| BZ2 | `42 5A 68` | `BZh` | — |
| ARJ | `60 EA` | `` `ê `` | — |

#### 2.4 文档文件头

| 类型 | 文件头(hex) | ASCII |
|------|-------------|-------|
| PDF | `25 50 44 46 2D 31 2E` | `%PDF-1.` |
| MS Office 2003 | `D0 CF 11 E0` | `ÑÏ..` |
| MS Access(mdb) | `53 74 61 6E 64 61 72 64 20 4A` | `Standard J` |
| RTF | `7B 5C 72 74 66` | `{\rtf` |
| XML | `3C 3F 78 6D 6C` | `<?xml` |
| HTML | `3C 68 74 6D 6C 3E` | `<html>` |
| Postscript | `25 21 50 53 2D 41 64 6F 62 65` | `%!PS-Adobe` |
| WordPerfect(wpd) | `FF 57 50 43` | `ÿWPC` |

#### 2.5 音视频文件头

| 类型 | 文件头(hex) | ASCII |
|------|-------------|-------|
| WAV | `57 41 56 45` | `WAVE`（RIFF 容器） |
| MP3 | `49 44 33 03 00 00 00 00` | `ID3....` |
| MIDI | `4D 54 68 64` | `MThd` |
| Real Audio(ra) | `2E 72 61 FD` | `.ra` |
| M4A | `00 00 00 18 66 74 79 70 4D 34 41` | `....ftypM4A` |
| AVI | `41 56 49 20` | `AVI` |
| MOV | `6D 6F 6F 76` | `moov` |
| MPEG | `00 00 01 BA`（视频+音频）/ `00 00 01 B3`（仅视频） | — |
| Real Media(rm) | `2E 52 4D 46` | `.RMF` |
| Windows Media(asf) | `30 26 B2 75 8E 66 CF 11` | `0&²u.eoÏ.` |
| SWF | `46 57 53 08 AC 43 00 00` | `FWS.¬C..` |

#### 2.6 可执行 / 邮件 / 其他文件头

| 类型 | 文件头(hex) | ASCII |
|------|-------------|-------|
| PE(exe/dll) | `4D 5A` | `MZ` |
| ELF | `7F 45 4C 46` | `.ELF` |
| Java Class | `CA FE BA BE` | `Êþº¾` |
| Python Bytecode(pyc) | `03 F3 0D 0A` | `.ó..` |
| Email(eml) | `44 65 6C 69 76 65 72 79 2D 64 61 74 65 3A` | `Delivery-date:` |
| Outlook Express(dbx) | `CF AD 12 FE C5 FD 74 6F` | `Ï..þÅýto` |
| Outlook(pst) | `21 42 44 4E` | `!BDN` |
| Quicken(qdf) | `AC 9E BD 8F` | `¬ž½` |
| Windows Password(pwl) | `E3 82 85 96` | `ãâ…–` |
| VMDK | `4B 44 4D` | `KDM` |

---

### 三、编码与加密

#### 3.1 进制转换

可打印字符（含空格）的 ASCII 范围在 **32–126**，二进制下对应 `00100000 – 01111110`。拿到变换后的二进制串，可据此猜测变换方式。

常见进制对应 `flag`：

| 进制 | flag |
|------|------|
| 二进制 | `01100110 01101100 01100001 01100111` |
| 三进制 | `10210 11000 10121 10211` |
| 八进制 | `146 154 141 147` |
| 十进制 | `102 108 97 103` |
| 十六进制 | `66 6c 61 67` |

进制转换脚本（二/三/四/八进制等）：

```python
from Crypto.Util.number import long_to_bytes

# 二进制（注意按位反转等变换）
data = "1100001 000011 0111011 ...".split()
for item in data:
    print(chr(int(item[::-1], 2)), end='')  # 反转位后转字符

# 三进制
data = "10210 11000 10121 ...".split()
for item in data:
    print(chr(int(item, 3)), end='')

# 四进制 / 八进制：整体作为大整数处理
data = "1212123012011213132303..."
print(long_to_bytes(int(data, 4)))
print(long_to_bytes(int(data, 8)))
```

#### 3.2 Base 家族

Base xx 即用 xx 个字符对二进制数据编码。2 的 n 次方型（如 base64）按位分组；非 2 的 n 次方型则是将字符串整体/分块转大整数后除基取余再反转。

| 编码 | flag 示例 |
|------|-----------|
| base16 | `666C6167` |
| base32（A-Z2-7） | `MZWGCZY=` |
| base36 | `727432` |
| base58 | `3cr9Ae` |
| base64 | `Zmxh` |
| base85 | `Ao(mg` |
| base91 | `@iH<` |

**提示**：
- 纯小写字母 + 数字可能为 MD5；大小写错乱可能是 base64。
- base32 不区分大小写（域名只允许小写），解码前需转大写。
- 大量 `+/=` 结尾、末尾大量加号需改成等号，可能为 base64 及其变体。
- 很多层 base 编码 CyberChef 识别不出时，可用 [BaseCrack](https://github.com/mufeedvh/basecrack)：`python basecrack.py -m`。

##### 3.2.1 base64 换表

标准 base64 表为 `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`。若对表中字符顺序替换即为换表 base64，需将换表字符映射回标准表再解密。

```python
import base64

s = "jJuPnIyanISosKignJCTk6Cdnoyaycvegv=="
mapping = str.maketrans(
    "/+9876543210zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
)
translated = s.translate(mapping)
translated += '=' * ((4 - len(translated) % 4) % 4)
print(base64.b64decode(translated).decode('utf-8'))
```

##### 3.2.2 base64 隐写

长度非 3 的倍数的字符串在 base64 编码时末尾补 0，解码时补的 0 会被舍弃，因此可修改结尾字符隐藏信息（`=` 的数量决定隐藏位数）。

```python
import base64

b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
with open('stego.txt', 'rb') as f:
    bin_str = ''
    for line in f.readlines():
        stegb64 = str(line, "utf-8").strip("\n")
        rowb64 = str(base64.b64encode(base64.b64decode(stegb64)), "utf-8").strip("\n")
        offset = abs(b64chars.index(stegb64.replace('=', '')[-1])
                     - b64chars.index(rowb64.replace('=', '')[-1]))
        equalnum = stegb64.count('=')
        if equalnum:
            bin_str += bin(offset)[2:].zfill(equalnum * 2)
    print(''.join(chr(int(bin_str[i:i+8], 2)) for i in range(0, len(bin_str), 8)))
```

> 多行 base64 可能需手动补全 `=`，可用正则提取后补齐再解码。

#### 3.3 哈希

- **MD5**：密文均为十六进制字符，`admin` 的 32 位小写为 `21232f297a57a5a743894a0e4a801fc3`；16 位即取 32 位的 8–24 位。可到 somd5 / CMD5 反查。
- **常见 Hashcat 哈希类型**：`0`=MD5、`100`=SHA1、`1000`=NTLM、`1400`=SHA256、`1700`=SHA512、`1800`=sha512crypt、`3200`=bcrypt、`17200`=PKZIP、`17220`=PKZIP(多文件)、`11600`=7-zip、`13000`=RAR-5、`22000`=WPA2、`2500`=WPA/WPA2(hccapx)。

MD5 已知前缀爆破：

```python
import hashlib
from itertools import product

prefix = "flag{www_shiyanbar_com_is_very_good_"
target_hash = "38e4c352809e150186920aac37190cbc"
charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"

for guess in product(charset, repeat=4):
    test_str = prefix + ''.join(guess) + "}"
    if hashlib.md5(test_str.encode()).hexdigest() == target_hash:
        print(f"[+] {test_str}")
        break
```

#### 3.4 对称加密算法

##### 3.4.1 RC4

密钥任意长度。例：密文 `VWap58FvOtV1VNlmdcyKiaNVhPsWQRFYqt/duezhcddcVXmz5zhQyoc7`，密钥 `20250606` -> `flag{edb99a94-f84d-e175-8a7d-e7f658789447}`。

##### 3.4.2 DES

密钥 8 字节，存在四个弱密钥（题目未给密钥时可尝试）：

```
b'\x00\x00\x00\x00\x00\x00\x00\x00'
b'\x1E\x1E\x1E\x1E\x0F\x0F\x0F\x0F'
b"\xE1\xE1\xE1\xE1\xF0\xF0\xF0\xF0"
b"\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF"
```

可扩展为爆破脚本（对由弱密钥字节组合成的密钥空间穷举）：

```python
from Crypto.Cipher import DES
from itertools import product
from base64 import b64decode

BYTES = [b'\x1E', b'\xE1', b'\xF0', b'\x0F', b'\x00', b'\xFF']

def brute_force_decrypt(encrypted_data):
    for combo in product(BYTES, repeat=8):
        key = b''.join(combo)
        try:
            decrypted = DES.new(key, DES.MODE_ECB).decrypt(encrypted_data)
            if decrypted.startswith(b"FLAG"):
                print(f"Found key: {key}\n{decrypted}")
                return key
        except Exception:
            continue
    return None

encrypted_data = b64decode("ftNbIBh+yU8rzOhvbAplhB1hoQkblsKa+uGaNnTudD2LGw0+5fOHXycXZDujJFWwHZjIg5bfDpKFsqI18Ts7ZGG8dpqWAzar")
brute_force_decrypt(encrypted_data)
```

##### 3.4.3 AES

密钥长度 16/24/32 字节（128/192/256 位）。

- **AES-ECB**：不需要 IV；key 不足 16 字节可尾部 Padding `\x00`。
- **AES-CBC**：需要 IV；密钥不足 16 字节整数倍需 Padding 补齐。
- 在线解密：[lmeee](https://tool.lmeee.com/jiami/aes)、[sojson](https://www.sojson.com/encrypt_aes.html)、[the-x.cn](https://the-x.cn/cryptography/aes.aspx)。

openssl 加解密（3DES 示例，AES 同理）：

```bash
# 加密
tar -czvf - flag | openssl des3 -salt -k th1sisKey -out ./flag.tar.gz
# 解密
openssl des3 -d -salt -k th1sisKey -in ./flag.tar.gz -out decrypted_file
```

Python AES-CBC 加解密：

```python
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

def decrypt_aes_cbc(ciphertext_hex, key_hex, iv_hex):
    cipher = AES.new(bytes.fromhex(key_hex), AES.MODE_CBC, bytes.fromhex(iv_hex))
    return unpad(cipher.decrypt(bytes.fromhex(ciphertext_hex)), AES.block_size)
```

##### 3.4.4 国密 SM 系列

| 算法 | 类型 | 密钥类型 | 长度 | 字节 |
|------|------|----------|------|------|
| SM4 | 对称 | 密钥 | 128 bits | 16 字节（固定） |
| SM2 | 非对称 | 私钥 | 256 bits | 32 字节 |
| SM2 | 非对称 | 公钥（原始） | 512 bits | 64 字节（x,y 各 32） |
| SM2 | 非对称 | 公钥（编码后） | — | 65 或 33 字节（带 0x04 前缀为 65） |
| SM9 | 非对称 | 主/用户密钥 | 可变 | 可变 |

> SM4 解密 PHP 实现参见后文《应急响应》章节或 misc-security 原文。

##### 3.4.5 emoji-aes

密文由一大串 emoji 组成，解密需密钥。无密钥时可能是 **base100** 编码。

##### 3.4.6 Rabbit 加密

通常以 `U2FsdGVkX1` 开头，解 base64 得 `Salted`，是 js-crypt 库加密的特征。可用 PuzzleSolver 的 PBE 解密。

#### 3.5 古典密码

##### 3.5.1 摩斯电码

凡由三种字符构成、用空格或 `/` 分隔、字符可用 `0/1` 或 `./-` 表示的，都可能是摩斯。

```
..-. .-.. .- --.  - .... .. ...  ->  flag_this_...
```

##### 3.5.2 栅栏密码（Fence）

将明文按 N 个一组分组后取每列。分标准型和 W 型，可用随波逐流或在线工具。有时题目提示“栅栏”实际是要用栅栏加密而非解密。

##### 3.5.3 维吉尼亚密码（Vigenere）

- 给了密文+密钥：CyberChef / 在线解密。
- 给了密文无密钥：在线爆破。
- 给了密文+已知明文前几位：手搓密钥前几位。
- 给了密钥字典：脚本爆破。

```python
from pycipher import Vigenere

cipher = "rla xymijgpf ppsoto wq u nncwel ..."
with open("keys.txt") as f:
    for line in f:
        res = Vigenere(line.strip()).decipher(cipher)
        if "PASSWORD" in res:
            print(f"[+] key: {line.strip()}\n[+] {res.lower()}")
```

##### 3.5.4 希尔密码（Hill）

密钥可为网址或数字。解密：[metools.info](http://www.metools.info/code/hillcipher243.html)。

##### 3.5.5 仿射密码

密钥 `a` 须与 26 互质（1,3,5,7,9,11,15,17,19,21,23,25），`b` 为 0–25 任意整数。

##### 3.5.6 Gronsfeld 密码

```python
from pycipher import Gronsfeld
print(Gronsfeld([1,50,61,8,9,20,63,41]).decipher('TGLBOMSJNSRAJAZDEZXGHSJNZWHG'))
```

##### 3.5.7 单表替换密码（quipqiup）

看着不像任何编码也无规律的字符串，可能是单表替换。用 [quipqiup](https://quipqiup.com/) 爆破（原理基于字母频率）。

##### 3.5.8 云影密码

密文只由 `01248` 组成：以 0 分隔分组，每组数字相加得到 1–26 对应字母。

```python
ciphey = "8842101220480224404014224202480122"
res = []
for item in ciphey.split('0'):
    res.append(chr(sum(int(num) for num in item) + 64))
print(''.join(res))
```

##### 3.5.9 曼彻斯特 / 差分曼彻斯特编码

- 曼彻斯特：从高到低表示 1，从低到高表示 0。
- 差分曼彻斯特：时钟周期起始处有跳变表示 0，无跳变表示 1。

典型例题：CISCN 传感器系列（压力/温度传感器报文解码，涉及 ID、压力位、CRC 校验位）。

##### 3.5.10 其他古典密码

- **棋盘密码**：ADFGVX（默认棋盘 `ph0qg64mea1yl2nofdxkr3cvs5zw7bj9uti8`、密钥 `german`）、ADFGX（棋盘 `phqgmeaynofdxkrcvszwbutil`）、Polybius（波利比奥斯方阵，密钥随机、默认密文字符 ABCDE）。
- **埃特巴什码（Atbash）**：`flag{` -> `UOZT{`，用 CyberChef 或随波逐流。
- **培根密码**：密文只有两种字符（ab/AB/01），建议用随波逐流（CyberChef 有时有误）。
- **格雷码**：二进制转格雷码（第一位不变，后续逐位异或）。
- **博多码**：五位二进制一组。
- **Decabit**：十个字符一组（`+-` 组合），可用 `01` 替换。
- **DNA 编码**：`AATTCAACAACATGCTGC`，三碱基对应一字符。
- **金笛短信 PDU 编码**：逐行在线解码 [sendsms.cn](http://www.sendsms.cn/pdu/)。
- **中文电码**：四位数字一组。
- **恩尼格玛密码机**：[dcode.fr](https://www.dcode.fr/enigma-machine-cipher)。
- **当铺密码**：汉字笔画出头的数量转数字。
- **简/繁体汉字笔画编码**：按笔画数映射数字再转 ASCII。
- **日历密码 / 盲文 / 旗语**：按题目提示使用对应对照表。
- **PGP 词汇表**：英文单词 -> 十六进制字节。
- **VBS 加密**：`#@~^...^#~@` 格式在线解密为 vbs。
- **Tupper 自指公式**：0–9 长整数 -> 画图，[在线画图](https://tuppers-formula.ovh/)。
- **锟斤拷**：Unicode 替换字符 `EF BF BD` 在 GBK 下被解码为“锟斤拷”，可写脚本还原。
- **社会主义核心价值观密码 / 音乐符号加密**：音乐符号以 `=` 结尾。
- **Twitter Secret Messages**：密文含大量 Unicode 字符，[holloway.nz/steg](https://holloway.nz/steg/)。
- **垃圾邮件隐写（Spammimic）**：[spammimic.com](https://www.spammimic.com/)。
- **Quoted-Printable**：`=XX` 形式，`quopri` 模块或在线解码。
- **异形文字**：原神提瓦特文字、瓦坎达文字、羊文等，找不到对照表可映射后 quipqiup 爆破。

#### 3.6 编码 / 转义 / 混淆

- **Unicode**：`U+`、`\u`、`%u`、`&#`、`&#x` 等多种形式，[r12a 在线转换](https://r12a.github.io/app-conversion/)。
- **URL 编码**：大量 `%`，空格为 `%20`；`%3d%3d` 即 `==`，注意 base 编码。
- **中文 ASCII 码**：数字加 `&#` 和 `;` 后解密。
- **代码混淆**：
  - `jsfuck`：`{ } [ ] + !`
  - `Brainfuck`：`><+-.,[ ]`
  - `Ook!` / `short Ook!`：`Ook. Ook! Ook?` 或 `.!?`
  - `JJEncode` / `AAEncode`：颜文字
  - 在线：[splitbrain](https://www.splitbrain.org/services/ook)、[cachesleuth](https://www.cachesleuth.com/bfook.html)。
- **UUencode / XXencode**：形似 base85。
- **编程语言画图**：LOGO（[calormen.com/jslogo](https://www.calormen.com/jslogo/)）、CFRS（[susam.net/cfrs](https://susam.net/cfrs.html)）、npiet、velato（音乐）、rockstar（歌词）。

#### 3.7 键盘密码与布局

##### 3.7.1 电脑键盘坐标密码

```
  1 2 3 4 5 6 7 8 9 0
1 Q W E R T Y U I O P
2 A S D F G H J K L
3 Z X C V B N M
```
例：`11 21 31 18 27 33 34` -> `QAZIJCV`。

##### 3.7.2 QWE 加密 / 位移加密

- QWE 加密：按键盘行平移。
- 位移加密：`&&&* &&&!! %%%!! ...`，符号代表位置、重复次数代表向下移动格数。

##### 3.7.3 手机键盘密码

26 键：字母对应上档数字（`ooo yyy ii ...` -> `999 666 88 ...` -> 九键数字+次数）。九宫格键盘密码有数字坐标型（`82 73 42 ...`）与重复次数型（`888 77 2 ...`）两种。

##### 3.7.4 不同键盘布局

Qwerty / Qwertz / Azerty / **Dvorak** / **Colemak**，需用映射脚本互转：

```python
qwerty_lower = r"""qwertyuiop[]{}-=_+\asdfghjkl;'zxcvbnm,./"""
dvorak_lower = r"""',.pyfgcrl/=?+[]{}\|aoeuidhtns-;qjkxbmwvz"""
qwerty_upper = r"""QWERTYUIOP[]{}-=_+\ASDFGHJKL;'ZXCVBNM,./"""
dvorak_upper = r""""<>PYFGCRL/=?+[]{}\|AOEUIDHTNS_:QJKXBMWVZ"""

d2q = str.maketrans(dvorak_lower + dvorak_upper, qwerty_lower + qwerty_upper)
print("EAOJYU?TRX>{XPFABY{8{24+".translate(d2q))  # DASCTF{KOBE_BRYANT_8_24}
```

#### 3.8 隐写式编码（whitespace / SNOW / 零宽）

- **whitespace**：文件全是空白字符，[在线解码](https://vii5ard.github.io/whitespace/)。
- **SNOW**：`SNOW.EXE -C -p password flag.txt`；`-C` 参数会压缩/解压，可能解密乱码。下载 [darkside.com.au/snow](https://darkside.com.au/snow/)。
- **零宽字符隐写**：`\u200b\u200c\u200d` 等，[wetools](https://www.wetools.com/text-cloaking)、[mzy0](https://www.mzy0.com/ctftools/zerowidth1/)、[yuanfux](https://yuanfux.github.io/zero-width-web/)。
- **Cloakify**：`python2 decloakify.py cipher.txt passwd.txt`。
- **word 文档隐写（Text Steganography）**：利用不可见字符。

---

### 四、图片隐写

> 通用提示：各种隐写可先拉入 [Aperisolve](https://aperisolve.fr/) 一键梭哈；`zsteg`、`stegsolve`、`binwalk`、`foremost` 是图片题必备工具。

#### 4.1 通用思路（27+ 项）

1. **查看图片属性详细信息**（可能关键信息就在里面）。
2. **010 查看文件头尾**（是否篡改）。
3. **foremost / binwalk** 提取附加文件（一个提取不出，换另一个）。
4. **盲水印隐写**（单图或双图）：
   - 单图：隐形水印工具 V1.2 / WaterMark。
   - 双图：普通盲水印 [BlindWaterMark](https://github.com/chishaxie/BlindWaterMark)、频域盲水印 [blind-watermark](https://github.com/linyacool/blind-watermark)；已集成进 PuzzleSolver。
   - 普通盲水印特征：原图与加水印图异或后出现横向蓝色虚线。

   ```bash
   # 普通盲水印
   python bwmforpy3.py decode hui.png hui_wm_py3.png wm_out_py3.png
   python bwmforpy3.py decode day1.png day2.png flag.png --oldseed
   # 频域盲水印
   python decode.py --original ori.png --image res.png --result extract.png
   ```
   > 构成盲水印的两张图不一定是同格式（PNG/JPG/BMP 皆可）。

5. **图片分离与拼接**：
   ```bash
   convert glance.gif flag.png          # GIF 分解
   convert -flop reverse.jpg reversed.jpg  # 水平镜像
   convert -flip reverse.jpg reversed.jpg  # 垂直镜像
   montage flag*.png -tile x1 -geometry +0+0 flag.png  # 拼接
   ```
6. **Image Combiner**：两张图互补，用 Stegsolve 的 Analyze -> Image Combiner；或两张二维码逐像素异或。
7. **OurSecret 隐写**（可无密码）：特征为特定 40 字节标记。
8. **拼图题**：
   ```bash
   montage *.PNG -tile 12x12 -geometry +0+0 out.png   # 先合成
   ```
   再用 Puzzle-Merak 或 gaps 智能拼图：
   ```bash
   gaps --image=out.png --generation=30 --population=144 --size=30 --save
   ```
9. **提取等距像素点 / 近邻法缩放**：PS 缩小 1/10 选“邻近硬边缘”，或 `py main.py -f arcaea.png -p 0x0+3828x2148 -n 12x12`。
10. **PixelJihad**（可无密码）：[在线](https://sekao.net/pixeljihad/) 或 [项目](https://github.com/oakes/PixelJihad)。
11. **隐写文本藏在原图与隐写文件中间**：010 运行对应模板，看头尾额外内容。
12. **DeEgger Embedder 隐写**：`extract files`。
13. **flag 藏在 exif**：`exiftool 3.jpg`。
14. **两张图每行不同像素个数隐写**：用 `ImageChops.difference` 统计。
15. **两张图 Image Combiner 合成 BMP 后再 zsteg**。
16. **多通道 LSB**：Stegsolve 勾选背景色相同通道。
17. **小说藏进图片**：读取像素字节转文本（如 UTF-16）。
18. **Arnold 猫脸变换**：需 shuffle_times、a、b，可爆破。
19. **二进制数据转图片**：爆破宽高还原图像。
20. **脚本提取 LSB 数据分析**：`(data[:,:,0] & 1)`。
21. **像素 RGB 值转图片**：爆破宽高。
22. **图片套娃**：每个像素 RGB 值是另一张图片字节数据。
23. **Java BlindWatermark**：`java -jar BlindWatermark.jar decode -c password.png output.png`。
24. **在线网站一把梭**：[a.tools](https://www.a.tools/Tool.php?Id=100)。
25. **立体图（stereogram）**：Stegsolve 遍历偏移量，或 [stereogram-solver](https://piellardj.github.io/stereogram-solver/)。
26. **马赛克消除**：[Depixelization_poc](https://github.com/spipm/Depixelization_poc)。
27. **填满空间曲线**：皮亚诺曲线（3x3）、希尔伯特曲线（2x2）。
28. **DICOM 文件**（.dcm X 光图像）：MicroDicom 打开。
29. **backpaper**：点阵图，[Paperbak](http://www.ollydbg.de/Paperbak/)。

#### 4.2 zsteg 使用

基本用法：`zsteg [选项] 示例.png [参数]`。

| 选项 | 描述 |
|------|------|
| `-a, --all` | 尝试所有已知方法 |
| `-E, --extract NAME` | 提取指定载荷，如 `1b,rgb,lsb` |

| 参数 | 描述 |
|------|------|
| `-o, --order X` | 像素迭代顺序（xy/yx/XY/YX 等） |
| `-c, --channels X` | 通道（r/g/b/a 组合，如 r3g2b3） |
| `-b, --bits N` | 位数（`1,3,5` 或范围 `1-8`，或掩码 `0x88`） |
| `lsb` / `msb` | 最低/最高有效位优先 |
| `-P, --prime` | 只分析素数字节/像素 |
| `shift N` | 预填充 N 个零位 |
| `invert` | 反转位（XOR 0xff） |
| `pixel-align` | 像素对齐 |
| `-l, --limit N` | 限制检查字节数 |

```bash
zsteg -a 3.png
zsteg -e b1,r,lsb,xy 3.png > out.jpg
```

#### 4.3 PNG 专项

1. **宽高篡改**：17–20 字节为宽、21–24 字节为高；用 010 修改或 PuzzleSolver 爆破。
2. **LSB 隐写**：`zsteg` 快速查看；识别不出时用 Stegsolve 肉眼过一遍。有密钥时用 [cloacked-pixel](https://github.com/livz/cloacked-pixel)：
   ```bash
   python2 lsb.py extract 0.png out.data f78dcd383f1b574b
   ```
3. **IDAT 块隐写**：异常 IDAT 去头去尾后 zlib 解压：
   ```python
   import zlib, binascii
   IDAT = bytes.fromhex("789C...")   # zlib 头可能是 789C 或 785E
   data = binascii.hexlify(zlib.decompress(IDAT))
   print(bytes.fromhex(data.decode()))
   ```
   解压后补文件头尾、爆破宽高得到新图；可用 `pngcheck -v 0.png` 检查 IDAT。
4. **PNG 末尾隐藏内容**：010 定位文件尾看多余数据，或 binwalk/foremost。
5. **APNG 格式**：`exiftool` 识别；用 `apngdis_gui` 分帧；考帧内隐写、时间间隔转 ASCII、PLTE 调色板数据。
6. **CVE-2023-28303 截图工具漏洞**：图片有两个 IEND 块（`AE 42 60 82`）。
7. **stegpy 隐写**：`stegpy 1.png -p`（或 `pip3 install stegpy`）。
8. **npiet 编程语言**：白底彩色像素点，[在线](https://www.bertnase.de/npiet/npiet-execute.php) 或 `npiet.exe -tpic solved.png`。
9. **Image Steganography 隐写**：工具解密，可勾选 Decrypt。
10. **关键信息藏在被篡改的宽高 / IDAT 块长度 / PLTE 调色板数据中**。

#### 4.4 JPG 专项

1. **LSB 隐写**：Stegsolve 查看。
2. **stegdetect 判断加密**：`stegdetect.exe -t jopi -s 10.0 0.jpg`（三颗星不代表一定是）。
3. **JPHS 隐写**（可无密码）：Select File -> seek -> 保存。
4. **steghide 隐写**（可无密码）：
   ```bash
   steghide extract -sf filename -p passwd
   stegseek filename rockyou.txt   # 未知密码爆破
   ```
5. **SilentEye**：默认密钥 `silenteye`。
6. **outguess**：`outguess -k "abc" -r mmm.jpg flag.txt`。
7. **F5-steganography**：`java Extract beautiful.jpg -p passwd`（结果存 output.txt）。
8. **JPG 宽高隐写**：010 找 SOF 块调整宽高。
9. **jsteg**：专用工具一把梭。
10. **关键信息混在 jpg 十六进制数据中**：010 搜索 flag，或人工提取文件尾前的数据。

#### 4.5 BMP 专项

> BMP 通道顺序是 **BGR**。

1. **bmp 宽高爆破**：删文件头存 `.data` 用 GIMP 改宽高，或脚本爆破。
2. **wbStego4open**（可无密钥）。
3. **SilentEye**。
4. **steghide / stegseek**。

#### 4.6 GIF 专项

用 `identify flag.gif` 可查看每帧实际尺寸、画布尺寸、XY 偏移量、色深等参数。

1. **分帧**：
   ```bash
   convert flag.gif flag.png
   ffmpeg -i filename.gif frame%04d.png
   ```
2. **帧间隔隐写**：`identify -format "%s %T \n" flag.gif`（时间单位 1/100 秒）。
3. **每帧 XY 偏移量隐写**：`identify flag.gif` 提取偏移量分析。
4. **每帧实际尺寸隐写**。

#### 4.7 WebP / BPG / RAW

- **WebP**：可能是动图，用 PIL 分帧；转 PNG 后解 stegpy。
- **BPG**：`bpgdec.exe flag.bpg` 转 PNG。
- **RAW/ARW**：Sony 相机原始格式；用 `rawpy` 读像素看 LSB；或改 `.data` 用 GIMP 调整。

#### 4.8 二维码

- bmp 转二维码、16 进制转 pyc、字符串制作二维码（长度需为平方数）。
- 四个 TTL 值转换一个字节二进制。
- **其他类型二维码**：Aztec Code、DataMatrix、GridMatrix、MaxiCode、DotCode、汉信码（定位块方向可能反）、PDF417（可能反相，需 Stegsolve/PS 反相后再扫）。
- **QRCode 标准考点**：参考官方标准 [ISO-IEC-18004](https://github.com/goodlunatic/ISO-IEC-18004-Standard)，及 [note.tonycrane.cc](https://note.tonycrane.cc/ctf/misc/qrcode/)、[手搓二维码](https://cabelis.ink/2023/01/16/crash-qrcode-by-hand/)。

#### 4.9 信号与图像变换

- 快速傅里叶变换（FFT）、离散傅里叶变换（DFT）、离散余弦变换（DCT）、离散小波变换（DWT）。

#### 4.10 关键脚本示例

二进制转二维码：

```python
from PIL import Image

def generate_qrcode_from_binary(binary_str, img_size):
    assert len(binary_str) == img_size[0] * img_size[1], "Size mismatch!"
    pic = Image.new("RGB", img_size, color="white")
    index = 0
    for y in range(img_size[1]):
        for x in range(img_size[0]):
            if binary_str[index] == '1':
                pic.putpixel([x, y], (0, 0, 0))
            index += 1
    return pic
```

Arnold 猫脸变换解码：

```python
import cv2, numpy as np

def arnold_decode(image, shuffle_times, a, b):
    decode_image = np.zeros(shape=image.shape)
    h, w = image.shape[0], image.shape[1]
    N = h
    for _ in range(shuffle_times):
        for ori_x in range(h):
            for ori_y in range(w):
                new_x = ((a*b+1)*ori_x + (-b)*ori_y) % N
                new_y = ((-a)*ori_x + ori_y) % N
                decode_image[new_x, new_y, :] = image[ori_x, ori_y, :]
        image = np.copy(decode_image)
    return image
```

---

### 五、音频与视频隐写

#### 5.1 音频通用思路

1. **波形图分析**：摩斯电码。
2. **频谱图分析**（Audacity/Au，有时需调高最高频率）。
3. **SSTV 慢扫描电视**：
   ```bash
   # python 方式
   sudo python3 setup.py install
   sstv -d flag.wav   # 生成 result.png
   ```
   Windows 用 RX-SSTV（需虚拟声卡 Virtual Audio Cable）；Kali 用 qsstv（有时需反向/反相）。
4. **电话音分析（DTMF）**：在线 [dialabc.com](http://www.dialabc.com/sound/detect/) 或 `dtmf2num`；音频增幅到能看到两条白线。
5. **lyra 编码压缩**：[google/lyra](https://github.com/google/lyra) 解码。
6. **字母解释法（国际无线电通话拼写字母）**：如 Alpha/Bravo/Charlie。
7. **拨号音解密**：`dtmf2num 路径.wav`。
8. **grc 文件 FM 解调**（demodulate.py）。
9. **音频倒放**。

#### 5.2 MP3 专项

1. **MP3stego 隐写**（可无密码）：
   ```bash
   decode -X -P pass sound.mp3   # -X 提取隐写文件
   ```
   无密码时可能用歌曲名做密钥。
2. **MP3 数据块字段隐写**（copyright / private 字段）：
   ```python
   import libnum
   st, ed = 0x0F05A4, 0xC125A3
   res = ''
   files = open('1.mp3', 'rb')
   i = st
   while i < ed:
       files.seek(i, 0)
       target_data = files.read(1)[0]
       padding_bit = (target_data >> 1) & 1
       steg_bit = (target_data >> 3) & 1   # copyright 字段
       res += str(steg_bit)
       i += 1045 if padding_bit else 1044
   print(libnum.b2s(res.ljust((len(res)+7)//8*8, '0')).decode())
   ```

#### 5.3 WAV 专项

1. **SilentEye**（默认密码 silenteye）。
2. **Deepsound 隐写**（可无密码）：拉入 deepsound；密钥未知用 `deepsound2john` 生成 hash 再 `john hash.txt`。
3. **业余无线电数据（AFSK1200）**：
   ```bash
   sox -t wav latlong.wav -esigned-integer -b16 -r 22050 -t raw latlong.raw
   multimon-ng -t raw -a AFSK1200 latlong.raw
   ```
4. **steghide / stegseek**。
5. **OpenPuff**（有密码）。
6. **stegpy**：`stegpy 1.wav -p`。
7. **DeEgger Embedder**。
8. **写脚本提取音频数据分析**：
   - 常用模块：`wave`、`wavio`、`scipy.io.wavfile`、`soundfile`、`librosa`。
   - 提取 WAV LSB 隐写数据、左右声道差值、音频数据转图片、频率映射字符、FFT 分析。

WAV 基础参数查看：

```python
import wave

with wave.open('audio.wav', 'rb') as wf:
    print("通道数:", wf.getnchannels())
    print("采样字节:", wf.getsampwidth())
    print("采样率:", wf.getframerate())
    print("总帧数:", wf.getnframes())
```

#### 5.4 MIDI 专项

1. **Audacity 打开看字符**。
2. **velato 编程语言**：[velato.net](https://velato.net/)。
3. **从流量中提取 MIDI 文件**（结合时间戳；MIDI 三字节：事件 + 音符 + 力度）。
4. **LSB 隐写**（note_on 的 velocity 最低位）：

```python
import mido

def extract_lsb_from_midi(midi_path):
    mid = mido.MidiFile(midi_path)
    bits = []
    for track in mid.tracks:
        for msg in track:
            if msg.type == 'note_on':
                bits.append(str(msg.velocity & 1))
    binary_str = ''.join(bits)
    return bytes(int(binary_str[i:i+8], 2) for i in range(0, len(binary_str), 8))
```

#### 5.5 OGG 专项

`binwalk` 可能发现 OGG 后隐藏其他数据（如 ISO 镜像）。

#### 5.6 视频专项

1. **视频中音频隐写**：
   ```bash
   ffmpeg -i lion.mp4
   ffmpeg -i lion.mp4 -map 0:2 -q:a 0 output.wav   # 分离音频看频谱
   ```
2. **每帧图片 LSB 隐写**：用 `cv2` 循环读帧处理。
3. **循环读取指定列/像素**（视频帧抽样重建图像）。
4. **DeEgger Embedder 隐写**。

---

### 六、文档隐写

#### 6.1 PDF 题思路

1. binwalk/foremost 或 010 手动提取隐藏文件。
2. **wbStego4open** 隐写。
3. **PDF 携带附件**：Firefox/PDF 软件提取。
4. **透明/白色文字**：全选复制粘贴到记事本。
5. **DeEgger Embedder** extract files。
6. **多图层 PDF**：PS 打开查看隐藏图层。
7. **增量式 PDF**：foremost 原 PDF 得到新 PDF。
8. **弱密码加密 PDF**：Forensic PasswareKit 或 `pdfcrack -f enc.pdf -w rockyou.txt`。
9. **PDF 交叉引用隐写数据**：利用交叉引用偏移量差值隐写二进制。

#### 6.2 MS-Office 题思路

##### 新版 Office 2007+（docx/pptx/xlsx）

- 未知具体类型且加密：改后缀为 docx/pptx 用 PasswareKit 爆破，再 `msoffcrypto-tool` 解密：
  ```bash
  pip install msoffcrypto-tool
  msoffcrypto-tool encrypted.docx decrypted.docx -p Passw0rd
  ```
- **通用**：透明/白色文字全选复制或清除样式；改后缀为 `.zip` 解压查看。
- **docx**：WPS/Word 显示隐藏文字；`oletools` 提取宏（`olevba attachment.doc > test.txt`）；行距隐写（1 倍=`.`，1.5 倍=`-`）；emf/oleobject 提取；自定义字体隐写（otf/odttf）。
- **pptx**：关键信息藏在评论/批注中。
- **xlsx**：隐藏行列取消隐藏；条件格式高亮（黑白后可能出二维码）；先按行列排序。

##### 旧版 Office 97-2003（OLE 复合文档）

- **宏破解**：`office2john 示例.docm > word.hash`，再 `john --mask='?a' word.hash`。
- 宏密码保护绕过：010 搜索 `DPB` 改 `DPX`（不增减字符），保存重开，Alt+F11 设置密码后查看。
- **OLEHeader 修复**：文件头 `D0 CF 11 E0 A1 B1 1A E1`，修复扇区/目录结构可参考前文表格。

#### 6.3 TXT 题思路

1. wbStego4open。
2. 文件夹/目录套娃（用 Everything 一把梭）。
3. whitespace 隐写。
4. SNOW 隐写。
5. 零宽字符隐写。
6. 垃圾邮件隐写（spammimic）。
7. Cloakify 隐写。

#### 6.4 HTML 题思路

- wbStego4open 隐写。

---

### 七、压缩包分析

> 压缩包密码可以是可打印字符，也可以是不可打印字符。无思路时可先纯数字/字母暴力爆破。

#### 7.1 压缩包结构

##### ZIP 结构

三部分：**压缩文件源数据区**（`504B0304`）+ **压缩源文件目录区**（`504B0102`）+ **压缩源文件目录结束标志**（`504B0506`）。

关键字段：
- `frFlags`（数据区）/ `deFlags`（目录区）：最低 1 bit 为 1 表示加密，0 表示未加密。
- `frCrc`：压缩前 CRC32。
- `frCompressedSize` / `frUncompressedSize`：压缩后/前大小。

官方规范：[APPNOTE.TXT](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT)。

常见报错对应（借助 010 模板）：
- 文件已损坏 -> 源数据区/目录区文件名长度被修改。
- CRC 校验错误 -> 压缩方法被修改。

##### RAR 结构

文件头 `52 61 72 21 1A 07 00`（`Rar!`）。Main block / File Header / Terminator 均有 CRC、块大小、块类型、阻止标志等字段。

##### 7-Zip 结构

参考 [7zFormat.txt](https://raw.githubusercontent.com/ip7z/7zip/main/DOC/7zFormat.txt)。

#### 7.2 伪加密

- **ZIP**：Bandizip 看数据区 `frFlags`、7zip 看目录区 `deFlags`（都需修改才能防非预期）。去除伪加密：010 将数据区第 8 字节、目录区第 10 字节改为 `00`。
- **RAR**：第一种把第 24 字节尾数改 0；第二种把第 11 字节改为 `\x00`。

#### 7.3 CRC32 爆破

适用于压缩包内文件很小（几字节）。工具：[CRC32-Tools](https://github.com/AabyssZG/CRC32-Tools)、[crc32](https://github.com/theonlypwner/crc32)。

```bash
python3 crc32.py reverse 0x7c2df918
```

```python
import itertools, string, binascii

dic = string.ascii_letters + string.digits + '+/='
crc = 0x7615DE6A

for secret_number in itertools.product(dic, repeat=4):
    s = ''.join(secret_number).encode('utf-8')
    if binascii.crc32(s) & 0xffffffff == crc:
        print(s)
        break
```

#### 7.4 暴力破解密码

工具效率：ARCHPR < Passware Kit Forensic < Hashcat。爆破类型：限制字符集、掩码、字典（推荐 rockyou.txt，Kali 在 `/usr/share/wordlists`）。

Hashcat 爆破步骤：
1. 生成 hash：`zip2john layer3.zip`（或在线 [hashes.com](https://hashes.com/en/johntheripper)）。
2. 查 hash 类型：[example_hashes](https://hashcat.net/wiki/doku.php?id=example_hashes)。
3. 爆破：

```bash
hashcat -a 3 -m 17200 hash1.txt --increment --increment-min 1 --increment-max 8 ?d?d?d?d?d?d?d?d --force
hashcat -a 0 -m 17200 hash3.txt rockyou.txt --force
hashcat -a 3 -m 11600 -1 ?d hash4.txt Y3p_Ke9_1s_?1?1?1?1?1 --force
```

#### 7.5 压缩包套娃解套

```python
import zipfile, rarfile, py7zr, os

def decompress(archive_file):
    if "7z" in archive_file:
        with py7zr.SevenZipFile(archive_file, 'r') as a:
            a.extractall("tmp/")
    elif "rar" in archive_file:
        with rarfile.RarFile(archive_file) as a:
            a.extractall("tmp/")
    elif "zip" in archive_file:
        with zipfile.ZipFile(archive_file, 'r') as a:
            a.extractall("tmp/")
    os.remove(archive_file)
    os.system("mv tmp/* .")
    os.rmdir("tmp")
```

> ZIP 套娃建议用 `pyzipper` 模块（支持不可见字符密码）。

#### 7.6 分卷压缩包合并

```bash
copy /B topic.zip.001 + topic.zip.002 + topic.zip.003 topic.zip
```

#### 7.7 压缩包炸弹

很小的压缩文件解压出巨大空间。010 编辑看是否藏有另一个压缩包。

#### 7.8 不可见字符密码

- 短密码：直接爆破。
- 长密码：先 base64 编码再解码为 bytes 作为密码：

```python
import base64, pyzipper
pwd = base64.b64decode(b'aEXigItjVOKAjEbigI8=')
with pyzipper.AESZipFile('1.zip', 'r') as f:
    f.pwd = pwd
    f.extractall('./solved')
```

#### 7.9 明文攻击（bkcrack）

**条件**：至少已知明文 12 字节及偏移（其中至少 8 字节连续）；加密算法 ZipCrypto；部分明文需 Store 压缩，完整明文可 Deflate。

bkcrack 常用参数：

| 参数 | 说明 |
|------|------|
| `-C` | 加密 ZIP |
| `-c` | 目标加密文件 |
| `-P` | 明文 ZIP |
| `-p` | 明文文件 |
| `-x offset hex` | 指定偏移的十六进制明文 |
| `-o offset` | 明文相对偏移 |
| `-k` | 三段内部密钥 |
| `-U out.zip pwd` | 修改密码导出 |
| `-d out` | 解密输出 |
| `-r len ?a` | 恢复密码 |

```bash
# 基本明文攻击
bkcrack -C flag.zip -c hint.jpg -p hint.jpg -P hint.zip
# 得到密钥后改密码
bkcrack -C flag.zip -k afb9fee3 f8795353 f6de1d4e -U out.zip 123
# 反向爆破密码
bkcrack -k e48d3828 5b7223cc 71851fb0 -r 3 ?b
```

利用不同格式明文（部分明文攻击）：
- **PNG 头**：`echo 89504E470D0A1A0A0000000D49484452 | xxd -r -ps > png_header`，`-o 0`。
- **ZIP 内层**：文件名 `flag.txt` 偏移 30 + ZIP 头 `504B0304`。
- **EXE**：固定片段偏移 64。
- **pcapng**：固定头偏移 6。
- **XML/SVG/VMDK**：文件固定头。

> 明文攻击失败可多换压缩软件（Bandizip/WinRAR/7zip/360 等）；Windows 下 `echo` 默认 UTF-16LE 需注意编码。

#### 7.10 补 Zlib 头解压

无加密且 Deflate 压缩时，把 frData 提取出来前面加 `78 9C`，再 Zlib Inflate 解压。

#### 7.11 时间戳隐写

加密压缩包用脚本提取文件时间戳转 ASCII；未加密则解压后读目录文件修改时间。

#### 7.12 RAR NTFS 数据流隐写

010 查看 RAR，用新版 7zip 或 `NtfsStreamsEditor` 提取。

#### 7.13 通过 pkzip 哈希恢复 zip 原始内容

已知三段密钥时，还原 ZipCrypto 解密算法即可恢复内容（本质是 zipcrypto 原理）。

---

### 八、流量分析

> 流量分析是 MISC 取证类的重要分支，核心工具为 Wireshark。协议过滤、USB 键盘还原、无线 WPA 爆破、DNS/ICMP 隧道、哥斯拉 WebShell 流量特征、蓝牙 OBEX 等完整内容已单独成文，请参阅：
>
> **[《CTF流量分析经验总结——Wireshark实战指南》](./my-blog/posts/ctf-traffic-analysis-wireshark-guide.md)**

核心速览：

- 分组字节流直接搜 `flag`、`flag{`、`f`、`fl` 等，注意编码与干扰字符。
- 隐藏压缩包搜 `504B0304`（PK 头），优先用 `File → Export Objects` 导出。
- 常见隐蔽通道：DNS 隧道、ICMP 隧道、TCP/UDP 载荷、HTTP 头、时间通道。
- 常见考点：HTTP 参数提取、HTTPS/TLS 解密、USB 键盘还原、无线 WPA 握手爆破、哥斯拉 WebShell 流量特征、蓝牙 OBEX。

---

### 九、工控安全

> 工控安全（ICS/SCADA Security）已单独成文，涵盖 Modbus RTU/ASCII/TCP 帧结构与功能码、S7comm 协议、DNP3/IEC 104/OPC UA 等工控协议、固件提取与 ARM QEMU 模拟、工控常见漏洞与工具速查等完整内容，请参阅：
>
> **[《CTF工控安全经验总结——从协议分析到固件逆向》](./my-blog/posts/ctf-ics-security-guide.md)**

核心速览：

- **Modbus**：RTU/ASCII/TCP 三种帧格式；功能码 1/2/3/4 读、5/6/15/16 写；Wireshark 过滤 `mbtcp` / `modbus`。
- **S7comm**：基于 COTP（端口 102），Job / Ack_Data / Ack / Userdata 四种类型；用 `tshark -T fields -e s7comm.resp.data` 提取。
- **固件分析**：`binwalk` 提取、`firmware-mod-kit` 解包、ARM 平台 QEMU 模拟（tunctl + qemu-system-arm）。
- **常见漏洞**：TP-Link SR20 TDDP 命令注入、弱口令、明文凭据、未授权访问等。

---

### 十、数字取证与内存取证

> 取证分析已单独成文，涵盖内存取证（Volatility 2/3）、磁盘取证、文件雕刻与恢复、注册表分析、时间线分析与日志分析等完整内容，请参阅：
>
> **[《CTF取证分析经验总结——从内存到磁盘的全面实战》](./my-blog/posts/ctf-forensics-guide.md)**

核心速览：

- **内存取证**：Volatility 3（`vol -f memory.raw windows.pslist.PsList`），支持进程/网络/注册表/哈希提取与 YARA 扫描。
- **磁盘取证**：镜像获取（dd/dc3dd/FTK Imager）、Autopsy 分析、NTFS/EXT4 文件系统。
- **文件恢复**：foremost/scalpel 雕刻、testdisk/photorec 恢复、交替数据流（ADS）。
- **注册表/日志**：启动项、服务、计划任务、Windows 事件日志（4624/4625/4688 等）、Linux 日志。

---

### 十一、应急响应与恶意文件分析

> 应急响应全生命周期（准备、识别、遏制、取证、根除、恢复、总结）已单独成文，涵盖 Windows/Linux 取证、攻击溯源、恶意软件分析、证据保全与快速检查清单等完整内容，请参阅：
>
> **[《应急响应经验总结——全生命周期实战指南》](./my-blog/posts/emergency-response-guide.md)**

核心速览：

- **流程框架**：PICERL 模型 / NIST SP 800-61。
- **Windows 取证**：事件日志（4624/4625/4688/4720 等）、注册表、进程/服务/计划任务。
- **Linux 取证**：auth.log/syslog、账户、SUID、cron、Rootkit 检测（chkrootkit/rkhunter）。
- **恶意文件分析**：在线检测（VirusTotal）、威胁情报、勒索解密、云沙箱、静态/动态分析。

---

### 十二、其他方向

#### 12.1 侧信道攻击

**核心原理**：程序运行时，不同复杂度所消耗的时间和能量不同。侧信道攻击利用设备执行加密时泄露的物理信息（功耗、时间、电磁辐射、声波）推断密钥。

| 攻击类型 | 缩写 | 说明 |
|----------|------|------|
| 简单能量分析 | SPA | 观察单次功耗曲线推断内部状态 |
| 差分能量分析 | DPA | 多次功耗曲线 + 统计推断，抗噪更强 |
| 相关能量分析 | CPA | DPA 变种，计算实测与假设功耗模型相关性 |
| 模板攻击 | TA | 事先构建功耗模板，最强侧信道攻击之一 |

#### 12.2 pyjail 沙箱逃逸

> 沙箱逃逸已单独成文，涵盖 Python pyjail（属性链 payload、关键字/函数过滤绕过、Unicode NFKC 碰撞）、Node.js vm 沙箱、vm2 沙箱逃逸与原型链污染等完整内容，请参阅：
>
> **[《CTF沙箱逃逸经验总结——从Python pyjail到Node.js VM2》](./my-blog/posts/ctf-sandbox-escape-guide.md)**

核心速览：

- Python 属性链：`().__class__.__mro__[-1].__subclasses__()[-4].__init__.__globals__['system']('cat flag')`。
- `read /app/where_is_flag.txt` 直接输入文件路径绕过；关注 Unicode NFKC 碰撞绕过关键字过滤。
- Node.js vm：`this.toString.constructor("return process")()`；`Object.create(null)` 防护与 `arguments.callee.caller`、Proxy 绕过。

#### 12.3 OSINT 社工题思路

1. 谷歌/必应/yandex 识图。
2. 百度地图查看实景。
3. 图片哈希找原图。
4. Git 提交哈希去 GitHub 找内容。

#### 12.4 数据安全 / 其他

- **区块链安全**：Solidity 合约结构、Remix/MetaMask/Chainflag 交互，以及重入、整数溢出、访问控制、tx.origin、delegatecall、selfdestruct 强制转账、默认可见性、伪随机数等智能合约常见漏洞，已单独成文，请参阅：
  > **[《CTF区块链安全经验总结——Solidity基础与智能合约漏洞》](./my-blog/posts/ctf-blockchain-security-guide.md)**
- **AI 安全**：对抗样本（FGSM/PGD）、模型提取与逆向、数据投毒、LLM 提示注入、AI 隐写、模型权重分析、验证码攻击等，已单独成文，请参阅：
  > **[《CTF AI安全经验总结——从对抗样本到提示注入》](./my-blog/posts/ctf-ai-security-guide.md)**
- 杂项：rockstar 编程语言、exe 安装包协议藏 flag、gpx 文件（[gpsvisualizer](https://www.gpsvisualizer.com/map_input)）、pyc 隐写（[stegosaurus](https://github.com/AngelKitty/stegosaurus)）、kdbx 文件（keepass 打开，PasswareKit/john 爆破）。

#### 12.5 字节序（大端/小端）

- **大端序（Big-Endian）**：高位字节存低地址，符合人类阅读习惯。
- **小端序（Little-Endian）**：低位字节存低地址，符合 CPU 读取方式。
- 网络传输/文件存储常用大端；CPU 内部常用小端。

Python `struct` 处理：

```python
import struct
data = b'\x01\x00\x00\x00'
val = struct.unpack('<I', data)[0]   # 小端整数
val = struct.unpack('>I', data)[0]   # 大端整数
```

#### 12.6 Linux tar 命令

```bash
tar -cvf target.tar filename.txt      # 打包
tar -czvf out.tar.gz ./*              # 打包压缩
tar -xvf target.tar                   # 解压
tar -xzvf file.tar.gz -C path         # 解压到指定目录
```

#### 12.7 Hashcat 使用速查

| 参数 | 说明 |
|------|------|
| `-a` | 攻击模式（0=字典，1=组合，3=掩码，6=字典+掩码，7=掩码+字典） |
| `-m` | 哈希类型 |
| `-o` | 输出结果文件 |
| `--force` | 忽略警告 |
| `--show` | 显示已破解 |
| `-1` | 自定义字符集 |
| `-i` / `--increment-min` / `--increment-max` | 增量模式 |

掩码：`?l` 小写、`?u` 大写、`?d` 数字、`?s` 特殊、`?a` 全部、`?b` 字节。

常用哈希类型：`0`=MD5、`100`=SHA1、`1000`=NTLM、`3000`=LM、`1400`=SHA256、`1700`=SHA512、`1800`=sha512crypt、`17200`=PKZIP、`17220`=PKZIP(多文件)、`11600`=7-zip、`13000`=RAR-5、`22000`=WPA2、`2500`=WPA(hccapx)、`9600`=Office、`13600`=WinZip。

john 生成哈希结合 hashcat：

```bash
zip2john 1.zip > hash.txt        # ZIP
rar2john 1.rar > hash.txt        # RAR
office2john 1.docx > hash.txt    # Office
deepsound2john 1.wav > hash.txt  # DeepSound
```

---

### 十三、工具速查表

| 类别 | 工具 | 用途 |
|------|------|------|
| 文件识别 | `file`、`magika`、`binwalk`、`foremost`、010 Editor | 判断/提取/修复文件 |
| 编码加密 | CyberChef、随波逐流、BaseCrack、PuzzleSolver、CaptfEncoder | 各类编码/古典密码 |
| 图片隐写 | Stegsolve、zsteg、ImageMagick、gaps、Puzzle-Merak、Depix | LSB/通道/拼图 |
| 水印 | BlindWaterMark、blind-watermark、Java BlindWatermark | 盲水印 |
| 音频 | Audacity/Au、SSTV、dtmf2num、multimon-ng、deepsound、mp3stego | 音频分析 |
| 文档 | oletools、msoffcrypto-tool、pdfcrack、wbStego4open | 文档分析/爆破 |
| 压缩包 | bkcrack、hashcat、john、ARCHPR、Passware Kit、CRC32-Tools | 破解/明文攻击 |
| 流量 | Wireshark、tshark、hcxpcapngtool、airdecap-ng | 流量分析 |
| 取证 | Volatility3、exiftool、grep/strings | 内存/文件取证 |
| 应急响应 | 云沙箱、威胁情报平台、杀毒、Rootkit 检测 | 恶意文件分析 |

---

### 十四、参考链接汇总

#### 14.1 本系列内部文章

- [《CTF AI安全经验总结——从对抗样本到提示注入》](./my-blog/posts/ctf-ai-security-guide.md)
- [《CTF取证分析经验总结——从内存到磁盘的全面实战》](./my-blog/posts/ctf-forensics-guide.md)
- [《CTF流量分析经验总结——Wireshark实战指南》](./my-blog/posts/ctf-traffic-analysis-wireshark-guide.md)
- [《CTF工控安全经验总结——从协议分析到固件逆向》](./my-blog/posts/ctf-ics-security-guide.md)
- [《CTF沙箱逃逸经验总结——从Python pyjail到Node.js VM2》](./my-blog/posts/ctf-sandbox-escape-guide.md)
- [《CTF区块链安全经验总结——Solidity基础与智能合约漏洞》](./my-blog/posts/ctf-blockchain-security-guide.md)
- [《应急响应经验总结——全生命周期实战指南》](./my-blog/posts/emergency-response-guide.md)

#### 14.2 外部参考

- [Lunatic《[持续更新] CTF-Misc Guide》](https://goodlunatic.github.io/posts/1ad9200/)（主要来源）
- [Aperisolve 在线隐写一键梭哈](https://aperisolve.fr/)
- [BaseCrack](https://github.com/mufeedvh/basecrack)
- [quipqiup 单表替换爆破](https://quipqiup.com/)
- [CyberChef](https://gchq.github.io/CyberChef/)
- [r12a Unicode 转换](https://r12a.github.io/app-conversion/)
- [whitespace 在线解码](https://vii5ard.github.io/whitespace/)
- [零宽字符隐写（wetools）](https://www.wetools.com/text-cloaking)
- [BlindWaterMark](https://github.com/chishaxie/BlindWaterMark) / [blind-watermark](https://github.com/linyacool/blind-watermark)
- [cloacked-pixel](https://github.com/livz/cloacked-pixel) / [Python3 版](https://github.com/Grazee/cloacked-pixel-python3)
- [stegosaurus（pyc 隐写）](https://github.com/AngelKitty/stegosaurus)
- [bkcrack](https://github.com/kimci86/bkcrack)
- [CRC32-Tools](https://github.com/AabyssZG/CRC32-Tools)
- [Hashcat 示例哈希](https://hashcat.net/wiki/doku.php?id=example_hashes)
- [ISO/IEC-18004 QR 标准](https://github.com/goodlunatic/ISO-IEC-18004-Standard)
- [Volatility3](https://github.com/volatilityfoundation/volatility3)
- [SSTV 解码](https://sstv-decoder.mathieurenaud.fr/)
- [Tupper 自指公式画图](https://tuppers-formula.ovh/)
- [DNA 编码在线](https://earthsciweb.org/js/bio/dna-writer/)
- [PDU 编码解码](http://www.sendsms.cn/pdu/)
- [ZIP 官方规范 APPNOTE.TXT](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT)



