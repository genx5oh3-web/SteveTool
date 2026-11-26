import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import worldAtlas from 'world-atlas/countries-110m.json';
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Radio,
  Gamepad2,
} from 'lucide-react';
import { VpnServer, VpnState, VpnProtocol, MapServerNode, ThemeMode } from '../types/vpn.ts';
import {
  DEFAULT_SERVERS,
  USER_ORIGIN_LOCATION,
  calculateGreatCircleDistanceKm,
  getMapServerNodes,
  getTunnelVisualState,
} from '../utils/vpnLogic.ts';

interface TunnelMapProps {
  vpnState: VpnState;
  selectedServer: VpnServer;
  onSelectServer: (server: VpnServer) => void;
  isKillSwitchEngaged: boolean;
  activeProtocol: VpnProtocol;
  theme: ThemeMode;
}

const MAP_WIDTH = 960;
const MAP_HEIGHT = 420;

export const TunnelMap: React.FC<TunnelMapProps> = ({
  vpnState,
  selectedServer,
  onSelectServer,
  isKillSwitchEngaged,
  activeProtocol,
  theme,
}) => {
  const isLight = theme === 'light';
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomGroupRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [zoomScale, setZoomScale] = useState<number>(1);
  const [hoveredNode, setHoveredNode] = useState<{
    node: MapServerNode;
    x: number;
    y: number;
  } | null>(null);

  const visualState = useMemo(
    () => getTunnelVisualState(vpnState, isKillSwitchEngaged),
    [vpnState, isKillSwitchEngaged]
  );

  const distanceKm = useMemo(
    () =>
      calculateGreatCircleDistanceKm(
        USER_ORIGIN_LOCATION.coordinates,
        selectedServer.coordinates
      ),
    [selectedServer]
  );

  // Build world landmass GeoJSON & D3 projection once
  const { countries, graticulePath, projection, pathGenerator } = useMemo(() => {
    const topo = worldAtlas as any;
    const countriesGeo = feature(topo, topo.objects.countries) as any;
    const filteredFeatures = (countriesGeo.features || []).filter(
      (f: any) => String(f.id) !== '010' // Omit Antarctica for tighter cyber-NOC framing
    );
    const habitableCollection = {
      type: 'FeatureCollection',
      features: filteredFeatures,
    } as any;

    const proj = d3
      .geoNaturalEarth1()
      .fitExtent(
        [
          [24, 18],
          [MAP_WIDTH - 24, MAP_HEIGHT - 18],
        ],
        habitableCollection
      );

    const gen = d3.geoPath().projection(proj);
    const grat = gen(d3.geoGraticule10()) || '';

    const countryPaths = filteredFeatures.map((f: any, idx: number) => ({
      id: f.id ?? idx,
      name: f.properties?.name || 'Region',
      d: gen(f) || '',
    }));

    return {
      countries: countryPaths,
      graticulePath: grat,
      projection: proj,
      pathGenerator: gen,
    };
  }, []);

  // Project user origin & all 16 global server nodes
  const originLonLat: [number, number] = [
    USER_ORIGIN_LOCATION.coordinates[1],
    USER_ORIGIN_LOCATION.coordinates[0],
  ];
  const originPoint = projection(originLonLat) || [200, 150];

  const mappedNodes = useMemo(() => getMapServerNodes(DEFAULT_SERVERS), []);
  const activeNode =
    mappedNodes.find((n) => n.server.id === selectedServer.id) || mappedNodes[0];
  const targetPoint = projection(activeNode.lonLat) || [500, 140];

  // Great-circle geodesic SVG path via D3 geoPath LineString
  const tunnelPathD = useMemo(() => {
    const lineFeature: any = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [originLonLat, activeNode.lonLat],
      },
    };
    return pathGenerator(lineFeature) || '';
  }, [pathGenerator, activeNode, originLonLat[0], originLonLat[1]]);

  // Midpoint of the geodesic arc (for Kill Switch severed indicator)
  const arcMidpoint = useMemo(() => {
    const interpolator = d3.geoInterpolate(originLonLat, activeNode.lonLat);
    return projection(interpolator(0.5)) || [
      (originPoint[0] + targetPoint[0]) / 2,
      (originPoint[1] + targetPoint[1]) / 2,
    ];
  }, [projection, activeNode, originLonLat[0], originLonLat[1], originPoint[0], originPoint[1], targetPoint[0], targetPoint[1]]);

  // Wire up D3 zoom & pan behavior
  useEffect(() => {
    if (!svgRef.current || !zoomGroupRef.current) return;

    const svgSelection = d3.select(svgRef.current);
    const groupSelection = d3.select(zoomGroupRef.current);

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [MAP_WIDTH, MAP_HEIGHT],
      ])
      .on('zoom', (event) => {
        groupSelection.attr('transform', event.transform.toString());
        setZoomScale(Math.round(event.transform.k * 10) / 10);
      });

    svgSelection.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;

    return () => {
      svgSelection.on('.zoom', null);
    };
  }, []);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .interrupt()
      .transition()
      .duration(220)
      .call(zoomBehaviorRef.current.scaleBy, 1.45);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .interrupt()
      .transition()
      .duration(220)
      .call(zoomBehaviorRef.current.scaleBy, 0.7);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .interrupt()
      .transition()
      .duration(220)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const strokeColor =
    visualState.themeColor === 'emerald'
      ? isLight ? '#059669' : '#10b981'
      : visualState.themeColor === 'amber'
        ? isLight ? '#d97706' : '#f59e0b'
        : visualState.themeColor === 'rose'
          ? isLight ? '#e11d48' : '#f43f5e'
          : isLight ? '#0284c7' : '#38bdf8';

  const secondaryColor =
    visualState.themeColor === 'emerald'
      ? isLight ? '#0891b2' : '#06b6d4'
      : visualState.themeColor === 'amber'
        ? isLight ? '#f59e0b' : '#fbbf24'
        : visualState.themeColor === 'rose'
          ? isLight ? '#f43f5e' : '#fb7185'
          : isLight ? '#475569' : '#64748b';

  return (
    <div
      data-testid="d3-tunnel-map"
      data-tunnel-state={visualState.lineStyle}
      className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none space-y-4 relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl ${
              visualState.themeColor === 'emerald'
                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-300 dark:ring-emerald-500/30'
                : visualState.themeColor === 'amber'
                  ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-500/30'
                  : visualState.themeColor === 'rose'
                    ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 ring-1 ring-rose-300 dark:ring-rose-500/30'
                    : 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400'
            }`}
          >
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-800 dark:text-slate-300">
                Global Tunnel Topology & Geodesic Route
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                {DEFAULT_SERVERS.length} Edge Nodes
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Interactive D3 world projection • Click any server marker to reroute your encrypted exit tunnel
            </p>
          </div>
        </div>

        {/* Live Tunnel State Pill */}
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              visualState.themeColor === 'emerald'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                : visualState.themeColor === 'amber'
                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                  : visualState.themeColor === 'rose'
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                visualState.themeColor === 'emerald'
                  ? 'bg-emerald-600 dark:bg-emerald-400 animate-pulse'
                  : visualState.themeColor === 'amber'
                    ? 'bg-amber-600 dark:bg-amber-400 animate-ping'
                    : visualState.themeColor === 'rose'
                      ? 'bg-rose-600 dark:bg-rose-500 animate-pulse'
                      : 'bg-cyan-600 dark:bg-cyan-400'
              }`}
            />
            <span>{visualState.statusLabel}</span>
          </span>
        </div>
      </div>

      {/* Interactive D3 Map Viewport */}
      <div className="relative rounded-2xl bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/90 overflow-hidden select-none">
        {/* Subtle radial atmospheric glow */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            visualState.isTunnelActive
              ? 'bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] opacity-100'
              : isKillSwitchEngaged
                ? 'bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.1)_0%,transparent_70%)] opacity-100'
                : 'bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06)_0%,transparent_70%)] opacity-100'
          }`}
        />

        {/* Top-Right D3 Zoom Controls */}
        <div className="absolute top-3 right-3 z-20 flex items-center space-x-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-700/80 p-1 rounded-xl shadow-md dark:shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in map"
            title="Zoom in"
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out map"
            title="Zoom out"
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            aria-label="Reset map zoom"
            title="Reset view"
            className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors flex items-center space-x-1 ${
              zoomScale > 1
                ? 'text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{zoomScale.toFixed(1)}x</span>
          </button>
        </div>

        {/* Top-Left Legend */}
        <div className="absolute top-3 left-3 z-20 hidden sm:flex items-center space-x-3 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-300 dark:border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 ring-2 ring-amber-400/30" />
            <span>Your Origin</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 ring-2 ring-emerald-400/30" />
            <span>Active Exit</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400" />
            <span>Gaming Node</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400/80" />
            <span>Edge Node</span>
          </span>
        </div>

        {/* D3 SVG Canvas */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="w-full h-[260px] sm:h-[340px] lg:h-[380px] cursor-grab active:cursor-grabbing block"
          role="img"
          aria-label={`Interactive world map showing VPN route from ${USER_ORIGIN_LOCATION.city} to ${selectedServer.city}, ${selectedServer.country}`}
        >
          <defs>

            {/* Tunnel Gradient from Origin to Selected Exit */}
            <linearGradient
              id="tunnel-arc-gradient"
              gradientUnits="userSpaceOnUse"
              x1={originPoint[0]}
              y1={originPoint[1]}
              x2={targetPoint[0]}
              y2={targetPoint[1]}
            >
              <stop offset="0%" stopColor={secondaryColor} />
              <stop offset="55%" stopColor={strokeColor} />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          <g ref={zoomGroupRef}>
            {/* Graticule Lat/Lng Grid */}
            <path
              d={graticulePath}
              fill="none"
              stroke={isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(30, 41, 59, 0.55)'}
              strokeWidth={0.6}
              strokeDasharray="2 3"
            />

            {/* World Countries */}
            <g>
              {countries.map((c: any) => {
                const isSelectedCountry =
                  c.name === selectedServer.country ||
                  (selectedServer.country === 'United States' &&
                    c.name === 'United States of America') ||
                  (selectedServer.country === 'United Kingdom' &&
                    c.name === 'United Kingdom');

                return (
                  <path
                    key={c.id}
                    d={c.d}
                    fill={
                      isSelectedCountry
                        ? visualState.isTunnelActive
                          ? isLight ? 'rgba(16, 185, 129, 0.24)' : 'rgba(16, 185, 129, 0.16)'
                          : isLight ? 'rgba(8, 145, 178, 0.18)' : 'rgba(6, 182, 212, 0.14)'
                        : isLight ? '#cbd5e1' : '#0f172a'
                    }
                    stroke={
                      isSelectedCountry
                        ? visualState.isTunnelActive
                          ? isLight ? 'rgba(5, 150, 105, 0.55)' : 'rgba(52, 211, 153, 0.45)'
                          : isLight ? 'rgba(2, 132, 199, 0.5)' : 'rgba(56, 189, 248, 0.4)'
                        : isLight ? '#94a3b8' : '#1e293b'
                    }
                    strokeWidth={isSelectedCountry ? 0.9 : 0.55}
                    className="transition-colors duration-300"
                  />
                );
              })}
            </g>

            {/* Geodesic VPN Tunnel Connection Line */}
            {tunnelPathD && (
              <g>
                {/* Soft Outer Vector Glow Halo when active or handshaking */}
                {(visualState.isTunnelActive ||
                  visualState.themeColor === 'amber' ||
                  isKillSwitchEngaged) && (
                  <>
                    <path
                      d={tunnelPathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={visualState.isTunnelActive ? 10 : 7}
                      strokeOpacity={visualState.isTunnelActive ? 0.12 : 0.09}
                      strokeLinecap="round"
                    />
                    <path
                      d={tunnelPathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={visualState.isTunnelActive ? 5 : 3.5}
                      strokeOpacity={visualState.isTunnelActive ? 0.28 : 0.2}
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* Base Connection Arc */}
                <path
                  d={tunnelPathD}
                  fill="none"
                  stroke={
                    visualState.isTunnelActive
                      ? 'url(#tunnel-arc-gradient)'
                      : strokeColor
                  }
                  strokeWidth={visualState.isTunnelActive ? 2.6 : 1.75}
                  strokeOpacity={
                    visualState.lineStyle === 'solid'
                      ? 0.95
                      : isKillSwitchEngaged
                        ? 0.75
                        : 0.55
                  }
                  strokeDasharray={
                    visualState.lineStyle === 'solid'
                      ? 'none'
                      : isKillSwitchEngaged
                        ? '4 6'
                        : '6 5'
                  }
                  strokeLinecap="round"
                />

                {/* Animated Flowing Packet Dash Overlay */}
                {visualState.animatePackets && (
                  <path
                    d={tunnelPathD}
                    fill="none"
                    stroke="#e0f2fe"
                    strokeWidth={2.2}
                    strokeDasharray="6 30"
                    strokeLinecap="round"
                    strokeOpacity={0.9}
                    className="animate-tunnel-flow"
                  />
                )}

                {/* Live Glowing Data Packets traveling along the exact geodesic SVG path */}
                {visualState.animatePackets && (
                  <>
                    <circle
                      r={5.2}
                      fill={visualState.isTunnelActive ? '#34d399' : '#fbbf24'}
                      opacity={0.35}
                    >
                      <animateMotion
                        dur={visualState.isTunnelActive ? '2.1s' : '1.4s'}
                        repeatCount="indefinite"
                        path={tunnelPathD}
                      />
                    </circle>
                    <circle r={3.2} fill="#ffffff">
                      <animateMotion
                        dur={visualState.isTunnelActive ? '2.1s' : '1.4s'}
                        repeatCount="indefinite"
                        path={tunnelPathD}
                      />
                    </circle>
                    <circle
                      r={2.8}
                      fill={visualState.isTunnelActive ? '#34d399' : '#fbbf24'}
                      opacity={0.9}
                    >
                      <animateMotion
                        dur={visualState.isTunnelActive ? '2.1s' : '1.4s'}
                        begin={visualState.isTunnelActive ? '1.05s' : '0.7s'}
                        repeatCount="indefinite"
                        path={tunnelPathD}
                      />
                    </circle>
                  </>
                )}

                {/* Kill Switch Severed Shield Indicator at Midpoint */}
                {isKillSwitchEngaged && (
                  <g transform={`translate(${arcMidpoint[0]}, ${arcMidpoint[1]})`}>
                    <circle
                      r={11}
                      fill="#4c0519"
                      stroke="#f43f5e"
                      strokeWidth={1.8}
                    />
                    <line
                      x1={-4.5}
                      y1={-4.5}
                      x2={4.5}
                      y2={4.5}
                      stroke="#fda4af"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <line
                      x1={4.5}
                      y1={-4.5}
                      x2={-4.5}
                      y2={4.5}
                      stroke="#fda4af"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>
            )}

            {/* User Origin Marker (San Francisco, US) */}
            <g
              transform={`translate(${originPoint[0]}, ${originPoint[1]})`}
              pointerEvents="none"
            >
              <circle
                r={13}
                fill={visualState.isTunnelActive ? '#10b981' : '#f59e0b'}
                opacity={0.18}
              >
                <animate
                  attributeName="r"
                  values="8;16;8"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.35;0.05;0.35"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </circle>
              {visualState.isTunnelActive && (
                <circle
                  r={8}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={1.2}
                  strokeOpacity={0.75}
                />
              )}
              <circle
                r={5.5}
                fill="#f59e0b"
                stroke={isLight ? '#f8fafc' : '#020617'}
                strokeWidth={1.8}
              />
              <g transform="translate(0, -15)">
                <rect
                  x={-56}
                  y={-13}
                  width={112}
                  height={16}
                  rx={5}
                  fill={isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(2, 6, 23, 0.9)'}
                  stroke={
                    visualState.isTunnelActive
                      ? isLight ? 'rgba(5, 150, 105, 0.65)' : 'rgba(16, 185, 129, 0.55)'
                      : isLight ? 'rgba(217, 119, 6, 0.65)' : 'rgba(245, 158, 11, 0.55)'
                  }
                  strokeWidth={0.9}
                />
                <text
                  textAnchor="middle"
                  y={-2}
                  fill={
                    visualState.isTunnelActive
                      ? isLight ? '#047857' : '#6ee7b7'
                      : isLight ? '#b45309' : '#fcd34d'
                  }
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  YOU ({USER_ORIGIN_LOCATION.city})
                </text>
              </g>
            </g>

            {/* All 16 Interactive Server Markers (Static centered hit-targets) */}
            {[...mappedNodes]
              .sort((a, b) =>
                a.server.id === selectedServer.id
                  ? 1
                  : b.server.id === selectedServer.id
                    ? -1
                    : 0
              )
              .map((node) => {
                const projected = projection(node.lonLat);
                if (!projected) return null;
                const [cx, cy] = projected;
                const isSelected = node.server.id === selectedServer.id;
                const isGaming = node.server.specialty === 'Gaming Low-Ping';

                const nodeFill = isSelected
                  ? visualState.isTunnelActive
                    ? isLight ? '#059669' : '#10b981'
                    : isKillSwitchEngaged
                      ? '#f43f5e'
                      : isLight ? '#0284c7' : '#06b6d4'
                  : isGaming
                    ? isLight ? '#9333ea' : '#c084fc'
                    : isLight ? '#0284c7' : '#38bdf8';

                return (
                  <g
                    key={node.server.id}
                    transform={`translate(${cx}, ${cy})`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select VPN node ${node.server.city}, ${node.server.country} (${node.server.ping} ms)`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectServer(node.server);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectServer(node.server);
                      }
                    }}
                    onMouseEnter={() => setHoveredNode({ node, x: cx, y: cy })}
                    onMouseLeave={() => setHoveredNode(null)}
                    onFocus={() => setHoveredNode({ node, x: cx, y: cy })}
                    onBlur={() => setHoveredNode(null)}
                    className="cursor-pointer focus:outline-none group"
                  >
                    {/* Centered hit target (5px radius keeps co-located nodes non-overlapping) */}
                    <circle r={5} fill="rgba(0,0,0,0)" />

                    {/* Visible Node Dot */}
                    <circle
                      r={isSelected ? 5.2 : 3.8}
                      fill={nodeFill}
                      stroke={isLight ? '#f8fafc' : '#020617'}
                      strokeWidth={1.4}
                      className="transition-all duration-200 group-hover:r-[5.5px]"
                    />
                  </g>
                );
              })}

            {/* Decorative Radar Pulse & Label Badge for Selected Server (pointer-events-none) */}
            {(() => {
              const projected = projection(activeNode.lonLat);
              if (!projected) return null;
              const [cx, cy] = projected;
              const badgeText = `${activeNode.server.city.toUpperCase()} • ${activeNode.server.ping}ms`;
              const badgeWidth = Math.max(96, badgeText.length * 5.8 + 16);
              const activeFill = visualState.isTunnelActive
                ? isLight ? '#059669' : '#10b981'
                : isKillSwitchEngaged
                  ? '#f43f5e'
                  : isLight ? '#0284c7' : '#06b6d4';

              return (
                <g transform={`translate(${cx}, ${cy})`} pointerEvents="none">
                  <circle r={15} fill={activeFill} opacity={0.22}>
                    <animate
                      attributeName="r"
                      values="8;19;8"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.4;0.04;0.4"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    r={8.5}
                    fill="none"
                    stroke={activeFill}
                    strokeWidth={1.3}
                    strokeOpacity={0.75}
                  />
                  <g transform="translate(0, 18)">
                    <rect
                      x={-badgeWidth / 2}
                      y={-9}
                      width={badgeWidth}
                      height={17}
                      rx={5}
                      fill={isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(2, 6, 23, 0.92)'}
                      stroke={activeFill}
                      strokeWidth={1}
                    />
                    <text
                      textAnchor="middle"
                      y={2.5}
                      fill={isLight ? '#0f172a' : '#f8fafc'}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {badgeText}
                    </text>
                  </g>
                </g>
              );
            })()}
          </g>
        </svg>

        {/* Interactive Hover Tooltip Card */}
        {hoveredNode && (
          <div
            className="pointer-events-none absolute z-30 bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 border border-cyan-300 dark:border-cyan-500/40 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-md text-xs font-mono animate-in fade-in duration-150"
          >
            <div className="flex items-center space-x-2">
              <span className="text-base">{hoveredNode.node.server.flag}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {hoveredNode.node.server.city}, {hoveredNode.node.server.country}
              </span>
              {hoveredNode.node.server.specialty === 'Gaming Low-Ping' && (
                <span className="px-1.5 py-0.5 text-[9px] rounded bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 flex items-center space-x-1">
                  <Gamepad2 className="w-2.5 h-2.5" />
                  <span>Gaming</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              <span>
                Ping:{' '}
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {hoveredNode.node.server.ping} ms
                </strong>
              </span>
              <span>•</span>
              <span>
                Load:{' '}
                <strong className="text-slate-900 dark:text-slate-200">
                  {hoveredNode.node.server.load}%
                </strong>
              </span>
              <span>•</span>
              <span className="text-cyan-700 dark:text-cyan-400">
                {hoveredNode.node.server.id === selectedServer.id
                  ? 'Active Exit'
                  : 'Click to Connect'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Route Telemetry Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-300">
            <Navigation className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              Origin: {USER_ORIGIN_LOCATION.flag} {USER_ORIGIN_LOCATION.city}
            </span>
          </span>
          <span className="text-slate-400 dark:text-slate-600">→</span>
          <span className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-300">
            {visualState.isTunnelActive ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : isKillSwitchEngaged ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            ) : (
              <Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            )}
            <span>
              Exit: {selectedServer.flag} {selectedServer.city},{' '}
              {selectedServer.country}
            </span>
          </span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="text-cyan-700 dark:text-cyan-300">
            Geodesic Span: {distanceKm.toLocaleString()} km
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            {visualState.isTunnelActive
              ? `${activeProtocol} Encrypted Hop (${selectedServer.ip})`
              : 'Preview Mode — Connect VPN to Encrypt Hop'}
          </span>
        </div>
      </div>
    </div>
  );
};
