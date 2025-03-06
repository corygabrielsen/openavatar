// Section.tsx
import styles from '../../styles/about/Section.module.scss'

interface SectionProps {
  label: string
  content: string[]
}

const Section: React.FC<SectionProps> = ({ label, content }) => (
  <div className={styles.container}>
    <div className={styles.content}>
      <p className={styles.label}>{label}</p>
      {content.map((item, index) => (
        <p key={index} className={styles.disclaimer}>
          {item}
        </p>
      ))}
      <div className={styles.spacing}></div>
    </div>
  </div>
)

export default Section
