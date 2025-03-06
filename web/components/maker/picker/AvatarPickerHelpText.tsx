import styles from '../../../styles/maker/picker/AvatarPickerHelpText.module.scss'

type Props = {
  text: string
}

const AvatarPickerHelpText = ({ text }: Props) => {
  return <p className={styles.text}>{text}</p>
}

export default AvatarPickerHelpText
