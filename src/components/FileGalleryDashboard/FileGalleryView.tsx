import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Badge } from '../ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import {
  Upload,
  Search,
  Image,
  File,
  Video,
  Archive,
  Download,
  Share2,
  MoreHorizontal,
  Grid3X3,
  List,
  Filter,
  FolderOpen,
  Trash2,
  Eye
} from 'lucide-react';

export function FileGalleryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample files data
  const files = [
    {
      id: 1,
      name: 'server-diagram.png',
      type: 'image',
      size: '2.4 MB',
      uploadedBy: 'John Doe',
      uploadDate: '2024-08-12',
      category: 'Images',
      ticketId: 'TK-2089',
      tags: ['server', 'diagram', 'infrastructure'],
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      description: 'Network infrastructure diagram'
    },
    {
      id: 2,
      name: 'security-report.pdf',
      type: 'document',
      size: '1.8 MB',
      uploadedBy: 'Jane Smith',
      uploadDate: '2024-08-11',
      category: 'Documents',
      ticketId: 'TK-2087',
      tags: ['security', 'report', 'audit'],
      url: '/placeholder-pdf.png',
      description: 'Monthly security audit report'
    },
    {
      id: 3,
      name: 'training-video.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadedBy: 'Mike Johnson',
      uploadDate: '2024-08-10',
      category: 'Videos',
      ticketId: 'TK-2086',
      tags: ['training', 'video', 'tutorial'],
      url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
      description: 'Software installation tutorial'
    },
    {
      id: 4,
      name: 'backup-logs.zip',
      type: 'archive',
      size: '12.7 MB',
      uploadedBy: 'Sarah Wilson',
      uploadDate: '2024-08-09',
      category: 'Archives',
      ticketId: 'TK-2085',
      tags: ['backup', 'logs', 'archive'],
      url: '/placeholder-archive.png',
      description: 'System backup log files'
    },
    {
      id: 5,
      name: 'hardware-specs.xlsx',
      type: 'document',
      size: '856 KB',
      uploadedBy: 'John Doe',
      uploadDate: '2024-08-08',
      category: 'Documents',
      ticketId: 'TK-2084',
      tags: ['hardware', 'specifications', 'inventory'],
      url: '/placeholder-excel.png',
      description: 'Hardware inventory spreadsheet'
    },
    {
      id: 6,
      name: 'network-topology.jpg',
      type: 'image',
      size: '3.2 MB',
      uploadedBy: 'Jane Smith',
      uploadDate: '2024-08-07',
      category: 'Images',
      ticketId: 'TK-2083',
      tags: ['network', 'topology', 'diagram'],
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      description: 'Current network topology diagram'
    },
    {
      id: 7,
      name: 'error-screenshots.zip',
      type: 'archive',
      size: '8.4 MB',
      uploadedBy: 'Mike Johnson',
      uploadDate: '2024-08-06',
      category: 'Archives',
      ticketId: 'TK-2082',
      tags: ['error', 'screenshots', 'debugging'],
      url: '/placeholder-archive.png',
      description: 'Error screenshots for troubleshooting'
    },
    {
      id: 8,
      name: 'demo-presentation.pptx',
      type: 'document',
      size: '15.3 MB',
      uploadedBy: 'Sarah Wilson',
      uploadDate: '2024-08-05',
      category: 'Documents',
      ticketId: 'TK-2081',
      tags: ['presentation', 'demo', 'training'],
      url: '/placeholder-pptx.png',
      description: 'Product demonstration slides'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Files', count: files.length, icon: File },
    { id: 'images', name: 'Images', count: files.filter(f => f.type === 'image').length, icon: Image },
    { id: 'documents', name: 'Documents', count: files.filter(f => f.type === 'document').length, icon: File },
    { id: 'videos', name: 'Videos', count: files.filter(f => f.type === 'video').length, icon: Video },
    { id: 'archives', name: 'Archives', count: files.filter(f => f.type === 'archive').length, icon: Archive }
  ];

  const recentFiles = files.slice(0, 4);
  const imageFiles = files.filter(f => f.type === 'image');

  const typeIcons = {
    'image': '🖼️',
    'document': '📄',
    'video': '🎥',
    'archive': '📦'
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' ||
                           file.type === selectedCategory.replace('s', '');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-background">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2 text-foreground">File Gallery</h1>
          <p className="text-muted-foreground">Manage attachments, images, and media files</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground">
            <Upload className="h-4 w-4 mr-2" />
            <span>Upload Files</span>
          </Button>
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-foreground">New Folder</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="gallery" className="bg-background">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-fit grid-cols-3 bg-muted border-border">
                <TabsTrigger value="gallery" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">Gallery</TabsTrigger>
                <TabsTrigger value="recent" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">Recent</TabsTrigger>
                <TabsTrigger value="images" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">Images</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid'
                    ? "bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                    : "border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  }
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list'
                    ? "bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                    : "border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  }
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="gallery" className="space-y-4 bg-background">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files, tags, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap ${
                        selectedCategory === category.id
                          ? "bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                          : "border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <category.icon className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-foreground">{category.name} ({category.count})</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Files Display */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map(file => (
                    <Card key={file.id} className="group hover:shadow-md transition-shadow border-border bg-card">
                      <CardContent className="p-4 space-y-3 bg-card">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center relative">
                          {file.type === 'image' ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl">{typeIcons[file.type as keyof typeof typeIcons]}</span>
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="sm" className="h-6 w-6 p-0 bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm truncate text-card-foreground" title={file.name}>
                            {file.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {file.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="text-muted-foreground">{file.size}</span>
                            <span className="text-muted-foreground">{file.uploadDate}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs border-border text-foreground">
                            <span>{file.ticketId}</span>
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map(file => (
                    <Card key={file.id} className="group hover:bg-accent/50 transition-colors border-border bg-card">
                      <CardContent className="p-4 bg-card">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {file.type === 'image' ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-lg">{typeIcons[file.type as keyof typeof typeIcons]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate text-card-foreground">{file.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{file.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="text-muted-foreground">By {file.uploadedBy}</span>
                              <span className="text-muted-foreground">{file.uploadDate}</span>
                              <span className="text-muted-foreground">{file.size}</span>
                              <Badge variant="outline" className="text-xs border-border text-foreground">
                                <span>{file.ticketId}</span>
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentFiles.map(file => (
                  <Card key={file.id} className="group hover:shadow-md transition-shadow border-border bg-card">
                    <CardContent className="p-4 space-y-3 bg-card">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center relative">
                        {file.type === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">{typeIcons[file.type as keyof typeof typeIcons]}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm truncate text-card-foreground">{file.name}</h3>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageFiles.map(file => (
                  <Card key={file.id} className="group hover:shadow-md transition-shadow border-border bg-card">
                    <CardContent className="p-0 bg-card">
                      <div className="aspect-square rounded-t-lg overflow-hidden bg-muted">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 space-y-2 bg-card">
                        <h3 className="font-medium text-sm truncate text-card-foreground">{file.name}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="text-muted-foreground">{file.size}</span>
                          <Badge variant="outline" className="text-xs border-border text-foreground">
                            <span>{file.ticketId}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upload Area */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Upload className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Quick Upload</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center bg-card">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drop files here or click to browse
                </p>
                <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                  <span className="text-foreground">Choose Files</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Storage Stats */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="text-card-foreground">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Images</span>
                  <span className="font-medium text-foreground">145 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Documents</span>
                  <span className="font-medium text-foreground">423 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Videos</span>
                  <span className="font-medium text-foreground">1.2 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Archives</span>
                  <span className="font-medium text-foreground">89 MB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-theme-accent h-2 rounded-full" style={{ width: '38%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">1.9 GB of 5 GB used</div>
              </div>
            </CardContent>
          </Card>

          {/* File Actions */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 bg-card">
              <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">Advanced Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                <Share2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">Share Selected</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">Bulk Download</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive border-border hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Delete Selected</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
