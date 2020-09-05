import React from 'react'
import classNames from 'classnames'
import styles from './button.module.css'

function Button (props) {
  const { children, onClick, className, size } = props

  const prefixCls = []

  // large => lg
  // small => sm
  switch (size) {
    case 'large':
      prefixCls.push(styles['btn-lg'])
      break;
    case 'small':
      prefixCls.push(styles['btn-sm'])
      break;
    default:
      break;
  }

  return  (
    <button
      className={classNames(styles.btn, prefixCls, className)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button