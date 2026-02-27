#!/usr/bin/env node

import fs from 'node:fs'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import * as tar from 'tar'

const pipelineAsync = promisify(pipeline)

const picocolors = (() => {
  const colos = {
    gray: (val = '30') => val,
    red: (val = '31') => val,
    green: (val = '32') => val,
    yellow: (val = '33') => val,
    blue: (val = '34') => val,
    purple: (val = '35') => val,
    cyan: (val = '36') => val,
    white: (val = '37') => val,
  }
  return new Proxy(colos, {
    get: (target, prop) => {
      if (prop in colos) {
        return (content) => {
          const color = colos[prop]()
          return `\x1b[${color}m${content}\x1b[0m`
        }
      }
      return (content) => content
    },
  })
})()

const context = {
  platform: process.platform,
  root: process.cwd(),
  owner: 'hayden-fr',
  repo: 'uniapp-preset',
  defaultBranch: 'main',
  userAgent: 'uniapp-preset-cli',
  HEAD: '',
  updateAt: '',
  tempfile: '',
}

function resolveJSON(jsonPath) {
  const content = fs.readFileSync(jsonPath, 'utf-8')
  return JSON.parse(content)
}

async function init() {
  const resData = await new Promise((resolve) => {
    https.get(
      {
        hostname: 'api.github.com',
        path: `/repos/${context.owner}/${context.repo}`,
        headers: {
          'User-Agent': context.userAgent,
        },
      },
      (response) => {
        let data = ''
        response.on('data', (chunk) => {
          data += chunk
        })
        response.on('end', () => {
          resolve(JSON.parse(data.toString()))
        })
      },
    )
  })

  context.defaultBranch = resData.default_branch
  context.updateAt = resData.updated_at
}

async function download() {
  const cacheDir = path.resolve(
    os.homedir(),
    '.degit',
    context.owner,
    context.repo,
  )

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  const accessPath = path.resolve(cacheDir, 'access.json')
  const mapPath = path.resolve(cacheDir, 'map.json')

  if (fs.existsSync(accessPath)) {
    const accessData = resolveJSON(accessPath)
    if (accessData.HEAD === context.updateAt) {
      if (fs.existsSync(mapPath)) {
        const mapData = resolveJSON(mapPath)
        const HEAD = mapData.HEAD
        context.tempfile = path.resolve(cacheDir, `${HEAD}.tar.gz`)
        if (fs.existsSync(context.tempfile)) {
          context.HEAD = HEAD
          return
        }
      }
    }
  } else {
    fs.writeFileSync(
      accessPath,
      JSON.stringify({ HEAD: context.updateAt }, null, 2),
    )
  }

  const branchInfo = await new Promise((resolve) => {
    https.get(
      {
        hostname: 'api.github.com',
        path: `/repos/${context.owner}/${context.repo}/branches/${context.defaultBranch}`,
        headers: {
          'User-Agent': context.userAgent,
        },
      },
      (response) => {
        let data = ''
        response.on('data', (chunk) => {
          data += chunk
        })
        response.on('end', () => {
          resolve(JSON.parse(data.toString()))
        })
      },
    )
  })

  const HEAD = branchInfo.commit.sha
  context.HEAD = HEAD
  fs.writeFileSync(mapPath, JSON.stringify({ HEAD: HEAD }, null, 2))
  context.tempfile = path.resolve(cacheDir, `${HEAD}.tar.gz`)
  const writeStream = fs.createWriteStream(context.tempfile)

  await new Promise((resolve) => {
    https.get(
      {
        hostname: 'codeload.github.com',
        path: `/${context.owner}/${context.repo}/tar.gz/refs/heads/${context.defaultBranch}`,
        headers: {
          'User-Agent': context.userAgent,
        },
      },
      (response) => {
        pipelineAsync(response, writeStream)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            reject(err)
          })
      },
    )
  })
}

