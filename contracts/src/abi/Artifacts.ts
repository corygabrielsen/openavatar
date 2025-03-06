import { PROJECT_CONTRACTS_DIR } from '../util/FileUtils'
import { Deployable } from './Deployable'

// The files won't exist the first time we run the script, so we use require instead.
const loadedArtifacts: Map<string, any> = new Map()
// compute length of DeployableContract dynamically for sanity checks
const N = Object.keys(Deployable).length
const CONTRACT_SUBDIRS = ['core/dependencies/', 'core/lib/', '', '', '', '', '', 'extensions/', 'extensions/example/']
if (N !== CONTRACT_SUBDIRS.length) {
  throw new Error('CONTRACT_NAMES and CONTRACT_SUBDIRS must be the same length')
}

const missing: string[] = []
for (let i = 0; i < N; i++) {
  const deployable: Deployable = Object.values(Deployable)[i]
  const solFilename: string = `${deployable}.sol`
  const subdir = CONTRACT_SUBDIRS[i]
  const path = `${PROJECT_CONTRACTS_DIR}/artifacts/contracts/${subdir}${solFilename}/${deployable}.json`
  try {
    const artifact = require(path)
    if (artifact === undefined) {
      console.error(`artifact is undefined: ${subdir.length > 0 ? subdir : ''}${deployable}`)
      throw new Error('artifact is undefined')
    }
    loadedArtifacts.set(deployable, artifact)
  } catch (e) {
    missing.push(path)
    console.error(`Missing artifact: ${path}`)
  }
}

if (missing.length > 0) {
  console.warn('Missing artifacts detected. Run `hardhat compile` and then run `tsc` again.')
  if (missing.length === N) {
    console.warn('This is expected for a clean build due to chicken-and-egg problem with `hardhat compile` and `tsc`.')
  } else {
    console.error(`\x1b[31m${missing.length}/${N} artifacts are missing.\x1b[0m`)
    for (const missingPath of missing) {
      console.error(`\t\x1b[31m${missingPath}\x1b[0m`)
    }
    console.error('\x1b[31mThis is unexpected. Check the above paths and make sure they exist.\x1b[0m')
  }
}

export const Artifacts = loadedArtifacts
