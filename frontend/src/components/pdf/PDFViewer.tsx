import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  RotateCw,
  Search,
} from 'lucide-react';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { useStudyStore } from '@/store/useStudyStore';

interface PDFViewerProps {
  url?: string;
  title?: string;
  initialPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  title = 'Document.pdf',
  initialPage = 1,
  totalPages: propTotalPages,
  onPageChange,
  className = '',
}) => {
  const { pdfCurrentPage, setPdfCurrentPage, pdfZoom, setPdfZoom } = useStudyStore();
  const [totalPages, setTotalPages] = useState<number>(propTotalPages || 12);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propTotalPages) {
      setTotalPages(propTotalPages);
    }
  }, [propTotalPages]);

  useEffect(() => {
    if (initialPage) {
      setCurrentPage(initialPage);
      setPdfCurrentPage(initialPage);
    }
  }, [initialPage]);

  // Synchronize when store changes (e.g. from topic card jump)
  useEffect(() => {
    if (pdfCurrentPage && pdfCurrentPage !== currentPage) {
      setCurrentPage(pdfCurrentPage);
    }
  }, [pdfCurrentPage]);

  const handlePagePrev = () => {
    if (currentPage > 1) {
      const p = currentPage - 1;
      setCurrentPage(p);
      setPdfCurrentPage(p);
      onPageChange?.(p);
    }
  };

  const handlePageNext = () => {
    if (currentPage < totalPages) {
      const p = currentPage + 1;
      setCurrentPage(p);
      setPdfCurrentPage(p);
      onPageChange?.(p);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    setPdfCurrentPage(page);
    onPageChange?.(page);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 15, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 15, 60));
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-[#1e222d] rounded-2xl shadow-xl border border-slate-700/60 overflow-hidden select-none ${className}`}
    >
      {/* Dark PDF Toolbar */}
      <div className="h-11 bg-[#181a20] border-b border-slate-800 px-3 flex items-center justify-between text-slate-300 text-xs">
        {/* Left: Document Title */}
        <div className="flex items-center gap-2 max-w-[200px] truncate">
          <span className="text-slate-500">≡</span>
          <span className="font-mono text-[11px] text-slate-300 font-medium truncate">
            {title}
          </span>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
          <button
            onClick={handlePagePrev}
            disabled={currentPage <= 1}
            className="p-1 hover:text-white disabled:opacity-30 transition-opacity"
            title="Previous Page"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="font-mono text-[11px] text-slate-200">
            {currentPage} <span className="text-slate-500">/</span> {totalPages}
          </span>
          <button
            onClick={handlePageNext}
            disabled={currentPage >= totalPages}
            className="p-1 hover:text-white disabled:opacity-30 transition-opacity"
            title="Next Page"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Right: Zoom & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 px-1.5 py-1 rounded-md border border-slate-800">
            <button
              onClick={handleZoomOut}
              className="p-0.5 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={12} />
            </button>
            <span className="font-mono text-[10px] text-slate-300 px-1">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-0.5 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={12} />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:text-white bg-slate-900/80 rounded-md border border-slate-800 transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Main PDF Body (Thumbnails + Page Canvas) */}
      <div className="flex-1 flex overflow-hidden bg-[#242836] min-h-[460px]">
        {/* Left Thumbnails Sidebar */}
        <div className="w-16 bg-[#161820] border-r border-slate-800 p-2 overflow-y-auto flex flex-col gap-2.5 shrink-0">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isSelected = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                className={`group flex flex-col items-center gap-1 transition-all ${
                  isSelected ? 'scale-105' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-11 h-15 rounded-xs bg-white text-[5px] text-slate-400 p-1 overflow-hidden shadow-xs border transition-colors ${
                    isSelected
                      ? 'border-brand-400 ring-2 ring-brand-500/50'
                      : 'border-slate-700 group-hover:border-slate-500'
                  }`}
                >
                  <div className="w-full h-1 bg-slate-200 mb-1" />
                  <div className="w-3/4 h-0.5 bg-slate-100 mb-0.5" />
                  <div className="w-full h-0.5 bg-slate-100 mb-0.5" />
                  <div className="w-1/2 h-0.5 bg-slate-100 mb-0.5" />
                  <div className="w-full h-1 bg-slate-200 mt-2 mb-1" />
                  <div className="w-5/6 h-0.5 bg-slate-100 mb-0.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {pageNum}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Page Canvas / Real PDF Embed */}
        <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <PencilLoader size="sm" message="Loading document..." />
            </div>
          ) : url ? (
            <div className="w-full h-full min-h-[640px] flex flex-col bg-white rounded-sm overflow-hidden shadow-2xl">
              <iframe
                src={`${url}#page=${currentPage}&zoom=${zoom}`}
                className="w-full h-full min-h-[640px] border-0"
                title={title}
              />
            </div>
          ) : (
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
              }}
              className="bg-white text-slate-900 rounded-sm shadow-2xl p-8 w-[540px] min-h-[720px] transition-transform duration-150 font-serif"
            >
              {/* Exam Paper Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Sant Gadge Baba Amravati University
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">
                  Winter 2025 Examination
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 uppercase">
                  Data Structures & Algorithms
                </div>
                <div className="text-[11px] text-slate-600">
                  (Semester - V) [Branch: Computer Science & Engineering]
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-700 font-mono mt-3 px-2">
                  <span>Time: 3 Hours</span>
                  <span>Max. Marks: 80</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-[10px] italic text-slate-600 mb-4 bg-slate-50 p-1.5 rounded-sm border border-slate-200">
                Note: 1. Attempt any Five questions. 2. All questions carry equal marks. 3. Assume suitable data if necessary.
              </div>

              {/* Dynamic Simulated Questions for Selected Page */}
              <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
                {currentPage === 1 ? (
                  <>
                    <div className="border-l-2 border-brand-500 pl-2">
                      <div className="flex justify-between font-bold">
                        <span>Q.1 (a) Explain different types of Arrays with suitable memory representation.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Describe one-dimensional, two-dimensional and multi-dimensional arrays along with row-major and column-major addressing formulas.
                      </p>
                    </div>

                    <div className="pl-2">
                      <div className="flex justify-between font-bold">
                        <span>(b) Write an algorithm to implement a Circular Queue using arrays.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Explain insertion (Enqueue) and deletion (Dequeue) operations with overflow and underflow conditions.
                      </p>
                    </div>

                    <div className="text-center font-bold text-[11px] my-2 text-slate-500">OR</div>

                    <div className="pl-2">
                      <div className="flex justify-between font-bold">
                        <span>Q.2 (a) Define Stack. Explain its applications in expression conversion.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Convert the following Infix expression to Postfix: <code className="bg-slate-100 px-1">A + B * (C - D) / E ^ F</code>
                      </p>
                    </div>
                  </>
                ) : currentPage === 2 ? (
                  <>
                    <div className="border-l-2 border-brand-500 pl-2">
                      <div className="flex justify-between font-bold">
                        <span>Q.3 (a) Explain Singly Linked List representation in memory.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Write a C function to insert a new node at the beginning and at the end of a Singly Linked List.
                      </p>
                    </div>

                    <div className="pl-2">
                      <div className="flex justify-between font-bold">
                        <span>(b) Compare Singly Linked List, Doubly Linked List and Circular Linked List.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                    </div>

                    <div className="text-center font-bold text-[11px] my-2 text-slate-500">OR</div>

                    <div className="pl-2">
                      <div className="flex justify-between font-bold">
                        <span>Q.4 (a) Write an algorithm to reverse a Doubly Linked List.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                    </div>
                  </>
                ) : currentPage === 3 ? (
                  <>
                    <div className="border-l-2 border-emerald-500 pl-2 bg-emerald-50/40 p-1.5 rounded-sm">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Q.5 (a) Explain Tree terminology: Root, Leaf node, Depth, Height and Degree.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-1">
                        What is a Binary Search Tree (BST)? Construct a BST for the sequence: <code className="bg-white px-1">45, 15, 79, 90, 10, 55, 12, 20</code>
                      </p>
                    </div>

                    <div className="pl-2 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>(b) Write recursive algorithms for Inorder, Preorder, and Postorder Traversals.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                    </div>

                    <div className="text-center font-bold text-[11px] my-2 text-slate-500">OR</div>

                    <div className="pl-2">
                      <div className="flex justify-between font-bold">
                        <span>Q.6 (a) Explain AVL Tree rotations (LL, RR, LR, RL) with diagrams.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pl-2">
                      <div className="flex justify-between font-bold">
                        <span>Q.7 (a) Explain Breadth First Search (BFS) and Depth First Search (DFS) on Graphs.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                    </div>
                    <div className="pl-2 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>(b) Find Minimum Spanning Tree using Prim's and Kruskal's Algorithms.</span>
                        <span className="font-mono">[8]</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Page Footer */}
              <div className="mt-12 text-center text-[10px] text-slate-400 font-mono border-t pt-3">
                --- Page {currentPage} of {totalPages} ---
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
