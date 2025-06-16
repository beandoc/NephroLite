
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAiSuggestedTagsAction } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface AiTagSuggesterProps {
  onTagsSuggested: (tags: string[]) => void;
  currentTags: string[];
}

export function AiTagSuggester({ onTagsSuggested, currentTags }: AiTagSuggesterProps) {
  const [inputText, setInputText] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestTags = async () => {
    if (!inputText.trim()) {
      toast({ title: "Input Required", description: "Please enter diagnosis or medication text.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSuggestedTags([]);
    const result = await getAiSuggestedTagsAction({ text: inputText });
    setIsLoading(false);

    if (result.success && result.tags) {
      // Filter out tags that are already part of currentTags
      const newTags = result.tags.filter(tag => !currentTags.includes(tag));
      setSuggestedTags(newTags);
      if (newTags.length === 0 && result.tags.length > 0) {
        toast({ title: "Suggestions", description: "All suggested tags are already added." });
      } else if (newTags.length === 0) {
        toast({ title: "No New Suggestions", description: "AI could not find new relevant tags." });
      }
    } else {
      toast({
        title: "Error Suggesting Tags",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = (tag: string) => {
    onTagsSuggested([tag]);
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };

  const handleAddAllTags = () => {
    onTagsSuggested(suggestedTags);
    setSuggestedTags([]);
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-base font-headline flex items-center"><Wand2 className="mr-2 h-5 w-5 text-primary" />AI Tag Suggester</CardTitle>
        <CardDescription>Enter diagnosis or medication details to get tag suggestions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="e.g., Patient diagnosed with Type 2 Diabetes Mellitus, on Metformin 500mg BID..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
        />
        <Button onClick={handleSuggestTags} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Suggest Tags
        </Button>
        {suggestedTags.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">Suggested Tags:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleAddTag(tag)}
                  title={`Click to add "${tag}"`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <Button onClick={handleAddAllTags} variant="outline" size="sm" className="mt-2">
              Add All Suggested
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
