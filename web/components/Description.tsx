import styles from '../styles/Description.module.scss'

const Description = () => {
  return (
    <div className={styles.container}>
      <div className={styles.text}>
        <h1>OpenAvatar</h1>
        <p>
          The goal of OpenAvatar is to provide an open source, onchain, interoperable protocol standard for Avatars.
        </p>
        <p>Each avatar has a unique set of attributes and no two avatars are completely identical.</p>
        <p>All avatars are stored directly on the Ethereum blockchain, including raw image data and image encoders.</p>
        {/* <h2>What is an Avatar?</h2>
        <p>An avatar is a digital representation of a user or character in an online environment.</p>
        <p>
          It can take many forms, such as a profile picture, a virtual character in a game, or a personalized icon on a
          social media platform.
        </p> */}
        <p>
          OpenAvatar allows users to create and customize their own avatars, which are stored on the Ethereum blockchain
          as NFTs (non-fungible tokens).
        </p>
        <h2>Features</h2>
        <ul>
          <li>Create and customize your own unique avatar</li>
          <li>Store your avatar on the Ethereum blockchain as an NFT</li>
          <li>Interoperability with other applications that support NFTs</li>
        </ul>
        <h2>Social Media</h2>
        <p>
          Follow{' '}
          <a className={styles.twitter} href="https://twitter.com/OpenAvatarNFT">
            @OpenAvatarNFT
          </a>{' '}
          for updates and announcements.
        </p>
        <h2>License</h2>
        <p>OpenAvatar is currently in private beta.</p>
        <h2>Attribution</h2>
        <p>OpenAvatar was founded and built by Cory Gabrielsen (cory.eth).</p>
      </div>
    </div>
  )
}

export default Description
