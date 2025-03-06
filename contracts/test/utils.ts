import { ContractReceipt } from '@ethersproject/contracts'
import { expect } from 'chai'
import fs from 'fs'

export function mkTestDirs() {
  const TEST_ARTIFACTS_DIR = 'test/artifacts'
  if (!fs.existsSync(TEST_ARTIFACTS_DIR)) {
    fs.mkdirSync(TEST_ARTIFACTS_DIR)
  }
}

export async function silence(fn: () => Promise<void>) {
  let log = console.log
  let debug = console.debug
  console.log = () => {}
  console.debug = () => {}
  await fn()
  console.log = log
  console.debug = debug
}

export function expectEvent(receipt: ContractReceipt, eventName: string, eventArgs: Record<string, any> = {}) {
  expect(receipt.events).to.not.be.undefined

  // find the events with the matching name
  const match = []
  for (const event of receipt.events!) {
    if (event.event === eventName) {
      match.push(event)
    }
  }
  // if there are no matches, fail
  expect(match.length, `Event '${eventName}' not found`).to.be.greaterThan(0)

  // one of the matches should be an exact match for all the event args
  const exactMatch = match.find((event) => {
    if (event.args === undefined) {
      return false
    }
    for (const [key, value] of Object.entries(eventArgs)) {
      // check for string equality
      const eventValue = (event.args as Record<string, any>)[key]
      if (`${eventValue}` !== `${value}`) {
        return false
      }
    }
    return true
  })
  expect(exactMatch, `Event '${eventName}' with args '${JSON.stringify(eventArgs)}' not found`).to.not.be.undefined
}

export function expectOneEvent(receipt: ContractReceipt, eventName: string, eventArgs: Record<string, any> = {}) {
  expect(receipt.events).to.not.be.undefined
  expect(receipt.events?.length, `Expected exactly 1 event`).to.equal(1)

  expectEvent(receipt, eventName, eventArgs)
}
