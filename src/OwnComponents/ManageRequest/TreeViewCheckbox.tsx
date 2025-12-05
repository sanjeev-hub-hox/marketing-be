import React, { useState, forwardRef, ChangeEvent } from 'react'
import { Accordion, AccordionSummary, Typography, Grid, Collapse, Checkbox, Box } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem, TreeItemProps } from '@mui/x-tree-view/TreeItem'
import { useSpring, animated } from '@react-spring/web'

interface CustomTreeItemProps extends TreeItemProps {
  nodeId?: any
  expanded?: any
}
function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`
    }
  })

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  )
}

const CustomTreeItem = forwardRef((props: CustomTreeItemProps, ref: React.Ref<HTMLLIElement>) => (
  <TreeItem {...props} slots={{ groupTransition: TransitionComponent, ...props.slots }} ref={ref} />
))

CustomTreeItem.displayName = 'CustomTreeItem'

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

const treeData: TreeNode[] = [
  {
    id: '1',
    label: 'Academic',
    children: [
      {
        id: '2',
        label: 'Timetable',
        children: [
          {
            id: '5',
            label: 'Sub Sub Module',
            children: [
              { id: '9', label: 'Create' },
              { id: '10', label: 'Update' },
              { id: '11', label: 'Delete' },
              { id: '12', label: 'Demo1' },
              { id: '13', label: 'Demo2' }
            ]
          }
        ]
      },
      {
        id: '3',
        label: 'Division Allocation',
        children: [
          {
            id: '6',
            label: 'Sub Sub Module',
            children: [
              { id: '15', label: 'Create' },
              { id: '16', label: 'Update' },
              { id: '17', label: 'Delete' },
              { id: '18', label: 'Demo1' },
              { id: '19', label: 'Demo2' }
            ]
          }
        ]
      },
      {
        id: '4',
        label: 'House Allocation',
        children: [
          {
            id: '7',
            label: 'Sub Sub Module',
            children: [
              { id: '21', label: 'Create' },
              { id: '22', label: 'Update' },
              { id: '23', label: 'Delete' },
              { id: '24', label: 'Demo1' },
              { id: '25', label: 'Demo2' }
            ]
          }
        ]
      }
    ]
  }
]

export default function TreeViewCheckbox() {
  const [expanded, setExpanded] = useState<string | false>('panel1')
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [checked, setChecked] = useState<{ [key: string]: boolean }>({})

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false)
  }

  const handleExpandedItemsChange = (nodeIds: string[]) => {
    setExpandedItems(nodeIds)
  }

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>, nodeId: string) => {
    const { checked } = event.target
    const updatedCheckedState: { [key: string]: boolean } = {}
    const expandedNodeIds: string[] = []

    const updateChildrenCheckedState = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        updatedCheckedState[node.id] = checked
        expandedNodeIds.push(node.id)
        if (node.children) {
          updateChildrenCheckedState(node.children)
        }
      })
    }

    const node = findNodeById(treeData, nodeId)
    updatedCheckedState[nodeId] = checked
    expandedNodeIds.push(nodeId)

    if (node && node.children) {
      updateChildrenCheckedState(node.children)
    }

    setChecked(prev => ({
      ...prev,
      ...updatedCheckedState
    }))

    handleExpandedItemsChange(checked ? expandedNodeIds : expandedItems.filter(id => !expandedNodeIds.includes(id)))
  }

  const findNodeById = (nodes: TreeNode[], nodeId: string): TreeNode | undefined => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === nodeId) {
        return nodes[i]
      } else if (nodes[i].children) {
        const foundNode = findNodeById(nodes[i].children!, nodeId)
        if (foundNode) {
          return foundNode
        }
      }
    }

    return undefined
  }

  const renderTree = (nodes: TreeNode[]) =>
    nodes.map(node => (
      <CustomTreeItem
        key={node.id}
        itemId={node.id}
        nodeId={node.id}
        className='label'
        onClick={() =>
          handleExpandedItemsChange(
            expandedItems.includes(node.id) ? expandedItems.filter(id => id !== node.id) : [...expandedItems, node.id]
          )
        }
        label={
          <Box display='flex' alignItems='center'>
            <Checkbox
              color={!checked[node.id] ? 'default' : 'primary'}
              checked={!!checked[node.id]}
              onChange={event => handleCheckboxChange(event, node.id)}
              indeterminate={node.children ? node.children.some(child => !!checked[child.id]) : false}
            />
            <Typography
              style={{
                fontSize: '14px',
                fontWeight: checked[node.id] ? '600' : '400',
                color: '#1B1B1B'
              }}
            >
              {node.label}
            </Typography>
          </Box>
        }
        expanded={expandedItems.includes(node.id)}
      >
        {node.children && renderTree(node.children)}
      </CustomTreeItem>
    ))

  return (
    <>
      <Grid container spacing={2}>
        <Grid item md={3}>
          <Grid container spacing={2}>
            <Grid item md={12}>
              <Accordion
                expanded={expanded === 'panel1'}
                onChange={handleChange('panel1')}
                className='tree-vcard'
                sx={{ boxShadow: 'none', borderBottom: '0px' }}
              >
                <AccordionSummary aria-controls='panel1bh-content' id='panel1bh-header'>
                  <SimpleTreeView
                    aria-label='customized'
                    defaultExpandedItems={[]}
                    sx={{
                      overflowX: 'hidden',
                      flexGrow: 1,
                      maxWidth: 300
                    }}
                    expandedItems={expandedItems}
                    className='header-dropdown'
                  >
                    {renderTree(treeData)}
                  </SimpleTreeView>
                </AccordionSummary>
              </Accordion>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
