import { FC } from 'react'
import styles from '../../../styles/maker/search/SearchView.module.scss'
import SearchBox from './SearchBox'
import SearchSuggestionsView from './SearchSuggestionsView'

interface Props {
  suggestedSearchTerms: string[]
  searchTerm: string
  onChange: (term: string) => void
}

const SearchView: FC<Props> = ({ suggestedSearchTerms, searchTerm, onChange }) => {
  return (
    <div className={styles.searchView}>
      <SearchBox searchTerm={searchTerm} onChange={onChange} />
      {suggestedSearchTerms.length > 0 && (
        <SearchSuggestionsView
          suggestedTerms={suggestedSearchTerms}
          selectedTerm={searchTerm}
          onSelect={(term) => onChange(term)}
        />
      )}
    </div>
  )
}

export default SearchView
