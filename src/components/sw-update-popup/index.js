import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import Button from 'components/button'
import event from 'utils/event'
import styles from './sw-update-popup.module.css'

function SWUpdatePoppup () {

  const [enable, setEnable] = useState(false)
  const [registration, setRegistration] = useState(null)

  useEffect(
    () => {
      event.on('sw-update', (registration) => {
        setEnable(true)
        setRegistration(registration)
      })
    },
    []
  )

  function reload () {
    if (!registration || !registration.waiting) return
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
    registration.waiting.postMessage({
      type: 'SKIP_WAITING'
    })
  }

  return (
    <div className={classNames(styles.wrapper, {
      [styles.enable]: enable
    })}>
      <div className={styles.content}>发现新内容!!</div>
      <Button size='small' onClick={reload}>刷新</Button>
    </div>
  )
}

export default SWUpdatePoppup