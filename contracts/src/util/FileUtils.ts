import fs from 'fs'

/**
 * Returns the path to the contracts directory.
 * @returns The path to the contracts directory
 * @throws Error if the contracts directory cannot be found
 * @throws Error if the parent directory is not named 'contracts'
 */
function contractsProjectDirAbsPath() {
  const contractsDir = fs.realpathSync(`${__dirname}/../..`)
  const contractsDirParent = fs.realpathSync(`${contractsDir}/..`)
  if (
    !contractsDir.endsWith('/app') &&
    !contractsDir.endsWith('contracts') &&
    !contractsDirParent.endsWith('contracts')
  ) {
    throw new Error('contractsDir must end in /contracts')
  }
  const subdirsInContractsDir = fs.readdirSync(contractsDir)
  if (!subdirsInContractsDir.includes('node_modules')) {
    throw new Error('contractsDir must contain node_modules')
  }
  return contractsDir
}

export const PROJECT_CONTRACTS_DIR = contractsProjectDirAbsPath()

/**
 * Returns the path to the artifacts directory from which hex files will be uploaded.
 * @returns The path to the artifacts directory
 */
export const DEPENDENCY_NODE_MODULES_ASSET_ARTIFACTS_DIR = `${contractsProjectDirAbsPath()}/node_modules/@openavatar/assets/artifacts`
