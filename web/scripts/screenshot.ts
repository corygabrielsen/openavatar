// sudo apt-get install -y libasound2
// sudo apt-get install -y libatk1.0-0
// sudo apt-get install -y libatk-bridge2.0-0
// sudo apt-get install -y libcairo2
// sudo apt-get install -y libcups2
// sudo apt-get install -y libgbm1
// sudo apt-get install -y libnss3
// sudo apt-get install -y libpango-1.0-0
// sudo apt-get install -y libxcomposite1
// sudo apt-get install -y libxdamage1
// sudo apt-get install -y libxfixes3
// sudo apt-get install -y libxkbcommon0
// sudo apt-get install -y libxrandr2
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const yargs = require('yargs')
const argv = (yargs as any)(process.argv.slice(2)).argv

async function screenshot(page: any, params: { path: string; fullPage?: boolean }): Promise<void> {
  console.log(`📸 ${params.path}`)
  // create dir if not exists
  const dir = path.dirname(params.path)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return await page.screenshot(params)
}

async function takeScreenshots(url: string) {
  const browser = await puppeteer.launch({
    args: ['--disable-web-security'],
  })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle0' })

  // Take a full window screenshot on page load
  for (const { width, height } of [
    { width: 1920, height: 1080 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 800, height: 600 },
  ]) {
    await page.setViewport({ width, height })
    await screenshot(page, { path: `artifacts/screenshots/pageLoad-${width}x${height}.png` })
    await screenshot(page, { path: `artifacts/screenshots/fullPage-${width}x${height}.png`, fullPage: true })
  }

  await browser.close()
}

;(async () => {
  await takeScreenshots(argv._[0])
})()
