@echo off
chcp 65001 >nul

echo 正在启动GLAIRS...

:: 切换到脚本所在目录
cd /d "%~dp0"
echo 当前工作目录: %CD%

:: 检查 npm 是否可用
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未找到 npm 命令，请确保已安装 Node.js
    echo 您可以从 https://nodejs.org/ 下载并安装 Node.js
    pause
    exit /b 1
)

:: 显示 npm 版本
echo 检查 npm 版本...
call npm -v
if %ERRORLEVEL% neq 0 (
    echo 错误: npm 命令执行失败
    pause
    exit /b 1
)

:: 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo 首次运行，正在配置国内镜像源...
    call npm config set registry https://registry.npmmirror.com
    
    echo 正在安装依赖（这可能需要几分钟）...
    :: 添加详细输出
    call npm install --verbose
    if %ERRORLEVEL% neq 0 (
        echo 依赖安装失败，错误代码: %ERRORLEVEL%
        echo 请检查以下可能的问题：
        echo 1. 网络连接是否正常
        echo 2. 是否有足够的磁盘空间
        echo 3. 是否有写入权限
        echo 4. package.json 文件是否完整
        echo.
        echo 您可以尝试手动运行：
        echo npm cache clean --force
        echo npm install
        pause
        exit /b 1
    )
    echo 依赖安装完成！
)

:: 检查关键依赖是否已安装
if not exist "node_modules\next" (
    echo 错误: next 模块未找到，尝试重新安装依赖...
    call npm install
    if not exist "node_modules\next" (
        echo 严重错误: 依赖安装失败
        pause
        exit /b 1
    )
)

:: 启动应用
echo 正在启动应用...
start cmd /k "call npm run dev"
if %ERRORLEVEL% neq 0 (
    echo 应用启动失败，错误代码: %ERRORLEVEL%
    pause
    exit /b 1
)

timeout /t 5 >nul

:: 等待服务启动后打开浏览器
echo 正在打开浏览器...
start http://localhost:3000