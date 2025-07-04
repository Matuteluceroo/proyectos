import './InfoItem.css'

type InfoItemProps = {
  fieldName: string
  value: string | number
}

const InfoItem = ({ fieldName, value }: InfoItemProps) => (
  <div className="info-item">
    <strong>{fieldName}:</strong> <span>{value}</span>
  </div>
)

export default InfoItem
