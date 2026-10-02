'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { fetchAPI } from '@/lib/api';
import { Users, AlertTriangle, Building2, UserCheck, CheckCircle2, UserSquare2, Fingerprint } from 'lucide-react';

// --- CUSTOM NODES ---

const BlueprintNode = ({ data }: { data: any }) => {
  const isError = data.status === 'error';
  const isWarning = data.status === 'warning';
  
  let borderColor = 'rgba(56, 189, 248, 0.5)';
  let shadow = '0 0 15px rgba(56, 189, 248, 0.2)';
  
  if (isError) {
    borderColor = 'rgba(239, 68, 68, 0.8)';
    shadow = '0 0 20px rgba(239, 68, 68, 0.4)';
  } else if (isWarning) {
    borderColor = 'rgba(245, 158, 11, 0.8)';
    shadow = '0 0 15px rgba(245, 158, 11, 0.3)';
  }

  return (
    <div className="relative rounded-lg bg-[#0f172a] border-2 flex items-center p-3 min-w-[180px]" style={{ borderColor, boxShadow: shadow }}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-slate-400 border-none" />
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{data.group.replace('_', ' ')}</span>
          {isError && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
          {isWarning && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
          {!isError && !isWarning && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
        </div>
        <div className="text-sm font-bold text-sky-100">{data.label}</div>
        
        {Object.entries(data.details || {}).map(([key, val]: any) => (
           <div key={key} className="text-[10px] text-slate-300 mt-1 truncate max-w-[140px]">
             <span className="text-slate-500">{key}:</span> {val}
           </div>
        ))}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-sky-400 border-none" />
    </div>
  );
};

const nodeTypes = {
  blueprint: BlueprintNode,
};

export default function SystemMappingPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [stats, setStats] = useState<any>(null);
  const [missingMappings, setMissingMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAPI('/users/system/map/');
        
        setStats(data.stats);
        setMissingMappings(data.missing_mappings);

        // Group-based Layout Engine
        const layoutedNodes: Node[] = [];
        const layoutedEdges: Edge[] = [];

        // Definition of zones
        const zones = [
          { key: 'admission', title: 'ADMISSION ZONE', x: 50, groups: ['prospective_user', 'applicant_profile', 'application', 'seat'] },
          { key: 'academic', title: 'ACADEMIC ZONE', x: 1000, groups: ['student_user', 'student_profile', 'enrollment'] },
          { key: 'faculty', title: 'FACULTY & ADMIN ZONE', x: 1950, groups: ['department', 'faculty_user', 'faculty_profile', 'other_user'] }
        ];

        // Draw zone backgrounds
        zones.forEach(zone => {
           layoutedNodes.push({
             id: `zone_${zone.key}`,
             type: 'default',
             position: { x: zone.x - 20, y: -50 },
             data: { label: zone.title },
             style: { 
               width: (zone.groups.length * 220) + 40, 
               height: 1500, // Arbitrary large height
               backgroundColor: 'rgba(15, 23, 42, 0.4)',
               border: '1px dashed rgba(56, 189, 248, 0.2)',
               borderRadius: '16px',
               zIndex: -1,
               color: 'rgba(56, 189, 248, 0.5)',
               fontSize: '24px',
               fontWeight: '900',
               display: 'flex',
               alignItems: 'flex-start',
               justifyContent: 'center',
               paddingTop: '20px',
               pointerEvents: 'none'
             },
             draggable: false,
             selectable: false,
             zIndex: -1,
           });
        });

        // Group nodes by their type
        const groupedNodes: Record<string, any[]> = {};
        data.nodes.forEach((n: any) => {
          const g = n.data.group || 'other';
          if (!groupedNodes[g]) groupedNodes[g] = [];
          groupedNodes[g].push(n);
        });

        // Position nodes inside their respective zones/columns
        zones.forEach(zone => {
           let currentX = zone.x;
           zone.groups.forEach(groupKey => {
              const nodesInGroup = groupedNodes[groupKey] || [];
              let currentY = 50;
              
              nodesInGroup.forEach(n => {
                 layoutedNodes.push({
                    id: n.id,
                    type: 'blueprint',
                    position: { x: currentX, y: currentY },
                    data: n.data,
                 });
                 currentY += 120;
              });
              currentX += 220; // column width
           });
        });

        // Style edges
        data.edges.forEach((e: any) => {
           const isError = e.label === 'Missing' || e.animated;
           layoutedEdges.push({
              ...e,
              type: 'smoothstep',
              animated: true,
              style: { stroke: isError ? '#ef4444' : 'rgba(56, 189, 248, 0.4)', strokeWidth: 2 },
              markerEnd: {
                 type: MarkerType.ArrowClosed,
                 color: isError ? '#ef4444' : 'rgba(56, 189, 248, 0.4)',
              },
           });
        });

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback((_: any, node: Node) => {
     if (!node.id.startsWith('zone_')) {
        setSelectedNodeData(node.data);
     }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-[#020617]">
        <div className="flex flex-col items-center">
           <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mb-4"></div>
           <div className="text-sky-400 font-mono tracking-widest text-sm animate-pulse">GENERATING BLUEPRINT...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-[#020617] -m-6 p-6 rounded-tl-2xl overflow-hidden relative font-sans">
      {/* Top Stats Bar */}
      <div className="flex gap-4 mb-6 z-10 shrink-0">
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex-1 shadow-lg flex items-center">
           <div className="bg-sky-500/10 p-3 rounded-lg mr-4"><Users className="text-sky-400" size={24} /></div>
           <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Users</div>
              <div className="text-2xl font-black text-sky-100">{stats?.total_users || 0}</div>
           </div>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex-1 shadow-lg flex items-center">
           <div className="bg-emerald-500/10 p-3 rounded-lg mr-4"><UserCheck className="text-emerald-400" size={24} /></div>
           <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Students</div>
              <div className="text-2xl font-black text-emerald-100">{stats?.students || 0}</div>
           </div>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex-1 shadow-lg flex items-center">
           <div className="bg-purple-500/10 p-3 rounded-lg mr-4"><Building2 className="text-purple-400" size={24} /></div>
           <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Faculty</div>
              <div className="text-2xl font-black text-purple-100">{stats?.faculty || 0}</div>
           </div>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex-1 shadow-lg flex items-center">
           <div className="bg-orange-500/10 p-3 rounded-lg mr-4"><UserSquare2 className="text-orange-400" size={24} /></div>
           <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Prospective</div>
              <div className="text-2xl font-black text-orange-100">{stats?.prospective || 0}</div>
           </div>
        </div>
        <div className="bg-[#0f172a] border border-red-900/50 rounded-xl p-4 flex-1 shadow-lg flex items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
           <div className="bg-red-500/20 p-3 rounded-lg mr-4 z-10"><AlertTriangle className="text-red-400" size={24} /></div>
           <div className="z-10">
              <div className="text-red-300/80 text-xs font-bold uppercase tracking-wider">Missing Mappings</div>
              <div className="text-2xl font-black text-red-400">{stats?.missing_mappings || 0}</div>
           </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.1}
          maxZoom={1.5}
        >
          <Controls className="bg-slate-900 border-slate-700 fill-sky-400" />
          <MiniMap 
             nodeColor={(n) => n.data?.status === 'error' ? '#ef4444' : '#38bdf8'} 
             maskColor="rgba(2, 6, 23, 0.8)" 
             style={{ backgroundColor: '#0f172a' }}
          />
          <Background gap={40} size={1} color="rgba(56, 189, 248, 0.15)" />
        </ReactFlow>
      </div>

      {/* Detail Side Panel */}
      {selectedNodeData && (
         <div className="absolute top-24 right-6 bottom-6 w-80 bg-[#0f172a]/95 backdrop-blur-md border-l border-t border-b border-sky-500/30 rounded-l-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col z-50 transform transition-transform duration-300">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-tl-2xl">
               <h3 className="text-sky-400 font-mono font-bold tracking-wider flex items-center">
                  <Fingerprint size={16} className="mr-2" />
                  NODE INSPECTOR
               </h3>
               <button onClick={() => setSelectedNodeData(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
               <div className="mb-6">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Entity Type</div>
                  <div className="text-lg font-bold text-slate-200">{selectedNodeData.group.toUpperCase().replace('_', ' ')}</div>
               </div>

               <div className="mb-6">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Label / Identifier</div>
                  <div className="text-md text-sky-100">{selectedNodeData.label}</div>
               </div>

               <div className="mb-6">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Health Status</div>
                  <div className="flex items-center mt-1">
                     {selectedNodeData.status === 'error' && <><span className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></span> <span className="text-red-400 font-bold text-sm">Missing Mapping</span></>}
                     {selectedNodeData.status === 'warning' && <><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span> <span className="text-amber-400 font-bold text-sm">Warning</span></>}
                     {selectedNodeData.status === 'ok' && <><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> <span className="text-emerald-400 font-bold text-sm">Healthy</span></>}
                  </div>
               </div>

               {selectedNodeData.details && Object.keys(selectedNodeData.details).length > 0 && (
                  <div>
                     <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Properties</div>
                     <div className="bg-[#020617] rounded-lg p-3 space-y-2 border border-slate-800">
                        {Object.entries(selectedNodeData.details).map(([key, val]: any) => (
                           <div key={key}>
                              <div className="text-[10px] text-slate-500">{key}</div>
                              <div className="text-sm text-slate-300 font-medium">{val}</div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
}
