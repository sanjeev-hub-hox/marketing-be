import { Autocomplete, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

export type ListObject = {
  label: string
  value: string
}

type PropList = {
  options: ListObject[]
  selectedValue: ListObject
  onChange?: (event: any, newValue: any) => void
  TextFieldLabel: string
  TextFieldName: string
}

export function AutoCompleteSearch({ options, selectedValue, onChange, TextFieldLabel, TextFieldName }: PropList) {
  const [selectedRenderVal, setSelectedRender] = useState(selectedValue)
  useEffect(() => {
    setSelectedRender(selectedValue)
  }, [selectedValue])

  return (
    <Autocomplete
      disablePortal
      id='combo-box-demo'
      fullWidth
      options={options}
      value={selectedValue && { ...selectedRenderVal }}
      defaultValue={selectedValue && { ...selectedRenderVal }}
      onChange={onChange}
      renderOption={(props, option: ListObject) => {
        return (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )
      }}
      renderInput={(params: any) => <TextField {...params} label={TextFieldLabel} name={TextFieldName} />}
    />
  )
}
