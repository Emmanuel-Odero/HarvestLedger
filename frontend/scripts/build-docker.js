#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const apiDir = path.join(__dirname, '../src/app/api')
const tempApiDir = path.join(__dirname, '../temp-api-backup')

console.log('🐳 Building for Docker (static export)...')

try {
  // Temporarily move API directory outside of src
  if (fs.existsSync(apiDir)) {
    console.log('📦 Temporarily moving API directory...')
    if (fs.existsSync(tempApiDir)) {
      fs.rmSync(tempApiDir, { recursive: true, force: true })
    }
    fs.renameSync(apiDir, tempApiDir)
  }

  // Set environment and build
  console.log('🔨 Running Next.js build...')
  execSync('next build', { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DOCKER_BUILD: 'true' }
  })

  console.log('✅ Docker build completed successfully!')

} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
} finally {
  // Restore API directory
  if (fs.existsSync(tempApiDir)) {
    console.log('🔄 Restoring API directory...')
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true })
    }
    fs.renameSync(tempApiDir, apiDir)
  }
}