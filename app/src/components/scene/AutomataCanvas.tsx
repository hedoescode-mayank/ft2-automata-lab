import { useState, useRef, type MouseEvent } from 'react';
import { useStore } from '../../store/useStore';
import type { State } from '../../core/automata/types';

export const AutomataCanvas = () => {
  const { automaton, updateStatePosition, addTransition, updateStateProperties } = useStore();
  
  const [draggingState, setDraggingState] = useState<string | null>(null);
  const [drawingEdge, setDrawingEdge] = useState<{ from: string, toX: number, toY: number } | null>(null);
  
  // Pan and Zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [panning, setPanning] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  const getMouseCoords = (e: MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d
    };
  };

  const handlePointerDown = (e: MouseEvent) => {
    if ((e.target as Element).tagName === 'svg') {
      setPanning(true);
    }
  };

  const handlePointerMove = (e: MouseEvent) => {
    if (panning) {
      setPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
    
    if (draggingState) {
      const coords = getMouseCoords(e);
      updateStatePosition(draggingState, coords.x, coords.y);
    }

    if (drawingEdge) {
      const coords = getMouseCoords(e);
      setDrawingEdge(prev => prev ? { ...prev, toX: coords.x, toY: coords.y } : null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setPanning(false);
    
    if (drawingEdge) {
      const coords = getMouseCoords(e);
      // Find a state within radius 24 (or a bit more for generous hit box)
      const targetState = automaton.states.find(s => {
        const dx = s.x - coords.x;
        const dy = s.y - coords.y;
        return Math.sqrt(dx*dx + dy*dy) <= 30;
      });

      if (targetState && targetState.id !== drawingEdge.from) {
        const symbols = prompt("Enter transition symbols (comma separated, use 'e' for ε):", "0");
        if (symbols) {
          const parsed = symbols.split(',').map(s => s.trim().replace('e', 'ε')).filter(Boolean);
          if (parsed.length > 0) {
            addTransition(drawingEdge.from, targetState.id, parsed);
          }
        }
      }
    }

    setDraggingState(null);
    setDrawingEdge(null);
  };

  const handleStateMouseDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
    
    if (e.shiftKey) {
      // Start drawing edge
      const state = automaton.states.find(s => s.id === id)!;
      setDrawingEdge({ from: id, toX: state.x, toY: state.y });
    } else {
      setDraggingState(id);
    }
  };

  const handleStateMouseUp = (_e: React.PointerEvent) => {
    // Left empty because edge dropping is handled on SVG level now
  };

  const handleStateDoubleClick = (e: React.MouseEvent, state: State) => {
    e.stopPropagation();
    const action = prompt("Type 'start' to toggle initial, 'final' to toggle accepting, or enter a new label:", state.label);
    if (!action) return;
    
    if (action.toLowerCase() === 'start') {
      updateStateProperties(state.id, { initial: !state.initial });
    } else if (action.toLowerCase() === 'final') {
      updateStateProperties(state.id, { accepting: !state.accepting });
    } else {
      updateStateProperties(state.id, { label: action });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.1, Math.min(3, prev - e.deltaY * 0.001)));
  };

  return (
    <svg 
      ref={svgRef}
      className="absolute inset-0 w-full h-full bg-slate-900/50"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        
        {/* Render Edges */}
        {automaton.transitions.map(t => {
          const fromState = automaton.states.find(s => s.id === t.from);
          const toState = automaton.states.find(s => s.id === t.to);
          if (!fromState || !toState) return null;
          
          const isSelfLoop = fromState.id === toState.id;
          
          if (isSelfLoop) {
            return (
              <g key={t.id}>
                <path 
                  d={`M ${fromState.x - 10} ${fromState.y - 20} C ${fromState.x - 40} ${fromState.y - 80}, ${fromState.x + 40} ${fromState.y - 80}, ${fromState.x + 10} ${fromState.y - 20}`}
                  fill="none" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)"
                />
                <text x={fromState.x} y={fromState.y - 60} fill="#94a3b8" fontSize="12" textAnchor="middle">
                  {t.symbols.join(', ')}
                </text>
              </g>
            );
          }

          const dx = toState.x - fromState.x;
          const dy = toState.y - fromState.y;
          const len = Math.sqrt(dx*dx + dy*dy);
          // Offset to edge of circle (r=24)
          const nx = len ? dx/len : 0;
          const ny = len ? dy/len : 0;
          const startX = fromState.x + nx*24;
          const startY = fromState.y + ny*24;
          const endX = toState.x - nx*24;
          const endY = toState.y - ny*24;

          return (
            <g key={t.id}>
              <line 
                x1={startX} y1={startY} 
                x2={endX} y2={endY} 
                stroke="#475569" strokeWidth="2" 
                markerEnd="url(#arrow)"
              />
              <text x={(startX + endX)/2} y={(startY + endY)/2 - 10} fill="#94a3b8" fontSize="12" textAnchor="middle">
                {t.symbols.join(', ')}
              </text>
            </g>
          );
        })}

        {/* Drawing Edge */}
        {drawingEdge && (
          <line 
            x1={automaton.states.find(s => s.id === drawingEdge.from)!.x}
            y1={automaton.states.find(s => s.id === drawingEdge.from)!.y}
            x2={drawingEdge.toX} y2={drawingEdge.toY}
            stroke="#22d3ee" strokeWidth="2" strokeDasharray="5,5"
          />
        )}

        {/* Render States */}
        {automaton.states.map(s => (
          <g 
            key={s.id} 
            transform={`translate(${s.x}, ${s.y})`} 
            className="cursor-move"
            onPointerDown={(e) => handleStateMouseDown(e, s.id)}
            onPointerUp={(e) => handleStateMouseUp(e)}
            onDoubleClick={(e) => handleStateDoubleClick(e, s)}
          >
            {s.initial && (
              <path d="M -50 0 L -24 0" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-blue)" />
            )}
            <circle r="24" fill="#1e293b" stroke={s.initial ? "#3b82f6" : "#475569"} strokeWidth="2" />
            {s.accepting && <circle r="20" fill="none" stroke="#475569" strokeWidth="1" />}
            <text textAnchor="middle" dy="5" fill="#f1f5f9" fontSize="14" className="select-none font-medium pointer-events-none">{s.label}</text>
          </g>
        ))}
        
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
        </defs>
      </g>
    </svg>
  );
};
