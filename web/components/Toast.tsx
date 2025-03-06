import style from '../styles/Toast.module.scss'

interface Prop {
  text: string
  lightMode?: boolean
}

const Toast = ({ text, lightMode }: Prop) => {
  return <p className={`${style.container} ${lightMode ? style.lightMode : ''}`}>{text}</p>
}

export default Toast
