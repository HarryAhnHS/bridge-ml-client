"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Music, Headphones, Loader2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function SemanticAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const audioRef = useRef(null);
  const progressInterval = useRef(null);

  // Cleanup audio URL when component unmounts or when file changes
  useEffect(() => {
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setAudioUrl(fileUrl);
      return () => URL.revokeObjectURL(fileUrl);
    }
  }, [file]);

  // Audio player controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Simulate loading progress
    if (loading) {
      setLoadingProgress(0);
      progressInterval.current = setInterval(() => {
        setLoadingProgress(prev => {
          // Slowly increase to 95% max to indicate waiting for backend
          const increment = Math.random() * 2;
          const newValue = prev + increment;
          return newValue > 95 ? 95 : newValue;
        });
      }, 1000);
    } else {
      clearInterval(progressInterval.current);
      setLoadingProgress(0);
    }

    return () => {
      clearInterval(progressInterval.current);
    };
  }, [loading]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolume = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
      // Reset analysis results when new file is uploaded
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use our proxy API route instead of calling the backend directly
      const res = await fetch("/api/semantic", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResult(data.result);
    } catch (error) {
      console.error("Error analyzing track:", error);
      setError(error.message || "Failed to analyze track. Please try again.");
    } finally {
      setLoading(false);
      setLoadingProgress(100); // Set to 100% when done
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Semantic Track Analyzer</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your audio file to analyze its musical characteristics, get smart recommendations, and detailed insights.
          </p>
        </div>
        
        <Card className="shadow-2xl border border-primary/10 overflow-hidden backdrop-blur-sm bg-background/80">
          <CardHeader className="bg-gradient-to-r from-black via-gray-900 to-zinc-800 rounded-t-lg p-6">
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-primary" />
              <CardTitle className="text-white text-2xl font-bold">Track Analyzer</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              Upload an MP3 or WAV file to get detailed analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Input 
                type="file" 
                accept="audio/mp3,audio/wav" 
                onChange={handleFileChange} 
                className="hidden" 
                id="file-upload"
              />
              <label 
                htmlFor="file-upload" 
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Headphones className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-lg font-medium">
                  {file ? file.name : "Drop your audio file here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "MP3 or WAV format supported"}
                </p>
              </label>
            </div>
            
            {file && audioUrl && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 rounded-full"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <Slider 
                      value={[currentTime]} 
                      max={duration || 100}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={toggleMute}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolume}
                      className="w-20 cursor-pointer"
                    />
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <Button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="w-full h-12 text-md font-medium bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Upload className="mr-2 h-4 w-4" /> Analyze Track
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {loading && (
          <Card className="shadow-2xl border border-primary/10 overflow-hidden backdrop-blur-sm bg-background/80">
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Analyzing Your Track</h3>
                <p className="text-muted-foreground max-w-md">
                  Our AI is working hard to analyze your music. This process might take 
                  a couple of minutes depending on the file size and complexity.
                </p>
              </div>
              
              <div className="flex flex-col w-full max-w-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="font-medium">{Math.floor(loadingProgress)}%</span>
                </div>
                <Progress value={loadingProgress} className="h-2" />
                
                <div className="bg-muted/30 p-3 rounded-md mt-4 flex items-start">
                  <div className="min-w-[24px] mr-3 mt-1">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We&apos;re extracting musical features, analyzing patterns, and generating 
                    insights about your track. The system is processing audio characteristics like 
                    tempo, key, instrumentation, and more to provide comprehensive results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="shadow-2xl border border-primary/10 overflow-hidden backdrop-blur-sm bg-background/80">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Track Analysis Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <span className="text-primary">🎧</span> Summary
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-foreground leading-relaxed text-base">
                    {result.summary}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <span className="text-primary">🏷️</span> Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-3 py-1 text-sm hover:bg-primary hover:text-white cursor-pointer transition-colors duration-200"
                      onClick={() => navigator.clipboard.writeText(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <span className="text-primary">📊</span> Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-1">Track Type</div>
                    <div className="text-lg font-semibold">{result.metadata.track_type}</div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-1">Duration</div>
                    <div className="text-lg font-semibold">{result.metadata.duration_sec.toFixed(1)} sec</div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-1">Tempo</div>
                    <div className="text-lg font-semibold">{result.metadata.tempo_bpm.toFixed(2)} BPM</div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <span className="text-primary">🔊</span> Per-Stem Characteristics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(result.stem_tags).map(([stem, tags]) => (
                    <div key={stem} className="bg-muted/30 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                      <h4 className="capitalize text-md font-semibold mb-2 text-primary">
                        {stem}
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tags.map((tag, idx) => (
                          <span key={idx} className="text-xs bg-secondary/50 px-2 py-1 rounded-full text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-foreground">
                        {result.stem_summaries[stem]}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <span className="text-primary">🎯</span> You Might Also Like
                </h3>
                <div className="space-y-4">
                  {result.neighbors.map((track, i) => (
                    <div key={i} className="border-l-4 pl-4 border-primary bg-muted/30 p-4 rounded-r-lg hover:bg-muted/50 transition-all">
                      <p className="text-md font-semibold">
                        {track.title} <span className="text-muted-foreground">by</span> {track.artist}
                      </p>
                      <p className="text-sm italic text-muted-foreground">{track.genre_names?.join(", ")} — {track.location}</p>
                      <p className="text-xs mt-2 text-muted-foreground line-clamp-3">
                        {track.artist_bio || "No bio available."}
                      </p>
                      {track.artist_website && (
                        <a
                          href={track.artist_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-primary underline hover:text-primary/80"
                        >
                          Visit Artist Website
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 