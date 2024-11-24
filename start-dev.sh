#!/bin/bash

# 设置终端输出为 UTF-8
export LANG=en_US.UTF-8

echo "正在启动GLAIRS..."

# 获取脚本所在目录并切换到该目录
cd "$(dirname "$0")"

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "首次运行，正在配置国内镜像源..."
    npm config set registry https://registry.npmmirror.com
    
    echo "正在安装依赖（这可能需要几分钟）..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "依赖安装失败，请检查网络连接或手动运行 npm install"
        read -p "按回车键退出..."
        exit 1
    fi
    echo "依赖安装完成！"
fi

# 启动应用
echo "正在启动应用..."
npm run dev &

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 打开浏览器
echo "正在打开浏览器..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:3000"
else
    xdg-open "http://localhost:3000"
fi 