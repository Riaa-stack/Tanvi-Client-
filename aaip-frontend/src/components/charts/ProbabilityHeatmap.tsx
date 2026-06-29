import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { ProbabilityScore } from '@/types/models'

interface ProbabilityHeatmapProps {
  data: ProbabilityScore[]
}

export function ProbabilityHeatmap({ data }: ProbabilityHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const margin = { top: 30, right: 30, bottom: 80, left: 150 }
    const width = svgRef.current.parentElement?.clientWidth || 600 - margin.left - margin.right
    
    // Group by unit, then topic
    const topics = Array.from(new Set(data.map(d => d.topic_name)))
    // For heatmap, we can show year vs topic, or unit vs topic. The prompt mentions 2D matrix. 
    // Let's do Topic (Y axis) vs "Probability" (X axis as a single column) or Topic vs Something else.
    // Actually, a probability heatmap could just show a block per topic colored by probability score.
    // Let's create a grid.
    
    const height = Math.max(400, topics.length * 30)

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const y = d3.scaleBand()
      .range([0, height])
      .domain(topics)
      .padding(0.05)

    const x = d3.scaleBand()
      .range([0, width])
      .domain(['Probability Score'])
      .padding(0.05)

    const color = d3.scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain([0, 100])

    g.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain').remove()

    g.append('g')
      .attr('transform', `translate(0,-5)`)
      .call(d3.axisTop(x).tickSize(0))
      .select('.domain').remove()

    // Tooltip div
    const tooltip = d3.select('body').append('div')
      .style('opacity', 0)
      .attr('class', 'absolute bg-surface-card border border-default p-2 rounded shadow text-sm text-primary pointer-events-none z-50')

    g.selectAll()
      .data(data, (d: any) => d.topic_name)
      .enter()
      .append('rect')
      .attr('x', x('Probability Score') as number)
      .attr('y', d => y(d.topic_name) as number)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', d => color(d.probability))
      .style('stroke', 'var(--border-default)')
      .attr('rx', 4)
      .attr('ry', 4)
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(200).style('opacity', .9)
        tooltip.html(`<strong>${d.topic_name}</strong><br/>Probability: ${d.probability}%<br/>Confidence: ${d.confidence}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        tooltip.transition().duration(500).style('opacity', 0)
      })

    // Clean up tooltip on unmount
    return () => {
      tooltip.remove()
    }
  }, [data])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="text-sm font-sans" />
    </div>
  )
}
