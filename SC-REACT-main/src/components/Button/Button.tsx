import { forwardRef, useState, MouseEventHandler, ReactNode } from "react"
import "./Button.css"

type ButtonProps = {
  id?: string
  className?: string
  text?: string | ReactNode
  icon?: ReactNode
  onClick: () => void
  isHidden?: () => boolean
  title?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ id, className = "", text, icon, onClick, isHidden, title }, ref) => {
    const [isDisabled, setIsDisabled] = useState(false)

    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      if (!isDisabled) {
        setIsDisabled(true)
        onClick()
        setTimeout(() => setIsDisabled(false), 2000)
      }
    }

    return (
      <button
        ref={ref}
        id={id}
        type="button"
        className={`button ${className}`}
        onClick={handleClick}
        hidden={isHidden ? isHidden() : undefined}
        title={title}
        disabled={isDisabled}
      >
        {icon && <span className="button-icon">{icon}</span>}
        {text && <span className="button-text">{text}</span>}
      </button>
    )
  }
)

export default Button
