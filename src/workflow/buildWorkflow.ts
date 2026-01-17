import type { Node, Edge } from 'reactflow'
import type { WorkflowJson } from './types'

export function buildWorkflow(workflow: WorkflowJson) {
  const layout = calculateLayout(workflow)

  const nodes: Node[] = workflow.nodes.map((node) => {
    const position = layout.get(node.id) || { x: 250, y: 100 }
    const isCondition = node.type === 'condition'
    
    return {
      id: node.id,
      type: node.type === 'input' ? 'input' : 'default',
      data: {
        label: node.label
      },
      position,
      style: {
        width: isCondition ? 200 : 220,
        height: isCondition ? 100 : 60,
        fontSize: isCondition ? 12 : 13,
        fontWeight: 500,
        padding: isCondition ? '20px' : '10px',
        border: isCondition ? '3px solid #ff9800' : '2px solid #007bff',
        borderRadius: isCondition ? 8 : 8,
        backgroundColor: isCondition ? '#fff3e0' : '#ffffff',
        clipPath: isCondition ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }
    }
  })

  const edges: Edge[] = workflow.edges.map((edge, index) => ({
    id: `e-${index}`,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: true,
    type: 'smoothstep',
    style: { 
      stroke: edge.label ? '#ff9800' : '#007bff', 
      strokeWidth: 2 
    },
    labelStyle: { 
      fontSize: 11, 
      fontWeight: 'bold',
      fill: '#ff9800'
    },
    labelBgStyle: { 
      fill: '#ffffff',
      fillOpacity: 0.95,
      rx: 4,
      ry: 4
    }
  }))

  return { nodes, edges }
}

function calculateLayout(workflow: WorkflowJson): Map<string, { x: number; y: number }> {
  const layout = new Map<string, { x: number; y: number }>()
  
  // Construir grafo de adjacência
  const outgoing = new Map<string, string[]>()
  const incoming = new Map<string, string[]>()
  
  workflow.nodes.forEach(node => {
    outgoing.set(node.id, [])
    incoming.set(node.id, [])
  })
  
  workflow.edges.forEach(edge => {
    outgoing.get(edge.source)?.push(edge.target)
    incoming.get(edge.target)?.push(edge.source)
  })

  // Encontrar nó inicial
  let startNode = workflow.nodes.find(node => 
    node.type === 'input' || (incoming.get(node.id)?.length || 0) === 0
  )
  
  if (!startNode) {
    startNode = workflow.nodes[0]
  }

  if (!startNode) {
    return layout
  }

  // Calcular níveis usando BFS
  const levels = new Map<string, number>()
  const queue: string[] = [startNode.id]
  levels.set(startNode.id, 0)
  const visited = new Set<string>()
  
  while (queue.length > 0) {
    const nodeId = queue.shift()!
    if (visited.has(nodeId)) continue
    visited.add(nodeId)
    
    const currentLevel = levels.get(nodeId)!
    const children = outgoing.get(nodeId) || []
    
    children.forEach(childId => {
      if (!levels.has(childId)) {
        levels.set(childId, currentLevel + 1)
        queue.push(childId)
      }
    })
  }

  // Agrupar nodes por nível
  const nodesByLevel = new Map<number, string[]>()
  const maxLevel = Math.max(0, ...Array.from(levels.values()))
  
  for (let i = 0; i <= maxLevel; i++) {
    nodesByLevel.set(i, [])
  }
  
  levels.forEach((level, nodeId) => {
    nodesByLevel.get(level)!.push(nodeId)
  })

  // Configurações
  const VERTICAL_SPACING = 160
  const HORIZONTAL_SPACING = 280
  const BASE_X = 400
  const START_Y = 80

  // Calcular largura necessária para cada subárvore
  function calculateSubtreeWidth(nodeId: string, memo = new Map<string, number>()): number {
    if (memo.has(nodeId)) return memo.get(nodeId)!
    
    const children = outgoing.get(nodeId) || []
    const currentNode = workflow.nodes.find(n => n.id === nodeId)
    const isCondition = currentNode?.type === 'condition'
    
    if (children.length === 0) {
      memo.set(nodeId, 1)
      return 1
    }
    
    if (isCondition && children.length > 1) {
      // Condição: soma das larguras dos filhos
      const totalWidth = children.reduce((sum, childId) => {
        return sum + calculateSubtreeWidth(childId, memo)
      }, 0)
      memo.set(nodeId, totalWidth)
      return totalWidth
    } else {
      // Normal: largura do maior filho
      const maxWidth = Math.max(...children.map(childId => calculateSubtreeWidth(childId, memo)))
      memo.set(nodeId, maxWidth)
      return maxWidth
    }
  }

  const widthMemo = new Map<string, number>()
  calculateSubtreeWidth(startNode.id, widthMemo)

  // Posicionar nodes
  const positioned = new Set<string>()
  
  function positionNode(nodeId: string, x: number, level: number) {
    if (positioned.has(nodeId)) return
    
    const y = START_Y + level * VERTICAL_SPACING
    const currentNode = workflow.nodes.find(n => n.id === nodeId)
    const children = outgoing.get(nodeId) || []
    const isCondition = currentNode?.type === 'condition'
    
    if (children.length === 0) {
      // Nó folha
      layout.set(nodeId, { x, y })
      positioned.add(nodeId)
      return
    }
    
    if (isCondition && children.length > 1) {
      // Condição com múltiplos filhos
      const childWidths = children.map(childId => widthMemo.get(childId) || 1)
      const totalWidth = childWidths.reduce((a, b) => a + b, 0)
      const totalSpacing = totalWidth * HORIZONTAL_SPACING
      
      let currentX = x - totalSpacing / 2
      const childXPositions: number[] = []
      
      children.forEach((childId, idx) => {
        const childWidth = childWidths[idx]
        const childCenterOffset = (childWidth * HORIZONTAL_SPACING) / 2
        const childX = currentX + childCenterOffset
        
        const childLevel = levels.get(childId) ?? level + 1
        positionNode(childId, childX, childLevel)
        
        childXPositions.push(childX)
        currentX += childWidth * HORIZONTAL_SPACING
      })
      
      // Centralizar node condicional
      const avgX = childXPositions.reduce((a, b) => a + b, 0) / childXPositions.length
      layout.set(nodeId, { x: avgX, y })
      positioned.add(nodeId)
      
    } else {
      // Node normal - filho diretamente abaixo
      layout.set(nodeId, { x, y })
      positioned.add(nodeId)
      
      children.forEach(childId => {
        const childLevel = levels.get(childId) ?? level + 1
        positionNode(childId, x, childLevel)
      })
    }
  }

  // Posicionar a partir da raiz
  positionNode(startNode.id, BASE_X, 0)

  // Posicionar nodes desconectados
  let orphanX = BASE_X + 600
  workflow.nodes.forEach(node => {
    if (!positioned.has(node.id)) {
      const level = levels.get(node.id) || 0
      const y = START_Y + level * VERTICAL_SPACING
      layout.set(node.id, { x: orphanX, y })
      positioned.add(node.id)
      orphanX += HORIZONTAL_SPACING
    }
  })

  return layout
}
