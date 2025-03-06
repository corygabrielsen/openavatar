import { FC } from 'react'
import styles from '../../../styles/maker/search/SearchSuggestionsView.module.scss'

interface Props {
  suggestedTerms: string[]
  selectedTerm: string
  onSelect: (term: string) => void
}

const SearchSuggestionsView: FC<Props> = ({ suggestedTerms, selectedTerm, onSelect }) => {
  return (
    <div className={styles.suggestedSearches}>
      <button
        className={`${styles.suggestedSearch} ${'' === selectedTerm ? styles.selected : ''}`}
        onClick={() => onSelect('')}
      >
        ALL
      </button>
      {suggestedTerms.map((term) => (
        <button
          key={term}
          className={`${styles.suggestedSearch} ${
            term.toLowerCase() === selectedTerm.toLowerCase() ? styles.selected : ''
          }`}
          onClick={() => onSelect(term)}
        >
          {term}
        </button>
      ))}
    </div>
  )
}

export default SearchSuggestionsView
