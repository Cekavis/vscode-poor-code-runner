# Poor Code Runner

A VSCode extension to compile and test C++ programs in competitive programming.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/08cdc26a8cbf4c9f95642440c57d310f)](https://www.codacy.com/manual/Cekavis/vscode-poor-code-runner?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Cekavis/vscode-poor-code-runner&amp;utm_campaign=Badge_Grade)

## Features

-   编译 C++ 文件
-   在独立终端运行编译后的可执行文件
-   获取一些 OJ 的样例并批量测试
-   测试程序运行时间

## Usage

### 命令

1.  编译
    -   命令：`Poor: Compile`
    -   默认快捷键：`F9`
2.  运行
    -   命令：`Poor: Run`
    -   默认快捷键：`F10`
3.  编译并运行
    -   命令：`Poor: Compile and Run`
    -   默认快捷键：`F11`
4.  测试运行时间（无法从键盘输入）
    -   命令：`Poor: Test Running Time`
    -   默认快捷键：`Ctrl+F9`
5.  测试样例
    -   命令：`Poor: Test All Samples`
    -   默认快捷键：`Ctrl+F10`
6.  停止测试运行时间（仅针对 Windows）
    -   命令：`Poor: Kill Running Time Test`
    -   默认快捷键：`Ctrl+F11`
7.  设置题目网址
    -   命令：`Poor: Set Custom Problem URL`
    -   左键单击 VSCode 状态栏（底部）左部的按钮

### 配置

1.  编译选项
    -   变量：`poor-code-runner.compilerFlags`
    -   Windows 默认在末尾加入 `-Wl,--stack=998244353`

### 支持环境

1.  我的 Windows 10
2.  我的 Ubuntu 20.04

### 支持 OJ

1.  Codeforces
2.  AtCoder
3.  LibreOJ（部分）

## Change Log

在[这里](CHANGELOG.md)
