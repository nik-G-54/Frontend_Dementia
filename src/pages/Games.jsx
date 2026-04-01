import React from 'react';
import { Card, CardLabel, SectionTitle, MiniLabel } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';

export default function Games() {
  const games = [
    {
      id: 'memory-mosaic',
      title: 'Memory Mosaic',
      description: 'Recall the pattern of highlighted tiles in a 3x3 grid.',
      category: 'Visuospacial Memory',
      difficulty: 'Moderate',
      icon: '🧩',
      color: '#6d5cf7',
    },
    {
      id: 'word-garden',
      title: 'Word Garden',
      description: 'Type as many items in a specific category (animals, fruits) as you can in 60s.',
      category: 'Semantic Memory',
      difficulty: 'Moderate',
      icon: '🌿',
      color: '#1D9E75',
    },
    {
      id: 'path-finder',
      title: 'Path Finder',
      description: 'Connect numbered and lettered dots in an alternating sequence (1-A, 2-B...).',
      category: 'Executive Function',
      difficulty: 'Advanced',
      icon: '📍',
      color: '#3B8BD4',
    }
  ];

  return (
    <div className="w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Brain Fitness Suite</h1>
        <p className="text-[var(--color-text-secondary)]">Clinically-inspired cognitive micro-tests for your daily check-in.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="hover:border-[#6d5cf7]/50 transition-all cursor-pointer group hover:shadow-md h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${game.color}15`, color: game.color }}
              >
                {game.icon}
              </div>
              <Badge variant="default" className="bg-[var(--color-background-secondary)]">
                {game.difficulty}
              </Badge>
            </div>

            <CardLabel style={{ color: game.color }}>{game.category}</CardLabel>
            <SectionTitle className="text-lg group-hover:text-[#6d5cf7] transition-colors">{game.title}</SectionTitle>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">
              {game.description}
            </p>

            <button className="mt-6 w-full py-2.5 bg-[var(--color-background-secondary)] hover:bg-[#6d5cf7] hover:text-white rounded-lg text-sm font-medium transition-all text-[var(--color-text-primary)]">
              Start Activity
            </button>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <Card className="bg-[var(--color-background-info)]/30 border-[#85B7EB]">
          <SectionTitle>Why these activities?</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <MiniLabel className="block font-bold mb-2">Hippocampal Function</MiniLabel>
              <p className="text-xs text-[var(--color-text-secondary)]">Pattern recognition like Memory Mosaic directly engages the hippocampal region, often the first impacted in early cognitive decline.</p>
            </div>
            <div>
              <MiniLabel className="block font-bold mb-2">Semantic Fluency</MiniLabel>
              <p className="text-xs text-[var(--color-text-secondary)]">Word-based tasks measure the health of semantic networks, which help in retrieving language and concepts.</p>
            </div>
            <div>
              <MiniLabel className="block font-bold mb-2">Cognitive Flexibility</MiniLabel>
              <p className="text-xs text-[var(--color-text-secondary)]">Alternating task sets (like Path Finder) test the frontal lobes' executive control, crucial for daily decision-making.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
