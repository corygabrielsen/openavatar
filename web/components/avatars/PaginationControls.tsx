import styles from '../../styles/avatars/PaginationControls.module.scss'

interface Props {
  first: number
  itemsPerPage: number
  totalSupply: number
  onPrev: () => void
  onNext: () => void
  onChangeItemsPerPage: (itemsPerPage: number) => void
}

const PaginationControls: React.FC<Props> = ({
  first,
  itemsPerPage,
  totalSupply,
  onPrev,
  onNext,
  onChangeItemsPerPage,
}) => (
  <div className={styles.container}>
    <button className={styles.prev} onClick={onPrev} disabled={first === 0}>
      {'<'}
    </button>
    <span className={styles.range}>{`${first} - ${Math.min(totalSupply - 1, first + itemsPerPage - 1)}`}</span>
    <button className={styles.next} onClick={onNext} disabled={totalSupply > 0 && first + itemsPerPage >= totalSupply}>
      {'>'}
    </button>
    <span className={styles.total}>{/* {` of ${totalSupply}`} */}</span>
    <select value={itemsPerPage} onChange={(e) => onChangeItemsPerPage(Number(e.target.value))}>
      {[10, 20, 50, 100, 250].map((option) => (
        <option key={option} value={option}>
          {`Show ${option}`}
        </option>
      ))}
    </select>
  </div>
)

export default PaginationControls
