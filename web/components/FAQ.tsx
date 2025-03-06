import styles from '../styles/FAQ.module.scss'

const FAQ = () => {
  return (
    <div className={styles.container}>
      <div className={styles.text}>
        <h1>OpenAvatar</h1>
        <p>
          The goal of OpenAvatar is to provide an open source, onchain, interoperable protocol standard for Avatars.
        </p>
        <p>Avatars should work the way humans want them to work.</p>
        <h2>What is an Avatar?</h2>
        <p>
          An avatar is a digital representation of a user or character in an online environment. It can take many forms,
          such as a profile picture, a virtual character in a game, or a personalized icon on a social media platform.
        </p>
        <p>
          OpenAvatar allows users to create and customize their own avatars, which are stored on the Ethereum blockchain
          as NFTs.
        </p>
        <h2>How many OpenAvatar NFTs will there be?</h2>
        <p>An OpenAvatar is like a World of Warcraft character or an ENS domain.</p>
        <p>Every OpenAvatar is unique and there is no limit.</p>
        <h2>Is each Avatar unique?</h2>
        <p>Yes.</p>
        <p>
          All Avatars have a <strong>32byte DNA code</strong> which is unique and cannot be changed.
        </p>
        <p>
          e.g. <span className={styles.dna}>0x000102030405060708090A0B0C0D0E0F000102030405060708090A0B0C0D0E0F</span>
        </p>
        <p>No two Avatars may have the exact same DNA.</p>
        <h2>How much does mint cost?</h2>
        <p>Minting an OpenAvatar costs 0.02 ETH.</p>
        <p>Price mechanism may be adjusted based on demand and gas prices.</p>
        <h2>What are mint funds used for?</h2>
        <p>
          Mint funds will be used to sponsor artists and developers to create more art and more use cases for Avatars.
        </p>
        <p>We can create a network effect as follows:</p>
        <ol>
          <li>Mint Avatars</li>
          <li>=&gt; sponsor artists and devs</li>
          <li>==&gt; more visualizations, interoperability, games, and experiences</li>
          <li>===&gt; more Avatar use cases</li>
          <li>====&gt; more Avatar mints</li>
          <li>=&gt; (repeat).</li>
        </ol>
        <h2>Are you going to build a game?</h2>
        <p>I started with Avatars because a portable identity is the base primitive.</p>
        <p>I also acquired ENS domains:</p>
        <ul>
          <li>OpenAvatar.eth</li>
          <li>OpenAvatarDAO.eth</li>
          <li>OpenAvatarNFT.eth</li>
          <li>OpenBattleRoyale.eth</li>
          <li>OpenFPS.eth</li>
          <li>OpenMMO.eth</li>
          <li>OpenMMORPG.eth</li>
          <li>OpenMon.eth</li>
          <li>OpenRacing.eth</li>
          <li>OpenRPG.eth</li>
          <li>OpenRTS.eth</li>
        </ul>
        <p>
          The idea is to curate a system of open source, interoperable protocols for Avatars to participate in the
          metaverse.
        </p>
        <p>The Metaverse we want. Not fucking Zoom with JPEGs.</p>
        <h2>Can I choose how my Avatar looks?</h2>
        <p>Yes.</p>
        <p>You choose how your Avatar looks when minting.</p>
        <p>
          This means you can choose and mint the exact Avatar you want. Make it look like you, a celebrity, a rockstar,
          an alien, a zombie, a demon, a ghost, or whatever you want. The contract allows for adding new attributes and
          styles in the future.
        </p>
        <p>
          It&apos;s conceivable your Avatar may appear different in different game worlds. First Principles design
          empowers creativity.
        </p>
        <h2>Will there be more art?</h2>
        <p>Yes.</p>
        <p>
          When you see Mario or Link, you recognize their character design whether it&apos;s a 2D sprite or 3D model.
        </p>
        <p>OpenAvatar aims to empower people to own and create Avatars with similar, broad recognizability.</p>
        <p>
          Your Avatar DNA is your immutable, interoperable identity. How your Avatar is rendered may vary across
          platforms, games, or social media.
        </p>
        <h2>Can I change how my Avatar looks later?</h2>
        <p>Yes.</p>
        <p>
          You can change your <strong>Avatar&apos;s Renderer</strong> to change how it looks at any time.
        </p>
        <p>
          An Avatar Renderer may consider new clothing, accessories, haircuts, undressing, transmorphing, evolving,
          death, re-birth, mating, or any concept you invent.
        </p>
        <p>
          <strong>But your Avatar&apos;s 32byte DNA code is immutable and cannot be changed.</strong>
        </p>
        <p>This consistency allows for interoperability of Avatars across platforms and applications.</p>
        <p>Application-specific re-interpretations of the 32byte DNA code are entirely possible and encouraged.</p>
        <p>Your Avatar should be able to look the way you want, when you want, where you want.</p>
        <h2>How are Avatar images generated?</h2>
        <p>Your Avatar&apos;s unique DNA code is used to render your Avatar.</p>
        <p>
          Similar to the ENS Resolver pattern,{' '}
          <strong>your Avatar Renderer can be upgraded or changed by the NFT owner.</strong>
        </p>
        <p>
          Token owners are empowered to upgrade their Avatar art to HD or 3D, or stick with the 32x32 sprite art
          forever.
        </p>
        <p>
          With the 32x32 sprite art deployed onchain for mint, in some cases your Avatar&apos;s clothing or VR goggles
          may obscure other traits like eyes or tattoos, but each Avatar still has a unique DNA code defining the Avatar
          attribute set and no two Avatars are completely identical.
        </p>
        <p>
          This design allows for a wide range of use cases and interoperability with other platforms and applications
          that support NFTs.
        </p>
        <h2>Can my Avatar have a pet or own things?</h2>
        <p>Yes, pending development.</p>
        <p>Avatars should be able to own things. Similar to how a World of Warcraft character has gear and mounts.</p>
        <p>
          To accomplish this, a DeFi-style Vault contract is under development that allows an Avatar to own other
          ERC-20, ERC-721, and ERC-1155 tokens directly.
        </p>
        <h3>Details</h3>
        <p>
          Using the Vault pattern common in DeFi, an Avatar can act as an ownership claim to other NFTs or ERC-20
          tokens. This allows for interesting use cases like:
        </p>
        <ul>
          <li>An Avatar that owns clothing or accessories</li>
          <li>An Avatar that owns a pet</li>
          <li>An Avatar that owns another Avatar</li>
          <li>An Avatar that has ownership in a DAO</li>
          <li>An Avatar that generates yield</li>
          <li>An Avatar that owns billions of dollars</li>
        </ul>
        <p>
          Essentially, <strong>your Avatar can be an access pass to a token vault in the future</strong>. The only limit
          is gas and clever engineering.
        </p>
        <h2>Where is the art stored?</h2>
        <p>All art is stored directly on Ethereum (not IPFS).</p>
        <p>
          Similar to ENS Resolvers, your Avatar&apos;s Renderer can be upgraded or changed by the token owner, allowing
          for more ways to visualize your Avatar as a pfp or preview photo.
        </p>
        <p>This design:</p>
        <ul>
          <li>is fully controlled by the token owner</li>
          <li>is censorship resistant</li>
          <li>
            token owner can choose to render their avatar in a different format (PNG, SVG, BMP, HTML, owner-written
            formats)
          </li>
          <li>
            contract owner can offer new standardized render options in the future or upgrade default, (3D, Anime, HD
            pixel art, etc)
          </li>
          <li>minimizes gas cost to store art onchain allowing for more options and unique art</li>
          <li>does not rely on IPFS pinning for the rest of eternity</li>
        </ul>
        <h2>Can I 3D print my Avatar?</h2>
        <p>Mint funds will be used to sponsor 3D asset development.</p>
        <p>All art will be released to the public domain.</p>
        <p>
          Once 3D models are available, you will be able to print your Avatar at home, or possibly order one printed for
          you.
        </p>
        <h2>Will there be plushies or toys?</h2>
        <p>
          The toy industry reached out to me and we are scoping efforts to turn the Avatars into plushies. This also
          requires making 3D models.
        </p>
        <h2>Do Avatars have stats?</h2>
        <p>An ENS-style database contract is under development that allows an Avatar to store any key-value pair.</p>
        <p>This allows for a wide range of use cases.</p>
        <ul>
          <li>Share Avatar stats between games</li>
          <li>An Avatar that is a DAO delegate</li>
          <li>A decentralized social media profile</li>
          <li>Encode and store arbitrary data related to your Avatar</li>
        </ul>
        <p>ENS uses this pattern to allow users to store an Ethereum address, a Twitter handle, a website, etc.</p>
        <p>
          OpenAvatars will use a similar pattern to ENS. For each Avatar, the token owner can store any key-value pair
          in a database-style smart contract.
        </p>
        <p>
          Essentially, <strong>your Avatar is also a censorship-resistant database</strong>. The only limit is gas and
          clever engineering.
        </p>
        <h2>Can my Avatar make an Ethereum transaction itself?</h2>
        <p>
          Today you need to use the signing key that owns that Avatar rather than, say, the Avatar &quot;itself&quot;.
          There&apos;s a subtlety here because your signing key will have other data and tokens, whereas the Avatar
          context is clearly partitioned by its suite of smart contracts and implied ownership.
        </p>
        <p>
          When Account Abstraction is available, the idea is to make an Avatar a first-class primitive. This means it
          could act as a smart wallet and own things onchain. This is a very powerful pattern.
        </p>
        <p>
          Essentially, <strong>your Avatar can be a smart wallet in the future</strong>. The only limit is gas and
          clever engineering.
        </p>
        <h2>Are Avatars going to be on other chains?</h2>
        <p>The multi-chain design is under development. The initial version will be on Ethereum.</p>
        <p>
          ENS CCIP-Read is a great example of how to build a multi-chain protocol, but still under development. It is
          likely that OpenAvatar will follow a similar pattern.
        </p>
        <h2>How long have you been working on this?</h2>
        <p>I have been thinking about this idea since I started playing video games at 6 years old.</p>
        <p>
          In 2022, I had a moment of clarity and wrote{' '}
          <a href="https://coryeth.substack.com/p/the-avatar-industry">The Avatar Industry</a>.
        </p>
        <p>I bought Photoshop and drew my Twitter pfp.</p>
        <p>This has been my north star since then.</p>
        <p>
          It took me over a year to distill the core ideas into First Principles Design that I was happy with launching.
        </p>
        <h2>Aren&apos;t other people also building protocols?</h2>
        <p>Yes. I would love to collaborate with other builders.</p>
        <p>
          The OpenAvatar protocol is built from first principles and is sufficiently generalized to integrate with other
          identity or gaming protocols, or Avatar experiences.
        </p>
        <h2>What were your inspirations?</h2>
        <ul>
          <li>Games like World of Warcraft and Pokémon.</li>
          <li>Identity Protocols like ENS and Facebook.</li>
          <li>NFTs like Cryptopunks and Loot.</li>
          <li>Declarative languages like HTML and SQL</li>
          <li>Math like Type Systems and Category Theory</li>
          <li>Based solo devs like Linus Torvalds.</li>
        </ul>
        <h2>Who founded OpenAvatar?</h2>
        <p>
          Cory Gabrielsen (cory.eth) conceptualized, prototyped, built, and launched the initial OpenAvatar protocol as
          a solo builder, including all art, smart contracts, frontend, and marketing.
        </p>
        <h2>Are there investors?</h2>
        <p>No.</p>
        <h2>Are you hiring?</h2>
        <p>
          Mint funds will be used to sponsor artists and developers to build the OpenAvatar ecosystem. Reach out to me
          on Twitter if you are interested.
        </p>
        <h2>What is the license?</h2>
        <p>
          All code is released under GPL v3.0. All art is released to the public domain under Creative Commons Zero.
        </p>
        <p>
          When I was scoping the project, I found that all &quot;open source&quot; game art is restricted by a licensing
          that prevents usage for NFTs.
        </p>
        <p>So, I made art for everyone to enjoy and NFT enjoyers to own via cryptography.</p>
        <h2>Are the contracts audited?</h2>
        <p>No.</p>
        <p>I am a solo builder. I &quot;audited&quot; my own code by keeping it simple and writing tests.</p>
        <p>The contracts are open source and you or someone you trust can read them at any time.</p>
        <p>
          The upgrade and proxy patterns which empower the Avatars are quite simple and fully controlled by the token
          owner.
        </p>
        <p>I used ENS and DeFi patterns as a guide.</p>
        <h2>Legal Disclaimer</h2>
        <p>
          Having a lot of ideas and clear vision doesn&apos;t make something a promise. Nothing written above is
          promised. In fact, having more ideas makes it more likely that some of them will be wrong.
        </p>
        <p>
          Wherever possible, refer to smart contract source code. Insofar as is possible, the intent is for all project
          obligations to be fulfilled and settled exclusively by smart contract interactions.
        </p>
        <p>
          <strong>Minting an OpenAvatar NFT is not an investment or a promise of future value.</strong>
        </p>
        <p>OpenAvatar ERC-721 NFTs are not securities.</p>
      </div>
    </div>
  )
}

export default FAQ
