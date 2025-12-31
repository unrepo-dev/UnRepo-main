'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CodePanelProps {
  repoData: any;
  selectedFile?: any;
  onAskAboutFile?: (file: any, content: string) => void;
}

export default function CodePanel({ repoData, selectedFile, onAskAboutFile }: CodePanelProps) {
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFile && repoData?.repo) {
      fetchFileContent();
    }
  }, [selectedFile]);

  const fetchFileContent = async () => {
    if (!selectedFile || !repoData?.repo) return;

    setLoading(true);
    try {
      console.log('Fetching file:', {
        owner: repoData.repo.owner,
        repo: repoData.repo.name,
        path: selectedFile.path,
        branch: repoData.repo.branch,
      });

      const response = await fetch('/api/github/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: repoData.repo.owner,
          repo: repoData.repo.name,
          path: selectedFile.path,
          branch: repoData.repo.branch,
        }),
      });

      const data = await response.json();
      console.log('File response:', data);

      if (data.success && data.data?.content) {
        setFileContent(data.data.content);
      } else {
        setFileContent(`// Error: ${data.message || 'Failed to load file'}`);
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      setFileContent('// Error loading file: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  if (!repoData) {
    return (
      <div className="p-8 text-center text-gray-500 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-zinc-900 border border-red-900/30 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-600">No code selected</p>
        <p className="text-sm mt-2 text-gray-700">Select a file from the tree to view code</p>
      </div>
    );
  }

  // Show selected file content
  if (selectedFile) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 bg-zinc-950 border-b border-red-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-gray-400 font-mono">{selectedFile.name}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAskAboutFile && onAskAboutFile(selectedFile, fileContent)}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Ask AI
          </motion.button>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar bg-black">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading file...</p>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 text-sm font-mono text-gray-400 overflow-x-auto leading-relaxed">
                {fileContent.split('\n').map((line, i) => (
                  <div key={i} className="hover:bg-red-950/10 transition-colors">
                    <span className="inline-block w-12 text-right pr-4 text-red-900/50 select-none">
                      {i + 1}
                    </span>
                    <span className="text-gray-300">{line || ' '}</span>
                  </div>
                ))}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <h3 className="text-white font-semibold mb-2">{repoData.repo?.name}</h3>
          <p className="text-gray-400 text-sm">{repoData.repo?.description}</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-gray-500">⭐ {repoData.repo?.stars || 0}</span>
            <span className="text-gray-500">🍴 {repoData.repo?.forks || 0}</span>
            <span className="text-gray-500">📝 {repoData.repo?.language}</span>
          </div>
        </div>

        {repoData.analysis && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Analysis Results</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Code Quality</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${repoData.analysis.codeQuality}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold text-sm">{repoData.analysis.codeQuality}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Rug Risk</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500" 
                        style={{ width: `${repoData.analysis.rugPotential}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold text-sm">{repoData.analysis.rugPotential}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">AI Generated</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500" 
                        style={{ width: `${repoData.analysis.aiGenerated}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold text-sm">{repoData.analysis.aiGenerated}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Summary</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{repoData.analysis.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
