import React from 'react'
import { Select, MenuItem, InputLabel, FormControl, ListItemText, Checkbox } from '@mui/material'

const MultiSelectDropdown = ({
  dataField,
  fieldId,
  options,
  handleMulti,
  name,
  isRepeatable = false
}: {
  dataField: any
  fieldId: any
  options: any
  handleMulti: any
  name: any
  isRepeatable: boolean
}) => {
  const handleSelectAll = (event: { target: { checked: any } }) => {
    if (event.target.checked) {
      handleMulti(
        fieldId,
        options.map((option: { value: any }) => option.value),
        name,
        isRepeatable
      )

      // setSelectedOptions(options.map(option => option.value));
    } else {
      handleMulti(fieldId, [], name, isRepeatable)

      // setSelectedOptions([]);
    }
  }

  const handleSelect = (event: { target: { value: any } }) => {
    // setSelectedOptions(event.target.value);
    handleMulti(fieldId, event.target.value, name, isRepeatable)
  }

  return (
    <FormControl fullWidth>
      <InputLabel id='multi-select-dropdown-label'>Select Options</InputLabel>
      <Select
        labelId='multi-select-dropdown-label'
        id='multi-select-dropdown'
        multiple
        value={dataField || []}
        onChange={handleSelect}
        renderValue={selected => selected.join(', ')}
      >
        <MenuItem>
          <Checkbox
            indeterminate={dataField?.length > 0 && dataField?.length < options.length}
            checked={dataField?.length === options?.length}
            onChange={handleSelectAll}
          />
          <ListItemText primary='Select All' />
        </MenuItem>
        {options?.map((option: any, index: number) => (
          <MenuItem key={index} value={option.value}>
            <Checkbox checked={dataField?.includes(option.value)} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default MultiSelectDropdown
