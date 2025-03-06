import { FC } from 'react'
import styles from '../../../styles/maker/search/SearchBox.module.scss'

interface Props {
  searchTerm: string
  onChange: (value: string) => void
}

const SearchBox: FC<Props> = ({ searchTerm, onChange }) => {
  return (
    <div className={styles.container}>
      {/* search icon */}
      <svg
        className={styles.icon}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="9.5" cy="9.5" r="6.75" stroke="#C4C4C4" strokeWidth="2" />
        <path d="M14.25 14.25L18.5 18.5" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        className={styles.search}
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default SearchBox
