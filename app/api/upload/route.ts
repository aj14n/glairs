import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { Client } from 'ssh2';
import fs from 'fs';

// 添加 OPTIONS 方法处理跨域预检请求
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  console.log('收到上传请求')
  
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const sshConfigStr = formData.get('sshConfig') as string | null
    
    // 保存到本地备份
    const localBytes = await file.arrayBuffer()
    const localBuffer = Buffer.from(localBytes)
    const localFilename = `${Date.now()}-${file.name}`
    const localPath = path.join(process.cwd(), 'public', 'input', localFilename)
    
    // 确保input目录存在
    const inputDir = path.join(process.cwd(), 'public', 'input')
    try {
      await fs.promises.mkdir(inputDir, { recursive: true })
      console.log('✅ 确保input目录存在')
    } catch (mkdirErr) {
      console.error('❌ 创建目录失败:', mkdirErr)
    }
    
    // 保存文件并验证
    try {
      await writeFile(localPath, localBuffer)
      console.log('✅ 文件已保存到:', localPath)
      
      // 验证文件是否成功保存
      const stats = await fs.promises.stat(localPath)
      console.log('✅ 文件大小:', stats.size, 'bytes')
    } catch (writeErr) {
      console.error('❌ 文件保存失败:', writeErr)
      throw writeErr
    }

    // 上传到远程服务器的调试日志
    if (sshConfigStr) {
      const sshConfig = JSON.parse(sshConfigStr)
      console.log('准备SSH上传，配置信息:', {
        host: sshConfig.host,
        port: sshConfig.port,
        username: sshConfig.user,
        targetPath: `/root/autodl-tmp/input/${localFilename}`
      })
      
      await new Promise((resolve, reject) => {
        const conn = new Client()
        
        // SSH连接事件监听
        conn.on('ready', () => {
          console.log('✅ SSH连接成功')
          
          conn.sftp((err, sftp) => {
            if (err) {
              console.error('❌ SFTP会话创建失败:', err)
              reject(err)
              return
            }
            console.log('✅ SFTP会话创建成功')
            
            const remoteFilePath = `/root/autodl-tmp/input/${localFilename}`
            console.log('📤 开始上传文件到:', remoteFilePath)
            
            const writeStream = sftp.createWriteStream(remoteFilePath)
            
            writeStream.on('close', () => {
              console.log('✅ 文件上传完成')
              conn.end()
              resolve(true)
            })
            
            writeStream.on('error', (err: Error) => {
              console.error('❌ 文件写入错误:', err)
              reject(err)
            })

            // 写入文件
            try {
              writeStream.write(localBuffer, (err) => {
                if (err) {
                  console.error('❌ 写入过程错误:', err)
                  reject(err)
                  return
                }
                console.log('✅ 文件内容写入成功')
                writeStream.end()
              })
            } catch (writeErr) {
              console.error('❌ 写入尝试失败:', writeErr)
              reject(writeErr)
            }
          })
        })
        
        conn.on('error', (err) => {
          console.error('❌ SSH连接错误:', err)
          reject(err)
        })

        conn.on('end', () => {
          console.log('📡 SSH连接已关闭')
        })

        // 尝试建立连接
        console.log('📡 正在建立SSH连接...')
        try {
          conn.connect({
            host: sshConfig.host,
            port: parseInt(sshConfig.port),
            username: sshConfig.user,
            password: sshConfig.password,
            readyTimeout: 5000, // 5秒超时
            debug: (msg) => console.log('SSH Debug:', msg)
          })
        } catch (connErr) {
          console.error('❌ SSH连接尝试失败:', connErr)
          reject(connErr)
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      path: `/input/${localFilename}`,
      filename: localFilename
    })
  } catch (error) {
    console.error('❌ 上传处理错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '上传失败',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 