async function extract(projectPath) {
  await tar.x({
    file: context.tempfile,
    cwd: projectPath,
    strip: 1,
  })

  const degitPath = path.resolve(projectPath, 'degit.json')
  if (fs.existsSync(degitPath)) {
    const degitData = resolveJSON(degitPath)
    for (const item of degitData) {
      if (item.action === 'remove') {
        for (const file of item.files) {
          const filePath = path.resolve(projectPath, file)
          if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true, force: true })
          }
        }
      }
    }
    fs.rmSync(degitPath)
  }
}

async function createProject(project) {
  if (!project) {
    console.log(picocolors.red('Error: 请输入项目路径'))
    process.exit(1)
  }

  let projectName = project
  const projectPath = path.resolve(context.root, project)

  if (context.root === projectPath) {
    projectName = path.basename(projectPath)
  }

  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true })
  }

  if (!fs.statSync(projectPath).isDirectory()) {
    console.log(picocolors.red(`${projectPath} 不是有效目录`))
    process.exit(1)
  }

  if (fs.readdirSync(projectPath).length > 0) {
    console.log(picocolors.red('目标目录不为空'))
    process.exit(1)
  }

  await init()
  await download()
  await extract(projectPath)

  const packagePath = path.resolve(projectPath, 'package.json')
  if (fs.existsSync(packagePath)) {
    const packageData = resolveJSON(packagePath)
    packageData.name = projectName
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2))
  }
  const readmePath = path.resolve(projectPath, 'README.md')
  fs.writeFileSync(readmePath, `# ${projectName}`)
}

async function updateProject(project) {
  const projectPath = path.resolve(context.root, project || '.')

  const packagePath = path.resolve(projectPath, 'package.json')
  if (!fs.existsSync(packagePath)) {
    console.log(picocolors.red('Error: 当前目录不是一个有效的 nodejs 项目'))
    process.exit(1)
  }

  await init()
  await download()

  const tempdir = path.resolve(projectPath, `.temp-${context.HEAD}`)
  if (!fs.existsSync(tempdir)) {
    fs.mkdirSync(tempdir, { recursive: true })
  }
  await extract(tempdir)

  const skipFiles = [
    'src/api',
    'src/locales',
    'src/App.vue',
    'src/config.example.ts',
    'src/config.ts',
    'src/manifest.json',
    'src/pages.json',
    'src/theme.ts',
    'README.md',
  ]
  for (const file of skipFiles) {
    fs.rmSync(path.resolve(tempdir, file), { recursive: true, force: true })
  }

  const originalPackageData = resolveJSON(packagePath)
  const tempPackagePath = path.resolve(tempdir, 'package.json')
  const targetPackageData = resolveJSON(tempPackagePath)
  const merge = (f) => {
    const data = Object.assign({}, targetPackageData[f], originalPackageData[f])
    originalPackageData[f] = Object.fromEntries(
      Object.keys(data)
        .sort()
        .map((key) => [key, data[key]]),
    )
  }
  merge('dependencies')
  merge('devDependencies')
  fs.writeFileSync(packagePath, JSON.stringify(originalPackageData, null, 2))
  fs.rmSync(tempPackagePath)

  // renameSync
  ;(function move(sourcePath, targetPath) {
    if (fs.statSync(sourcePath).isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true })
      }
      const files = fs.readdirSync(sourcePath)
      for (const file of files) {
        move(path.resolve(sourcePath, file), path.resolve(targetPath, file))
      }
    } else {
      fs.renameSync(sourcePath, targetPath)
    }
  })(tempdir, projectPath)

  fs.rmSync(tempdir, { recursive: true, force: true })
}

;(async () => {
  const help = [
    'Usage: [command] [options]',
    '',
    'create 使用模板创建项目',
    'update 使用模板更新项目',
    '',
  ]
  const [command, ...args] = process.argv.slice(2)
  switch (command) {
    case 'create':
      await createProject(...args)
      break
    case 'update':
      await updateProject(...args)
      break
    default:
      console.log(help.join('\n'))
      break
  }
})()
