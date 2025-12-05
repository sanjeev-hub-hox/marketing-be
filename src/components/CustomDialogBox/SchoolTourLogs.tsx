import { Button, Dialog, DialogTitle, List, ListItem } from '@mui/material'

export function SchoolTourLogs(props: any) {
  const { onClose, selectedValue, open, data } = props

  const handleClose = () => {
    onClose(selectedValue)
  }

  const handleListItemClick = (value: string) => {
    onClose(value)
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Checklist Covered</DialogTitle>
      <List sx={{ pt: 0 }}>
        <ol>
          {data.map((val: any, ind: any) => (
            <li style={{ lineHeight: '40px' }} key={ind}>
              {val}
            </li>
          ))}
        </ol>
      </List>
      <Button variant='contained' onClick={handleClose}>
        Close
      </Button>
    </Dialog>
  )
}
