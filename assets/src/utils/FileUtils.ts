import fs from 'fs'

/**
 * Returns the path to the assets directory.
 * @returns The path to the assets directory
 * @throws Error if the assets directory cannot be found
 * @throws Error if the parent directory is not named 'assets'
 */
function assetsProjectDirAbsPath() {
  const assetsDir = fs.realpathSync(`${__dirname}/../..`)
  const assetsDirParent = fs.realpathSync(`${assetsDir}/..`)
  if (!assetsDir.endsWith('/app') && !assetsDir.endsWith('assets') && !assetsDirParent.endsWith('assets')) {
    throw new Error('assetsDir must end in /assets')
  }
  const subdirsInContractsDir = fs.readdirSync(assetsDir)
  if (!subdirsInContractsDir.includes('node_modules')) {
    throw new Error('assetsDir must contain node_modules')
  }
  return assetsDir
}

export const PROJECT_ASSETS_DIR = assetsProjectDirAbsPath()

export const ASSETS_ARTIFACTS_DIR = `${PROJECT_ASSETS_DIR}/artifacts`
