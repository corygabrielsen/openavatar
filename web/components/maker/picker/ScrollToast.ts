import toast from 'react-hot-toast'

export const SCROLL_THRESHOLD = 300
export const DEBOUNCED_TIME = 2000

interface ScrollToastProps {
  lastToastTime: React.MutableRefObject<number | null>
  toastScrollY: React.MutableRefObject<number>
  showScrollToastOnClick: boolean
  scrollToastMessage?: string
}
// Modify your notify function to record the scroll position when the toast appears
export const notifyScrollHint = ({
  lastToastTime,
  toastScrollY,
  showScrollToastOnClick,
  scrollToastMessage,
}: ScrollToastProps) => {
  if (showScrollToastOnClick) {
    const currentTime = new Date().getTime()
    if (lastToastTime.current === null || currentTime - lastToastTime.current >= DEBOUNCED_TIME) {
      lastToastTime.current = currentTime
      toastScrollY.current = window.scrollY // Record the scroll position

      toast(scrollToastMessage || 'Scroll down to change colors', {
        id: 'scroll-notification', // this id should
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      })
    }
  }
}
