import { Avatar } from '@openavatar/types'
import { useEffect, useMemo, useState } from 'react'
import { useContractRead, useNetwork } from 'wagmi'
import { getContractConfigs } from '../../abi/ABI'

interface MintStatusState {
  dnaToIsMinted: { [key: string]: boolean }
}

const initialState: MintStatusState = {
  dnaToIsMinted: {},
}

export function useMintStatus(avatars: Avatar[]) {
  const { chain } = useNetwork()
  const [state, setState] = useState<MintStatusState>(initialState)
  const dnaArray = useMemo(() => avatars.map((avatar) => avatar.dna.toString()), [avatars])

  const enableContractRead = dnaArray.length > 0

  const { data: mintStatusArray } = useContractRead({
    address: getContractConfigs(chain).OpenAvatarGen0Token.address,
    abi: getContractConfigs(chain).OpenAvatarGen0Token.abi,
    functionName: 'isMintedEach',
    args: [dnaArray],
    enabled: enableContractRead,
  })

  useEffect(() => {
    if (mintStatusArray) {
      console.log('mintStatusArray', mintStatusArray)
      const updatedIsMinted = dnaArray.reduce((acc: { [key: string]: boolean }, dna, index) => {
        acc[dna] = (mintStatusArray as boolean[])[index]
        return acc
      }, {})

      setState({ dnaToIsMinted: updatedIsMinted })
    }
  }, [mintStatusArray, dnaArray])

  return {
    isMinted: state.dnaToIsMinted,
  }
}
