import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { shortName, isMetro } from '../../utils/regionMap';

/**
 * D3-geo 코로플레스 지도
 * @param {Object} topoData  - korea_topo.json
 * @param {Object} valueMap  - { '서울특별시': number, ... }
 * @param {string} colorScheme - 'blue' | 'orange'
 * @param {Function} onRegionClick
 * @param {string} selectedRegion
 * @param {Function} formatValue
 */
export default function KoreaMap({
  topoData,
  valueMap = {},
  colorScheme = 'blue',
  onRegionClick,
  selectedRegion,
  formatValue,
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!topoData || !svgRef.current) return;

    const objectKey = Object.keys(topoData.objects)[0];
    const geojson = topojson.feature(topoData, topoData.objects[objectKey]);

    const container = svgRef.current.parentElement;
    const W = container.clientWidth || 480;
    const H = Math.round(W * 1.1);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', W).attr('height', H);

    // 지도 투영
    const projection = d3.geoMercator().fitSize([W, H], geojson);
    const path = d3.geoPath().projection(projection);

    // 색상 스케일
    const values = Object.values(valueMap).filter(v => v != null && v > 0);
    const maxVal = values.length ? d3.max(values) : 1;

    const colorScale = colorScheme === 'orange'
      ? d3.scaleSequential([0, maxVal], d3.interpolateOranges)
      : d3.scaleSequential([0, maxVal], d3.interpolateBlues);

    // 지역 그리기
    svg.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const name = d.properties.name;
        const val = valueMap[name];
        if (!val) return '#e5e7eb';
        return colorScale(val);
      })
      .attr('stroke', d => {
        return d.properties.name === selectedRegion ? '#E85D24' : '#fff';
      })
      .attr('stroke-width', d => d.properties.name === selectedRegion ? 2.5 : 0.8)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        const name = d.properties.name;
        const val = valueMap[name];
        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          name,
          value: val,
        });
        d3.select(event.currentTarget)
          .attr('stroke', '#E85D24')
          .attr('stroke-width', 2);
      })
      .on('mouseleave', (event, d) => {
        setTooltip(null);
        const isSelected = d.properties.name === selectedRegion;
        d3.select(event.currentTarget)
          .attr('stroke', isSelected ? '#E85D24' : '#fff')
          .attr('stroke-width', isSelected ? 2.5 : 0.8);
      })
      .on('click', (event, d) => {
        onRegionClick?.(d.properties.name);
      });

    // 시도 이름 레이블
    svg.selectAll('text')
      .data(geojson.features)
      .enter()
      .append('text')
      .attr('transform', d => {
        const centroid = path.centroid(d);
        return `translate(${centroid})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', W < 400 ? 8 : 10)
      .attr('fill', d => {
        const name = d.properties.name;
        const val = valueMap[name];
        if (!val) return '#6b7280';
        return val > maxVal * 0.6 ? '#fff' : '#374151';
      })
      .attr('pointer-events', 'none')
      .text(d => shortName(d.properties.name));

  }, [topoData, valueMap, colorScheme, selectedRegion]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full" />
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl z-10"
          style={{ left: tooltip.x + 12, top: tooltip.y - 32, minWidth: 120 }}
        >
          <p className="font-semibold">{tooltip.name}</p>
          <p className="text-gray-300 mt-0.5">
            {tooltip.value != null ? (formatValue ? formatValue(tooltip.value) : tooltip.value.toLocaleString()) : '데이터 없음'}
          </p>
        </div>
      )}
    </div>
  );
}
