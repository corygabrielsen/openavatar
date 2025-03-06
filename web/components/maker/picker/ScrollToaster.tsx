import { Toaster, resolveValue } from 'react-hot-toast'
import styles from '../../../styles/maker/picker/ScrollToaster.module.scss'

const ScrollToaster = () => {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        className: '',
        duration: 5000,
      }}
    >
      {(t) => (
        <div
          className={styles.toast}
          style={{
            opacity: t.visible ? 1 : 0,
          }}
        >
          👇
          <div className={styles.toastContent}>{resolveValue(t.message, t)}</div>
          👇
        </div>
      )}
    </Toaster>
  )
}

export default ScrollToaster
