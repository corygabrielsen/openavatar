import { RainbowKitProvider, connectorsForWallets, darkTheme, getDefaultWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { argentWallet, trustWallet } from '@rainbow-me/rainbowkit/wallets'
import type { AppProps } from 'next/app'
import getConfig from 'next/config'
import Head from 'next/head'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { goerli, localhost, mainnet, sepolia } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import FontFace from '../components/FontFace'
import '../styles/globals.scss'

// function makeTestnetChain(chainId: number, hostname: string, port: number, ssl: boolean = false): Chain {
//   return {
//     id: chainId,
//     name: `${hostname}:${port}`,
//     network: `${hostname}:${port}`,
//     nativeCurrency: {
//       decimals: 18,
//       name: 'Ether',
//       symbol: 'ETH',
//     },
//     rpcUrls: {
//       default: { http: [`http${ssl ? 's' : ''}://${hostname}:${port}`] },
//       public: { http: [`http${ssl ? 's' : ''}://${hostname}:${port}`] },
//     },
//   }
// }

// const testnet: Chain = makeTestnetChain(31337, 'localhost', 8545)
// const alpha: Chain = makeTestnetChain(6942, 'api.openavatarnft.io', 6942, true)

const { publicRuntimeConfig } = getConfig()

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    ...(process.env.NEXT_PUBLIC_ENABLE_MAINNET === 'true'
      ? [mainnet]
      : [mainnet, localhost, goerli, sepolia /*, alpha */]),
  ],
  [
    alchemyProvider({
      // This is Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: 'ntc-ryYixN7lRo9G3jML5OD6SiZZDNLq',
    }),
    publicProvider(),
  ]
)

const appName = 'OpenAvatar'
const projectId = '9ba50bbc86a9506f0636d788491f82dc'

const { wallets } = getDefaultWallets({
  appName,
  projectId,
  chains,
})

const appInfo = {
  appName,
}

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [argentWallet({ projectId, chains }), trustWallet({ projectId, chains })],
  },
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        appInfo={appInfo}
        chains={chains}
        theme={darkTheme({
          borderRadius: 'small',
          fontStack: 'system',
          overlayBlur: 'small',
        })}
      >
        <Head>
          <title>OpenAvatar</title>
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="apple-mobile-web-app-title" content="App Title"></meta>
        </Head>
        <FontFace baseUrl={publicRuntimeConfig.baseUrl} />
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
