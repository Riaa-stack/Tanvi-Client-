import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DependencyGraphProps {
  data: {
    nodes: Array<{ id: string; group: number; label: string }>
    links: Array<{ source: string; target: string; value: number }>
  }
}

export function DependencyGraph({ data }: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.nodes || data.nodes.length === 0) return

    const width = svgRef.current.parentElement?.clientWidth || 800
    const height = 600

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    svg.attr('width', width).attr('height', height)

    const color = d3.scaleOrdinal(d3.schemeCategory10)

    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // Arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20) // distance from center of node
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'var(--border-strong)')

    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', 'var(--border-strong)')
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('marker-end', 'url(#arrow)')

    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', d => color(d.group.toString()))
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )

    node.append('title')
      .text(d => d.label)

    const label = svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter().append('text')
      .attr('dy', 20)
      .attr('dx', -15)
      .attr('font-size', '12px')
      .attr('fill', 'var(--text-primary)')
      .text(d => d.label)

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
    })

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }
    
    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }
    
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

  }, [data])

  return (
    <div className="w-full h-[600px] border border-default rounded-md bg-surface-card overflow-hidden">
      <svg ref={svgRef} className="w-full h-full font-sans" />
    </div>
  )
}
