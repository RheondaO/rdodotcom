import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

interface ContentCreationSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function ContentCreationSection({ selectedDate, isReadOnly = false }: ContentCreationSectionProps) {
  // Fetch mini-game blocks from API
  const { data: miniGameBlocks = [], isLoading: miniGameBlocksLoading } = useQuery({
    queryKey: ['/api/mini-game-blocks'],
    select: (data: any[]) => data || []
  });

  // Fetch mini-game designs from API
  const { data: miniGameDesigns = [], isLoading: miniGameDesignsLoading } = useQuery({
    queryKey: ['/api/mini-game-designs'],
    select: (data: any[]) => data || []
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Content Creation & Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {miniGameBlocksLoading ? "Loading content..." : "No content available. Connect to database to see content creation data."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}