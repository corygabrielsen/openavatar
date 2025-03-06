import Link from 'next/link'
import React from 'react'
import styles from '../styles/TwitterLink.module.scss'

interface Props {
  style?: React.CSSProperties
  svgStyle?: React.CSSProperties
  width?: number
  height?: number
}

const TwitterLink: React.FC<Props> = ({ style, svgStyle, width, height }) => {
  style = { ...style } || {}
  style.width = width
  style.height = height
  return (
    <Link href="https://twitter.com/OpenAvatarNFT" target="_blank" rel="noopener noreferrer">
      <div className={styles.twitter} style={style}>
        <svg viewBox={`0 0 32 32`} xmlns="http://www.w3.org/2000/svg" style={svgStyle}>
          <path d="M31.275 5.924c-.503.223-1.02.411-1.548.564a6.842 6.842 0 0 0 1.393-2.45.516.516 0 0 0-.755-.6 12.181 12.181 0 0 1-3.6 1.422 6.904 6.904 0 0 0-4.809-1.96 6.877 6.877 0 0 0-6.813 7.757A17.587 17.587 0 0 1 3.072 4.253a.516.516 0 0 0-.846.067 6.866 6.866 0 0 0-.93 3.454c0 1.655.59 3.225 1.634 4.452a5.816 5.816 0 0 1-.919-.41.516.516 0 0 0-.767.44v.091c0 2.47 1.33 4.695 3.362 5.908a5.882 5.882 0 0 1-.522-.076.516.516 0 0 0-.588.664 6.867 6.867 0 0 0 5.032 4.605 12.153 12.153 0 0 1-6.497 1.854c-.486 0-.976-.029-1.455-.085a.517.517 0 0 0-.339.946A18.525 18.525 0 0 0 10.255 29.1c6.994 0 11.37-3.298 13.808-6.065 3.041-3.45 4.785-8.016 4.785-12.528 0-.189-.003-.38-.009-.569a13.355 13.355 0 0 0 3.074-3.255.516.516 0 0 0-.638-.759Z"></path>
        </svg>
      </div>
    </Link>
  )
}

export default TwitterLink
