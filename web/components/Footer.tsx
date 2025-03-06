import styles from '../styles/Footer.module.scss'
import DiscordLink from './DiscordLink'
import TwitterLink from './TwitterLink'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>Created by cory.eth </p>
      <div className={styles.links}>
        <DiscordLink
          width={24}
          height={24}
          style={{
            position: 'absolute',
            right: '38px',
            bottom: '38px',
          }}
        />
        <TwitterLink
          width={24}
          height={24}
          style={{
            position: 'absolute',
            right: '76px',
            bottom: '38px',
          }}
        />
      </div>
    </footer>
  )
}

export default Footer
