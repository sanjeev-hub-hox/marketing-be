import React, { useState } from 'react'
import { Menu, MenuItem, Button } from '@mui/material'

interface ActionMenuProps {
  onSendBack: () => void
  onApprove: () => void
  onReject: () => void
  onHold: () => void
  statusList: Array<{ id: number; name: string }>
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onSendBack, onApprove, onReject, onHold, statusList }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Button variant='contained' color='primary' onClick={handleActionClick}>
        Apply Action
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        <MenuItem
          onClick={() => {
            onSendBack()
            handleClose()
          }}
        >
          Send Back
        </MenuItem>
        {statusList.map((list: any) => (
          <MenuItem
            key={list.id}
            onClick={() => {
              if (list.status === 1) {
                onApprove()
              } else if (list.status === 2) {
                onHold()
              } else if (list.status === 3) {
                onReject()
              }
              handleClose()
            }}
          >
            {list.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default ActionMenu
