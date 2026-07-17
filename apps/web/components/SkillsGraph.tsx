'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const skillsData = {
  center: { id: 'python', label: 'Python', desc: 'Central runtime. Multi-threading, async tasks, performance tuning, and AI modeling SDK orchestrations.' },
  satellites: [
    { id: 'fastapi', label: 'FastAPI', angle: 0, distance: 130, desc: 'Async REST/SSE API framework, Pydantic data validations, dependency injections.' },
    { id: 'docker', label: 'Docker', angle: 45, distance: 130, desc: 'Containerization, Multi-stage builds, docker-compose orchestration profiles.' },
    { id: 'mongo', label: 'MongoDB', angle: 90, distance: 130, desc: 'Motor async collections queries, Atlas indexing, aggregations pipelines.' },
    { id: 'redis', label: 'Redis', angle: 135, distance: 130, desc: 'High-speed caching layers, distributed mutex lock operations, rate limiters.' },
    { id: 'langchain', label: 'LangChain', angle: 180, distance: 130, desc: 'Structured prompts formats, model chaining outputs, memory hooks.' },
    { id: 'rag', label: 'RAG Systems', angle: 225, distance: 130, desc: 'Semantic documents chunks search, vector namespaces isolation policies.' },
    { id: 'mcp', label: 'MCP Spec', angle: 270, distance: 130, desc: 'Model Context Protocol linking server system resources directly to LLMs.' },
    { id: 'vector-db', label: 'Vector DBs', angle: 315, distance: 130, desc: 'High-dimension vectors similarity indexing (Pinecone, Chroma, SQLite-vec).' }
  ]
};

export default function SkillsGraph() {
  const [hoveredNode, setHoveredNode] = useState<{ id: string; label: string; desc: string } | null>(null);

  // SVG Size parameters
  const size = 360;
  const centerCoord = size / 2;

  return (
    <section id="skills" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 font-mono">
      <div className="flex flex-col mb-16">
        <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase mb-3">03 // SKILLS_KERNEL</span>
        <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white">
          Distributed Skills Topology Graph
        </h2>
        <p className="text-zinc-500 text-xs mt-3 max-w-lg">
          Hover or touch any peripheral cluster node to check its systems integration details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Interactive SVG Node Diagram */}
        <div className="flex justify-center items-center relative">
          <svg 
            width={size} 
            height={size} 
            viewBox={`0 0 ${size} ${size}`} 
            className="w-full max-w-[360px] overflow-visible"
          >
            {/* Draw connecting lines first */}
            {skillsData.satellites.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              const x = centerCoord + node.distance * Math.cos(rad);
              const y = centerCoord + node.distance * Math.sin(rad);
              const isHovered = hoveredNode?.id === node.id;
              
              return (
                <line
                  key={`line-${node.id}`}
                  x1={centerCoord}
                  y1={centerCoord}
                  x2={x}
                  y2={y}
                  stroke={isHovered ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)'}
                  strokeWidth={isHovered ? 1.5 : 1}
                  strokeDasharray={isHovered ? 'none' : '4, 4'}
                  className="transition-colors duration-300"
                />
              );
            })}

            {/* Core Central Node */}
            <g
              onMouseEnter={() => setHoveredNode(skillsData.center)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <circle
                cx={centerCoord}
                cy={centerCoord}
                r="30"
                fill="#09090b"
                stroke="#3b82f6"
                strokeWidth="2"
                className="transition-all duration-300 group-hover:r-[34px] group-hover:stroke-blue-400"
              />
              <text
                x={centerCoord}
                y={centerCoord + 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                className="pointer-events-none font-mono"
              >
                Python
              </text>
            </g>

            {/* Satellite Nodes */}
            {skillsData.satellites.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              const x = centerCoord + node.distance * Math.cos(rad);
              const y = centerCoord + node.distance * Math.sin(rad);
              const isHovered = hoveredNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill="#09090b"
                    stroke={isHovered ? '#3b82f6' : '#27272a'}
                    strokeWidth="1.5"
                    className="transition-all duration-300 group-hover:r-[22px] group-hover:stroke-zinc-300"
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill={isHovered ? '#3b82f6' : '#a1a1aa'}
                    fontSize="7.5"
                    fontWeight="bold"
                    className="pointer-events-none font-mono"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic description console layout */}
        <div className="p-6 border border-white/5 bg-white/2 rounded-xl min-h-[160px] flex flex-col justify-center">
          {hoveredNode ? (
            <div>
              <span className="text-[10px] text-blue-400 tracking-wider font-semibold uppercase">Cluster: {hoveredNode.label}</span>
              <p className="text-zinc-300 text-xs mt-3 leading-relaxed">
                {hoveredNode.desc}
              </p>
            </div>
          ) : (
            <div className="text-center text-zinc-500 text-xs">
              <span>[Hover over peripheral network nodes to inspect system specifications]</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
