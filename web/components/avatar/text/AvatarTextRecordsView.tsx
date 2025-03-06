import styles from '../../../styles/avatar/text/AvatarTextRecordsView.module.scss'

interface Props {
  title?: string
  records: Record<string, string>
}

interface InterleavedItem {
  type: 'key' | 'value'
  content: string
  uniqueKey: string
}

const AvatarTextRecordsView = ({ title, records }: Props) => {
  // Create an intermediate array to interleave keys and values
  const interleavedItems: InterleavedItem[] = []

  Object.entries(records).forEach(([key, value], index) => {
    // Insert key
    interleavedItems.push({
      type: 'key',
      content: key,
      uniqueKey: `key-${index}`,
    })

    // Insert value
    interleavedItems.push({
      type: 'value',
      content: value,
      uniqueKey: `value-${index}`,
    })
  })

  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.grid}>
        {interleavedItems.map((item) => (
          <div key={item.uniqueKey} className={styles[item.type]}>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AvatarTextRecordsView
