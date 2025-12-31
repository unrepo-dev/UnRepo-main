'use client';

import { ChevronRightIcon, FolderIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface FileTreeProps {
  repoData: any;
  onFileSelect?: (file: any) => void;
}

export default function FileTree({ repoData, onFileSelect }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  if (!repoData) {
    return (
      <div className="p-8 text-center text-gray-600">
        <p>No repository loaded</p>
        <p className="text-sm mt-2 text-gray-700">Enter a GitHub URL and click Verify</p>
      </div>
    );
  }

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const colorMap: Record<string, string> = {
      js: 'text-red-400',
      jsx: 'text-red-400',
      ts: 'text-red-500',
      tsx: 'text-red-500',
      json: 'text-red-300',
      md: 'text-gray-500',
      css: 'text-red-400',
      html: 'text-red-500',
      py: 'text-red-400',
      rs: 'text-red-600',
      go: 'text-red-500',
      java: 'text-red-400',
      rb: 'text-red-300',
      sol: 'text-red-600',
    };
    return colorMap[ext || ''] || 'text-gray-500';
  };

  const renderTree = (node: any, level: number = 0) => {
    if (!node) return null;

    const isExpanded = expandedFolders.has(node.path);

    return (
      <motion.div 
        key={node.path}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          whileHover={{ backgroundColor: 'rgba(127, 29, 29, 0.1)' }}
          className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-l-2 border-transparent hover:border-red-900/50 ${
            level > 0 ? `pl-${4 + level * 4}` : ''
          }`}
          style={{ paddingLeft: `${16 + level * 16}px` }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleFolder(node.path);
            } else if (onFileSelect) {
              onFileSelect(node);
            }
          }}
        >
          {node.type === 'directory' ? (
            <>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              </motion.div>
              <FolderIcon className="w-4 h-4 text-red-600" />
            </>
          ) : (
            <DocumentIcon className={`w-4 h-4 ${getFileIcon(node.name)} ml-4`} />
          )}
          <span className="text-sm text-gray-400 truncate">{node.name}</span>
          {node.size && node.type === 'file' && (
            <span className="text-xs text-gray-700 ml-auto">
              {(node.size / 1024).toFixed(1)}KB
            </span>
          )}
        </motion.div>
        {node.type === 'directory' && isExpanded && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child: any) => renderTree(child, level + 1))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="overflow-y-auto h-full custom-scrollbar">
      {repoData.fileTree ? renderTree(repoData.fileTree) : (
        <div className="p-4 text-gray-500 text-sm">Loading file tree...</div>
      )}
    </div>
  );
}
