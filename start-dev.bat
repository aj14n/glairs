@echo off
chcp 65001 >nul

echo 正在启动AI景观设计师...

cd /d "%~dp0"

:: 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo 首次运行，正在配置国内镜像源...
    call npm config set registry https://registry.npmmirror.com
    
    echo 正在安装依赖（这可能需要几分钟）...
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败，请检查网络连接或手动运行 npm install
        pause
        exit /b 1
    )
    echo 依赖安装完成！
)

:: 启动应用
echo 正在启动应用...
start cmd /k "npm run dev"
timeout /t 5 >nul

:: 等待服务启动后打开浏览器
echo 正在打开浏览器...
start http://localhost:3000