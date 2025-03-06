import style from '../styles/ToastGlow.module.scss'

interface Prop {
  text: string
}

const Toast = ({ text }: Prop) => {
  return (
    <div className={style.container}>
      <p className={style.text}>{text}</p>
    </div>
  )
}

export default Toast
